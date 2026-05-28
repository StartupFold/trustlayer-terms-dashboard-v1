/*
  Policy table — alternating rows, pill badges, icon action buttons.
*/

import React from 'react'
import { useNavigate } from 'react-router-dom'

function PolicyTable({ policies, onEdit, onDelete, onPublish, onSend }) {
  const navigate = useNavigate()

  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-5">
                  <i className="bi bi-file-earmark-plus d-block mb-2" style={{ fontSize: 28, opacity: 0.3 }}></i>
                  No policies yet. Create your first one above.
                </td>
              </tr>
            ) : (
              policies.map((policy, idx) => (
                <tr key={policy.id} style={idx % 2 === 1 ? { background: '#f9fafe' } : {}}>
                  <td style={{ fontWeight: 500 }}>{policy.title}</td>
                  <td>
                    <span className="text-muted" style={{ fontSize: 13 }}>{policy.policy_type}</span>
                  </td>
                  <td>
                    {policy.is_published ? (
                      <span className="badge-status badge-published">
                        <i className="bi bi-check-circle mr-1"></i>Published
                      </span>
                    ) : (
                      <span className="badge-status badge-draft">
                        <i className="bi bi-pencil mr-1"></i>Draft
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-icon btn-icon-edit mr-1"
                      onClick={() => onEdit(policy)}
                      title="Edit"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn-icon btn-icon-delete mr-1"
                      onClick={() => onDelete(policy.id)}
                      title="Delete"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                    {!policy.is_published && (
                      <button
                        className="btn-icon btn-icon-pub mr-1"
                        onClick={() => onPublish(policy.id)}
                        title="Publish"
                      >
                        <i className="bi bi-upload"></i>
                      </button>
                    )}
                    {policy.is_published && onSend && (
                      <button
                        className="btn-icon btn-icon-send mr-1"
                        onClick={() => onSend(policy)}
                        title="Send via Email"
                      >
                        <i className="bi bi-envelope"></i>
                      </button>
                    )}
                    <button
                      className="btn-icon btn-icon-view"
                      onClick={() => navigate(`/policies/${policy.id}/view`)}
                      title="View"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PolicyTable
