/*
  Admin panel page — accessible to super_admin role only.
  Manages organizations and users across the platform.
*/

import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Navbar from '../components/Navbar'
import {
  getAdminOrgs,
  createAdminOrg,
  deleteAdminOrg,
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
} from '../api/api'

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

function AdminPage() {
  const navigate = useNavigate()

  // ── Organizations state ──
  const [orgs, setOrgs] = useState([])
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [orgAlert, setOrgAlert] = useState({ type: '', message: '' })

  // ── Users state ──
  const [users, setUsers] = useState([])
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userRole, setUserRole] = useState('user')
  const [userOrgId, setUserOrgId] = useState('')
  const [userAlert, setUserAlert] = useState({ type: '', message: '' })

  const loadData = useCallback(async () => {
    try {
      const [orgsRes, usersRes] = await Promise.all([getAdminOrgs(), getAdminUsers()])
      setOrgs(orgsRes.data)
      setUsers(usersRes.data)
    } catch {
      // silently fail on load — individual actions show their own errors
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }
    try {
      const payload = jwtDecode(token)
      if (payload.role !== 'super_admin') {
        navigate('/dashboard')
        return
      }
    } catch {
      navigate('/')
      return
    }
    loadData()
  }, [navigate, loadData])

  // ── Org handlers ──

  const handleCreateOrg = async (e) => {
    e.preventDefault()
    setOrgAlert({ type: '', message: '' })
    try {
      await createAdminOrg({ name: orgName, slug: orgSlug })
      setOrgName('')
      setOrgSlug('')
      setOrgAlert({ type: 'success', message: `Organization "${orgName}" created.` })
      loadData()
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to create organization.'
      setOrgAlert({ type: 'danger', message: detail })
    }
  }

  const handleDeactivateOrg = async (id, name) => {
    setOrgAlert({ type: '', message: '' })
    try {
      await deleteAdminOrg(id)
      setOrgAlert({ type: 'success', message: `Organization "${name}" deactivated.` })
      loadData()
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to deactivate organization.'
      setOrgAlert({ type: 'danger', message: detail })
    }
  }

  // ── User handlers ──

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setUserAlert({ type: '', message: '' })
    try {
      await createAdminUser({
        email: userEmail,
        password: userPassword,
        role: userRole,
        organization_id: userOrgId ? parseInt(userOrgId, 10) : null,
      })
      setUserEmail('')
      setUserPassword('')
      setUserRole('user')
      setUserOrgId('')
      setUserAlert({ type: 'success', message: `User "${userEmail}" created.` })
      loadData()
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to create user.'
      setUserAlert({ type: 'danger', message: detail })
    }
  }

  const handleDeleteUser = async (id, email) => {
    setUserAlert({ type: '', message: '' })
    try {
      await deleteAdminUser(id)
      setUserAlert({ type: 'success', message: `User "${email}" deleted.` })
      loadData()
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to delete user.'
      setUserAlert({ type: 'danger', message: detail })
    }
  }

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1 className="mb-4">Admin Panel</h1>

        {/* ── Organizations Section ── */}
        <div className="card mb-5">
          <div className="card-header bg-dark text-white">
            <strong>Organizations</strong>
          </div>
          <div className="card-body">
            <Alert
              type={orgAlert.type}
              message={orgAlert.message}
              onDismiss={() => setOrgAlert({ type: '', message: '' })}
            />

            {/* Create org form */}
            <form onSubmit={handleCreateOrg} className="form-inline mb-4">
              <div className="form-group mr-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mr-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Slug (e.g. acme-corp)"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create Organization
              </button>
            </form>

            {/* Orgs table */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="thead-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Active</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No organizations yet.
                      </td>
                    </tr>
                  ) : (
                    orgs.map((org) => (
                      <tr key={org.id}>
                        <td>{org.id}</td>
                        <td>{org.name}</td>
                        <td>{org.slug || '—'}</td>
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
                            onClick={() => handleDeactivateOrg(org.id, org.name)}
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

        {/* ── Users Section ── */}
        <div className="card mb-5">
          <div className="card-header bg-dark text-white">
            <strong>Users</strong>
          </div>
          <div className="card-body">
            <Alert
              type={userAlert.type}
              message={userAlert.message}
              onDismiss={() => setUserAlert({ type: '', message: '' })}
            />

            {/* Create user form */}
            <form onSubmit={handleCreateUser} className="mb-4">
              <div className="row">
                <div className="col-md-3 form-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2 form-group">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="col-md-2 form-group">
                  <select
                    className="form-control"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="org_admin">org_admin</option>
                  </select>
                </div>
                <div className="col-md-3 form-group">
                  <select
                    className="form-control"
                    value={userOrgId}
                    onChange={(e) => setUserOrgId(e.target.value)}
                  >
                    <option value="">— No Organization —</option>
                    {orgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 form-group">
                  <button type="submit" className="btn btn-primary btn-block">
                    Create User
                  </button>
                </div>
              </div>
            </form>

            {/* Users table */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="thead-light">
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Org ID</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No users yet.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`badge badge-${
                              user.role === 'super_admin'
                                ? 'danger'
                                : user.role === 'org_admin'
                                ? 'warning'
                                : 'secondary'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>{user.organization_id ?? '—'}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteUser(user.id, user.email)}
                          >
                            Delete
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
      </div>
    </div>
  )
}

export default AdminPage
