export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
  errors?: { field: string; message: string }[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isEmailVerified?: boolean;
  isTwoFactorEnabled?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface Profile {
  _id: string;
  name: string;
  relation: string;
  dateOfBirth?: string;
  occupation?: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface Income {
  _id: string;
  profileId: string;
  title: string;
  amount: number;
  type: string;
  frequency: string;
  date: string;
  notes?: string;
}

export interface Expense {
  _id: string;
  profileId: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  isCustomCategory?: boolean;
}

export interface Investment {
  _id: string;
  profileId: string;
  investmentType: string;
  name?: string;
  amountInvested: number;
  currentValue: number;
  returns?: number;
  roiPercentage?: number;
}

export interface Goal {
  _id: string;
  profileId: string;
  goalName: string;
  goalType?: string;
  targetAmount: number;
  targetDate: string;
  currentSavings: number;
  remainingAmount?: number;
  completionPercentage?: number;
  monthlyRequiredInvestment?: number;
  isCompleted?: boolean;
}

export interface DashboardData {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  savingsRate: number;
  investments: { totalInvested: number; totalCurrent: number; profitLoss: number };
  goalsProgress: { id: string; goalName: string; targetAmount: number; currentSavings: number; completionPercentage: number }[];
  financialHealthScore: number | null;
  profileBreakdown: { profileId: string; name: string; relation: string; income: number; expenses: number; savings: number }[];
  isFamilyView?: boolean;
  members?: { profileId: string; name: string; relation: string }[];
  comparison?: {
    totalIncome?: number;
    totalExpenses?: number;
    totalSavings?: number;
    avgSavingsRate?: number;
    combinedIncome?: number;
    combinedExpenses?: number;
    combinedSavings?: number;
    combinedDebt?: number;
    topEarner?: { name: string; income: number } | null;
    topSpender?: { name: string; expenses: number } | null;
  };
  charts: {
    incomeByType: { name: string; value: number }[];
    expenseByCategory: { name: string; value: number }[];
    incomeByMember?: { name: string; value: number }[];
    expenseByMember?: { name: string; value: number }[];
  };
}

export interface Debt {
  _id: string;
  profileId: string;
  name: string;
  debtType: string;
  principalAmount: number;
  outstandingAmount: number;
  interestRate: number;
  monthlyEmi: number;
}

export interface DebtSummary {
  totalOutstanding: number;
  totalEmi: number;
  debtCount: number;
  byType: { type: string; outstanding: number; count: number }[];
}

export interface Budget {
  _id: string;
  profileId: string;
  category: string;
  limitAmount: number;
  month?: number;
  year?: number;
  alertThreshold?: number;
  spent?: number;
  percentUsed?: number;
}

export interface RecurringExpense {
  _id: string;
  profileId: string;
  title: string;
  amount: number;
  category: string;
  frequency: string;
  nextDueDate: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FinancialHealthHistoryEntry {
  score: number;
  calculatedAt: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
}

export interface LoginResponse {
  user?: User;
  requiresTwoFactor?: boolean;
}

export interface PayslipExtractedData {
  basicSalary: number;
  hra: number;
  specialAllowance?: number;
  otherAllowances?: number;
  grossSalary?: number;
  pf: number;
  professionalTax?: number;
  tax: number;
  otherDeductions?: number;
  totalDeductions?: number;
  bonus: number;
  netSalary: number;
  employerName?: string;
  employeeName?: string;
  employeeId?: string;
  designation?: string;
  panNumber?: string;
  payPeriod?: string;
}

export interface Payslip {
  _id: string;
  profileId: string;
  fileUrl: string;
  fileType: string;
  extractedData: PayslipExtractedData;
  extractionStatus?: 'pending' | 'success' | 'failed';
  extractionError?: string;
  isVerified: boolean;
  isSyncedToIncome?: boolean;
  linkedIncomeIds?: string[];
  month?: number;
  year?: number;
}

export interface PayslipConfirmPayload {
  extractedData: PayslipExtractedData;
  month?: number;
  year?: number;
  syncToIncome?: boolean;
}

export interface Conversation {
  _id: string;
  title: string;
  messages: { role: 'user' | 'assistant'; content: string; timestamp: string }[];
  updatedAt: string;
}

export interface Scenario {
  _id: string;
  name: string;
  scenarioType: string;
  parameters: Record<string, number>;
  projections: {
    futureSavings: { month: number; amount: number }[];
    netWorthGrowth: { month: number; netWorth: number }[];
    goalTimelines: { goalId: string; goalName: string; projectedDate: string | null; monthsToGoal: number | null }[];
  };
  summary: string;
}

export interface MonthlyInsight {
  _id: string;
  month: number;
  year: number;
  summary: string;
  insights: {
    category: string;
    title: string;
    description: string;
    trend: 'up' | 'down' | 'stable';
    percentageChange?: number;
  }[];
}

export interface FinancialHealth {
  score: number;
  components: Record<string, { score: number; value: number; weight: number }>;
  reasons: string[];
  calculatedAt: string;
}

export const INCOME_TYPES = ['Salary', 'Freelancing', 'Rental Income', 'Interest', 'Dividend', 'Business'];
export const INCOME_FREQUENCIES = ['One-time', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Yearly'];
export const EXPENSE_CATEGORIES = ['Food', 'Rent', 'Travel', 'Medical', 'Insurance', 'Shopping', 'Entertainment', 'Utilities'];
export const INVESTMENT_TYPES = ['Stocks', 'Mutual Funds', 'SIP', 'PPF', 'EPF', 'Fixed Deposit', 'Gold', 'Crypto'];
export const GOAL_TYPES = ['Buy House', 'Buy Car', 'Vacation', 'Marriage', 'Retirement', 'Other'];
export const PROFILE_RELATIONS = ['Self', 'Father', 'Mother', 'Spouse', 'Child', 'Sibling', 'Other'];
export const SCENARIO_TYPES = ['Salary Increase', 'Expense Increase', 'New Investment', 'New Loan'];
export const DEBT_TYPES = ['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Credit Card', 'Other'];
export const RECURRING_FREQUENCIES = ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Yearly'];
