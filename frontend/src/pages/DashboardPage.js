/*
  Dashboard page for organization overview.
  Displays policy and acceptance metrics; adapts UI based on JWT role.
*/

import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Navbar from '../components/Navbar'
import { getPolicies, getAuditLogs } from '../api/api'

function DashboardPage() {
  const navigate = useNavigate()
  const [policyCount, setPolicyCount] = useState(0)
  const [acceptanceCount, setAcceptanceCount] = useState(0)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    try {
      const payload = jwtDecode(token)
      setRole(payload.role || '')
      setEmail(payload.sub || '')
      if (payload.sub) localStorage.setItem('email', payload.sub)
      if (payload.role) localStorage.setItem('role', payload.role)
    } catch {
      navigate('/')
      return
    }

    getPolicies()
      .then((response) => setPolicyCount(response.data.length))
      .catch(() => setPolicyCount(0))

    getAuditLogs()
      .then((response) => setAcceptanceCount(response.data.length))
      .catch(() => setAcceptanceCount(0))
  }, [navigate])

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="row mb-3 align-items-center">
          <div className="col">
            <h1>Dashboard</h1>
            {role && (
              <span className={`badge badge-${
                role === 'super_admin' ? 'danger' : role === 'org_admin' ? 'warning' : 'secondary'
              }`}>
                {role}
              </span>
            )}
          </div>
          {role === 'super_admin' && (
            <div className="col-auto">
              <Link to="/admin" className="btn btn-danger">
                Admin Panel
              </Link>
            </div>
          )}
        </div>

        <div className="row">
          <div className="col-sm-12 col-md-4 mb-3">
            <div className="card text-white bg-primary h-100">
              <div className="card-body">
                <h5 className="card-title">
                  {role === 'org_admin' ? 'Org Policies' : 'Total Policies'}
                </h5>
                <p className="card-text display-4">{policyCount}</p>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-4 mb-3">
            <div className="card text-white bg-success h-100">
              <div className="card-body">
                <h5 className="card-title">
                  {role === 'super_admin' ? 'Platform Acceptances' : 'Total Acceptances'}
                </h5>
                <p className="card-text display-4">{acceptanceCount}</p>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-4 mb-3">
            <div className="card text-white bg-info h-100">
              <div className="card-body">
                <h5 className="card-title">Welcome</h5>
                <p className="card-text">{email || 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
