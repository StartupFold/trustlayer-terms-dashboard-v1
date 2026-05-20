/*
  Policy table component for displaying policy lists.
  Renders policies with edit, delete, and publish actions.
*/

import React from 'react'

function PolicyTable({ policies, onEdit, onDelete, onPublish }) {
  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead className="thead-light">
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Version</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy) => (
            <tr key={policy.id}>
              <td>{policy.title}</td>
              <td>{policy.policy_type}</td>
              <td>
                {policy.is_published ? (
                  <span className="badge badge-success">Published</span>
                ) : (
                  <span className="badge badge-secondary">Draft</span>
                )}
              </td>
              <td>{policy.version ?? 'N/A'}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-sm btn-primary mr-2"
                  onClick={() => onEdit(policy)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger mr-2"
                  onClick={() => onDelete(policy.id)}
                >
                  Delete
                </button>
                {!policy.is_published && (
                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={() => onPublish(policy.id)}
                  >
                    Publish
                  </button>
                )}
              </td>
            </tr>
          ))}
          {policies.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No policies found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default PolicyTable
