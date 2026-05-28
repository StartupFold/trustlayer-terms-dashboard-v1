/*
  Dashboard — stat cards with BI icon badges, recent activity with relative timestamps.
*/

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Layout from '../components/Layout'
import { getPolicies, getAuditLogs } from '../api/api'

function relativeTime(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function StatCard({ label, value, icon, colorClass }) {
  return (
    <div className="col-sm-12 col-md-4 mb-4">
      <div className={`card stat-card ${colorClass}`}>
        <div className="stat-icon-badge">
          <i className={`bi ${icon}`}></i>
        </div>
        <div className="stat-number">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

function DashboardPage() {
  const [policies, setPolicies] = useState([])
  const [logs, setLogs]         = useState([])
  const [role, setRole]         = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const payload = jwtDecode(token)
      setRole(payload.role || '')
      if (payload.sub)  localStorage.setItem('email', payload.sub)
      if (payload.role) localStorage.setItem('role', payload.role)
    } catch { return }

    Promise.all([getPolicies(), getAuditLogs()])
      .then(([pRes, lRes]) => { setPolicies(pRes.data); setLogs(lRes.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalPolicies    = policies.length
  const totalAcceptances = logs.filter((l) => l.accepted_at != null).length
  const pendingCount     = logs.filter((l) => l.accepted_at == null).length
  const recent           = logs.filter((l) => l.accepted_at != null).slice(0, 8)

  return (
    <Layout>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        {role === 'super_admin' ? 'Platform-wide overview' : 'Your organization overview'}
      </p>

      {loading ? (
        <div className="spinner-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading…</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row">
            <StatCard
              label={role === 'org_admin' ? 'Org Policies' : 'Total Policies'}
              value={totalPolicies}
              icon="bi-file-text-fill"
              colorClass="stat-brand"
            />
            <StatCard
              label="Acceptances"
              value={totalAcceptances}
              icon="bi-check-circle-fill"
              colorClass="stat-success"
            />
            <StatCard
              label="Pending"
              value={pendingCount}
              icon="bi-hourglass-split"
              colorClass="stat-warning"
            />
          </div>

          <div className="row mt-2">
            <div className="col-md-7 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <i className="bi bi-activity mr-2" style={{ color: 'var(--brand)' }}></i>
                  <strong>Recent Acceptances</strong>
                </div>
                <div className="card-body">
                  {recent.length === 0 ? (
                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                      No acceptances recorded yet.
                    </p>
                  ) : (
                    <ul className="activity-feed">
                      {recent.map((log) => (
                        <li key={log.id} className="activity-item">
                          <span className="activity-dot" />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>
                              {log.recipient_email || log.ip_address || 'Anonymous'}
                              <span className="text-muted" style={{ fontWeight: 400 }}>
                                {' — '}Policy #{log.policy_id}
                              </span>
                            </div>
                            <div className="activity-meta">
                              <i className="bi bi-clock mr-1"></i>
                              {relativeTime(log.accepted_at)}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-5 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <i className="bi bi-lightning-fill mr-2" style={{ color: 'var(--brand)' }}></i>
                  <strong>Quick Actions</strong>
                </div>
                <div className="card-body">
                  <Link to="/policies" className="btn btn-primary btn-block mb-2">
                    <i className="bi bi-file-text mr-2"></i>Manage Policies
                  </Link>
                  <Link to="/audit-logs" className="btn btn-outline-primary btn-block mb-2">
                    <i className="bi bi-clock-history mr-2"></i>View Audit Logs
                  </Link>
                  {role === 'super_admin' && (
                    <Link to="/super-admin" className="btn btn-outline-secondary btn-block">
                      <i className="bi bi-building mr-2"></i>Org Accounts
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}

export default DashboardPage
