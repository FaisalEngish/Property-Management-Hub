import express from "express";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { isDemoAuthenticated } from "./demoAuth";
import { db } from "./db";
import { propertyDocuments } from "@shared/schema";
import { eq, and, desc, lte, sql } from "drizzle-orm";
import fs from "fs";

export const propertyDocRouter = express.Router();

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'server/uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}_${sanitizedFilename}`;
    cb(null, uniqueName);
  }
});

// File filter to accept only allowed types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed: PDF, JPG, PNG, XLSX, XLS'));
  }
};

const upload = multer({
  storage: uploadStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// Role check middleware
const requireDocumentAccess = (req: any, res: any, next: any) => {
  const ALLOWED = new Set(['admin', 'Administrator', 'portfolio-manager', 'Portfolio Manager', 'owner', 'Owner']);
  const roles = req.user?.roles || (req.user?.role ? [req.user.role] : []);
  const hasAccess = Array.isArray(roles) ? roles.some(r => ALLOWED.has(r)) : ALLOWED.has(req.user?.role);
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied. Admin, Portfolio Manager, or Owner role required.' });
  }
  next();
};

// File upload endpoint
propertyDocRouter.post("/upload", isDemoAuthenticated, requireDocumentAccess, upload.single('file'), async (req, res) => {
  console.log("[ALT-ROUTE] POST /api/property-documents/upload hit");
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      fileName,
      category,
      fileType,
      tags,
      description,
      propertyId
    } = req.body;

    if (!fileName || !category || !propertyId) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Missing required fields: fileName, category, or propertyId' });
    }

    const orgId = req.user?.organizationId || "default-org";
    const filePath = `/uploads/documents/${req.file.filename}`;
    
    // Parse tags
    const parsedTags = tags ? tags.split(',').map((t: string) => t.trim()) : [];

    // Create document record
    const documentData = {
      organizationId: orgId,
      propertyId: parseInt(propertyId),
      docType: category,
      fileName: fileName,
      fileUrl: filePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category: category,
      tags: parsedTags,
      description: description || null,
      uploadedBy: req.user?.id || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const created = await storage.createPropertyDocument(orgId, documentData);
    console.log("[ALT-ROUTE] File uploaded successfully:", created);
    
    res.json(created);
  } catch (err: any) {
    console.error("[ALT-ROUTE] ERROR uploading file:", err);
    
    // Clean up file if it was uploaded
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
    }
    
    res.status(500).json({ error: err.message || 'Server error uploading file' });
  }
});

// Original POST endpoint (for backward compatibility)
propertyDocRouter.post("/", isDemoAuthenticated, async (req, res) => {
  console.log("[ALT-ROUTE] POST /api/property-documents hit");
  try {
    const orgId = req.user?.organizationId || "default-org";
    const data = req.body;
    
    console.log("[ALT-ROUTE] POST data:", JSON.stringify(data));
    
    if (!data.docType || !data.fileUrl || !data.uploadedBy) {
      console.log("[ALT-ROUTE] POST validation failed");
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Add defaults for new fields to ensure backward compatibility
    const documentData = {
      ...data,
      fileName: data.fileName || null,
      fileSize: data.fileSize || null,
      mimeType: data.mimeType || null,
      category: data.category || data.docType,
      tags: data.tags || [],
      description: data.description || null,
      updatedAt: new Date()
    };
    
    const created = await storage.createPropertyDocument(orgId, documentData);
    console.log("[ALT-ROUTE] POST created document:", JSON.stringify(created));
    res.json(created);
  } catch (err) {
    console.error("[ALT-ROUTE] ERROR creating document:", err);
    res.status(500).json({ message: "Server error creating document" });
  }
});

propertyDocRouter.get("/expiring", isDemoAuthenticated, async (req, res) => {
  console.log("[ALT-ROUTE] GET /api/property-documents/expiring hit");
  try {
    const orgId = req.user?.organizationId || "default-org";
    const days = parseInt(req.query.days as string) || 30;
    
    // Calculate future date threshold
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    console.log(`[ALT-ROUTE] Checking for documents expiring before ${futureDateStr} for org ${orgId}`);
    
    // Direct database query - fetch documents with expiryDate <= futureDate (includes expired and soon-to-expire)
    const expiringDocs = await db.select()
      .from(propertyDocuments)
      .where(and(
        eq(propertyDocuments.organizationId, orgId),
        lte(propertyDocuments.expiryDate, futureDateStr)
      ))
      .orderBy(propertyDocuments.expiryDate);
    
    console.log(`[ALT-ROUTE] Found ${expiringDocs.length} expiring/expired documents:`, JSON.stringify(expiringDocs));
    res.json(expiringDocs);
  } catch (err) {
    console.error("[ALT-ROUTE] ERROR fetching expiring documents:", err);
    res.status(500).json({ message: "Server error fetching expiring documents" });
  }
});

propertyDocRouter.get("/property/:propertyId", isDemoAuthenticated, async (req, res) => {
  console.log("[ALT-ROUTE] GET /api/property-documents/property/:propertyId hit");
  try {
    const orgId = req.user?.organizationId || "default-org";
    const { propertyId } = req.params;
    
    console.log(`[ALT-ROUTE] GET - Fetching docs for property ${propertyId}, org ${orgId}`);
    
    // Direct database query using actual schema columns (bypass broken storage method)
    const docs = await db.select()
      .from(propertyDocuments)
      .where(and(
        eq(propertyDocuments.organizationId, orgId),
        eq(propertyDocuments.propertyId, Number(propertyId))
      ))
      .orderBy(desc(propertyDocuments.createdAt));
    
    console.log(`[ALT-ROUTE] GET - Found ${docs?.length || 0} documents:`, JSON.stringify(docs));
    res.json(docs);
  } catch (err) {
    console.error("[ALT-ROUTE] ERROR fetching documents:", err);
    res.status(500).json({ message: "Server error fetching documents" });
  }
});

// Base GET endpoint for all documents
propertyDocRouter.get("/", isDemoAuthenticated, async (req, res) => {
  console.log("[ALT-ROUTE] GET /api/property-documents/ hit");
  try {
    const orgId = req.user?.organizationId || "default-org";
    
    console.log(`[ALT-ROUTE] GET - Fetching all docs for org ${orgId}`);
    
    const docs = await db.select()
      .from(propertyDocuments)
      .where(eq(propertyDocuments.organizationId, orgId))
      .orderBy(desc(propertyDocuments.createdAt));
    
    console.log(`[ALT-ROUTE] GET - Found ${docs?.length || 0} documents`);
    res.json(docs);
  } catch (err) {
    console.error("[ALT-ROUTE] ERROR fetching all documents:", err);
    res.status(500).json({ message: "Server error fetching documents" });
  }
});
