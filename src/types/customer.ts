// Customer data type definition
export interface CustomerData {
  customerId: string;
  name: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  creditScore: number;
  outstandingLoans: number;
  loanRepaymentHistory: number[]; // 1 = paid, 0 = missed
  accountBalance: number;
  status: 'Review' | 'Approved' | 'Rejected';
}

// Risk score interface
export interface RiskScore {
  customerId: string;
  score: number;
  level: 'Low' | 'Medium' | 'High';
  factors: {
    creditScoreImpact: number;
    repaymentHistoryImpact: number;
    loanToIncomeRatioImpact: number;
  }
}

// Financial metrics interface
export interface FinancialMetrics {
  totalCustomers: number;
  averageIncome: number;
  averageExpenses: number;
  averageCreditScore: number;
  totalOutstandingLoans: number;
  highRiskCustomers: number;
}

// Chart data types
export interface IncomeExpenseData {
  name: string;
  income: number;
  expenses: number;
}

export interface RiskDistributionData {
  name: string;
  value: number;
}