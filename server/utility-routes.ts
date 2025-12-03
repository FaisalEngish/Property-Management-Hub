import { Router } from "express";
import { db } from "./db";
import { 
  utilityBills, 
  propertyUtilityAccounts, 
  utilityAlertRules,
  utilityBillAlerts,
  properties 
} from "@shared/schema";
import { eq, and, desc, gte, lte, isNull, or, sql } from "drizzle-orm";
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

// ===== UTILITY ACCOUNTS ROUTES =====

// GET /api/utility/accounts - Get all utility accounts
router.get("/accounts", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : null;

    let query = db.select()
      .from(propertyUtilityAccounts)
      .leftJoin(properties, eq(propertyUtilityAccounts.propertyId, properties.id))
      .where(eq(propertyUtilityAccounts.organizationId, orgId));

    if (propertyId) {
      query = query.where(and(
        eq(propertyUtilityAccounts.organizationId, orgId),
        eq(propertyUtilityAccounts.propertyId, propertyId)
      )) as any;
    }

    const rawAccounts = await query;

    const accounts = rawAccounts.map((row: any) => ({
      ...row.property_utility_accounts,
      propertyName: row.properties?.name || null,
    }));

    res.json(accounts);
  } catch (err: any) {
    console.error("[UTILITY] ERROR fetching accounts:", err);
    res.status(500).json({ error: err.message || 'Server error fetching accounts' });
  }
});

// POST /api/utility/accounts - Create new utility account
router.post("/accounts", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const { propertyId, utilityType, provider, accountNumber, packageInfo, expectedBillDay } = req.body;

    if (!propertyId || !utilityType || !provider || !accountNumber || !expectedBillDay) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newAccount = await db.insert(propertyUtilityAccounts).values({
      organizationId: orgId,
      propertyId: parseInt(propertyId),
      utilityType,
      provider,
      accountNumber,
      packageInfo: packageInfo || null,
      expectedBillDay: parseInt(expectedBillDay),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.status(201).json(newAccount[0]);
  } catch (err: any) {
    console.error("[UTILITY] ERROR creating account:", err);
    res.status(500).json({ error: err.message || 'Server error creating account' });
  }
});

// PATCH /api/utility/accounts/:id - Update utility account
router.patch("/accounts/:id", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const accountId = parseInt(req.params.id);
    const { provider, accountNumber, packageInfo, expectedBillDay, isActive } = req.body;

    const updateData: any = { updatedAt: new Date() };
    if (provider !== undefined) updateData.provider = provider;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
    if (packageInfo !== undefined) updateData.packageInfo = packageInfo;
    if (expectedBillDay !== undefined) updateData.expectedBillDay = parseInt(expectedBillDay);
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await db.update(propertyUtilityAccounts)
      .set(updateData)
      .where(and(
        eq(propertyUtilityAccounts.id, accountId),
        eq(propertyUtilityAccounts.organizationId, orgId)
      ))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(updated[0]);
  } catch (err: any) {
    console.error("[UTILITY] ERROR updating account:", err);
    res.status(500).json({ error: err.message || 'Server error updating account' });
  }
});

// DELETE /api/utility/accounts/:id - Delete utility account
router.delete("/accounts/:id", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const accountId = parseInt(req.params.id);

    const deleted = await db.delete(propertyUtilityAccounts)
      .where(and(
        eq(propertyUtilityAccounts.id, accountId),
        eq(propertyUtilityAccounts.organizationId, orgId)
      ))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ message: 'Account deleted successfully', account: deleted[0] });
  } catch (err: any) {
    console.error("[UTILITY] ERROR deleting account:", err);
    res.status(500).json({ error: err.message || 'Server error deleting account' });
  }
});

// ===== UTILITY BILLS ROUTES =====

// GET /api/utility/bills - Get all utility bills
router.get("/bills", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : null;
    const status = req.query.status as string;
    const utilityType = req.query.utilityType as string;
    const limit = Math.min(100, Number(req.query.limit) || 50);

    let conditions = [eq(utilityBills.organizationId, orgId)];

    if (propertyId) {
      conditions.push(eq(utilityBills.propertyId, propertyId));
    }

    if (status) {
      conditions.push(eq(utilityBills.status, status));
    }

    if (utilityType) {
      conditions.push(eq(utilityBills.type, utilityType));
    }

    const rawBills = await db.select()
      .from(utilityBills)
      .leftJoin(properties, eq(utilityBills.propertyId, properties.id))
      .where(and(...conditions))
      .orderBy(desc(utilityBills.dueDate))
      .limit(limit);

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
      notes: row.utility_bills.notes,
      createdAt: row.utility_bills.createdAt,
    }));

    res.json(bills);
  } catch (err: any) {
    console.error("[UTILITY] ERROR fetching bills:", err);
    res.status(500).json({ error: err.message || 'Server error fetching bills' });
  }
});

// POST /api/utility/bills - Create/upload utility bill
router.post("/bills", isDemoAuthenticated, upload.single('receipt'), async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const { propertyId, utilityType, provider, accountNumber, amount, currency, dueDate, billingMonth, status, notes } = req.body;
    const file = req.file;

    if (!propertyId || !utilityType || !dueDate || !billingMonth) {
      return res.status(400).json({ error: 'Missing required fields: propertyId, utilityType, dueDate, billingMonth' });
    }

    const billData: any = {
      organizationId: orgId,
      propertyId: parseInt(propertyId),
      type: utilityType,
      provider: provider || null,
      accountNumber: accountNumber || null,
      amount: amount ? amount : null,
      currency: currency || "AUD",
      dueDate: new Date(dueDate),
      billingMonth: billingMonth,
      status: status || "pending",
      notes: notes || null,
      uploadedBy: req.user?.id,
      uploadedAt: new Date(),
      createdAt: new Date(),
    };

    if (file) {
      billData.receiptUrl = `/uploads/utility_bills/${file.filename}`;
      billData.receiptFilename = file.originalname;
    }

    const newBill = await db.insert(utilityBills).values(billData).returning();

    const rawCreatedBill = await db.select()
      .from(utilityBills)
      .leftJoin(properties, eq(utilityBills.propertyId, properties.id))
      .where(eq(utilityBills.id, newBill[0].id))
      .limit(1);

    const createdBill = {
      ...rawCreatedBill[0].utility_bills,
      propertyName: rawCreatedBill[0].properties?.name || null,
    };

    res.status(201).json(createdBill);
  } catch (err: any) {
    console.error("[UTILITY] ERROR creating bill:", err);
    res.status(500).json({ error: err.message || 'Server error creating bill' });
  }
});

// PATCH /api/utility/bills/:id - Update bill
router.patch("/bills/:id", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const billId = parseInt(req.params.id);
    const { status, amount, notes, provider, accountNumber } = req.body;

    const updateData: any = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (amount !== undefined) updateData.amount = amount;
    if (notes !== undefined) updateData.notes = notes;
    if (provider !== undefined) updateData.provider = provider;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;

    const updated = await db.update(utilityBills)
      .set(updateData)
      .where(and(
        eq(utilityBills.id, billId),
        eq(utilityBills.organizationId, orgId)
      ))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(updated[0]);
  } catch (err: any) {
    console.error("[UTILITY] ERROR updating bill:", err);
    res.status(500).json({ error: err.message || 'Server error updating bill' });
  }
});

// DELETE /api/utility/bills/:id - Delete bill
router.delete("/bills/:id", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const billId = parseInt(req.params.id);

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

    if (bill[0].receiptFilename) {
      const filePath = path.join(uploadsDir, path.basename(bill[0].receiptUrl || ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const deleted = await db.delete(utilityBills)
      .where(and(
        eq(utilityBills.id, billId),
        eq(utilityBills.organizationId, orgId)
      ))
      .returning();

    res.json({ message: 'Bill deleted successfully', bill: deleted[0] });
  } catch (err: any) {
    console.error("[UTILITY] ERROR deleting bill:", err);
    res.status(500).json({ error: err.message || 'Server error deleting bill' });
  }
});

// ===== ALERTS ROUTES =====

// GET /api/utility/alert-rules - Get alert rules
router.get("/alert-rules", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";

    const rules = await db.select()
      .from(utilityAlertRules)
      .where(eq(utilityAlertRules.organizationId, orgId))
      .orderBy(desc(utilityAlertRules.createdAt));

    res.json(rules);
  } catch (err: any) {
    console.error("[UTILITY] ERROR fetching alert rules:", err);
    // If table doesn't exist yet, return empty array
    if (err.code === '42P01') {
      return res.json([]);
    }
    res.status(500).json({ error: err.message || 'Server error fetching alert rules' });
  }
});

// POST /api/utility/alert-rules - Create alert rule
router.post("/alert-rules", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const { propertyId, utilityType, alertType, threshold, daysBeforeDue, notifyUsers, notifyRoles } = req.body;

    if (!alertType) {
      return res.status(400).json({ error: 'Alert type is required' });
    }

    const newRule = await db.insert(utilityAlertRules).values({
      organizationId: orgId,
      propertyId: (propertyId && propertyId !== 'all') ? parseInt(propertyId) : null,
      utilityType: (utilityType && utilityType !== 'all') ? utilityType : null,
      alertType,
      threshold: threshold || null,
      daysBeforeDue: daysBeforeDue ? parseInt(daysBeforeDue) : null,
      isEnabled: true,
      notifyUsers: notifyUsers || [],
      notifyRoles: notifyRoles || [],
      createdBy: req.user?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.status(201).json(newRule[0]);
  } catch (err: any) {
    console.error("[UTILITY] ERROR creating alert rule:", err);
    res.status(500).json({ error: err.message || 'Server error creating alert rule' });
  }
});

// PATCH /api/utility/alert-rules/:id - Update alert rule
router.patch("/alert-rules/:id", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const ruleId = parseInt(req.params.id);
    const { isEnabled, threshold, daysBeforeDue, notifyUsers, notifyRoles } = req.body;

    const updateData: any = { updatedAt: new Date() };
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
    if (threshold !== undefined) updateData.threshold = threshold;
    if (daysBeforeDue !== undefined) updateData.daysBeforeDue = daysBeforeDue;
    if (notifyUsers !== undefined) updateData.notifyUsers = notifyUsers;
    if (notifyRoles !== undefined) updateData.notifyRoles = notifyRoles;

    const updated = await db.update(utilityAlertRules)
      .set(updateData)
      .where(and(
        eq(utilityAlertRules.id, ruleId),
        eq(utilityAlertRules.organizationId, orgId)
      ))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    res.json(updated[0]);
  } catch (err: any) {
    console.error("[UTILITY] ERROR updating alert rule:", err);
    res.status(500).json({ error: err.message || 'Server error updating alert rule' });
  }
});

// DELETE /api/utility/alert-rules/:id - Delete alert rule
router.delete("/alert-rules/:id", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const ruleId = parseInt(req.params.id);

    const deleted = await db.delete(utilityAlertRules)
      .where(and(
        eq(utilityAlertRules.id, ruleId),
        eq(utilityAlertRules.organizationId, orgId)
      ))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    res.json({ message: 'Alert rule deleted successfully', rule: deleted[0] });
  } catch (err: any) {
    console.error("[UTILITY] ERROR deleting alert rule:", err);
    res.status(500).json({ error: err.message || 'Server error deleting alert rule' });
  }
});

// GET /api/utility/alerts - Get alerts
router.get("/alerts", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const status = req.query.status as string;

    let conditions = [eq(utilityBillAlerts.organizationId, orgId)];

    if (status) {
      conditions.push(eq(utilityBillAlerts.alertStatus, status));
    }

    const alerts = await db.select()
      .from(utilityBillAlerts)
      .leftJoin(properties, eq(utilityBillAlerts.propertyId, properties.id))
      .where(and(...conditions))
      .orderBy(desc(utilityBillAlerts.createdAt))
      .limit(50);

    const formattedAlerts = alerts.map((row: any) => ({
      ...row.utility_bill_alerts,
      propertyName: row.properties?.name || null,
    }));

    res.json(formattedAlerts);
  } catch (err: any) {
    console.error("[UTILITY] ERROR fetching alerts:", err);
    // If table doesn't exist yet, return empty array
    if (err.code === '42P01') {
      return res.json([]);
    }
    res.status(500).json({ error: err.message || 'Server error fetching alerts' });
  }
});

// PATCH /api/utility/alerts/:id - Update alert status
router.patch("/alerts/:id", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const alertId = parseInt(req.params.id);
    const { alertStatus } = req.body;

    const updateData: any = {};
    if (alertStatus === 'acknowledged') {
      updateData.alertStatus = 'acknowledged';
      updateData.acknowledgedBy = req.user?.id;
      updateData.acknowledgedAt = new Date();
    } else if (alertStatus === 'resolved') {
      updateData.alertStatus = 'resolved';
      updateData.resolvedBy = req.user?.id;
      updateData.resolvedAt = new Date();
    } else if (alertStatus) {
      updateData.alertStatus = alertStatus;
    }

    const updated = await db.update(utilityBillAlerts)
      .set(updateData)
      .where(and(
        eq(utilityBillAlerts.id, alertId),
        eq(utilityBillAlerts.organizationId, orgId)
      ))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(updated[0]);
  } catch (err: any) {
    console.error("[UTILITY] ERROR updating alert:", err);
    res.status(500).json({ error: err.message || 'Server error updating alert' });
  }
});

// ===== ANALYTICS ROUTES =====

// GET /api/utility/analytics - Get analytics summary
router.get("/analytics", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : null;

    let conditions = [eq(utilityBills.organizationId, orgId)];
    if (propertyId) {
      conditions.push(eq(utilityBills.propertyId, propertyId));
    }

    const bills = await db.select()
      .from(utilityBills)
      .where(and(...conditions));

    const totalAmount = bills.reduce((sum, bill) => sum + (parseFloat(bill.amount as any) || 0), 0);
    const paidAmount = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + (parseFloat(bill.amount as any) || 0), 0);
    const pendingAmount = bills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + (parseFloat(bill.amount as any) || 0), 0);
    const overdueAmount = bills.filter(b => b.status === 'overdue').reduce((sum, bill) => sum + (parseFloat(bill.amount as any) || 0), 0);

    const byType = bills.reduce((acc: any, bill) => {
      if (!acc[bill.type]) {
        acc[bill.type] = { count: 0, total: 0 };
      }
      acc[bill.type].count++;
      acc[bill.type].total += parseFloat(bill.amount as any) || 0;
      return acc;
    }, {});

    const byProperty = bills.reduce((acc: any, bill) => {
      const propId = bill.propertyId;
      if (!acc[propId]) {
        acc[propId] = { count: 0, total: 0 };
      }
      acc[propId].count++;
      acc[propId].total += parseFloat(bill.amount as any) || 0;
      return acc;
    }, {});

    const byMonth = bills.reduce((acc: any, bill) => {
      const month = bill.billingMonth;
      if (!acc[month]) {
        acc[month] = { count: 0, total: 0 };
      }
      acc[month].count++;
      acc[month].total += parseFloat(bill.amount as any) || 0;
      return acc;
    }, {});

    res.json({
      summary: {
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        billCount: bills.length,
      },
      byType,
      byProperty,
      byMonth,
    });
  } catch (err: any) {
    console.error("[UTILITY] ERROR fetching analytics:", err);
    res.status(500).json({ error: err.message || 'Server error fetching analytics' });
  }
});

export default router;
