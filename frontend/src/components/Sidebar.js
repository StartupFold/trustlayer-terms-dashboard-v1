/*
  Fixed left sidebar with Bootstrap Icons and role-aware navigation.
*/

import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',  icon: 'bi-grid-fill' },
  { to: '/policies',   label: 'Policies',   icon: 'bi-file-text-fill' },
  { to: '/audit-logs', label: 'Audit Logs', icon: 'bi-clock-history' },
]

const ADMIN_ITEMS = [
  { to: '/admin',       label: 'Admin Panel', icon: 'bi-gear-fill' },
  { to: '/super-admin', label: 'Org Accounts', icon: 'bi-building' },
]

function Sidebar({ role }) {
  const { pathname } = useLocation()

  return (
    <aside className="sidebar">
      <Link to="/dashboard" className="sidebar-logo">
        <span className="sidebar-logo-icon">
          <i className="bi bi-shield-check"></i>
        </span>
        <span className="sidebar-logo-text">
          Trust<span>Layer</span>
        </span>
      </Link>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Main</div>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link${pathname === to ? ' active' : ''}`}
          >
            <i className={`bi ${icon}`}></i>
            {label}
          </Link>
        ))}

        {role === 'super_admin' && (
          <>
            <div className="sidebar-section" style={{ marginTop: 12 }}>Admin</div>
            {ADMIN_ITEMS.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`sidebar-link${pathname === to ? ' active' : ''}`}
              >
                <i className={`bi ${icon}`}></i>
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar
