import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProfilesPage } from '@/pages/profiles/ProfilesPage';
import { IncomePage } from '@/pages/income/IncomePage';
import { ExpensesPage } from '@/pages/expenses/ExpensesPage';
import { InvestmentsPage } from '@/pages/investments/InvestmentsPage';
import { GoalsPage } from '@/pages/goals/GoalsPage';
import { DebtsPage } from '@/pages/debts/DebtsPage';
import { BudgetsPage } from '@/pages/budgets/BudgetsPage';
import { RecurringPage } from '@/pages/recurring/RecurringPage';
import { FamilyDashboardPage } from '@/pages/family/FamilyDashboardPage';
import { PayslipsPage } from '@/pages/payslips/PayslipsPage';
import { FinancialHealthPage } from '@/pages/health/FinancialHealthPage';
import { CoachPage } from '@/pages/coach/CoachPage';
import { SimulatorPage } from '@/pages/simulator/SimulatorPage';
import { InsightsPage } from '@/pages/insights/InsightsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/verify-email" element={<AuthLayout />}>
        <Route index element={<VerifyEmailPage />} />
      </Route>

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/debts" element={<DebtsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/recurring" element={<RecurringPage />} />
        <Route path="/family" element={<FamilyDashboardPage />} />
        <Route path="/payslips" element={<PayslipsPage />} />
        <Route path="/health" element={<FinancialHealthPage />} />
        <Route path="/coach" element={<CoachPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
