/*
  Login page — centered card with TrustLayer logo and clean form.
*/

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/api'

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(
      decoded
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    ))
  } catch {
    return null
  }
}

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await login(email, password)
      const token = response.data.access_token
      localStorage.setItem('token', token)
      const payload = decodeJwtPayload(token)
      if (payload?.role) localStorage.setItem('role', payload.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="card-body">
          <div className="auth-logo">
            <i className="bi bi-shield-check"></i>
          </div>
          <h1 className="auth-title">TrustLayer</h1>
          <p className="auth-subtitle">Sign in to your account</p>

          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-circle mr-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="auth-divider">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
