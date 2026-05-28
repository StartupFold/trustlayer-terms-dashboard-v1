/*
  Slim top bar — org context, user email, role badge, logout.
*/

import React from 'react'
import { useNavigate } from 'react-router-dom'

function TopBar({ email, role, orgName }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('email')
    navigate('/')
  }

  const displayOrg = orgName || (role === 'super_admin' ? 'Platform Admin' : 'My Organization')

  return (
    <header className="topbar">
      <span className="topbar-org">{displayOrg}</span>

      <div className="topbar-right">
        {email && (
          <span className="topbar-email">
            <i className="bi bi-person-circle mr-1" style={{ fontSize: 13 }}></i>
            {email}
          </span>
        )}
        {role && (
          <span className="topbar-role">
            {role === 'super_admin' ? 'Super Admin' : 'Org Admin'}
          </span>
        )}
        <button className="btn btn-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right mr-1"></i>
          Logout
        </button>
      </div>
    </header>
  )
}

export default TopBar
