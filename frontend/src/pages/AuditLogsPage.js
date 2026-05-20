/*
  Audit logs page showing acceptance history.
  Displays all policy acceptances for the organization (admin only).
*/

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AuditTable from '../components/AuditTable'
import { getAuditLogs } from '../api/api'

function AuditLogsPage() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    getAuditLogs()
      .then((response) => {
        setLogs(response.data)
        setError('')
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('token')
          navigate('/')
          return
        }
        if (err.response?.status === 403) {
          setError('You do not have permission to view audit logs.')
        } else {
          setError('Unable to load audit logs.')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [navigate])

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1 className="mb-4">Audit Logs</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <AuditTable logs={logs} />
        )}
      </div>
    </div>
  )
}

export default AuditLogsPage
