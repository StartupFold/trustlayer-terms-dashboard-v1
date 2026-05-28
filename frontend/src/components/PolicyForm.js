/*
  Policy form — create or edit a policy with polished inputs.
*/

import React, { useEffect, useState } from 'react'

function PolicyForm({ onSubmit, existingPolicy, onCancel }) {
  const [title, setTitle]         = useState('')
  const [policyType, setPolicyType] = useState('Terms & Conditions')
  const [content, setContent]     = useState('')

  useEffect(() => {
    if (existingPolicy) {
      setTitle(existingPolicy.title || '')
      setPolicyType(existingPolicy.policy_type || 'Terms & Conditions')
      setContent(existingPolicy.content || '')
    } else {
      setTitle('')
      setPolicyType('Terms & Conditions')
      setContent('')
    }
  }, [existingPolicy])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ title, policy_type: policyType, content })
  }

  return (
    <div className="card mb-4 policy-form-card">
      <div className="card-header">
        <i className={`bi ${existingPolicy ? 'bi-pencil-square' : 'bi-plus-circle'} mr-2`}
           style={{ color: 'var(--brand)' }}></i>
        <strong>{existingPolicy ? 'Edit Policy' : 'New Policy'}</strong>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 form-group">
              <label htmlFor="policyTitle">Title</label>
              <input
                id="policyTitle"
                type="text"
                className="form-control"
                placeholder="e.g. Terms & Conditions v2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 form-group">
              <label htmlFor="policyType">Policy Type</label>
              <select
                id="policyType"
                className="form-control"
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
              >
                <option>Terms &amp; Conditions</option>
                <option>Privacy Policy</option>
                <option>Refund Policy</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="policyContent">Content</label>
            <textarea
              id="policyContent"
              className="form-control"
              rows="6"
              placeholder="Write your policy content here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="d-flex align-items-center" style={{ gap: 8 }}>
            <button type="submit" className="btn btn-primary mr-2">
              <i className={`bi ${existingPolicy ? 'bi-check-lg' : 'bi-plus-lg'} mr-1`}></i>
              {existingPolicy ? 'Update Policy' : 'Create Policy'}
            </button>
            {onCancel && (
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default PolicyForm
