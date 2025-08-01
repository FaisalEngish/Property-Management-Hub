import type { Express } from "express";
import { storage } from "./storage";
import { isDemoAuthenticated } from "./demoAuth";
import { insertFinanceSchema } from "@shared/schema";

export function registerFinanceRoutes(app: Express) {
  // Basic Finance CRUD operations
  app.get("/api/finance", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const finances = await storage.getFinances();
      res.json(finances);
    } catch (error) {
      console.error("Error fetching finances:", error);
      res.status(500).json({ message: "Failed to fetch finances" });
    }
  });

  app.post("/api/finance", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const financeData = insertFinanceSchema.parse({
        ...req.body,
        organizationId
      });
      const finance = await storage.createFinance(financeData);
      res.status(201).json(finance);
    } catch (error) {
      console.error("Error creating finance record:", error);
      res.status(500).json({ message: "Failed to create finance record" });
    }
  });

  // Finance Analytics and Summary
  app.get("/api/finance/analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const finances = await storage.getFinances();
      
      // Calculate basic analytics from finances with proper number handling
      const totalRevenue = finances
        .filter(f => f.type === 'income')
        .reduce((sum, f) => {
          const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
      const totalExpenses = finances
        .filter(f => f.type === 'expense')
        .reduce((sum, f) => {
          const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
      const netProfit = totalRevenue - totalExpenses;
      
      const totalAmount = finances.reduce((sum, f) => {
        const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      const analytics = {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        transactionCount: finances.length,
        averageTransaction: finances.length > 0 ? 
          Math.round((totalAmount / finances.length) * 100) / 100 : 0
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching finance analytics:", error);
      res.status(500).json({ message: "Failed to fetch finance analytics" });
    }
  });

  // Finance Summary by Property
  app.get("/api/finance/summary-by-property", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const finances = await storage.getFinances();
      const properties = await storage.getProperties();
      
      const summary = properties.map(property => {
        const propertyFinances = finances.filter(f => f.propertyId === property.id);
        const revenue = propertyFinances
          .filter(f => f.type === 'income')
          .reduce((sum, f) => {
            const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);
        const expenses = propertyFinances
          .filter(f => f.type === 'expense')
          .reduce((sum, f) => {
            const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);
          
        return {
          propertyId: property.id,
          propertyName: property.name,
          revenue: Math.round(revenue * 100) / 100,
          expenses: Math.round(expenses * 100) / 100,
          netProfit: Math.round((revenue - expenses) * 100) / 100,
          transactionCount: propertyFinances.length
        };
      });
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching finance summary by property:", error);
      res.status(500).json({ message: "Failed to fetch finance summary by property" });
    }
  });

  // Monthly Finance Report
  app.get("/api/finance/monthly-report", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
      
      const finances = await storage.getFinances();
      
      // Filter finances by month/year
      const monthlyFinances = finances.filter(f => {
        if (!f.createdAt) return false;
        const financeDate = new Date(f.createdAt);
        return financeDate.getFullYear() === parseInt(year as string) &&
               financeDate.getMonth() === parseInt(month as string) - 1;
      });
      
      const report = {
        period: `${year}-${month.toString().padStart(2, '0')}`,
        totalRevenue: monthlyFinances
          .filter(f => f.type === 'income')
          .reduce((sum, f) => sum + (f.amount || 0), 0),
        totalExpenses: monthlyFinances
          .filter(f => f.type === 'expense')
          .reduce((sum, f) => sum + (f.amount || 0), 0),
        transactionCount: monthlyFinances.length,
        transactionsByCategory: monthlyFinances.reduce((acc, f) => {
          const category = f.category || 'uncategorized';
          if (!acc[category]) {
            acc[category] = { income: 0, expense: 0, count: 0 };
          }
          if (f.type === 'income') {
            acc[category].income += (f.amount || 0);
          } else {
            acc[category].expense += (f.amount || 0);
          }
          acc[category].count += 1;
          return acc;
        }, {} as Record<string, any>)
      };
      
      res.json(report);
    } catch (error) {
      console.error("Error generating monthly finance report:", error);
      res.status(500).json({ message: "Failed to generate monthly finance report" });
    }
  });

  // Finance Categories
  app.get("/api/finance/categories", isDemoAuthenticated, async (req: any, res) => {
    try {
      const finances = await storage.getFinances();
      const categories = [...new Set(finances.map(f => f.category).filter(Boolean))];
      res.json(categories);
    } catch (error) {
      console.error("Error fetching finance categories:", error);
      res.status(500).json({ message: "Failed to fetch finance categories" });
    }
  });

  // Villa-specific Finance Query with Date Range
  app.get("/api/finance/villa/:villaId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { villaId } = req.params;
      const { dateStart, dateEnd } = req.query;
      const organizationId = req.user?.organizationId || "default-org";

      // Get bookings for the specific villa within date range
      const bookings = await storage.getBookings();
      const filteredBookings = bookings.filter(booking => {
        const matchesVilla = booking.propertyId === parseInt(villaId);
        if (!dateStart || !dateEnd) return matchesVilla;
        
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const startDate = new Date(dateStart as string);
        const endDate = new Date(dateEnd as string);
        
        return matchesVilla && checkIn >= startDate && checkOut <= endDate;
      });

      // Calculate revenue and commission totals
      const totalRevenue = filteredBookings.reduce((sum, booking) => {
        const amount = typeof booking.totalAmount === 'number' ? booking.totalAmount : parseFloat(booking.totalAmount || '0');
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      // Get commission data from finance records
      const finances = await storage.getFinances();
      const commissionRecords = finances.filter(f => 
        f.propertyId === parseInt(villaId) && 
        f.category === 'commission' &&
        (!dateStart || !dateEnd || (
          f.createdAt && 
          new Date(f.createdAt) >= new Date(dateStart as string) && 
          new Date(f.createdAt) <= new Date(dateEnd as string)
        ))
      );

      const totalCommission = commissionRecords.reduce((sum, record) => {
        const amount = typeof record.amount === 'number' ? record.amount : parseFloat(record.amount || '0');
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      res.json({
        villaId: parseInt(villaId),
        dateStart: dateStart || null,
        dateEnd: dateEnd || null,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        bookingCount: filteredBookings.length,
        commissionRecords: commissionRecords.length
      });
    } catch (error) {
      console.error("Error fetching villa finance data:", error);
      res.status(500).json({ error: "Finance endpoint error", details: error.message });
    }
  });

  // Finance Dashboard Summary
  app.get("/api/finance/dashboard", isDemoAuthenticated, async (req: any, res) => {
    try {
      const finances = await storage.getFinances();
      const properties = await storage.getProperties();
      
      // Calculate current month metrics
      const currentDate = new Date();
      const currentMonthFinances = finances.filter(f => {
        if (!f.createdAt) return false;
        const financeDate = new Date(f.createdAt);
        return financeDate.getFullYear() === currentDate.getFullYear() &&
               financeDate.getMonth() === currentDate.getMonth();
      });

      const monthlyRevenue = currentMonthFinances
        .filter(f => f.type === 'income')
        .reduce((sum, f) => {
          const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

      const monthlyExpenses = currentMonthFinances
        .filter(f => f.type === 'expense')
        .reduce((sum, f) => {
          const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

      const dashboard = {
        totalProperties: properties.length,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        totalTransactions: currentMonthFinances.length,
        recentTransactions: finances
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5)
          .map(f => ({
            ...f,
            amount: typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0')
          }))
      };
      
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching finance dashboard:", error);
      res.status(500).json({ message: "Failed to fetch finance dashboard" });
    }
  });
}