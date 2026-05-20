import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard          from '@/components/layout/AuthGuard'
import AppShell           from '@/components/layout/AppShell'
import LoginPage          from '@/pages/auth/LoginPage'
import DashboardPage      from '@/pages/dashboard/DashboardPage'
import CustomersPage      from '@/pages/customers/CustomersPage'
import CreditPage         from '@/pages/credit/CreditPage'
import FraudPage          from '@/pages/fraud/FraudPage'
import BranchesPage       from '@/pages/branches/BranchesPage'
import LoanOriginationPage from '@/pages/loans/LoanOriginationPage'
import InsurancePage       from '@/pages/insurance/InsurancePage'
import ReportingPage       from '@/pages/reporting/ReportingPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGuard><AppShell /></AuthGuard>}>
          <Route path="/"           element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/customers"  element={<CustomersPage />} />
          <Route path="/credit"     element={<CreditPage />} />
          <Route path="/loans"      element={<LoanOriginationPage />} />
          <Route path="/fraud"      element={<FraudPage />} />
          <Route path="/branches"   element={<BranchesPage />} />
          <Route path="/insurance"  element={<InsurancePage />} />
          <Route path="/reporting"  element={<ReportingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
