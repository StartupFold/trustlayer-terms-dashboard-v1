/*
  Policy form component for creating and editing policies.
  Handles title, policy type, and content input.
*/

import React, { useEffect, useState } from 'react'

function PolicyForm({ onSubmit, existingPolicy, onCancel }) {
  const [title, setTitle] = useState('')
  const [policyType, setPolicyType] = useState('Terms & Conditions')
  const [content, setContent] = useState('')

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

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ title, policy_type: policyType, content })
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">{existingPolicy ? 'Edit Policy' : 'Create Policy'}</h5>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="policyTitle">Title</label>
            <input
              id="policyTitle"
              type="text"
              className="form-control"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="policyType">Policy Type</label>
            <select
              id="policyType"
              className="form-control"
              value={policyType}
              onChange={(event) => setPolicyType(event.target.value)}
            >
              <option>Terms & Conditions</option>
              <option>Privacy Policy</option>
              <option>Refund Policy</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="policyContent">Content</label>
            <textarea
              id="policyContent"
              className="form-control"
              rows="5"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary mr-2">
            {existingPolicy ? 'Update Policy' : 'Create Policy'}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

export default PolicyForm
