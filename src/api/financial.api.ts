import { apiClient } from './client';
import type {
  ApiResponse, Income, Expense, Investment, Goal, DashboardData, Payslip, Conversation,
  Scenario, MonthlyInsight, FinancialHealth, Debt, DebtSummary, Budget, RecurringExpense,
  Notification, FinancialHealthHistoryEntry,
} from '@/types';

export const financialApi = {
  // Income
  getIncomes: (params?: Record<string, string | number>) =>
    apiClient.get<ApiResponse<{ incomes: Income[] }>>('/incomes', { params }),
  createIncome: (data: Partial<Income>) =>
    apiClient.post<ApiResponse<{ income: Income }>>('/incomes', data),
  updateIncome: (id: string, data: Partial<Income>) =>
    apiClient.put<ApiResponse<{ income: Income }>>(`/incomes/${id}`, data),
  deleteIncome: (id: string) => apiClient.delete(`/incomes/${id}`),
  getIncomeAnalytics: (params?: Record<string, string>) =>
    apiClient.get<ApiResponse<{ analytics: { byType?: { name: string; value: number }[]; byMonth?: { name: string; value: number }[] } }>>('/incomes/analytics', { params }),

  // Expense
  getExpenses: (params?: Record<string, string | number>) =>
    apiClient.get<ApiResponse<{ expenses: Expense[] }>>('/expenses', { params }),
  createExpense: (data: Partial<Expense>) =>
    apiClient.post<ApiResponse<{ expense: Expense }>>('/expenses', data),
  updateExpense: (id: string, data: Partial<Expense>) =>
    apiClient.put<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`, data),
  deleteExpense: (id: string) => apiClient.delete(`/expenses/${id}`),
  getExpenseCategories: () =>
    apiClient.get<ApiResponse<{ categories: { default: string[]; custom: string[] } }>>('/expenses/categories'),
  getExpenseAnalytics: (params?: Record<string, string>) =>
    apiClient.get<ApiResponse<{ analytics: { byCategory?: { name: string; value: number }[]; byMonth?: { name: string; value: number }[] } }>>('/expenses/analytics', { params }),

  // Investment
  getInvestments: (params?: Record<string, string | number>) =>
    apiClient.get<ApiResponse<{ investments: Investment[] }>>('/investments', { params }),
  createInvestment: (data: Partial<Investment>) =>
    apiClient.post<ApiResponse<{ investment: Investment }>>('/investments', data),
  updateInvestment: (id: string, data: Partial<Investment>) =>
    apiClient.put<ApiResponse<{ investment: Investment }>>(`/investments/${id}`, data),
  deleteInvestment: (id: string) => apiClient.delete(`/investments/${id}`),
  getInvestmentSummary: (params?: Record<string, string | undefined>) =>
    apiClient.get<ApiResponse<{ summary: unknown }>>('/investments/summary', { params }),

  // Goals
  getGoals: (params?: Record<string, string | number>) =>
    apiClient.get<ApiResponse<{ goals: Goal[] }>>('/goals', { params }),
  createGoal: (data: Partial<Goal>) =>
    apiClient.post<ApiResponse<{ goal: Goal }>>('/goals', data),
  updateGoal: (id: string, data: Partial<Goal>) =>
    apiClient.put<ApiResponse<{ goal: Goal }>>(`/goals/${id}`, data),
  deleteGoal: (id: string) => apiClient.delete(`/goals/${id}`),

  // Debts
  getDebts: (params?: Record<string, string | number>) =>
    apiClient.get<ApiResponse<{ debts: Debt[] }>>('/debts', { params }),
  getDebtSummary: (params?: Record<string, string | undefined>) =>
    apiClient.get<ApiResponse<{ summary: DebtSummary }>>('/debts/summary', { params }),
  createDebt: (data: Partial<Debt>) =>
    apiClient.post<ApiResponse<{ debt: Debt }>>('/debts', data),
  updateDebt: (id: string, data: Partial<Debt>) =>
    apiClient.put<ApiResponse<{ debt: Debt }>>(`/debts/${id}`, data),
  deleteDebt: (id: string) => apiClient.delete(`/debts/${id}`),

  // Budgets
  getBudgets: (params?: Record<string, string | number>) =>
    apiClient.get<ApiResponse<{ budgets: Budget[] }>>('/budgets', { params }),
  checkBudgetAlerts: (params?: Record<string, string | undefined>) =>
    apiClient.get<ApiResponse<{ alerts: Budget[] }>>('/budgets/check-alerts', { params }),
  createBudget: (data: Partial<Budget>) =>
    apiClient.post<ApiResponse<{ budget: Budget }>>('/budgets', data),
  updateBudget: (id: string, data: Partial<Budget>) =>
    apiClient.put<ApiResponse<{ budget: Budget }>>(`/budgets/${id}`, data),
  deleteBudget: (id: string) => apiClient.delete(`/budgets/${id}`),

  // Recurring Expenses
  getRecurringExpenses: (params?: Record<string, string | number>) =>
    apiClient.get<ApiResponse<{ recurringExpenses: RecurringExpense[] }>>('/recurring-expenses', { params }),
  createRecurringExpense: (data: Partial<RecurringExpense>) =>
    apiClient.post<ApiResponse<{ recurringExpense: RecurringExpense }>>('/recurring-expenses', data),
  updateRecurringExpense: (id: string, data: Partial<RecurringExpense>) =>
    apiClient.put<ApiResponse<{ recurringExpense: RecurringExpense }>>(`/recurring-expenses/${id}`, data),
  deleteRecurringExpense: (id: string) => apiClient.delete(`/recurring-expenses/${id}`),

  // Notifications
  getNotifications: (params?: Record<string, string | number>) =>
    apiClient.get<ApiResponse<{ notifications: Notification[] }>>('/notifications', { params }),
  markNotificationRead: (id: string) =>
    apiClient.patch<ApiResponse<{ notification: Notification }>>(`/notifications/${id}/read`),
  markAllNotificationsRead: () =>
    apiClient.patch<ApiResponse<unknown>>('/notifications/read-all'),
  deleteNotification: (id: string) => apiClient.delete(`/notifications/${id}`),

  // Export
  exportIncomes: (params?: Record<string, string | undefined>) =>
    apiClient.get('/export/incomes', { params, responseType: 'blob' }),
  exportExpenses: (params?: Record<string, string | undefined>) =>
    apiClient.get('/export/expenses', { params, responseType: 'blob' }),
  importExpenses: (profileId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    form.append('profileId', profileId);
    return apiClient.post<ApiResponse<{ imported: number }>>('/export/expenses/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Dashboard
  getDashboard: (params?: Record<string, string | undefined>) =>
    apiClient.get<ApiResponse<{ dashboard: DashboardData }>>('/dashboard/overview', { params }),
  getFamilyDashboard: (params?: Record<string, string | undefined>) =>
    apiClient.get<ApiResponse<{ dashboard: DashboardData }>>('/dashboard/family', { params }),

  // Payslip
  uploadPayslip: (profileId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    form.append('profileId', profileId);
    return apiClient.post<ApiResponse<{ payslip: Payslip }>>('/payslips/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPayslips: (params?: Record<string, string | undefined>) =>
    apiClient.get<ApiResponse<{ payslips: Payslip[] }>>('/payslips', { params }),
  confirmPayslip: (id: string, data: import('@/types').PayslipConfirmPayload) =>
    apiClient.patch<ApiResponse<{ payslip: Payslip; syncedIncomes: number }>>(`/payslips/${id}/confirm`, data),
  reExtractPayslip: (id: string) =>
    apiClient.post<ApiResponse<{ payslip: Payslip }>>(`/payslips/${id}/re-extract`),
  deletePayslip: (id: string) => apiClient.delete(`/payslips/${id}`),

  // Financial Health
  getFinancialHealth: (params?: Record<string, string | undefined>) =>
    apiClient.get<ApiResponse<{ health: FinancialHealth }>>('/financial-health/latest', { params }),
  calculateFinancialHealth: (params?: Record<string, string | undefined>) =>
    apiClient.post<ApiResponse<{ health: FinancialHealth }>>('/financial-health/calculate', null, { params }),
  getFinancialHealthHistory: (params?: Record<string, string | undefined>) =>
    apiClient.get<ApiResponse<{ history: FinancialHealthHistoryEntry[] }>>('/financial-health/history', { params }),

  // Coach
  getConversations: () =>
    apiClient.get<ApiResponse<{ conversations: Conversation[] }>>('/coach'),
  getConversation: (id: string) =>
    apiClient.get<ApiResponse<{ conversation: Conversation }>>(`/coach/${id}`),
  sendMessage: (message: string, conversationId?: string) =>
    apiClient.post<ApiResponse<{ conversation: Conversation }>>('/coach/message', { message, conversationId }),
  deleteConversation: (id: string) => apiClient.delete(`/coach/${id}`),

  // Scenario
  simulateScenario: (data: { name: string; scenarioType: string; parameters: Record<string, number>; profileId?: string }) =>
    apiClient.post<ApiResponse<{ scenario: Scenario }>>('/scenarios/simulate', data),
  getScenarios: () =>
    apiClient.get<ApiResponse<{ scenarios: Scenario[] }>>('/scenarios'),
  deleteScenario: (id: string) => apiClient.delete(`/scenarios/${id}`),

  // Insights
  getInsights: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<ApiResponse<{ insights: MonthlyInsight[] }>>('/insights', { params }),
  getMonthlyInsight: (params: { month: number; year: number; profileId?: string }) =>
    apiClient.get<ApiResponse<{ insight: MonthlyInsight }>>('/insights/monthly', { params }),
  generateInsight: (params: { month: number; year: number }) =>
    apiClient.post<ApiResponse<{ insight: MonthlyInsight }>>('/insights/generate', null, { params }),
};
