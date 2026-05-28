/*
  Super Admin page — org account creation and listing.
  Accessible to super_admin role only.
*/

import React, { useEffect, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import { getAdminOrgs, createAdminOrg, deleteAdminOrg } from '../api/api'

function Alert({ type, message, onDismiss }) {
  if (!message) return null
  return (
    <div className={`alert alert-${type} alert-dismissible`} role="alert">
      {message}
      <button type="button" className="close" onClick={onDismiss}>
        <span>&times;</span>
      </button>
    </div>
  )
}

function SuperAdminPage() {
  const [orgs, setOrgs] = useState([])
  const [orgName, setOrgName] = useState('')
  const [orgEmail, setOrgEmail] = useState('')
  const [orgPassword, setOrgPassword] = useState('')
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const loadOrgs = useCallback(async () => {
    try {
      const res = await getAdminOrgs()
      setOrgs(res.data)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    loadOrgs()
  }, [loadOrgs])

  const handleCreate = async (e) => {
    e.preventDefault()
    setAlert({ type: '', message: '' })
    setLoading(true)
    try {
      await createAdminOrg({ org_name: orgName, email: orgEmail, password: orgPassword })
      setOrgName('')
      setOrgEmail('')
      setOrgPassword('')
      setAlert({ type: 'success', message: `Organization "${orgName}" created with admin user ${orgEmail}.` })
      loadOrgs()
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to create organization.'
      setAlert({ type: 'danger', message: detail })
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async (id, name) => {
    setAlert({ type: '', message: '' })
    try {
      await deleteAdminOrg(id)
      setAlert({ type: 'success', message: `"${name}" deactivated.` })
      loadOrgs()
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.detail || 'Failed.' })
    }
  }

  return (
    <Layout requireRole="super_admin">
      <h1 className="page-title">Org Accounts</h1>
      <p className="page-subtitle">Create a new organization and its admin user in one step.</p>

      <Alert type={alert.type} message={alert.message} onDismiss={() => setAlert({ type: '', message: '' })} />

      <div className="card mb-5">
        <div className="card-header"><strong>Create Organization Account</strong></div>
        <div className="card-body">
          <form onSubmit={handleCreate}>
            <div className="row">
              <div className="col-md-4 form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Acme Corp"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4 form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@acme.com"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3 form-group">
                <label>Admin Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min 8 characters"
                  value={orgPassword}
                  onChange={(e) => setOrgPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="col-md-1 form-group d-flex align-items-end">
                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? '...' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><strong>All Organizations</strong></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="thead-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Admin Email</th>
                  <th>Subscription</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orgs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">No organizations yet.</td>
                  </tr>
                ) : (
                  orgs.map((org) => (
                    <tr key={org.id}>
                      <td>{org.id}</td>
                      <td><strong>{org.name}</strong></td>
                      <td>{org.admin_email || org.email || '—'}</td>
                      <td>{org.subscription_status}</td>
                      <td>
                        <span className={`badge badge-${org.is_active ? 'success' : 'secondary'}`}>
                          {org.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(org.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning"
                          disabled={!org.is_active}
                          onClick={() => handleDeactivate(org.id, org.name)}
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default SuperAdminPage
