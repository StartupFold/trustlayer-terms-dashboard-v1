/*
  Main React application component.
*/

import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PoliciesPage from './pages/PoliciesPage'
import AuditLogsPage from './pages/AuditLogsPage'
import PolicyViewPage from './pages/PolicyViewPage'

function App() {
  const [appReady] = useState(true)

  return (
    <BrowserRouter>
      {appReady && (
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/policies/:id/view" element={<PolicyViewPage />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
