/*
  Registration page for new user accounts.
  Sends email + password to /api/register, then redirects to login.
*/

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/api'

function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register(email, password, 'user', null)
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Registration failed.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-center mb-4">🔒 TrustLayer</h3>
            <h6 className="text-center text-muted mb-4">Create an account</h6>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block mt-4"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>

            <p className="text-center mt-3 mb-0">
              Already have an account?{' '}
              <Link to="/">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
