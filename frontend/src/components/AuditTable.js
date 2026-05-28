/*
  Audit table — search/filter bar, monospace IPs, relative timestamps, CSV export.
*/

import React, { useState } from 'react'

function relativeTime(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString()
}

function exportCSV(logs) {
  const header = ['ID', 'Policy ID', 'Recipient Email', 'IP Address', 'User Agent', 'Status', 'Accepted At']
  const rows = logs.map((l) => [
    l.id,
    l.policy_id,
    l.recipient_email || '',
    l.ip_address || '',
    (l.user_agent || '').replace(/,/g, ' '),
    l.accepted_at ? 'Accepted' : 'Pending',
    l.accepted_at ? new Date(l.accepted_at).toISOString() : '',
  ])
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function AuditTable({ logs }) {
  const [search, setSearch] = useState('')

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase()
    return (
      (l.recipient_email || '').toLowerCase().includes(q) ||
      (l.ip_address || '').includes(q) ||
      String(l.policy_id).includes(q)
    )
  })

  return (
    <div>
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: 12 }}>
        <div className="search-bar flex-grow-1" style={{ maxWidth: 380 }}>
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search by email, IP, or policy ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="d-flex align-items-center" style={{ gap: 10 }}>
          <span className="text-muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
            {filtered.length} of {logs.length} record{logs.length !== 1 ? 's' : ''}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => exportCSV(logs)}
            disabled={logs.length === 0}
          >
            <i className="bi bi-download mr-1"></i>Export CSV
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Email / Recipient</th>
                <th>Policy</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Accepted</th>
                <th>User Agent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-5">
                    <i className="bi bi-inbox d-block mb-2" style={{ fontSize: 28, opacity: 0.3 }}></i>
                    {search ? 'No records match your search.' : 'No acceptance logs found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((log, idx) => (
                  <tr key={log.id} style={idx % 2 === 1 ? { background: '#f9fafe' } : {}}>
                    <td style={{ fontSize: 13 }}>
                      {log.recipient_email ? (
                        <span>
                          <i className="bi bi-envelope mr-1 text-muted"></i>
                          {log.recipient_email}
                        </span>
                      ) : (
                        <span className="text-muted">
                          <i className="bi bi-person mr-1"></i>Anonymous
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge-status badge-draft">#{log.policy_id}</span>
                    </td>
                    <td>
                      {log.ip_address ? (
                        <span className="font-mono">{log.ip_address}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {log.accepted_at ? (
                        <span className="badge-status badge-accepted">
                          <i className="bi bi-check-circle mr-1"></i>Accepted
                        </span>
                      ) : (
                        <span className="badge-status badge-pending">
                          <i className="bi bi-hourglass mr-1"></i>Pending
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {log.accepted_at ? (
                        <span title={new Date(log.accepted_at).toLocaleString()}>
                          {relativeTime(log.accepted_at)}
                        </span>
                      ) : '—'}
                    </td>
                    <td
                      className="text-truncate text-muted"
                      style={{ maxWidth: 200, fontSize: 12 }}
                      title={log.user_agent || ''}
                    >
                      {log.user_agent || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AuditTable
