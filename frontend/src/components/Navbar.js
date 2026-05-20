/*
  Navigation bar component for the frontend UI.
  Displays application navigation and provides logout behavior.
*/

import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('token')))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('email')
    setIsAuthenticated(false)
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">
          🔒 TrustLayer
        </Link>
        {isAuthenticated && (
          <>
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
              </ul>
              <button className="btn btn-outline-light my-2 my-sm-0" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
