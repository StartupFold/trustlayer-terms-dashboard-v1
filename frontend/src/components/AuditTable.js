/*
  Audit table component for displaying acceptance logs.
  Shows policy acceptance events with IP and user agent data.
*/

import React from 'react'

function AuditTable({ logs }) {
  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead className="thead-light">
          <tr>
            <th>Policy ID</th>
            <th>IP Address</th>
            <th>User Agent</th>
            <th>Accepted At</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.policy_id}</td>
              <td>{log.ip_address || 'N/A'}</td>
              <td className="text-truncate" style={{ maxWidth: '300px' }}>
                {log.user_agent || 'N/A'}
              </td>
              <td>{new Date(log.accepted_at).toLocaleString()}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No acceptance logs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default AuditTable
