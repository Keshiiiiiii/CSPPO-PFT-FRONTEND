import React, { useState } from 'react'
import './Login.css'
import CreateAccount from './Create_Account.jsx'
import Modal from './Modal.jsx'
import { officerLogin, adminLogin } from './api'

function Login({ onLogin, onCreateAccount, loginError, setLoginError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [messageType, setMessageType] = useState('error') // 'error' | 'success'
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState('officer') // 'officer' or 'admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')

    if (!email || !password) {
      setLoginError('Please enter both email and password.')
      setMessageType('error')
      setShowErrorModal(true)
      return
    }

    setIsLoading(true)

    try {
      const loginData = {
        email,
        password,
      }

      let result
      if (userType === 'admin') {
        result = await adminLogin(loginData)
      } else {
        result = await officerLogin(loginData)
      }

      // Call parent handler with user info
      onLogin({
        email,
        password,
        userType,
        user: result,
      })

      setEmail('')
      setPassword('')
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.'
      setLoginError(errorMessage)
      setMessageType('error')
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (newAccount) => {
    try {
      await onCreateAccount(newAccount)
      setIsRegistering(false)
      setEmail('')
      setPassword('')
      // Set success message
      setLoginError('Account created successfully! Please sign in.')
      setMessageType('success')
      setShowErrorModal(true)
    } catch (error) {
      setLoginError(error.message || 'Failed to create account.')
      setMessageType('error')
      setShowErrorModal(true)
    }
  }

  // Show error modal when loginError is provided
  React.useEffect(() => {
    if (loginError) {
      setShowErrorModal(true)
    }
  }, [loginError])

  if (isRegistering) {
    return (
      <div className="login-root">
        <CreateAccount onRegister={handleRegister} onCancel={() => setIsRegistering(false)} />
      </div>
    )
  }

  return (
    <div className="login-root">
      <div className="login-panel">
        <div className="login-header">
          <div className="login-badge-icon">
            <img
              src="https://static.wikia.nocookie.net/logopedia/images/3/31/Philippine_National_Police.png/revision/latest?cb=20200626051209"
              alt="Philippine National Police"
            />
          </div>
          <div className="login-title-block">
            <div className="login-subtitle">Philippine National Police</div>
            <div className="login-title">HRDD User Portal</div>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="user-type">Account Type</label>
            <select
              id="user-type"
              className="login-input"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              disabled={isLoading}
            >
              <option value="officer">Officer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="login-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="login-footer">
            <button type="submit" className="login-btn-primary" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="login-footer" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            <button 
              type="button" 
              className="login-btn-secondary" 
              onClick={() => setIsRegistering(true)}
              disabled={isLoading}
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="login-meta">
          <span>Authorized personnel only • All access is audited</span>
        </div>
      </div>

      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={messageType === 'success' ? 'Success' : 'Login Failed'}
        className={messageType === 'success' ? 'success-modal' : 'error-modal'}
      >
        <p>{loginError || 'Please enter both name and password.'}</p>
      </Modal>
    </div>
  )
}

export default Login

