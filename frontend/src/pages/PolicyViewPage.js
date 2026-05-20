/*
  Policy view page for reading policy details and accepting.
  Public endpoint - no login required.
*/

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { acceptPolicy, getPolicies } from '../api/api'

function PolicyViewPage() {
  const { id } = useParams()
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [acceptanceLoading, setAcceptanceLoading] = useState(false)

  useEffect(() => {
    getPolicies()
      .then((response) => {
        const found = response.data.find((p) => p.id === parseInt(id, 10))
        if (found) {
          setPolicy(found)
          setError('')
        } else {
          setError('Policy not found.')
        }
      })
      .catch(() => {
        setError('Unable to load policy.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const handleAccept = () => {
    setSuccess('')
    setError('')
    setAcceptanceLoading(true)

    acceptPolicy(parseInt(id, 10))
      .then(() => {
        setSuccess('You have accepted this policy.')
      })
      .catch((err) => {
        const message = err.response?.data?.detail || 'Unable to accept policy.'
        setError(message)
      })
      .finally(() => {
        setAcceptanceLoading(false)
      })
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!policy) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error || 'Policy not found.'}</div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">{policy.title}</h3>
          <p className="text-muted">{policy.policy_type}</p>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="card-text mt-4 p-3" style={{ backgroundColor: '#f8f9fa', minHeight: '200px' }}>
            {policy.content || 'No content provided.'}
          </div>
          <button
            type="button"
            className="btn btn-primary mt-4"
            onClick={handleAccept}
            disabled={acceptanceLoading || Boolean(success)}
          >
            {acceptanceLoading ? 'Accepting...' : 'I Agree'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PolicyViewPage
