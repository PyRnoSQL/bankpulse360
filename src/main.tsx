import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/globals.css'

import LoginPage     from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import CustomersPage from './pages/customers/CustomersPage'
import CreditPage    from './pages/credit/CreditPage'
import FraudPage     from './pages/fraud/FraudPage'
import BranchesPage  from './pages/branches/BranchesPage'
import AppShell      from './components/layout/AppShell'
import AuthGuard     from './components/layout/AuthGuard'

const qc = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGuard />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"  element={<DashboardPage />} />
              <Route path="customers"  element={<CustomersPage />} />
              <Route path="credit"     element={<CreditPage />} />
              <Route path="fraud"      element={<FraudPage />} />
              <Route path="branches"   element={<BranchesPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
