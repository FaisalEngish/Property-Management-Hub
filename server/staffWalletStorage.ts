interface StaffWalletTransaction {
  id: string;
  staffId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  time: string;
  receipt?: string;
  guestName?: string;
  propertyName?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewDate?: string;
  finalCategory?: 'company_expense' | 'billed_to_guest' | 'billed_to_owner';
  property?: string;
  reviewNotes?: string;
}

interface StaffWallet {
  staffId: string;
  currentBalance: number;
  basePettyCash: number;
  totalCollected: number;
  totalExpenses: number;
  lastCleared: string;
}

interface PendingCheckout {
  id: string;
  guestName: string;
  propertyName: string;
  checkoutDate: string;
  checkoutTime: string;
  electricityReading: {
    start: number;
    end: number;
    rate: number;
  };
  estimatedCash: number;
  status: 'pending_collection' | 'collected';
}

class StaffWalletStorage {
  private wallets: Map<string, StaffWallet> = new Map();
  private transactions: Map<string, StaffWalletTransaction> = new Map();
  private pendingCheckouts: Map<string, PendingCheckout> = new Map();

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Initialize demo wallet for staff-pool
    this.wallets.set('staff-pool', {
      staffId: 'staff-pool',
      currentBalance: 6750,
      basePettyCash: 5000,
      totalCollected: 2500,
      totalExpenses: 750,
      lastCleared: '2025-01-22'
    });

    // Demo transactions
    const demoTransactions: StaffWalletTransaction[] = [
      {
        id: '1',
        staffId: 'staff-pool',
        type: 'income',
        amount: 1750,
        description: 'Check-out cash collection - Villa Aruna electricity',
        category: 'checkout_cash',
        date: '2025-01-23',
        time: '14:30',
        guestName: 'John Smith',
        propertyName: 'Villa Aruna',
        status: 'pending'
      },
      {
        id: '2',
        staffId: 'staff-pool',
        type: 'expense',
        amount: 450,
        description: 'Gasoline for property visits',
        category: 'transport',
        date: '2025-01-23',
        time: '10:15',
        receipt: 'Receipt-GAS-001.jpg',
        status: 'pending'
      }
    ];

    demoTransactions.forEach(transaction => {
      this.transactions.set(transaction.id, transaction);
    });

    // Demo pending checkouts
    const demoPendingCheckouts: PendingCheckout[] = [
      {
        id: '1',
        guestName: 'Michael Johnson',
        propertyName: 'Villa Aruna',
        checkoutDate: '2025-01-23',
        checkoutTime: '11:00',
        electricityReading: { start: 1250, end: 1387, rate: 7 },
        estimatedCash: 959,
        status: 'pending_collection'
      },
      {
        id: '2',
        guestName: 'Emma Wilson',
        propertyName: 'Villa Breeze',
        checkoutDate: '2025-01-23',
        checkoutTime: '14:30',
        electricityReading: { start: 2100, end: 2198, rate: 7 },
        estimatedCash: 686,
        status: 'pending_collection'
      }
    ];

    demoPendingCheckouts.forEach(checkout => {
      this.pendingCheckouts.set(checkout.id, checkout);
    });
  }

  // Wallet operations
  getWallet(staffId: string): StaffWallet | undefined {
    return this.wallets.get(staffId);
  }

  updateWalletBalance(staffId: string, amount: number, type: 'add' | 'subtract'): void {
    const wallet = this.wallets.get(staffId);
    if (wallet) {
      if (type === 'add') {
        wallet.currentBalance += amount;
        wallet.totalCollected += amount;
      } else {
        wallet.currentBalance -= amount;
        wallet.totalExpenses += amount;
      }
      this.wallets.set(staffId, wallet);
    }
  }

  clearWalletBalance(staffId: string, reason: string): void {
    const wallet = this.wallets.get(staffId);
    if (wallet) {
      wallet.currentBalance = wallet.basePettyCash;
      wallet.lastCleared = new Date().toISOString().split('T')[0];
      this.wallets.set(staffId, wallet);
    }
  }

  // Transaction operations
  getTransactions(staffId?: string): StaffWalletTransaction[] {
    const allTransactions = Array.from(this.transactions.values());
    if (staffId) {
      return allTransactions.filter(t => t.staffId === staffId);
    }
    return allTransactions;
  }

  getPendingTransactions(): StaffWalletTransaction[] {
    return Array.from(this.transactions.values()).filter(t => t.status === 'pending');
  }

  getReviewedTransactions(): StaffWalletTransaction[] {
    return Array.from(this.transactions.values()).filter(t => t.status === 'approved');
  }

  addTransaction(transaction: Omit<StaffWalletTransaction, 'id'>): StaffWalletTransaction {
    const id = Date.now().toString();
    const newTransaction: StaffWalletTransaction = {
      id,
      ...transaction
    };
    this.transactions.set(id, newTransaction);

    // Update wallet balance
    if (transaction.type === 'income') {
      this.updateWalletBalance(transaction.staffId, transaction.amount, 'add');
    } else {
      this.updateWalletBalance(transaction.staffId, transaction.amount, 'subtract');
    }

    return newTransaction;
  }

  reviewTransaction(
    transactionId: string, 
    finalCategory: 'company_expense' | 'billed_to_guest' | 'billed_to_owner',
    property?: string,
    reviewNotes?: string,
    reviewedBy?: string
  ): boolean {
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      transaction.status = 'approved';
      transaction.finalCategory = finalCategory;
      transaction.property = property;
      transaction.reviewNotes = reviewNotes;
      transaction.reviewedBy = reviewedBy;
      transaction.reviewDate = new Date().toISOString();
      this.transactions.set(transactionId, transaction);
      return true;
    }
    return false;
  }

  // Checkout operations
  getPendingCheckouts(): PendingCheckout[] {
    return Array.from(this.pendingCheckouts.values()).filter(c => c.status === 'pending_collection');
  }

  recordCashCollection(
    checkoutId: string, 
    actualAmount: number, 
    collectionMethod: string, 
    notes?: string,
    receiptPhoto?: string
  ): boolean {
    const checkout = this.pendingCheckouts.get(checkoutId);
    if (checkout) {
      // Update checkout status
      checkout.status = 'collected';
      this.pendingCheckouts.set(checkoutId, checkout);

      // Add income transaction
      this.addTransaction({
        staffId: 'staff-pool', // Current staff member
        type: 'income',
        amount: actualAmount,
        description: `Check-out cash collection - ${checkout.propertyName}`,
        category: 'checkout_cash',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        guestName: checkout.guestName,
        propertyName: checkout.propertyName,
        receipt: receiptPhoto,
        status: 'pending'
      });

      return true;
    }
    return false;
  }
}

export const staffWalletStorage = new StaffWalletStorage();