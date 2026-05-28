/*
  App layout: fixed sidebar + slim top bar + page content area.
  All authenticated pages use this wrapper instead of the old Navbar.
*/

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function Layout({ children, requireRole }) {
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/'); return }
    try {
      const payload = jwtDecode(token)
      setRole(payload.role || '')
      setEmail(payload.sub || '')
      if (requireRole && payload.role !== requireRole) {
        navigate('/dashboard')
      }
    } catch {
      navigate('/')
    }
  }, [navigate, requireRole])

  return (
    <div>
      <Sidebar role={role} />
      <TopBar email={email} role={role} />
      <div className="app-layout">
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
