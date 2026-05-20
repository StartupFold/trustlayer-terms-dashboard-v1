/*
  Policies page for listing and managing policies.
  Allows creating, editing, deleting, and publishing policies.
*/

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PolicyForm from '../components/PolicyForm'
import PolicyTable from '../components/PolicyTable'
import { createPolicy, deletePolicy, getPolicies, publishPolicy, updatePolicy } from '../api/api'

function PoliciesPage() {
  const navigate = useNavigate()
  const [policies, setPolicies] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [error, setError] = useState('')

  const loadPolicies = () => {
    getPolicies()
      .then((response) => {
        setPolicies(response.data)
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('token')
          navigate('/')
          return
        }
        setError('Unable to load policies.')
      })
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/')
      return
    }
    loadPolicies()
  }, [navigate])

  const handleCreateClick = () => {
    setSelectedPolicy(null)
    setShowForm((current) => !current)
    setError('')
  }

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
      .then(() => {
        setShowForm(false)
        setSelectedPolicy(null)
        loadPolicies()
      })
      .catch(() => {
        setError('Unable to save policy. Please try again.')
      })
  }

  const handleEdit = (policy) => {
    setSelectedPolicy(policy)
    setShowForm(true)
    setError('')
  }

  const handleDelete = (policyId) => {
    setError('')
    deletePolicy(policyId)
      .then(() => loadPolicies())
      .catch(() => setError('Unable to delete policy.'))
  }

  const handlePublish = (policyId) => {
    setError('')
    publishPolicy(policyId)
      .then(() => loadPolicies())
      .catch(() => setError('Unable to publish policy.'))
  }

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>Policies</h1>
          <button className="btn btn-primary" onClick={handleCreateClick}>
            {showForm ? 'Hide Form' : 'Create New Policy'}
          </button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {showForm && (
          <PolicyForm
            existingPolicy={selectedPolicy}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false)
              setSelectedPolicy(null)
            }}
          />
        )}
        <PolicyTable
          policies={policies}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPublish={handlePublish}
        />
      </div>
    </div>
  )
}

export default PoliciesPage
