import { Request, Response } from 'express';
import { storage } from './storage';
import { insertStaffMemberSchema, insertStaffDocumentSchema, insertPayrollRecordSchema } from '@shared/schema';
import { z } from 'zod';

// ===== STAFF MEMBER ROUTES =====

export async function getStaffMembers(req: Request, res: Response) {
  try {
    const { organizationId } = req.query;
    const { department, status } = req.query;

    if (!organizationId || typeof organizationId !== 'string') {
      return res.status(400).json({ 
        error: 'Organization ID is required' 
      });
    }

    const filters: any = {};
    if (department && typeof department === 'string') filters.department = department;
    if (status && typeof status === 'string') filters.status = status;

    const staffMembers = await storage.getStaffMembers(organizationId, filters);
    res.json(staffMembers);
  } catch (error) {
    console.error('Error in getStaffMembers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch staff members',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getStaffMember(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const staffId = parseInt(id);

    if (isNaN(staffId)) {
      return res.status(400).json({ 
        error: 'Invalid staff member ID' 
      });
    }

    const staffMember = await storage.getStaffMember(staffId);
    
    if (!staffMember) {
      return res.status(404).json({ 
        error: 'Staff member not found' 
      });
    }

    res.json(staffMember);
  } catch (error) {
    console.error('Error in getStaffMember:', error);
    res.status(500).json({ 
      error: 'Failed to fetch staff member',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function createStaffMember(req: Request, res: Response) {
  try {
    const validation = insertStaffMemberSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const staffMember = await storage.createStaffMember(validation.data);
    res.status(201).json(staffMember);
  } catch (error) {
    console.error('Error in createStaffMember:', error);
    res.status(500).json({ 
      error: 'Failed to create staff member',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function updateStaffMember(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const staffId = parseInt(id);

    if (isNaN(staffId)) {
      return res.status(400).json({ 
        error: 'Invalid staff member ID' 
      });
    }

    const validation = insertStaffMemberSchema.partial().safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const updatedStaffMember = await storage.updateStaffMember(staffId, validation.data);
    
    if (!updatedStaffMember) {
      return res.status(404).json({ 
        error: 'Staff member not found' 
      });
    }

    res.json(updatedStaffMember);
  } catch (error) {
    console.error('Error in updateStaffMember:', error);
    res.status(500).json({ 
      error: 'Failed to update staff member',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function deleteStaffMember(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const staffId = parseInt(id);

    if (isNaN(staffId)) {
      return res.status(400).json({ 
        error: 'Invalid staff member ID' 
      });
    }

    const success = await storage.deleteStaffMember(staffId);
    
    if (!success) {
      return res.status(404).json({ 
        error: 'Staff member not found' 
      });
    }

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error in deleteStaffMember:', error);
    res.status(500).json({ 
      error: 'Failed to delete staff member',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// ===== STAFF DOCUMENT ROUTES =====

export async function getStaffDocuments(req: Request, res: Response) {
  try {
    const { staffMemberId } = req.params;
    const staffId = parseInt(staffMemberId);

    if (isNaN(staffId)) {
      return res.status(400).json({ 
        error: 'Invalid staff member ID' 
      });
    }

    const documents = await storage.getStaffDocuments(staffId);
    res.json(documents);
  } catch (error) {
    console.error('Error in getStaffDocuments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch staff documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function createStaffDocument(req: Request, res: Response) {
  try {
    const validation = insertStaffDocumentSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const document = await storage.createStaffDocument(validation.data);
    res.status(201).json(document);
  } catch (error) {
    console.error('Error in createStaffDocument:', error);
    res.status(500).json({ 
      error: 'Failed to create staff document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// ===== PAYROLL RECORD ROUTES =====

export async function getPayrollRecords(req: Request, res: Response) {
  try {
    const { organizationId } = req.query;
    const { staffMemberId, payPeriodStart, payPeriodEnd } = req.query;

    if (!organizationId || typeof organizationId !== 'string') {
      return res.status(400).json({ 
        error: 'Organization ID is required' 
      });
    }

    const filters: any = {};
    if (staffMemberId && typeof staffMemberId === 'string') {
      const id = parseInt(staffMemberId);
      if (!isNaN(id)) filters.staffMemberId = id;
    }
    if (payPeriodStart && typeof payPeriodStart === 'string') filters.payPeriodStart = payPeriodStart;
    if (payPeriodEnd && typeof payPeriodEnd === 'string') filters.payPeriodEnd = payPeriodEnd;

    const payrollRecords = await storage.getPayrollRecords(organizationId, filters);
    res.json(payrollRecords);
  } catch (error) {
    console.error('Error in getPayrollRecords:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payroll records',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function createPayrollRecord(req: Request, res: Response) {
  try {
    const validation = insertPayrollRecordSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const payrollRecord = await storage.createPayrollRecord(validation.data);
    res.status(201).json(payrollRecord);
  } catch (error) {
    console.error('Error in createPayrollRecord:', error);
    res.status(500).json({ 
      error: 'Failed to create payroll record',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// ===== STAFF ANALYTICS ROUTES =====

export async function getStaffAnalytics(req: Request, res: Response) {
  try {
    const { organizationId } = req.query;

    if (!organizationId || typeof organizationId !== 'string') {
      return res.status(400).json({ 
        error: 'Organization ID is required' 
      });
    }

    const analytics = await storage.getStaffAnalytics(organizationId);
    res.json(analytics);
  } catch (error) {
    console.error('Error in getStaffAnalytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch staff analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}