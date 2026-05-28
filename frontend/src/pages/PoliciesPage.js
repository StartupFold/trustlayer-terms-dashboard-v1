/*
  Policies page — lists policies in a styled table with Edit/Delete/Publish/Send actions.
  Includes a Send via Email modal for sending policy acceptance requests.
*/

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import PolicyForm from '../components/PolicyForm'
import PolicyTable from '../components/PolicyTable'
import { createPolicy, deletePolicy, getPolicies, publishPolicy, sendPolicyEmail, updatePolicy } from '../api/api'

function SendEmailModal({ policy, onClose, onSent }) {
  const [emailInput, setEmailInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async (e) => {
    e.preventDefault()
    setError('')
    const emails = emailInput
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (emails.length === 0) { setError('Enter at least one email address.'); return }
    setSending(true)
    try {
      await sendPolicyEmail(policy.id, emails)
      onSent(`Policy sent to ${emails.length} recipient(s).`)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="modal"
      style={{ display: 'block', background: 'rgba(0,0,0,0.4)', position: 'fixed', inset: 0, zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 480 }}>
        <div className="modal-content" style={{ borderRadius: 12, border: 'none' }}>
          <div className="modal-header">
            <h5 className="modal-title">Send via Email</h5>
            <button className="close" onClick={onClose}><span>&times;</span></button>
          </div>
          <div className="modal-body">
            <p className="text-muted" style={{ fontSize: 14 }}>
              Sending: <strong>{policy.title}</strong>
            </p>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label>Email Addresses</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="email@example.com, another@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <small className="text-muted">Separate multiple addresses with commas or newlines.</small>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-secondary mr-2" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function PoliciesPage() {
  const navigate = useNavigate()
  const [policies, setPolicies] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [sendTarget, setSendTarget] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadPolicies = () => {
    getPolicies()
      .then((r) => setPolicies(r.data))
      .catch((err) => {
        if (err.response?.status === 401) { localStorage.removeItem('token'); navigate('/') }
        else setError('Unable to load policies.')
      })
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/'); return }
    loadPolicies()
  }, [navigate])

  const handleSubmit = (policyData) => {
    setError('')
    const action = selectedPolicy
      ? updatePolicy(selectedPolicy.id, {
          title: policyData.title,
          policy_type: policyData.policy_type,
          ...(policyData.content ? { content: policyData.content } : {}),
        })
      : createPolicy(policyData.title, policyData.policy_type)
    action
      .then(() => { setShowForm(false); setSelectedPolicy(null); loadPolicies() })
      .catch(() => setError('Unable to save policy.'))
  }

  const handleEdit    = (policy) => { setSelectedPolicy(policy); setShowForm(true); setError('') }
  const handleDelete  = (id)     => { deletePolicy(id).then(loadPolicies).catch(() => setError('Unable to delete.')) }
  const handlePublish = (id)     => { publishPolicy(id).then(loadPolicies).catch(() => setError('Unable to publish.')) }
  const handleSend    = (policy) => { setSendTarget(policy) }

  return (
    <Layout>
      {sendTarget && (
        <SendEmailModal
          policy={sendTarget}
          onClose={() => setSendTarget(null)}
          onSent={(msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000) }}
        />
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="page-title">Policies</h1>
          <p className="page-subtitle">Manage your terms, privacy policies, and more.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedPolicy(null); setShowForm((v) => !v) }}>
          {showForm ? 'Hide Form' : '+ New Policy'}
        </button>
      </div>

      {error   && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <PolicyForm
          existingPolicy={selectedPolicy}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setSelectedPolicy(null) }}
        />
      )}

      <PolicyTable
        policies={policies}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onSend={handleSend}
      />
    </Layout>
  )
}

export default PoliciesPage
