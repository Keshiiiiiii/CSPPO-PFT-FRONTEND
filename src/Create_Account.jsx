import { useState } from 'react'
import './Create_Account.css'
import { officerSignup, adminSignup } from './api'

function CreateAccount({ onRegister, onCancel }) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('officer')
  const [department, setDepartment] = useState('IT')
  const [status, setStatus] = useState('active')
  const [authKey, setAuthKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !fullName || !userName || !password || !confirmPassword || !role) {
      setError('Please fill all fields to create account.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (role === 'admin' && !authKey) {
      setError('Authorization key is required for admin accounts.')
      return
    }

    setIsLoading(true)

    try {
      const signupData = {
        email,
        full_name: fullName,
        user_name: userName,
        password,
        status,
      }

      if (role === 'admin') {
        signupData.role = 'admin'
        signupData.department = department
      }

      let result
      if (role === 'admin') {
        result = await adminSignup(signupData, authKey)
      } else {
        result = await officerSignup(signupData)
      }

      onRegister({
        email,
        fullName,
        userName,
        role,
        ...result,
      })

      setEmail('')
      setFullName('')
      setUserName('')
      setPassword('')
      setConfirmPassword('')
      setRole('officer')
      setDepartment('IT')
      setStatus('active')
      setAuthKey('')
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="create-account-panel">
      <h2>Create Account</h2>
      {error && <div className="error-message" style={{ color: '#d32f2f', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
      <form className="create-account-form" onSubmit={handleSubmit}>
        <div className="create-account-group">
          <label htmlFor="create-email">Email</label>
          <input
            id="create-email"
            className="create-account-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. user@example.com"
            disabled={isLoading}
          />
        </div>
        <div className="create-account-group">
          <label htmlFor="create-fullname">Full Name</label>
          <input
            id="create-fullname"
            className="create-account-input"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Juan dela Cruz"
            disabled={isLoading}
          />
        </div>
        <div className="create-account-group">
          <label htmlFor="create-username">User Name</label>
          <input
            id="create-username"
            className="create-account-input"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. testuser3"
            disabled={isLoading}
          />
        </div>
        <div className="create-account-group">
          <label htmlFor="create-password">Password</label>
          <input
            id="create-password"
            className="create-account-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            disabled={isLoading}
          />
        </div>
        <div className="create-account-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            className="create-account-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            disabled={isLoading}
          />
        </div>
        <div className="create-account-group">
          <label htmlFor="create-role">Role</label>
          <select
            id="create-role"
            className="create-account-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading}
          >
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role === 'admin' && (
          <div className="create-account-group">
            <label htmlFor="create-auth-key">Authorization Key</label>
            <input
              id="create-auth-key"
              className="create-account-input"
              type="text"
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              placeholder="Enter authorization key"
              disabled={isLoading}
            />
          </div>
        )}

        {role === 'admin' && (
          <div className="create-account-group">
            <label htmlFor="create-department">Department</label>
            <input
              id="create-department"
              className="create-account-input"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. IT"
              disabled={isLoading}
            />
          </div>
        )}

        <div className="create-account-group">
          <label htmlFor="create-status">Status</label>
          <select
            id="create-status"
            className="create-account-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isLoading}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="create-account-actions">
          <button type="submit" className="create-account-btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
          <button type="button" className="create-account-btn-secondary" onClick={onCancel} disabled={isLoading}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default CreateAccount
