import type { Express } from "express";
import { saasStorage } from "./saas-storage";
import { saasProvisioner } from "./saas-provisioner";
import { insertSignupRequestSchema } from "../shared/saas-schema";

export function registerSaasRoutes(app: Express) {
  // ===== PUBLIC SIGNUP REQUEST ENDPOINT =====
  app.post("/api/saas/signup-request", async (req, res) => {
    try {
      const requestData = insertSignupRequestSchema.parse(req.body);
      
      const signupRequest = await saasStorage.createSignupRequest({
        ...requestData,
        status: "pending",
      });

      // Log the signup request
      await saasStorage.logSaasAction({
        action: "signup_request",
        organizationId: null,
        performedBy: requestData.email,
        details: {
          companyName: requestData.companyName,
          contactName: requestData.contactName,
          country: requestData.country,
          propertyCount: requestData.propertyCount,
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null,
      });

      res.status(201).json({
        message: "Signup request submitted successfully",
        requestId: signupRequest.id,
      });

    } catch (error) {
      console.error("Error creating signup request:", error);
      res.status(400).json({ 
        error: "Invalid request data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ===== ADMIN ENDPOINTS (require authentication) =====
  
  // Get all signup requests
  app.get("/api/saas/signup-requests", async (req, res) => {
    if (!req.isAuthenticated() || !req.user || (req.user as any).role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const status = req.query.status as string;
      const requests = await saasStorage.getSignupRequests(status);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching signup requests:", error);
      res.status(500).json({ error: "Failed to fetch signup requests" });
    }
  });

  // Approve signup request and provision environment
  app.post("/api/saas/signup-requests/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const requestId = req.params.id;
      const { hostawayApiKey } = req.body;

      // Get the signup request
      const signupRequest = await saasStorage.getSignupRequest(requestId);
      if (!signupRequest) {
        return res.status(404).json({ error: "Signup request not found" });
      }

      if (signupRequest.status !== "pending") {
        return res.status(400).json({ error: "Request has already been processed" });
      }

      // Update request status to approved
      await saasStorage.updateSignupRequestStatus(
        requestId, 
        "approved", 
        req.user.id
      );

      // Start provisioning process
      const organizationId = await saasProvisioner.provisionTenantEnvironment(
        signupRequest,
        req.user.id,
        hostawayApiKey
      );

      res.json({
        message: "Request approved and environment provisioning started",
        organizationId,
      });

    } catch (error) {
      console.error("Error approving request:", error);
      res.status(500).json({ 
        error: "Failed to approve request",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Reject signup request
  app.post("/api/saas/signup-requests/:id/reject", async (req, res) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const requestId = req.params.id;
      const { reason } = req.body;

      if (!reason?.trim()) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }

      const signupRequest = await saasStorage.getSignupRequest(requestId);
      if (!signupRequest) {
        return res.status(404).json({ error: "Signup request not found" });
      }

      if (signupRequest.status !== "pending") {
        return res.status(400).json({ error: "Request has already been processed" });
      }

      await saasStorage.updateSignupRequestStatus(
        requestId,
        "rejected",
        req.user.id,
        reason
      );

      // Log the rejection
      await saasStorage.logSaasAction({
        action: "signup_rejected",
        organizationId: null,
        performedBy: req.user.id,
        details: {
          companyName: signupRequest.companyName,
          reason,
        },
      });

      res.json({ message: "Request rejected successfully" });

    } catch (error) {
      console.error("Error rejecting request:", error);
      res.status(500).json({ error: "Failed to reject request" });
    }
  });

  // Get all tenant organizations
  app.get("/api/saas/tenant-organizations", async (req, res) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const organizations = await saasStorage.getTenantOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error("Error fetching tenant organizations:", error);
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  });

  // Update tenant organization status
  app.patch("/api/saas/tenant-organizations/:organizationId/status", async (req, res) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { organizationId } = req.params;
      const { status } = req.body;

      if (!["active", "suspended", "terminated"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedOrg = await saasStorage.updateTenantStatus(organizationId, status);

      // Log the status change
      await saasStorage.logSaasAction({
        action: "status_updated",
        organizationId,
        performedBy: req.user.id,
        details: {
          newStatus: status,
          companyName: updatedOrg.companyName,
        },
      });

      res.json(updatedOrg);

    } catch (error) {
      console.error("Error updating tenant status:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // Get deployment status
  app.get("/api/saas/deployments/:organizationId", async (req, res) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { organizationId } = req.params;
      const deployment = await saasStorage.getTenantDeployment(organizationId);
      
      if (!deployment) {
        return res.status(404).json({ error: "Deployment not found" });
      }

      res.json(deployment);
    } catch (error) {
      console.error("Error fetching deployment:", error);
      res.status(500).json({ error: "Failed to fetch deployment" });
    }
  });

  // Get SaaS audit logs
  app.get("/api/saas/audit-logs", async (req, res) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const organizationId = req.query.organizationId as string;
      const logs = await saasStorage.getSaasAuditLogs(organizationId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });
}