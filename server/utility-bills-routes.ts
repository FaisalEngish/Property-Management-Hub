import { Router } from "express";
import { db } from "./db";
import { utilityBills, properties } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { isDemoAuthenticated } from "./demoAuth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, "uploads/utility_bills");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
    }
  }
});

// GET /api/utility-bills - List utility bills
router.get("/", isDemoAuthenticated, async (req, res) => {
  console.log("[UTILITY-BILLS] GET /api/utility-bills hit");
  
  try {
    const orgId = req.user?.organizationId || "default-org";
    const order = req.query.order === 'asc' ? 'asc' : 'desc';
    const limit = Math.min(100, Number(req.query.limit) || 50);

    // Fetch bills with property name
    const rawBills = await db.select()
      .from(utilityBills)
      .leftJoin(properties, eq(utilityBills.propertyId, properties.id))
      .where(eq(utilityBills.organizationId, orgId))
      .orderBy(order === 'asc' ? utilityBills.dueDate : desc(utilityBills.dueDate))
      .limit(limit);

    // Transform the results to flatten the joined data
    const bills = rawBills.map((row: any) => ({
      id: row.utility_bills.id,
      organizationId: row.utility_bills.organizationId,
      propertyId: row.utility_bills.propertyId,
      propertyName: row.properties?.name || null,
      type: row.utility_bills.type,
      provider: row.utility_bills.provider,
      accountNumber: row.utility_bills.accountNumber,
      amount: row.utility_bills.amount,
      currency: row.utility_bills.currency,
      dueDate: row.utility_bills.dueDate,
      billPeriodStart: row.utility_bills.billPeriodStart,
      billPeriodEnd: row.utility_bills.billPeriodEnd,
      billingMonth: row.utility_bills.billingMonth,
      status: row.utility_bills.status,
      receiptUrl: row.utility_bills.receiptUrl,
      receiptFilename: row.utility_bills.receiptFilename,
      responsibleParty: row.utility_bills.responsibleParty,
      createdAt: row.utility_bills.createdAt,
    }));

    console.log("[UTILITY-BILLS] Found", bills.length, "bills");
    res.json(bills);

  } catch (err: any) {
    console.error("[UTILITY-BILLS] ERROR fetching bills:", err);
    res.status(500).json({ error: err.message || 'Server error fetching bills' });
  }
});

// POST /api/utility-bills - Upload utility bill
router.post("/", isDemoAuthenticated, upload.single('receipt'), async (req, res) => {
  console.log("[UTILITY-BILLS] POST /api/utility-bills hit");
  
  try {
    const orgId = req.user?.organizationId || "default-org";
    const { property_id, bill_type, amount, due_date, provider, account_number, billing_month, responsible_party } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Receipt file is required' });
    }

    if (!property_id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    if (!bill_type) {
      return res.status(400).json({ error: 'Bill type is required' });
    }

    if (!due_date) {
      return res.status(400).json({ error: 'Due date is required' });
    }

    if (!billing_month) {
      return res.status(400).json({ error: 'Billing month is required' });
    }

    // Create the utility bill record
    const newBill = await db.insert(utilityBills).values({
      organizationId: orgId,
      propertyId: parseInt(property_id, 10),
      type: bill_type,
      provider: provider || null,
      accountNumber: account_number || null,
      amount: amount ? amount : null,
      currency: "AUD",
      dueDate: new Date(due_date),
      billingMonth: billing_month,
      status: "uploaded",
      receiptUrl: `/uploads/utility_bills/${file.filename}`,
      receiptFilename: file.originalname,
      responsibleParty: responsible_party || "owner",
      reminderSent: false,
      isRecurring: true,
      createdAt: new Date(),
    }).returning();

    console.log("[UTILITY-BILLS] Created bill:", newBill[0]);
    
    // Fetch the created bill with property name
    const rawCreatedBill = await db.select()
      .from(utilityBills)
      .leftJoin(properties, eq(utilityBills.propertyId, properties.id))
      .where(eq(utilityBills.id, newBill[0].id))
      .limit(1);

    const createdBill = {
      ...rawCreatedBill[0].utility_bills,
      propertyName: rawCreatedBill[0].properties?.name || null,
    };

    res.status(201).json({ bill: createdBill });

  } catch (err: any) {
    console.error("[UTILITY-BILLS] ERROR creating bill:", err);
    res.status(500).json({ error: err.message || 'Server error creating bill' });
  }
});

// PATCH /api/utility-bills/:id - Update bill status
router.patch("/:id", isDemoAuthenticated, async (req, res) => {
  console.log("[UTILITY-BILLS] PATCH /api/utility-bills/:id hit");
  
  try {
    const orgId = req.user?.organizationId || "default-org";
    const billId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'uploaded', 'paid', 'overdue'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Update the bill
    const updated = await db.update(utilityBills)
      .set({ status })
      .where(and(
        eq(utilityBills.id, billId),
        eq(utilityBills.organizationId, orgId)
      ))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    console.log("[UTILITY-BILLS] Updated bill status:", updated[0]);
    res.json({ bill: updated[0] });

  } catch (err: any) {
    console.error("[UTILITY-BILLS] ERROR updating bill:", err);
    res.status(500).json({ error: err.message || 'Server error updating bill' });
  }
});

// DELETE /api/utility-bills/:id - Delete a utility bill
router.delete("/:id", isDemoAuthenticated, async (req, res) => {
  console.log("[UTILITY-BILLS] DELETE /api/utility-bills/:id hit");
  
  try {
    const orgId = req.user?.organizationId || "default-org";
    const billId = parseInt(req.params.id, 10);

    // First, get the bill to delete the receipt file if it exists
    const bill = await db.select()
      .from(utilityBills)
      .where(and(
        eq(utilityBills.id, billId),
        eq(utilityBills.organizationId, orgId)
      ))
      .limit(1);

    if (!bill.length) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Delete the file if it exists
    if (bill[0].receiptFilename) {
      const filePath = path.join(uploadsDir, path.basename(bill[0].receiptUrl || ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("[UTILITY-BILLS] Deleted file:", filePath);
      }
    }

    // Delete the bill record
    const deleted = await db.delete(utilityBills)
      .where(and(
        eq(utilityBills.id, billId),
        eq(utilityBills.organizationId, orgId)
      ))
      .returning();

    console.log("[UTILITY-BILLS] Deleted bill:", deleted[0]);
    res.json({ message: 'Bill deleted successfully', bill: deleted[0] });

  } catch (err: any) {
    console.error("[UTILITY-BILLS] ERROR deleting bill:", err);
    res.status(500).json({ error: err.message || 'Server error deleting bill' });
  }
});

// Serve uploaded files statically
router.use('/uploads', (req, res, next) => {
  console.log("[UTILITY-BILLS] Serving file:", req.path);
  next();
});

export default router;
