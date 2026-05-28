/*
  Audit logs page — shows acceptance history with CSV export.
*/

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import AuditTable from '../components/AuditTable'
import { getAuditLogs } from '../api/api'

function AuditLogsPage() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/'); return }
    getAuditLogs()
      .then((r) => { setLogs(r.data); setError('') })
      .catch((err) => {
        if (err.response?.status === 401) { localStorage.removeItem('token'); navigate('/'); return }
        if (err.response?.status === 403) setError('You do not have permission to view audit logs.')
        else setError('Unable to load audit logs.')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  return (
    <Layout>
      <h1 className="page-title">Audit Logs</h1>
      <p className="page-subtitle">Full history of policy acceptance events.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <AuditTable logs={logs} />
      )}
    </Layout>
  )
}

export default AuditLogsPage
