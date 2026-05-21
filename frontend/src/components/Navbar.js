/*
  Navigation bar component for the frontend UI.
  Displays navigation links based on auth state and role.
*/

import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(Boolean(token))
    setRole(localStorage.getItem('role') || '')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('email')
    setIsAuthenticated(false)
    setRole('')
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">
          🔒 TrustLayer
        </Link>

        {isAuthenticated ? (
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/policies">
                  Policies
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/audit-logs">
                  Audit Logs
                </Link>
              </li>
              {role === 'super_admin' && (
                <li className="nav-item">
                  <Link className="nav-link text-danger font-weight-bold" to="/admin">
                    Admin Panel
                  </Link>
                </li>
              )}
            </ul>
            <button
              className="btn btn-outline-light my-2 my-sm-0"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="collapse navbar-collapse justify-content-end">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
