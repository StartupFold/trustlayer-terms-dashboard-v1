/*
  Main React application component.
*/

import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import PoliciesPage from './pages/PoliciesPage'
import AuditLogsPage from './pages/AuditLogsPage'
import PolicyViewPage from './pages/PolicyViewPage'
import AdminPage from './pages/AdminPage'
import SuperAdminPage from './pages/SuperAdminPage'

function App() {
  const [appReady] = useState(true)

  return (
    <BrowserRouter>
      {appReady && (
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/policies/:id/view" element={<PolicyViewPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/super-admin" element={<SuperAdminPage />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
