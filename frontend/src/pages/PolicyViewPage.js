/*
  Policy view page — clean centered layout with sticky I Agree bar at bottom.
  Supports token-based acceptance from email links (?token=xxx).
*/

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { acceptPolicy, getPolicies, getPolicyVersions } from '../api/api'

function PolicyViewPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [policy, setPolicy]                 = useState(null)
  const [content, setContent]               = useState('')
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')
  const [success, setSuccess]               = useState('')
  const [acceptanceLoading, setAcceptanceLoading] = useState(false)

  useEffect(() => {
    const policyId = parseInt(id, 10)
    getPolicies()
      .then((res) => {
        const found = res.data.find((p) => p.id === policyId)
        if (!found) { setError('Policy not found.'); setLoading(false); return }
        setPolicy(found)
        return getPolicyVersions(policyId)
      })
      .then((res) => {
        if (!res) return
        const versions = res.data
        if (versions.length > 0) setContent(versions[versions.length - 1].content || '')
      })
      .catch(() => setError('Unable to load policy.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAccept = () => {
    setSuccess('')
    setError('')
    setAcceptanceLoading(true)
    acceptPolicy(parseInt(id, 10), token)
      .then(() => setSuccess('You have accepted this policy.'))
      .catch((err) => setError(err.response?.data?.detail || 'Unable to accept policy.'))
      .finally(() => setAcceptanceLoading(false))
  }

  if (loading) {
    return (
      <div className="policy-view-page">
        <div className="spinner-center" style={{ paddingTop: 80 }}>
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading…</span>
          </div>
        </div>
      </div>
    )
  }

  if (!policy) {
    return (
      <div className="policy-view-page">
        <div style={{ width: '100%', maxWidth: 720 }}>
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle mr-2"></i>
            {error || 'Policy not found.'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="policy-view-page">
      <div className="policy-view-card card shadow-sm">
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <span className="policy-view-badge">{policy.policy_type}</span>
          </div>
          <h1 className="policy-view-title">{policy.title}</h1>
          <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />

          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-circle mr-2"></i>{error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle mr-2"></i>{success}
            </div>
          )}
          {token && !success && (
            <div className="alert alert-info">
              <i className="bi bi-envelope-open mr-2"></i>
              You were invited to review this policy. Please read it carefully before accepting.
            </div>
          )}

          <div className="policy-view-content">
            {content || 'No content has been added to this policy yet.'}
          </div>
        </div>
      </div>

      {/* Sticky bottom agree bar */}
      {!success && (
        <div className="policy-agree-bar">
          <button
            type="button"
            className="btn btn-primary policy-agree-btn"
            onClick={handleAccept}
            disabled={acceptanceLoading}
          >
            {acceptanceLoading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                Recording…
              </>
            ) : (
              <>
                <i className="bi bi-check-lg mr-2"></i>I Agree to this Policy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default PolicyViewPage
