import type { Express } from "express";
import { db } from "../db";
import {
  commissionPayouts,
  pmPayoutRequests,
  pmCommissionBalance,
  portfolioAssignments,
  pmNotifications,
  tasks,
  properties,
  billingInvoices,
  users,
  bookings,
} from "@shared/schema";
import { eq, and, gte, lte, sql, desc, or, count, sum } from "drizzle-orm";
import {
  calculateManagerCommissionForPeriod,
  getPortfolioManagerProperties,
  calculateMonthlyTrend,
  getCommissionBalance,
} from "./commission-service";

export function registerPMDashboardRoutes(app: Express) {
  /**
   * GET /api/pm/dashboard/financial-overview
   * Get financial overview with commission earnings and property breakdown
   */
  app.get("/api/pm/dashboard/financial-overview", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      if (!organizationId) {
        return res.status(400).send("Organization ID required");
      }

      const { startDate, endDate, propertyId, portfolioManagerId } = req.query;

      // Use portfolioManagerId from query or current user's ID
      const managerId = (portfolioManagerId as string) || (req.user as any)?.id;

      if (!managerId) {
        return res.status(400).send("Portfolio Manager ID required");
      }

      // Calculate commission for the period
      const commissionData = await calculateManagerCommissionForPeriod({
        organizationId,
        managerId,
        startDate: (startDate as string) || new Date().toISOString().split('T')[0],
        endDate: (endDate as string) || new Date().toISOString().split('T')[0],
        propertyId: propertyId as string,
      });

      // Get monthly trend
      const monthlyTrend = await calculateMonthlyTrend(organizationId, managerId);

      res.json({
        totalCommissionEarnings: commissionData.totalCommission,
        propertyBreakdown: commissionData.breakdownByProperty.map(b => ({
          propertyId: b.propertyId,
          propertyName: b.propertyName,
          totalRevenue: b.totalRevenue,
          commissionEarned: b.commission,
          bookingCount: b.bookingCount,
        })),
        monthlyTrend,
        pendingBalance: commissionData.totalCommission, // Will be refined with payout tracking
      });
    } catch (error: any) {
      console.error("Error fetching financial overview:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * GET /api/pm/dashboard/balance
   * Get commission balance summary
   */
  app.get("/api/pm/dashboard/balance", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      if (!organizationId) {
        return res.status(400).send("Organization ID required");
      }

      const { portfolioManagerId } = req.query;
      const managerId = (portfolioManagerId as string) || (req.user as any)?.id;

      if (!managerId) {
        return res.status(400).send("Portfolio Manager ID required");
      }

      // Get commission balance
      const balance = await getCommissionBalance(organizationId, managerId);

      // Get last payout date from payout requests
      const lastPayout = await db
        .select({
          paidAt: pmPayoutRequests.paidAt,
        })
        .from(pmPayoutRequests)
        .where(
          and(
            eq(pmPayoutRequests.organizationId, organizationId),
            eq(pmPayoutRequests.managerId, managerId),
            eq(pmPayoutRequests.status, "paid")
          )
        )
        .orderBy(desc(pmPayoutRequests.paidAt))
        .limit(1);

      res.json({
        totalEarned: balance.totalEarned,
        totalPaid: balance.totalPaid,
        currentBalance: balance.currentBalance,
        lastPayoutDate: lastPayout[0]?.paidAt?.toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching balance:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * GET /api/pm/dashboard/payouts
   * Get payout request history
   */
  app.get("/api/pm/dashboard/payouts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      if (!organizationId) {
        return res.status(400).send("Organization ID required");
      }

      const { portfolioManagerId } = req.query;
      const managerId = (portfolioManagerId as string) || (req.user as any)?.id;

      if (!managerId) {
        return res.status(400).send("Portfolio Manager ID required");
      }

      const payouts = await db
        .select()
        .from(pmPayoutRequests)
        .where(
          and(
            eq(pmPayoutRequests.organizationId, organizationId),
            eq(pmPayoutRequests.managerId, managerId)
          )
        )
        .orderBy(desc(pmPayoutRequests.requestedAt));

      res.json(payouts.map(p => ({
        id: p.id,
        amount: parseFloat(p.amount),
        currency: p.currency,
        requestNotes: p.requestNotes,
        adminNotes: p.adminNotes,
        status: p.status,
        receiptUrl: p.receiptUrl,
        requestedAt: p.requestedAt?.toISOString(),
        approvedAt: p.approvedAt?.toISOString(),
        paidAt: p.paidAt?.toISOString(),
      })));
    } catch (error: any) {
      console.error("Error fetching payouts:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * POST /api/pm/dashboard/payouts
   * Create a new payout request
   */
  app.post("/api/pm/dashboard/payouts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      const managerId = (req.user as any)?.id;

      if (!organizationId || !managerId) {
        return res.status(400).send("Organization ID and Manager ID required");
      }

      const { amount, requestNotes } = req.body;

      // Validate amount
      const requestAmount = parseFloat(amount);
      if (isNaN(requestAmount) || requestAmount <= 0) {
        return res.status(400).send("Invalid amount");
      }

      // Check current balance
      const balance = await getCommissionBalance(organizationId, managerId);
      if (requestAmount > balance.currentBalance) {
        return res.status(400).send("Insufficient balance");
      }

      const [newPayout] = await db
        .insert(pmPayoutRequests)
        .values({
          organizationId,
          managerId,
          amount: requestAmount.toString(),
          currency: "USD",
          requestNotes: requestNotes || null,
          status: "pending",
        })
        .returning();

      res.json(newPayout);
    } catch (error: any) {
      console.error("Error creating payout request:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * PATCH /api/pm/dashboard/payouts/:id/received
   * Mark payout as received (confirm payment)
   */
  app.patch("/api/pm/dashboard/payouts/:id/received", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      const managerId = (req.user as any)?.id;
      const payoutId = parseInt(req.params.id);

      if (!organizationId || !managerId) {
        return res.status(400).send("Organization ID and Manager ID required");
      }

      // Verify payout belongs to this manager
      const [payout] = await db
        .select()
        .from(pmPayoutRequests)
        .where(
          and(
            eq(pmPayoutRequests.id, payoutId),
            eq(pmPayoutRequests.organizationId, organizationId),
            eq(pmPayoutRequests.managerId, managerId)
          )
        );

      if (!payout) {
        return res.status(404).send("Payout not found");
      }

      if (payout.status !== "approved" && payout.status !== "paid") {
        return res.status(400).send("Payout must be approved first");
      }

      const [updated] = await db
        .update(pmPayoutRequests)
        .set({
          status: "paid",
          paidAt: new Date(),
        })
        .where(eq(pmPayoutRequests.id, payoutId))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error confirming payout:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * PATCH /api/pm/dashboard/payouts/:id/approve
   * Admin approves a payout request
   */
  app.patch("/api/pm/dashboard/payouts/:id/approve", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const userRole = (req.user as any)?.role;
      if (userRole !== "admin") {
        return res.status(403).send("Admin access required");
      }

      const organizationId = (req.user as any)?.organizationId;
      const adminId = (req.user as any)?.id;
      const payoutId = parseInt(req.params.id);
      const { adminNotes } = req.body;

      const [payout] = await db
        .select()
        .from(pmPayoutRequests)
        .where(
          and(
            eq(pmPayoutRequests.id, payoutId),
            eq(pmPayoutRequests.organizationId, organizationId)
          )
        );

      if (!payout) {
        return res.status(404).send("Payout not found");
      }

      if (payout.status !== "pending") {
        return res.status(400).send("Payout has already been processed");
      }

      const [updated] = await db
        .update(pmPayoutRequests)
        .set({
          status: "approved",
          adminNotes: adminNotes || null,
          approvedAt: new Date(),
          processedBy: adminId,
        })
        .where(eq(pmPayoutRequests.id, payoutId))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error approving payout:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * PATCH /api/pm/dashboard/payouts/:id/reject
   * Admin rejects a payout request
   */
  app.patch("/api/pm/dashboard/payouts/:id/reject", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const userRole = (req.user as any)?.role;
      if (userRole !== "admin") {
        return res.status(403).send("Admin access required");
      }

      const organizationId = (req.user as any)?.organizationId;
      const adminId = (req.user as any)?.id;
      const payoutId = parseInt(req.params.id);
      const { adminNotes } = req.body;

      const [payout] = await db
        .select()
        .from(pmPayoutRequests)
        .where(
          and(
            eq(pmPayoutRequests.id, payoutId),
            eq(pmPayoutRequests.organizationId, organizationId)
          )
        );

      if (!payout) {
        return res.status(404).send("Payout not found");
      }

      if (payout.status !== "pending") {
        return res.status(400).send("Payout has already been processed");
      }

      const [updated] = await db
        .update(pmPayoutRequests)
        .set({
          status: "rejected",
          adminNotes: adminNotes || null,
          processedBy: adminId,
        })
        .where(eq(pmPayoutRequests.id, payoutId))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error rejecting payout:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * PATCH /api/pm/dashboard/payouts/:id/pay
   * Admin marks payout as paid (uploads receipt)
   */
  app.patch("/api/pm/dashboard/payouts/:id/pay", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const userRole = (req.user as any)?.role;
      if (userRole !== "admin") {
        return res.status(403).send("Admin access required");
      }

      const organizationId = (req.user as any)?.organizationId;
      const adminId = (req.user as any)?.id;
      const payoutId = parseInt(req.params.id);
      const { receiptUrl, adminNotes } = req.body;

      const [payout] = await db
        .select()
        .from(pmPayoutRequests)
        .where(
          and(
            eq(pmPayoutRequests.id, payoutId),
            eq(pmPayoutRequests.organizationId, organizationId)
          )
        );

      if (!payout) {
        return res.status(404).send("Payout not found");
      }

      if (payout.status !== "approved") {
        return res.status(400).send("Payout must be approved first");
      }

      // Update payout status
      const [updated] = await db
        .update(pmPayoutRequests)
        .set({
          status: "paid",
          receiptUrl: receiptUrl || null,
          adminNotes: adminNotes || payout.adminNotes,
          paidAt: new Date(),
          processedBy: adminId,
        })
        .where(eq(pmPayoutRequests.id, payoutId))
        .returning();

      // Update the commission balance
      const payoutAmount = parseFloat(payout.amount || "0");
      
      // Get current balance record
      const [balanceRecord] = await db
        .select()
        .from(pmCommissionBalance)
        .where(
          and(
            eq(pmCommissionBalance.organizationId, organizationId),
            eq(pmCommissionBalance.managerId, payout.managerId)
          )
        );

      if (balanceRecord) {
        const currentPaid = parseFloat(balanceRecord.totalPaid || "0");
        const currentBalance = parseFloat(balanceRecord.currentBalance || "0");
        
        await db
          .update(pmCommissionBalance)
          .set({
            totalPaid: (currentPaid + payoutAmount).toFixed(2),
            currentBalance: Math.max(0, currentBalance - payoutAmount).toFixed(2),
            lastPayoutDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(pmCommissionBalance.id, balanceRecord.id));
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error marking payout as paid:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * GET /api/pm/dashboard/all-payouts
   * Admin gets all payout requests across all managers
   */
  app.get("/api/pm/dashboard/all-payouts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const userRole = (req.user as any)?.role;
      if (userRole !== "admin") {
        return res.status(403).send("Admin access required");
      }

      const organizationId = (req.user as any)?.organizationId;
      const { status, managerId } = req.query;

      const conditions = [eq(pmPayoutRequests.organizationId, organizationId)];

      if (status && status !== "all") {
        conditions.push(eq(pmPayoutRequests.status, status as string));
      }

      if (managerId) {
        conditions.push(eq(pmPayoutRequests.managerId, managerId as string));
      }

      const payouts = await db
        .select({
          id: pmPayoutRequests.id,
          managerId: pmPayoutRequests.managerId,
          amount: pmPayoutRequests.amount,
          currency: pmPayoutRequests.currency,
          requestNotes: pmPayoutRequests.requestNotes,
          adminNotes: pmPayoutRequests.adminNotes,
          status: pmPayoutRequests.status,
          receiptUrl: pmPayoutRequests.receiptUrl,
          requestedAt: pmPayoutRequests.requestedAt,
          approvedAt: pmPayoutRequests.approvedAt,
          paidAt: pmPayoutRequests.paidAt,
          processedBy: pmPayoutRequests.processedBy,
          managerFirstName: users.firstName,
          managerLastName: users.lastName,
          managerEmail: users.email,
        })
        .from(pmPayoutRequests)
        .leftJoin(users, eq(pmPayoutRequests.managerId, users.id))
        .where(and(...conditions))
        .orderBy(desc(pmPayoutRequests.requestedAt));

      res.json(payouts.map(p => ({
        ...p,
        amount: parseFloat(p.amount || "0"),
        managerName: `${p.managerFirstName || ""} ${p.managerLastName || ""}`.trim() || p.managerEmail,
      })));
    } catch (error: any) {
      console.error("Error fetching all payouts:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * POST /api/pm/dashboard/add-commission
   * Admin adds commission to a manager's balance
   */
  app.post("/api/pm/dashboard/add-commission", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const userRole = (req.user as any)?.role;
      if (userRole !== "admin") {
        return res.status(403).send("Admin access required");
      }

      const organizationId = (req.user as any)?.organizationId;
      const { managerId, amount, description, propertyId, bookingId } = req.body;

      const commissionAmount = parseFloat(amount);
      if (isNaN(commissionAmount) || commissionAmount <= 0) {
        return res.status(400).send("Invalid amount");
      }

      // Get or create balance record
      let [balanceRecord] = await db
        .select()
        .from(pmCommissionBalance)
        .where(
          and(
            eq(pmCommissionBalance.organizationId, organizationId),
            eq(pmCommissionBalance.managerId, managerId)
          )
        );

      if (!balanceRecord) {
        [balanceRecord] = await db
          .insert(pmCommissionBalance)
          .values({
            organizationId,
            managerId,
            totalEarned: "0",
            totalPaid: "0",
            currentBalance: "0",
          })
          .returning();
      }

      const currentEarned = parseFloat(balanceRecord.totalEarned || "0");
      const currentBalance = parseFloat(balanceRecord.currentBalance || "0");

      await db
        .update(pmCommissionBalance)
        .set({
          totalEarned: (currentEarned + commissionAmount).toFixed(2),
          currentBalance: (currentBalance + commissionAmount).toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(pmCommissionBalance.id, balanceRecord.id));

      // Record the commission in commission payouts table
      const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const [payout] = await db
        .insert(commissionPayouts)
        .values({
          organizationId,
          propertyId: propertyId ? parseInt(propertyId) : null,
          userId: managerId,
          userRole: "portfolio-manager",
          period: currentPeriod,
          baseCommissionAmount: commissionAmount.toFixed(2),
          commissionPercentage: "100.00",
          finalPayoutAmount: commissionAmount.toFixed(2),
          status: "approved",
          notes: description || "Manual commission added by admin",
        })
        .returning();

      res.json({
        success: true,
        newBalance: currentBalance + commissionAmount,
        payoutRecord: payout,
      });
    } catch (error: any) {
      console.error("Error adding commission:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * GET /api/pm/dashboard/task-logs
   * Get task logs for portfolio manager's properties
   */
  app.get("/api/pm/dashboard/task-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      if (!organizationId) {
        return res.status(400).send("Organization ID required");
      }

      const { portfolioManagerId, startDate, endDate, department, status, limit } = req.query;
      const managerId = (portfolioManagerId as string) || (req.user as any)?.id;

      if (!managerId) {
        return res.status(400).send("Portfolio Manager ID required");
      }

      // Get manager's properties
      const managerProperties = await db
        .select({
          propertyId: portfolioAssignments.propertyId,
        })
        .from(portfolioAssignments)
        .where(
          and(
            eq(portfolioAssignments.organizationId, organizationId),
            eq(portfolioAssignments.managerId, managerId),
            eq(portfolioAssignments.isActive, true)
          )
        );

      const propertyIds = managerProperties.map(p => p.propertyId);

      if (propertyIds.length === 0) {
        return res.json([]);
      }

      // Build task query conditions
      const conditions = [
        eq(tasks.organizationId, organizationId),
        sql`${tasks.propertyId} = ANY(${propertyIds})`,
      ];

      if (department && department !== "all") {
        conditions.push(eq(tasks.department, department as string));
      }

      if (status && status !== "all") {
        conditions.push(eq(tasks.status, status as string));
      }

      if (startDate) {
        conditions.push(gte(tasks.createdAt, new Date(startDate as string)));
      }

      if (endDate) {
        conditions.push(lte(tasks.createdAt, new Date(endDate as string)));
      }

      const taskLogs = await db
        .select({
          id: tasks.id,
          taskTitle: tasks.title,
          department: tasks.department,
          status: tasks.status,
          completedAt: tasks.completedAt,
          result: tasks.result,
          notes: tasks.notes,
          propertyId: tasks.propertyId,
          propertyName: properties.name,
          staffFirstName: users.firstName,
          staffLastName: users.lastName,
          createdAt: tasks.createdAt,
        })
        .from(tasks)
        .leftJoin(properties, eq(tasks.propertyId, properties.id))
        .leftJoin(users, eq(tasks.assignedTo, users.id))
        .where(and(...conditions))
        .orderBy(desc(tasks.createdAt))
        .limit(parseInt(limit as string) || 100);

      res.json(taskLogs.map(t => ({
        ...t,
        staffAssigned: t.staffFirstName && t.staffLastName 
          ? `${t.staffFirstName} ${t.staffLastName}`.trim() 
          : t.staffFirstName || t.staffLastName || null,
      })));
    } catch (error: any) {
      console.error("Error fetching task logs:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * GET /api/pm/dashboard/portfolio
   * Get portfolio manager's properties
   */
  app.get("/api/pm/dashboard/portfolio", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      if (!organizationId) {
        return res.status(400).send("Organization ID required");
      }

      const { portfolioManagerId } = req.query;
      const managerId = (portfolioManagerId as string) || (req.user as any)?.id;

      if (!managerId) {
        return res.status(400).send("Portfolio Manager ID required");
      }

      console.log(`[PM Dashboard] Fetching portfolio for managerId: ${managerId}, orgId: ${organizationId}`);
      const portfolioProperties = await getPortfolioManagerProperties(organizationId, managerId);
      console.log(`[PM Dashboard] Found ${portfolioProperties.length} properties`);

      res.json(portfolioProperties.map(p => ({
        id: p.propertyId,
        name: p.propertyName || `Property #${p.propertyId}`,
        address: p.propertyAddress,
        status: p.propertyStatus,
        isActive: p.isActive,
      })));
    } catch (error: any) {
      console.error("Error fetching portfolio:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * GET /api/pm/dashboard/notifications
   * Get portfolio manager notifications
   */
  app.get("/api/pm/dashboard/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      if (!organizationId) {
        return res.status(400).send("Organization ID required");
      }

      const { portfolioManagerId, limit } = req.query;
      const managerId = (portfolioManagerId as string) || (req.user as any)?.id;

      if (!managerId) {
        return res.status(400).send("Portfolio Manager ID required");
      }

      const notifications = await db
        .select()
        .from(pmNotifications)
        .where(
          and(
            eq(pmNotifications.organizationId, organizationId),
            eq(pmNotifications.managerId, managerId)
          )
        )
        .orderBy(desc(pmNotifications.createdAt))
        .limit(parseInt(limit as string) || 20);

      res.json(notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        severity: n.severity,
        actionRequired: n.actionRequired,
        isRead: n.isRead ?? false,
        createdAt: n.createdAt?.toISOString(),
        relatedType: n.relatedType,
        relatedId: n.relatedId,
      })));
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * PATCH /api/pm/dashboard/notifications/:id/read
   * Mark notification as read
   */
  app.patch("/api/pm/dashboard/notifications/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      const managerId = (req.user as any)?.id;
      const notificationId = parseInt(req.params.id);

      if (!organizationId || !managerId) {
        return res.status(400).send("Organization ID and Manager ID required");
      }

      const [updated] = await db
        .update(pmNotifications)
        .set({
          isRead: true,
        })
        .where(
          and(
            eq(pmNotifications.id, notificationId),
            eq(pmNotifications.organizationId, organizationId),
            eq(pmNotifications.managerId, managerId)
          )
        )
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * PATCH /api/pm/dashboard/notifications/mark-all-read
   * Mark all notifications as read
   */
  app.patch("/api/pm/dashboard/notifications/mark-all-read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      const managerId = (req.user as any)?.id;

      if (!organizationId || !managerId) {
        return res.status(400).send("Organization ID and Manager ID required");
      }

      const updated = await db
        .update(pmNotifications)
        .set({
          isRead: true,
        })
        .where(
          and(
            eq(pmNotifications.organizationId, organizationId),
            eq(pmNotifications.managerId, managerId),
            eq(pmNotifications.isRead, false)
          )
        )
        .returning();

      res.json({ message: `Marked ${updated.length} notifications as read`, count: updated.length });
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * POST /api/pm/dashboard/notifications
   * Create a new notification (for system or manual alerts)
   */
  app.post("/api/pm/dashboard/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      const managerId = (req.user as any)?.id;

      if (!organizationId || !managerId) {
        return res.status(400).send("Organization ID and Manager ID required");
      }

      const { type, title, message, severity, relatedType, relatedId, actionRequired } = req.body;

      if (!type || !title || !message) {
        return res.status(400).send("Type, title, and message are required");
      }

      const [newNotification] = await db
        .insert(pmNotifications)
        .values({
          organizationId,
          managerId,
          type,
          title,
          message,
          severity: severity || "info",
          relatedType: relatedType || null,
          relatedId: relatedId || null,
          actionRequired: actionRequired || false,
          isRead: false,
        })
        .returning();

      res.json(newNotification);
    } catch (error: any) {
      console.error("Error creating notification:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * DELETE /api/pm/dashboard/notifications/:id
   * Delete a notification
   */
  app.delete("/api/pm/dashboard/notifications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      const managerId = (req.user as any)?.id;
      const notificationId = parseInt(req.params.id);

      if (!organizationId || !managerId) {
        return res.status(400).send("Organization ID and Manager ID required");
      }

      const [deleted] = await db
        .delete(pmNotifications)
        .where(
          and(
            eq(pmNotifications.id, notificationId),
            eq(pmNotifications.organizationId, organizationId),
            eq(pmNotifications.managerId, managerId)
          )
        )
        .returning();

      if (!deleted) {
        return res.status(404).send("Notification not found");
      }

      res.json({ message: "Notification deleted", id: notificationId });
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * POST /api/pm/dashboard/notifications/generate-sample
   * Generate sample notifications for testing
   */
  app.post("/api/pm/dashboard/notifications/generate-sample", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      const managerId = (req.user as any)?.id;

      if (!organizationId || !managerId) {
        return res.status(400).send("Organization ID and Manager ID required");
      }

      const sampleNotifications = [
        {
          organizationId,
          managerId,
          type: "guest_issue",
          title: "Guest Complaint - Property #1",
          message: "Guest reported AC not working properly. Requires immediate attention.",
          severity: "urgent",
          relatedType: "property",
          relatedId: "1",
          actionRequired: true,
          isRead: false,
        },
        {
          organizationId,
          managerId,
          type: "owner_approval",
          title: "Expense Approval Pending",
          message: "Owner approval needed for plumbing repair ($450). Waiting for response.",
          severity: "warning",
          relatedType: "task",
          relatedId: "1",
          actionRequired: true,
          isRead: false,
        },
        {
          organizationId,
          managerId,
          type: "system_suggestion",
          title: "Revenue Optimization Tip",
          message: "Consider raising rates by 10% for upcoming peak season (Dec-Jan). Market analysis shows demand increase.",
          severity: "info",
          relatedType: null,
          relatedId: null,
          actionRequired: false,
          isRead: false,
        },
        {
          organizationId,
          managerId,
          type: "bill_upload",
          title: "New Utility Bill Uploaded",
          message: "Electric bill for Property #2 has been uploaded. Amount: $187.50. Due: Dec 15.",
          severity: "info",
          relatedType: "property",
          relatedId: "2",
          actionRequired: false,
          isRead: false,
        },
        {
          organizationId,
          managerId,
          type: "guest_issue",
          title: "Early Check-in Request",
          message: "Guest arriving tomorrow requests early check-in at 10 AM instead of 3 PM.",
          severity: "warning",
          relatedType: "booking",
          relatedId: "1",
          actionRequired: true,
          isRead: false,
        },
      ];

      const inserted = await db
        .insert(pmNotifications)
        .values(sampleNotifications)
        .returning();

      res.json({ message: `Created ${inserted.length} sample notifications`, notifications: inserted });
    } catch (error: any) {
      console.error("Error generating sample notifications:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * GET /api/pm/dashboard/invoices
   * Get invoices created by portfolio manager
   */
  app.get("/api/pm/dashboard/invoices", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      const managerId = (req.user as any)?.id;

      if (!organizationId || !managerId) {
        return res.status(400).send("Organization ID and Manager ID required");
      }

      const pmInvoices = await db
        .select()
        .from(billingInvoices)
        .where(
          and(
            eq(billingInvoices.organizationId, organizationId),
            eq(billingInvoices.createdBy, managerId)
          )
        )
        .orderBy(desc(billingInvoices.createdAt))
        .limit(50);

      res.json(pmInvoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        receiverName: inv.clientName,
        invoiceType: inv.clientType,
        description: inv.description || "",
        totalAmount: parseFloat(inv.total || "0"),
        status: inv.status,
        dueDate: inv.dueDate,
        createdAt: inv.createdAt?.toISOString(),
      })));
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * POST /api/pm/dashboard/invoices
   * Create a new invoice
   */
  app.post("/api/pm/dashboard/invoices", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      const managerId = (req.user as any)?.id;

      if (!organizationId || !managerId) {
        return res.status(400).send("Organization ID and Manager ID required");
      }

      const {
        receiverType,
        receiverId,
        receiverName,
        receiverAddress,
        invoiceType,
        description,
        lineItems,
        taxRate,
        notes,
        dueDate,
        referenceNumber,
      } = req.body;

      // Calculate totals from line items
      const subtotal = lineItems.reduce((sum: number, item: any) => {
        const qty = parseFloat(item.quantity || "0");
        const price = parseFloat(item.unitPrice || "0");
        return sum + (qty * price);
      }, 0);

      const taxAmount = subtotal * (parseFloat(taxRate || "0") / 100);
      const totalAmount = subtotal + taxAmount;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      const today = new Date().toISOString().split('T')[0];
      const [newInvoice] = await db
        .insert(billingInvoices)
        .values({
          organizationId,
          invoiceNumber,
          clientType: receiverType || "owner",
          clientId: receiverId || null,
          clientName: receiverName || "Unknown",
          clientEmail: null,
          propertyId: null,
          issueDate: today,
          dueDate: dueDate || today,
          description: description || null,
          status: "draft",
          subtotal: subtotal.toString(),
          taxTotal: taxAmount.toString(),
          discountTotal: "0",
          total: totalAmount.toString(),
          createdBy: managerId,
        })
        .returning();

      res.json(newInvoice);
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      res.status(500).send(error.message);
    }
  });

  /**
   * GET /api/pm/dashboard/analytics
   * Get comprehensive analytics for portfolio manager
   */
  app.get("/api/pm/dashboard/analytics", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Not authenticated");
      }

      const organizationId = (req.user as any)?.organizationId;
      if (!organizationId) {
        return res.status(400).send("Organization ID required");
      }

      const { portfolioManagerId, startDate, endDate } = req.query;
      const managerId = (portfolioManagerId as string) || (req.user as any)?.id;

      if (!managerId) {
        return res.status(400).send("Portfolio Manager ID required");
      }

      // Get manager's properties
      const managerProperties = await db
        .select({
          propertyId: portfolioAssignments.propertyId,
        })
        .from(portfolioAssignments)
        .where(
          and(
            eq(portfolioAssignments.organizationId, organizationId),
            eq(portfolioAssignments.managerId, managerId),
            eq(portfolioAssignments.isActive, true)
          )
        );

      const propertyIds = managerProperties
        .map(p => p.propertyId)
        .filter((id): id is number => id !== null);

      // Default date range: last 6 months
      const endDateObj = endDate ? new Date(endDate as string) : new Date();
      const startDateObj = startDate 
        ? new Date(startDate as string) 
        : new Date(endDateObj.getFullYear(), endDateObj.getMonth() - 6, 1);

      // Performance metrics
      let totalRevenue = 0;
      let totalBookings = 0;
      let averageBookingValue = 0;
      let occupancyRate = 0;
      let completedTasks = 0;
      let pendingTasks = 0;
      let revenueByMonth: Array<{ month: string; revenue: number; bookings: number }> = [];
      let propertyPerformance: Array<{
        propertyId: number;
        propertyName: string;
        revenue: number;
        bookings: number;
        occupancyRate: number;
        rating: number;
      }> = [];

      if (propertyIds.length > 0) {
        // Get bookings for properties
        const startDateStr = startDateObj.toISOString().split('T')[0];
        const endDateStr = endDateObj.toISOString().split('T')[0];
        
        const bookingsData = await db
          .select({
            id: bookings.id,
            propertyId: bookings.propertyId,
            totalAmount: bookings.totalAmount,
            checkIn: bookings.checkIn,
            checkOut: bookings.checkOut,
            status: bookings.status,
          })
          .from(bookings)
          .where(
            and(
              eq(bookings.organizationId, organizationId),
              sql`${bookings.propertyId} = ANY(${propertyIds})`,
              sql`${bookings.checkIn} >= ${startDateStr}`,
              sql`${bookings.checkIn} <= ${endDateStr}`
            )
          );

        totalBookings = bookingsData.length;
        totalRevenue = bookingsData.reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0);
        averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        // Calculate occupancy rate (simplified: total booked nights / total available nights)
        const totalDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
        const totalAvailableNights = totalDays * propertyIds.length;
        const bookedNights = bookingsData.reduce((sum, b) => {
          const checkIn = new Date(b.checkIn);
          const checkOut = new Date(b.checkOut);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          return sum + nights;
        }, 0);
        occupancyRate = totalAvailableNights > 0 ? (bookedNights / totalAvailableNights) * 100 : 0;

        // Revenue by month
        const monthlyData: Record<string, { revenue: number; bookings: number }> = {};
        bookingsData.forEach(b => {
          const date = new Date(b.checkIn);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { revenue: 0, bookings: 0 };
          }
          monthlyData[monthKey].revenue += parseFloat(b.totalAmount || "0");
          monthlyData[monthKey].bookings += 1;
        });

        // Sort by month and format
        revenueByMonth = Object.entries(monthlyData)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, data]) => {
            const [year, monthNum] = month.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return {
              month: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
              revenue: data.revenue,
              bookings: data.bookings,
            };
          });

        // Property performance
        const propertiesInfo = await db
          .select({
            id: properties.id,
            name: properties.name,
          })
          .from(properties)
          .where(sql`${properties.id} = ANY(${propertyIds})`);

        const propertyMap = new Map(propertiesInfo.map(p => [p.id, p.name]));

        const propertyBookings: Record<number, { revenue: number; bookings: number; nights: number }> = {};
        bookingsData.forEach(b => {
          const propId = b.propertyId!;
          if (!propertyBookings[propId]) {
            propertyBookings[propId] = { revenue: 0, bookings: 0, nights: 0 };
          }
          propertyBookings[propId].revenue += parseFloat(b.totalAmount || "0");
          propertyBookings[propId].bookings += 1;
          const checkIn = new Date(b.checkIn);
          const checkOut = new Date(b.checkOut);
          propertyBookings[propId].nights += Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        });

        propertyPerformance = propertyIds.map(propId => {
          const data = propertyBookings[propId] || { revenue: 0, bookings: 0, nights: 0 };
          const propOccupancy = totalDays > 0 ? (data.nights / totalDays) * 100 : 0;
          return {
            propertyId: propId,
            propertyName: propertyMap.get(propId) || `Property #${propId}`,
            revenue: data.revenue,
            bookings: data.bookings,
            occupancyRate: Math.min(propOccupancy, 100),
            rating: 4.0 + Math.random() * 1.0, // Placeholder rating
          };
        }).sort((a, b) => b.revenue - a.revenue);

        // Task statistics
        const taskStats = await db
          .select({
            status: tasks.status,
            count: count(),
          })
          .from(tasks)
          .where(
            and(
              eq(tasks.organizationId, organizationId),
              sql`${tasks.propertyId} = ANY(${propertyIds})`
            )
          )
          .groupBy(tasks.status);

        taskStats.forEach(stat => {
          if (stat.status === 'completed') {
            completedTasks = Number(stat.count);
          } else if (stat.status === 'pending' || stat.status === 'in_progress') {
            pendingTasks += Number(stat.count);
          }
        });
      }

      // Generate AI suggestions based on data
      const suggestions: Array<{
        id: number;
        type: string;
        priority: string;
        title: string;
        description: string;
        actionable: boolean;
      }> = [];

      // Low occupancy suggestion
      if (occupancyRate < 50 && propertyIds.length > 0) {
        suggestions.push({
          id: 1,
          type: 'occupancy',
          priority: 'high',
          title: 'Improve Occupancy Rate',
          description: `Current occupancy is ${occupancyRate.toFixed(1)}%. Consider adjusting pricing, running promotions, or improving property listings to attract more bookings.`,
          actionable: true,
        });
      }

      // Low average booking value
      if (averageBookingValue < 500 && totalBookings > 0) {
        suggestions.push({
          id: 2,
          type: 'revenue',
          priority: 'medium',
          title: 'Increase Average Booking Value',
          description: `Average booking is $${averageBookingValue.toFixed(0)}. Consider offering premium add-ons, longer stay discounts, or seasonal pricing to increase revenue per booking.`,
          actionable: true,
        });
      }

      // Pending tasks warning
      if (pendingTasks > 5) {
        suggestions.push({
          id: 3,
          type: 'tasks',
          priority: 'medium',
          title: 'Address Pending Tasks',
          description: `You have ${pendingTasks} pending tasks. Prioritize completing maintenance and cleaning tasks to maintain property quality.`,
          actionable: true,
        });
      }

      // Performance praise
      if (occupancyRate > 70) {
        suggestions.push({
          id: 4,
          type: 'performance',
          priority: 'low',
          title: 'Excellent Occupancy Performance',
          description: `Your portfolio is performing well with ${occupancyRate.toFixed(1)}% occupancy. Consider expanding your portfolio or optimizing pricing for even better results.`,
          actionable: false,
        });
      }

      // Underperforming properties
      const underperformingProps = propertyPerformance.filter(p => p.occupancyRate < 30);
      if (underperformingProps.length > 0) {
        suggestions.push({
          id: 5,
          type: 'property',
          priority: 'high',
          title: 'Underperforming Properties Detected',
          description: `${underperformingProps.length} properties have less than 30% occupancy. Review listings, photos, and pricing for: ${underperformingProps.slice(0, 3).map(p => p.propertyName).join(', ')}.`,
          actionable: true,
        });
      }

      // Top performer recognition
      const topPerformer = propertyPerformance[0];
      if (topPerformer && topPerformer.revenue > 0) {
        suggestions.push({
          id: 6,
          type: 'insight',
          priority: 'low',
          title: 'Top Performing Property',
          description: `${topPerformer.propertyName} is your best performer with $${topPerformer.revenue.toLocaleString()} in revenue. Analyze what makes it successful and apply those strategies to other properties.`,
          actionable: false,
        });
      }

      // Default suggestion if no data
      if (suggestions.length === 0) {
        suggestions.push({
          id: 7,
          type: 'info',
          priority: 'low',
          title: 'Build Your Portfolio',
          description: 'Add properties to your portfolio and track bookings to receive personalized performance insights and AI-powered recommendations.',
          actionable: false,
        });
      }

      res.json({
        summary: {
          totalRevenue,
          totalBookings,
          averageBookingValue,
          occupancyRate: Math.min(occupancyRate, 100),
          propertyCount: propertyIds.length,
          completedTasks,
          pendingTasks,
        },
        revenueByMonth,
        propertyPerformance,
        suggestions,
        period: {
          startDate: startDateObj.toISOString().split('T')[0],
          endDate: endDateObj.toISOString().split('T')[0],
        },
      });
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).send(error.message);
    }
  });
}
