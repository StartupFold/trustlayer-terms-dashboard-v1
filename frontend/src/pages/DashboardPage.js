/*
  Dashboard page for organization overview.
  Displays policy and acceptance metrics for the logged-in user.
*/

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getPolicies, getAuditLogs } from '../api/api'

function DashboardPage() {
  const navigate = useNavigate()
  const [policyCount, setPolicyCount] = useState(0)
  const [acceptanceCount, setAcceptanceCount] = useState(0)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    const storedEmail = localStorage.getItem('email')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        if (payload?.sub) {
          localStorage.setItem('email', payload.sub)
          setEmail(payload.sub)
        }
      } catch {
        setEmail('')
      }
    }

    getPolicies()
      .then((response) => {
        setPolicyCount(response.data.length)
      })
      .catch(() => {
        setPolicyCount(0)
      })

    getAuditLogs()
      .then((response) => {
        setAcceptanceCount(response.data.length)
      })
      .catch(() => {
        setAcceptanceCount(0)
      })
  }, [navigate])

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col-12">
            <h1>Dashboard</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-4 mb-3">
            <div className="card text-white bg-primary h-100">
              <div className="card-body">
                <h5 className="card-title">Total Policies</h5>
                <p className="card-text display-4">{policyCount}</p>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-4 mb-3">
            <div className="card text-white bg-success h-100">
              <div className="card-body">
                <h5 className="card-title">Total Acceptances</h5>
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
