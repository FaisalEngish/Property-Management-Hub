import type { Express } from "express";
import { storage } from "./storage";
import { isDemoAuthenticated } from "./demoAuth";
import { insertFinanceSchema } from "@shared/schema";

export function registerFinanceRoutes(app: Express) {
  // Basic Finance CRUD operations
  app.get("/api/finance", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const finances = await storage.getFinances(organizationId);
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

  // Advanced Finance Analytics with Multi-dimensional Filtering
  app.get("/api/finance/analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const {
        propertyId,
        department,
        costCenter,
        budgetCategory,
        businessUnit,
        dateStart,
        dateEnd,
        status,
        type,
        category,
        channelSource,
        revenueStream,
        fiscalYear,
        tags,
        comparisonPeriod // previous-period, previous-year, custom
      } = req.query;

      let finances = await storage.getFinances(organizationId);
      const bookings = await storage.getBookings(organizationId);
      
      // Apply comprehensive filters to finances
      const filteredFinances = finances.filter(f => {
        // Basic filters
        if (propertyId && f.propertyId !== parseInt(propertyId as string)) return false;
        if (department && f.department !== department) return false;
        if (costCenter && f.costCenter !== costCenter) return false;
        if (budgetCategory && f.budgetCategory !== budgetCategory) return false;
        if (businessUnit && f.businessUnit !== businessUnit) return false;
        if (status && f.status !== status) return false;
        if (type && f.type !== type) return false;
        if (category && f.category !== category) return false;
        if (channelSource && f.channelSource !== channelSource) return false;
        if (revenueStream && f.revenueStream !== revenueStream) return false;
        if (fiscalYear && f.fiscalYear !== parseInt(fiscalYear as string)) return false;
        
        // Date range filter
        if (dateStart || dateEnd) {
          const transactionDate = new Date(f.date);
          if (dateStart && transactionDate < new Date(dateStart as string)) return false;
          if (dateEnd && transactionDate > new Date(dateEnd as string)) return false;
        }
        
        // Tags filter (array intersection)
        if (tags) {
          const searchTags = (tags as string).split(',');
          const transactionTags = f.tags || [];
          if (!searchTags.some(tag => transactionTags.includes(tag.trim()))) return false;
        }
        
        return true;
      });

      // Apply property filter to bookings as well
      const filteredBookings = bookings.filter(b => {
        if (propertyId && b.propertyId !== parseInt(propertyId as string)) return false;
        return true;
      });

      // Calculate Total Revenue from PAID/CONFIRMED bookings (confirmed, checked-in, checked-out)
      const totalRevenue = filteredBookings
        .filter(b => ['confirmed', 'checked-in', 'checked-out'].includes(b.status))
        .reduce((sum, b) => {
          const amount = typeof b.totalAmount === 'string' ? parseFloat(b.totalAmount) : (b.totalAmount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
      
      // Calculate Pending Payments from UNPAID bookings (pending status)
      const pendingPayments = filteredBookings
        .filter(b => b.status === 'pending')
        .reduce((sum, b) => {
          const amount = typeof b.totalAmount === 'string' ? parseFloat(b.totalAmount) : (b.totalAmount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
      const totalExpenses = filteredFinances
        .filter(f => f.type === 'expense')
        .reduce((sum, f) => {
          const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

      const totalCommissions = filteredFinances
        .filter(f => f.type === 'commission')
        .reduce((sum, f) => {
          const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

      const totalFees = filteredFinances
        .filter(f => f.type === 'fees')
        .reduce((sum, f) => {
          const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

      const totalPayouts = filteredFinances
        .filter(f => f.type === 'payout')
        .reduce((sum, f) => {
          const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
      
      // Calculate total expenses as sum of all expense types
      const totalAllExpenses = totalExpenses + totalCommissions + totalFees + totalPayouts;

      // Department breakdown
      const departmentBreakdown = filteredFinances.reduce((acc, f) => {
        const dept = f.department || 'unassigned';
        if (!acc[dept]) {
          acc[dept] = { revenue: 0, expenses: 0, commissions: 0, count: 0 };
        }
        const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
        if (f.type === 'income') acc[dept].revenue += amount;
        if (f.type === 'expense') acc[dept].expenses += amount;
        if (f.type === 'commission') acc[dept].commissions += amount;
        acc[dept].count += 1;
        return acc;
      }, {} as Record<string, any>);

      // Channel source breakdown
      const channelBreakdown = filteredFinances
        .filter(f => f.type === 'income' && f.channelSource)
        .reduce((acc, f) => {
          const channel = f.channelSource || 'direct';
          if (!acc[channel]) {
            acc[channel] = { revenue: 0, count: 0, avgTransaction: 0 };
          }
          const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
          acc[channel].revenue += amount;
          acc[channel].count += 1;
          acc[channel].avgTransaction = acc[channel].revenue / acc[channel].count;
          return acc;
        }, {} as Record<string, any>);

      // Business unit performance
      const businessUnitBreakdown = filteredFinances.reduce((acc, f) => {
        const unit = f.businessUnit || 'unassigned';
        if (!acc[unit]) {
          acc[unit] = { revenue: 0, expenses: 0, netProfit: 0, count: 0 };
        }
        const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
        if (f.type === 'income') acc[unit].revenue += amount;
        if (f.type === 'expense') acc[unit].expenses += amount;
        acc[unit].netProfit = acc[unit].revenue - acc[unit].expenses;
        acc[unit].count += 1;
        return acc;
      }, {} as Record<string, any>);
        
      const netProfit = totalRevenue - totalAllExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      // Calculate monthly revenue and expenses (current month)
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      const monthlyRevenue = filteredFinances
        .filter(f => {
          const fDate = new Date(f.date);
          return f.type === 'income' && fDate >= currentMonthStart && fDate <= currentMonthEnd;
        })
        .reduce((sum, f) => {
          const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
      const monthlyExpenses = filteredFinances
        .filter(f => {
          const fDate = new Date(f.date);
          return f.type === 'expense' && fDate >= currentMonthStart && fDate <= currentMonthEnd;
        })
        .reduce((sum, f) => {
          const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
      
      const analytics = {
        // Summary metrics (Revenue from bookings, Expenses from finance)
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalAllExpenses * 100) / 100, // All expense types combined
        totalCommissions: Math.round(totalCommissions * 100) / 100,
        totalFees: Math.round(totalFees * 100) / 100,
        totalPayouts: Math.round(totalPayouts * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        
        // Expense breakdown by type
        expensesByType: {
          expense: Math.round(totalExpenses * 100) / 100,
          commission: Math.round(totalCommissions * 100) / 100,
          fees: Math.round(totalFees * 100) / 100,
          payout: Math.round(totalPayouts * 100) / 100,
        },
        
        // Booking metrics
        pendingPayments: Math.round(pendingPayments * 100) / 100,
        confirmedBookingsCount: filteredBookings.filter(b => ['confirmed', 'checked-in', 'checked-out'].includes(b.status)).length,
        pendingBookingsCount: filteredBookings.filter(b => b.status === 'pending').length,
        
        // Monthly metrics (current month)
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        
        // Transaction metrics
        transactionCount: filteredFinances.length,
        averageTransaction: filteredFinances.length > 0 ? 
          Math.round((totalRevenue / filteredFinances.filter(f => f.type === 'income').length) * 100) / 100 : 0,
          
        // Breakdowns
        departmentBreakdown,
        channelBreakdown,
        businessUnitBreakdown,
        
        // Period information
        period: {
          start: dateStart || null,
          end: dateEnd || null,
          fiscalYear: fiscalYear || null
        },
        
        // Applied filters summary
        appliedFilters: {
          propertyId: propertyId || null,
          department: department || null,
          costCenter: costCenter || null,
          budgetCategory: budgetCategory || null,
          businessUnit: businessUnit || null,
          status: status || null,
          type: type || null,
          category: category || null,
          channelSource: channelSource || null,
          revenueStream: revenueStream || null,
          tags: tags ? (tags as string).split(',') : null
        }
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

  // Department Performance Report
  app.get("/api/finance/department-report", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const { department, dateStart, dateEnd } = req.query;
      
      const finances = await storage.getFinances();
      const filteredFinances = finances.filter(f => {
        if (department && f.department !== department) return false;
        if (dateStart || dateEnd) {
          const transactionDate = new Date(f.date);
          if (dateStart && transactionDate < new Date(dateStart as string)) return false;
          if (dateEnd && transactionDate > new Date(dateEnd as string)) return false;
        }
        return true;
      });

      const departmentStats = filteredFinances.reduce((acc, f) => {
        const dept = f.department || 'unassigned';
        if (!acc[dept]) {
          acc[dept] = {
            revenue: 0,
            expenses: 0,
            commissions: 0,
            payouts: 0,
            transactionCount: 0,
            avgTransactionSize: 0,
            profitMargin: 0,
            topCategories: {}
          };
        }
        
        const amount = typeof f.amount === 'number' ? f.amount : parseFloat(f.amount || '0');
        
        if (f.type === 'income') acc[dept].revenue += amount;
        if (f.type === 'expense') acc[dept].expenses += amount;
        if (f.type === 'commission') acc[dept].commissions += amount;
        if (f.type === 'payout') acc[dept].payouts += amount;
        
        acc[dept].transactionCount += 1;
        
        // Track top categories
        const category = f.category || 'uncategorized';
        if (!acc[dept].topCategories[category]) {
          acc[dept].topCategories[category] = 0;
        }
        acc[dept].topCategories[category] += amount;
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate derived metrics
      Object.keys(departmentStats).forEach(dept => {
        const stats = departmentStats[dept];
        stats.avgTransactionSize = stats.transactionCount > 0 ? 
          Math.round((stats.revenue / stats.transactionCount) * 100) / 100 : 0;
        stats.profitMargin = stats.revenue > 0 ? 
          Math.round(((stats.revenue - stats.expenses) / stats.revenue) * 10000) / 100 : 0;
        
        // Convert topCategories to sorted array
        stats.topCategories = Object.entries(stats.topCategories)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 5)
          .map(([category, amount]) => ({ category, amount }));
      });

      res.json(departmentStats);
    } catch (error) {
      console.error("Error fetching department report:", error);
      res.status(500).json({ message: "Failed to fetch department report" });
    }
  });

  // Period Comparison Report
  app.get("/api/finance/period-comparison", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const { 
        currentStart, 
        currentEnd, 
        compareStart, 
        compareEnd,
        groupBy = 'month' // day, week, month, quarter
      } = req.query;
      
      const finances = await storage.getFinances();
      
      const getCurrentPeriodData = () => {
        return finances.filter(f => {
          const transactionDate = new Date(f.date);
          return transactionDate >= new Date(currentStart as string) && 
                 transactionDate <= new Date(currentEnd as string);
        });
      };
      
      const getComparisonPeriodData = () => {
        return finances.filter(f => {
          const transactionDate = new Date(f.date);
          return transactionDate >= new Date(compareStart as string) && 
                 transactionDate <= new Date(compareEnd as string);
        });
      };

      const calculatePeriodMetrics = (periodData: any[]) => {
        const revenue = periodData
          .filter(f => f.type === 'income')
          .reduce((sum, f) => sum + (parseFloat(f.amount || '0') || 0), 0);
        
        const expenses = periodData
          .filter(f => f.type === 'expense')
          .reduce((sum, f) => sum + (parseFloat(f.amount || '0') || 0), 0);
          
        const commissions = periodData
          .filter(f => f.type === 'commission')
          .reduce((sum, f) => sum + (parseFloat(f.amount || '0') || 0), 0);

        return {
          revenue: Math.round(revenue * 100) / 100,
          expenses: Math.round(expenses * 100) / 100,
          commissions: Math.round(commissions * 100) / 100,
          netProfit: Math.round((revenue - expenses) * 100) / 100,
          transactionCount: periodData.length
        };
      };

      const currentPeriod = calculatePeriodMetrics(getCurrentPeriodData());
      const comparisonPeriod = calculatePeriodMetrics(getComparisonPeriodData());
      
      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 10000) / 100;
      };

      const comparison = {
        current: currentPeriod,
        previous: comparisonPeriod,
        changes: {
          revenue: calculateChange(currentPeriod.revenue, comparisonPeriod.revenue),
          expenses: calculateChange(currentPeriod.expenses, comparisonPeriod.expenses),
          commissions: calculateChange(currentPeriod.commissions, comparisonPeriod.commissions),
          netProfit: calculateChange(currentPeriod.netProfit, comparisonPeriod.netProfit),
          transactionCount: calculateChange(currentPeriod.transactionCount, comparisonPeriod.transactionCount)
        },
        periods: {
          current: { start: currentStart, end: currentEnd },
          comparison: { start: compareStart, end: compareEnd }
        }
      };

      res.json(comparison);
    } catch (error) {
      console.error("Error fetching period comparison:", error);
      res.status(500).json({ message: "Failed to fetch period comparison" });
    }
  });

  // Filter Options Endpoint
  app.get("/api/finance/filter-options", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const finances = await storage.getFinances();
      const properties = await storage.getProperties();

      const filterOptions = {
        properties: properties.map(p => ({ id: p.id, name: p.name })),
        departments: [...new Set(finances.map(f => f.department).filter(Boolean))],
        costCenters: [...new Set(finances.map(f => f.costCenter).filter(Boolean))],
        budgetCategories: [...new Set(finances.map(f => f.budgetCategory).filter(Boolean))],
        businessUnits: [...new Set(finances.map(f => f.businessUnit).filter(Boolean))],
        types: [...new Set(finances.map(f => f.type).filter(Boolean))],
        categories: [...new Set(finances.map(f => f.category).filter(Boolean))],
        channelSources: [...new Set(finances.map(f => f.channelSource).filter(Boolean))],
        revenueStreams: [...new Set(finances.map(f => f.revenueStream).filter(Boolean))],
        statuses: [...new Set(finances.map(f => f.status).filter(Boolean))],
        tags: [...new Set(finances.flatMap(f => f.tags || []))],
        dateRange: {
          earliest: finances.reduce((earliest, f) => {
            const date = new Date(f.date);
            return !earliest || date < earliest ? date : earliest;
          }, null),
          latest: finances.reduce((latest, f) => {
            const date = new Date(f.date);
            return !latest || date > latest ? date : latest;
          }, null)
        }
      };

      res.json(filterOptions);
    } catch (error) {
      console.error("Error fetching filter options:", error);
      res.status(500).json({ message: "Failed to fetch filter options" });
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