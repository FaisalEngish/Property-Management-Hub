import type { Express } from "express";
import { storage } from "./storage";
import { isDemoAuthenticated } from "./demoAuth";

export function registerPropertyDocumentRoutes(app: Express) {
  console.log("=== REGISTERING PROPERTY DOCUMENT ROUTES ===");

  // Get property documents by property ID
  app.get("/api/property-documents/property/:propertyId", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const organizationId = req.user?.organizationId || "default-org";
      
      console.log(`[PROPERTY-DOCS] GET - Fetching documents for property ${propertyId}, org ${organizationId}`);
      
      const documents = await storage.getPropertyDocuments(organizationId, {
        propertyId: parseInt(propertyId)
      });
      
      console.log(`[PROPERTY-DOCS] GET - Found ${documents?.length || 0} documents`);
      res.json(documents);
    } catch (error) {
      console.error("[PROPERTY-DOCS] GET - Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents by property" });
    }
  });

  // Create new property document
  app.post("/api/property-documents", isDemoAuthenticated, async (req, res) => {
    console.log("[PROPERTY-DOCS] POST endpoint hit");
    console.log("[PROPERTY-DOCS] Request body:", JSON.stringify(req.body, null, 2));
    console.log("[PROPERTY-DOCS] User:", req.user);
    
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const documentData = req.body;
      
      console.log("[PROPERTY-DOCS] Received data:", JSON.stringify(documentData));
      console.log("[PROPERTY-DOCS] Organization ID:", organizationId);
      
      if (!documentData.docType || !documentData.fileUrl || !documentData.uploadedBy) {
        console.log("[PROPERTY-DOCS] ERROR: Validation failed - missing required fields");
        return res.status(400).json({ message: "Document type, file URL, and uploader are required" });
      }

      console.log("[PROPERTY-DOCS] Validation passed, calling storage.createPropertyDocument...");
      const created = await storage.createPropertyDocument(organizationId, documentData);
      console.log("[PROPERTY-DOCS] Document created successfully:", JSON.stringify(created, null, 2));
      
      res.json(created);
    } catch (error) {
      console.error("[PROPERTY-DOCS] ERROR creating property document:", error);
      res.status(500).json({ message: "Failed to create property document" });
    }
  });

  console.log("=== PROPERTY DOCUMENT ROUTES REGISTERED ===");
}
