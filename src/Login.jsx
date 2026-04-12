import React, { useState } from 'react'
import './css/Login.css'
import CreateAccount from './Create_Account.jsx'
import Modal from './Modal.jsx'
import { officerLogin, adminLogin } from './api'

/* ── Inline SVG Icons ── */
const IconMail = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
)
const IconLock = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
)
const IconEye = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
)
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
)
const IconShield = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
)
const IconUser = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" className="btn-icon-svg"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
)
const IconLoader = () => (
  <svg viewBox="0 0 24 24" className="btn-icon-svg spin-icon"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"/></svg>
)
const IconUserPlus = () => (
  <svg viewBox="0 0 24 24" className="btn-icon-svg"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
)

function Login({ onLogin, onCreateAccount, loginError, setLoginError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [messageType, setMessageType] = useState('error') // 'error' | 'success'
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState('officer') // 'officer' or 'admin'
  const [showPassword, setShowPassword] = useState(false)

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
        <div className="login-particles" />
        <CreateAccount onRegister={handleRegister} onCancel={() => setIsRegistering(false)} />
      </div>
    )
  }

  return (
    <div className="login-root">
      <div className="login-particles" />

      <div className="login-panel">
        {/* ── Header with badge ── */}
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

        {/* ── Segmented Account Type Toggle ── */}
        <div className="login-type-toggle">
          <button
            type="button"
            className={`type-toggle-btn${userType === 'officer' ? ' active' : ''}`}
            onClick={() => setUserType('officer')}
            disabled={isLoading}
          >
            <IconUser /> Officer
          </button>
          <button
            type="button"
            className={`type-toggle-btn${userType === 'admin' ? ' active' : ''}`}
            onClick={() => setUserType('admin')}
            disabled={isLoading}
          >
            <IconShield /> Admin
          </button>
          <div className={`type-toggle-slider ${userType === 'admin' ? 'right' : 'left'}`} />
        </div>

        {/* ── Login Form ── */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="email">Email Address</label>
            <div className="login-input-wrapper">
              <span className="input-icon"><IconMail /></span>
              <input
                id="email"
                type="email"
                className="login-input has-icon"
                placeholder="e.g. officer@pnp.gov.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrapper">
              <span className="input-icon"><IconLock /></span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="login-input has-icon has-action"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          {/* ── Sign In Button ── */}
          <button type="submit" className="login-btn-primary" disabled={isLoading}>
            {isLoading ? (
              <><IconLoader /> Signing in...</>
            ) : (
              <>Sign In <IconArrowRight /></>
            )}
          </button>
        </form>

        {/* ── Divider ── */}
        <div className="login-divider">
          <span>or</span>
        </div>

        {/* ── Create Account Button ── */}
        <button
          type="button"
          className="login-btn-secondary"
          onClick={() => setIsRegistering(true)}
          disabled={isLoading}
        >
          <IconUserPlus /> Create New Account
        </button>

        {/* ── Footer Note ── */}
        <div className="login-meta">
          <span>Authorized personnel only &bull; All access is audited</span>
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
