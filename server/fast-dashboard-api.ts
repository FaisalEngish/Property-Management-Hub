// Fast dashboard API endpoints optimized for performance
import { Express } from 'express';
import { isDemoAuthenticated } from './demoAuth';

export function registerFastDashboardRoutes(app: Express) {

  // Fast tasks endpoint for dashboard - only recent tasks
  app.get('/api/dashboard/recent-tasks', isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const { storage } = await import('./storage');
      
      const allTasks = await storage.getTasks();
      
      // Filter by organization and get only recent 10 tasks
      const filteredTasks = allTasks
        .filter(task => task.organizationId === organizationId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      
      res.json(filteredTasks);
    } catch (error) {
      console.error("Error fetching recent tasks:", error);
      res.status(500).json({ message: "Failed to fetch recent tasks" });
    }
  });

  // Fast task stats endpoint for dashboard
  app.get('/api/dashboard/task-stats', isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const { storage } = await import('./storage');
      
      const allTasks = await storage.getTasks();
      const orgTasks = allTasks.filter(task => task.organizationId === organizationId);
      
      const stats = {
        total: orgTasks.length,
        pending: orgTasks.filter(t => t.status === 'pending').length,
        inProgress: orgTasks.filter(t => t.status === 'in-progress').length,
        completed: orgTasks.filter(t => t.status === 'completed').length,
        highPriority: orgTasks.filter(t => t.priority === 'high').length,
        overdue: orgTasks.filter(t => {
          if (!t.dueDate) return false;
          return new Date(t.dueDate) < new Date();
        }).length
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching task stats:", error);
      res.status(500).json({ message: "Failed to fetch task stats" });
    }
  });

  // Finance export endpoints - moved here to ensure they're registered before Vite middleware
  app.post('/api/finance-export', isDemoAuthenticated, async (req: any, res) => {
    console.log(`🚀 Finance export endpoint called`);
    console.log(`📋 Request body:`, req.body);
    console.log(`👤 User:`, req.user ? { id: req.user.id, organizationId: req.user.organizationId } : 'No user');
    
    try {
      if (!req.user) {
        console.error(`❌ No user found in request`);
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { organizationId, id: userId } = req.user;
      const { exportType, format, dateRange, filters } = req.body;
      
      console.log(`📋 Finance export requested: ${exportType} format by user ${userId} for org ${organizationId}`);
      
      if (!exportType) {
        console.error(`❌ No export type specified`);
        return res.status(400).json({ error: 'Export type is required' });
      }

      // Get financial data with detailed logging
      console.log(`🔍 Fetching financial data...`);
      const { storage } = await import('./storage');
      const finances = await storage.getFinances();
      console.log(`💰 Retrieved ${finances.length} total finance records`);
      
      const organizationFinances = finances.filter(f => 
        f.organizationId === organizationId || 
        f.organizationId === 'default-org' || 
        f.organizationId === 'demo-org'
      );
      
      console.log(`📊 Found ${organizationFinances.length} financial records for export after filtering`);
      
      if (exportType === 'csv') {
        console.log(`📝 Generating CSV export...`);
        
        // Generate Excel-compatible CSV content with proper escaping
        const csvHeaders = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Property', 'Status', 'Transaction ID'];
        
        const csvRows = organizationFinances.map(f => {
          // Escape special characters for Excel compatibility
          const escapeCSVField = (field: any) => {
            if (field === null || field === undefined) return '';
            const str = String(field);
            // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
            if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          };
          
          return [
            escapeCSVField(f.date || new Date().toISOString().split('T')[0]),
            escapeCSVField((f.type || 'income').toUpperCase()),
            escapeCSVField(f.amount || '0'),
            escapeCSVField(f.category || 'General'),
            escapeCSVField(f.description || 'Transaction'),
            escapeCSVField(f.propertyId ? `Property ${f.propertyId}` : 'General'),
            escapeCSVField(f.status || 'confirmed'),
            escapeCSVField(f.id || '')
          ];
        });
        
        // Add BOM for Excel UTF-8 compatibility
        const BOM = '\uFEFF';
        const csvContent = BOM + [
          csvHeaders.join(','),
          ...csvRows.map(row => row.join(','))
        ].join('\r\n'); // Use Windows line endings for Excel compatibility
        
        // Set proper headers for CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="financial_export.csv"');
        res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8').toString());
        res.send(csvContent);
        
        console.log(`✅ CSV export completed: ${csvContent.length} characters, ${csvRows.length} data rows`);
        
      } else if (exportType === 'pdf') {
        console.log(`📄 Generating PDF export...`);
        
        // Calculate summary statistics
        const totalRevenue = organizationFinances
          .filter(f => f.type === 'income')
          .reduce((sum, f) => sum + (parseFloat(f.amount?.toString() || '0') || 0), 0);
          
        const totalExpenses = organizationFinances
          .filter(f => f.type === 'expense')
          .reduce((sum, f) => sum + (parseFloat(f.amount?.toString() || '0') || 0), 0);
        
        const netProfit = totalRevenue - totalExpenses;
        
        // Import PDFKit dynamically
        const PDFDocument = (await import('pdfkit')).default;
        
        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="financial_report.pdf"');
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Add content to PDF
        doc.fontSize(20).font('Helvetica-Bold').text('Financial Report', { align: 'center' });
        doc.moveDown(0.5);
        
        // Add metadata
        doc.fontSize(12).font('Helvetica')
          .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'left' })
          .text(`Organization: ${organizationId}`)
          .moveDown(1);
        
        // Add summary section
        doc.fontSize(16).font('Helvetica-Bold').text('Summary');
        doc.moveDown(0.5);
        
        doc.fontSize(12).font('Helvetica')
          .fillColor('#22c55e').text(`Total Revenue: THB ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
          .fillColor('#ef4444').text(`Total Expenses: THB ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
          .fillColor(netProfit >= 0 ? '#22c55e' : '#ef4444')
          .text(`Net Profit: THB ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
          .fillColor('#000000')
          .text(`Total Transactions: ${organizationFinances.length}`)
          .moveDown(1);
        
        // Add transactions section
        doc.fontSize(16).font('Helvetica-Bold').text('Recent Transactions');
        doc.moveDown(0.5);
        
        // Add table headers
        const startY = doc.y;
        const colWidths = [80, 60, 80, 100, 200];
        const headers = ['Date', 'Type', 'Amount', 'Category', 'Description'];
        
        let currentX = doc.page.margins.left;
        headers.forEach((header, i) => {
          doc.fontSize(10).font('Helvetica-Bold').text(header, currentX, startY, { width: colWidths[i] });
          currentX += colWidths[i];
        });
        
        doc.moveTo(doc.page.margins.left, startY + 15)
          .lineTo(doc.page.width - doc.page.margins.right, startY + 15)
          .stroke();
        
        // Add transaction rows (limit to 25 for PDF)
        const maxTransactions = Math.min(25, organizationFinances.length);
        let rowY = startY + 25;
        
        for (let i = 0; i < maxTransactions; i++) {
          const transaction = organizationFinances[i];
          currentX = doc.page.margins.left;
          
          // Check if we need a new page
          if (rowY > doc.page.height - 100) {
            doc.addPage();
            rowY = doc.page.margins.top;
          }
          
          const rowData = [
            transaction.date || 'N/A',
            (transaction.type || 'income').toUpperCase(),
            `THB ${parseFloat(transaction.amount?.toString() || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            transaction.category || 'General',
            (transaction.description || 'Transaction').substring(0, 30) + 
              (transaction.description && transaction.description.length > 30 ? '...' : '')
          ];
          
          rowData.forEach((data, j) => {
            const color = j === 1 ? (transaction.type === 'income' ? '#22c55e' : '#ef4444') : '#000000';
            doc.fontSize(9).font('Helvetica').fillColor(color)
              .text(data, currentX, rowY, { width: colWidths[j] });
            currentX += colWidths[j];
          });
          
          rowY += 20;
        }
        
        // Add footer if more transactions exist
        if (organizationFinances.length > maxTransactions) {
          doc.fillColor('#666666').fontSize(10)
            .text(`... and ${organizationFinances.length - maxTransactions} more transactions`, 
                  doc.page.margins.left, rowY + 10);
        }
        
        // Add footer
        doc.fillColor('#999999').fontSize(8)
          .text('Report generated by HostPilotPro Financial Management System', 
                doc.page.margins.left, doc.page.height - 50);
        
        // Finalize PDF
        doc.end();
        
        console.log(`✅ PDF export completed: ${organizationFinances.length} transactions processed`);
        
      } else {
        res.status(400).json({ message: "Unsupported export type" });
      }
      
    } catch (error) {
      console.error("❌ Error exporting financial data:", error);
      res.status(500).json({ message: "Failed to export financial data" });
    }
  });

  // Staff Export Endpoint
  app.post('/api/staff-export', async (req: any, res) => {
    try {
      console.log("🧑‍💼 Starting staff export...");
      const { exportType, format, filters } = req.body;
      const organizationId = req.user?.organizationId || "default-org";
      
      // Get staff data from storage
      const allStaff = await storage.getStaffMembers(organizationId);
      
      if (exportType === 'csv') {
        console.log(`📊 Generating staff CSV export...`);
        
        const csvHeaders = ['ID', 'First Name', 'Last Name', 'Email', 'Department', 'Position', 'Salary', 'Status', 'Hire Date'];
        
        const csvRows = allStaff.map(staff => {
          return [
            staff.id || '',
            staff.firstName || '',
            staff.lastName || '', 
            staff.email || '',
            staff.department || 'General',
            staff.position || 'Staff',
            staff.salary ? `THB ${parseFloat(staff.salary.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'THB 0.00',
            staff.status || 'active',
            staff.hireDate || ''
          ].map(field => `"${String(field).replace(/"/g, '""')}"`);
        });
        
        const BOM = '\uFEFF';
        const csvContent = BOM + [
          csvHeaders.join(','),
          ...csvRows.map(row => row.join(','))
        ].join('\r\n');
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="staff_export.csv"');
        res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8').toString());
        res.send(csvContent);
        
        console.log(`✅ Staff CSV export completed: ${csvRows.length} staff members`);
        
      } else if (exportType === 'pdf') {
        console.log(`📄 Generating staff PDF export...`);
        
        // Import PDFKit dynamically
        const PDFDocument = (await import('pdfkit')).default;
        
        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="staff_report.pdf"');
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Add content to PDF
        doc.fontSize(20).font('Helvetica-Bold').text('Staff Report', { align: 'center' });
        doc.moveDown(0.5);
        
        // Add metadata
        doc.fontSize(12).font('Helvetica')
          .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'left' })
          .text(`Organization: ${organizationId}`)
          .text(`Total Staff: ${allStaff.length}`)
          .moveDown(1);
        
        // Add staff table
        doc.fontSize(16).font('Helvetica-Bold').text('Staff Members');
        doc.moveDown(0.5);
        
        // Add table headers
        const startY = doc.y;
        const colWidths = [100, 100, 120, 80, 100];
        const headers = ['Name', 'Email', 'Department', 'Position', 'Status'];
        
        let currentX = doc.page.margins.left;
        headers.forEach((header, i) => {
          doc.fontSize(10).font('Helvetica-Bold').text(header, currentX, startY, { width: colWidths[i] });
          currentX += colWidths[i];
        });
        
        doc.moveTo(doc.page.margins.left, startY + 15)
          .lineTo(doc.page.width - doc.page.margins.right, startY + 15)
          .stroke();
        
        // Add staff rows
        let rowY = startY + 25;
        
        for (let i = 0; i < Math.min(20, allStaff.length); i++) {
          const staff = allStaff[i];
          currentX = doc.page.margins.left;
          
          if (rowY > doc.page.height - 100) {
            doc.addPage();
            rowY = doc.page.margins.top;
          }
          
          const rowData = [
            `${staff.firstName || ''} ${staff.lastName || ''}`.trim(),
            staff.email || 'N/A',
            staff.department || 'General',
            staff.position || 'Staff',
            (staff.status || 'active').toUpperCase()
          ];
          
          rowData.forEach((data, j) => {
            const color = j === 4 ? (staff.status === 'active' ? '#22c55e' : '#ef4444') : '#000000';
            doc.fontSize(9).font('Helvetica').fillColor(color)
              .text(data, currentX, rowY, { width: colWidths[j] });
            currentX += colWidths[j];
          });
          
          rowY += 20;
        }
        
        if (allStaff.length > 20) {
          doc.fillColor('#666666').fontSize(10)
            .text(`... and ${allStaff.length - 20} more staff members`, 
                  doc.page.margins.left, rowY + 10);
        }
        
        // Add footer
        doc.fillColor('#999999').fontSize(8)
          .text('Report generated by HostPilotPro Staff Management System', 
                doc.page.margins.left, doc.page.height - 50);
        
        doc.end();
        
        console.log(`✅ Staff PDF export completed: ${allStaff.length} staff processed`);
        
      } else {
        res.status(400).json({ message: "Unsupported export type" });
      }
      
    } catch (error) {
      console.error("❌ Error exporting staff data:", error);
      res.status(500).json({ message: "Failed to export staff data" });
    }
  });

  // Properties Export Endpoint
  app.post('/api/properties-export', async (req: any, res) => {
    try {
      console.log("🏢 Starting properties export...");
      const { exportType, format, filters } = req.body;
      const organizationId = req.user?.organizationId || "default-org";
      
      // Get properties data from storage
      const allProperties = await storage.getProperties(organizationId);
      
      if (exportType === 'csv') {
        console.log(`📊 Generating properties CSV export...`);
        
        const csvHeaders = ['ID', 'Name', 'Address', 'Type', 'Bedrooms', 'Bathrooms', 'Status', 'Owner', 'Created Date'];
        
        const csvRows = allProperties.map(property => {
          return [
            property.id || '',
            property.name || '',
            property.address || '',
            property.type || 'Apartment',
            property.bedrooms || '0',
            property.bathrooms || '0',
            property.status || 'active',
            property.ownerId || 'Unassigned',
            property.createdAt ? new Date(property.createdAt).toLocaleDateString() : ''
          ].map(field => `"${String(field).replace(/"/g, '""')}"`);
        });
        
        const BOM = '\uFEFF';
        const csvContent = BOM + [
          csvHeaders.join(','),
          ...csvRows.map(row => row.join(','))
        ].join('\r\n');
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="properties_export.csv"');
        res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8').toString());
        res.send(csvContent);
        
        console.log(`✅ Properties CSV export completed: ${csvRows.length} properties`);
        
      } else if (exportType === 'pdf') {
        console.log(`📄 Generating properties PDF export...`);
        
        // Import PDFKit dynamically
        const PDFDocument = (await import('pdfkit')).default;
        
        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="properties_report.pdf"');
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Add content to PDF
        doc.fontSize(20).font('Helvetica-Bold').text('Properties Report', { align: 'center' });
        doc.moveDown(0.5);
        
        // Add metadata
        doc.fontSize(12).font('Helvetica')
          .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'left' })
          .text(`Organization: ${organizationId}`)
          .text(`Total Properties: ${allProperties.length}`)
          .moveDown(1);
        
        // Add properties table
        doc.fontSize(16).font('Helvetica-Bold').text('Property Listings');
        doc.moveDown(0.5);
        
        // Add table headers
        const startY = doc.y;
        const colWidths = [120, 150, 80, 60, 90];
        const headers = ['Name', 'Address', 'Type', 'Rooms', 'Status'];
        
        let currentX = doc.page.margins.left;
        headers.forEach((header, i) => {
          doc.fontSize(10).font('Helvetica-Bold').text(header, currentX, startY, { width: colWidths[i] });
          currentX += colWidths[i];
        });
        
        doc.moveTo(doc.page.margins.left, startY + 15)
          .lineTo(doc.page.width - doc.page.margins.right, startY + 15)
          .stroke();
        
        // Add property rows
        let rowY = startY + 25;
        
        for (let i = 0; i < Math.min(15, allProperties.length); i++) {
          const property = allProperties[i];
          currentX = doc.page.margins.left;
          
          if (rowY > doc.page.height - 100) {
            doc.addPage();
            rowY = doc.page.margins.top;
          }
          
          const rowData = [
            property.name || 'Unnamed Property',
            (property.address || 'No address').substring(0, 25) + (property.address && property.address.length > 25 ? '...' : ''),
            property.type || 'Apartment',
            `${property.bedrooms || 0}BR/${property.bathrooms || 0}BA`,
            (property.status || 'active').toUpperCase()
          ];
          
          rowData.forEach((data, j) => {
            const color = j === 4 ? (property.status === 'active' ? '#22c55e' : '#ef4444') : '#000000';
            doc.fontSize(9).font('Helvetica').fillColor(color)
              .text(data, currentX, rowY, { width: colWidths[j] });
            currentX += colWidths[j];
          });
          
          rowY += 20;
        }
        
        if (allProperties.length > 15) {
          doc.fillColor('#666666').fontSize(10)
            .text(`... and ${allProperties.length - 15} more properties`, 
                  doc.page.margins.left, rowY + 10);
        }
        
        // Add footer
        doc.fillColor('#999999').fontSize(8)
          .text('Report generated by HostPilotPro Property Management System', 
                doc.page.margins.left, doc.page.height - 50);
        
        doc.end();
        
        console.log(`✅ Properties PDF export completed: ${allProperties.length} properties processed`);
        
      } else {
        res.status(400).json({ message: "Unsupported export type" });
      }
      
    } catch (error) {
      console.error("❌ Error exporting properties data:", error);
      res.status(500).json({ message: "Failed to export properties data" });
    }
  });
}