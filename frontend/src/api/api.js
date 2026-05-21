/*
  API utility for frontend HTTP calls.
*/

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function login(email, password) {
  return api.post('/api/login', { email, password })
}

export function register(email, password, role, organization_id) {
  return api.post('/api/register', { email, password, role, organization_id })
}

export function getPolicies() {
  return api.get('/api/policies')
}

export function createPolicy(title, policy_type) {
  return api.post('/api/policies', { title, policy_type })
}

export function updatePolicy(id, data) {
  return api.put(`/api/policies/${id}`, data)
}

export function deletePolicy(id) {
  return api.delete(`/api/policies/${id}`)
}

export function publishPolicy(id) {
  return api.post(`/api/policies/${id}/publish`)
}

export function getPolicyVersions(id) {
  return api.get(`/api/policies/${id}/versions`)
}

export function getAuditLogs() {
  return api.get('/api/admin/audit-logs')
}

// ─── Admin: Organizations ─────────────────────────────────────────────────────

export function getAdminOrgs() {
  return api.get('/api/admin/organizations')
}

export function createAdminOrg(data) {
  return api.post('/api/admin/organizations', data)
}

export function deleteAdminOrg(id) {
  return api.delete(`/api/admin/organizations/${id}`)
}

// ─── Admin: Users ─────────────────────────────────────────────────────────────

export function getAdminUsers() {
  return api.get('/api/admin/users')
}

export function createAdminUser(data) {
  return api.post('/api/admin/users', data)
}

export function deleteAdminUser(id) {
  return api.delete(`/api/admin/users/${id}`)
}

export function acceptPolicy(id) {
  return api.post(`/api/policies/${id}/accept`)
}
