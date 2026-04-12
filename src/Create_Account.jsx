import { useState } from 'react'
import './css/Create_Account.css'
import { officerSignup, adminSignup } from './api'

/* ── Inline SVG Icons ── */
const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" className="back-icon-svg"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
)
const IconMail = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
)
const IconLock = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
)
const IconUser = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
const IconAtSign = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>
)
const IconShield = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
)
const IconKey = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
)
const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
)
const IconEye = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
)
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><polyline points="20 6 9 17 4 12"/></svg>
)
const IconX = () => (
  <svg viewBox="0 0 24 24" className="input-icon-svg"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)
const IconLoader = () => (
  <svg viewBox="0 0 24 24" className="btn-icon-svg spin-icon"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"/></svg>
)
const IconUserPlus = () => (
  <svg viewBox="0 0 24 24" className="btn-icon-svg"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
)

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showAuthKey, setShowAuthKey] = useState(false)

  const passwordStrength = (() => {
    if (!password) return { level: 0, text: '', color: '' }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 1) return { level: 1, text: 'Weak', color: 'var(--coral, #ef4444)' }
    if (score <= 3) return { level: 2, text: 'Fair', color: 'var(--amber, #f59e0b)' }
    return { level: 3, text: 'Strong', color: 'var(--emerald, #10b981)' }
  })()

  const passwordsMatch = confirmPassword && password === confirmPassword

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
      {/* ── Back Button ── */}
      <button type="button" className="ca-back-btn" onClick={onCancel} disabled={isLoading}>
        <IconArrowLeft /> Back to Sign In
      </button>

      {/* ── Header ── */}
      <div className="ca-header">
        <div className="ca-header-icon">
          <IconUserPlus />
        </div>
        <h2 className="ca-title">Create Account</h2>
        <p className="ca-subtitle">Join the PNP HRDD Portal</p>
      </div>

      {/* ── Error Alert ── */}
      {error && (
        <div className="ca-error">
          <IconX /> {error}
        </div>
      )}

      {/* ── Form ── */}
      <form className="ca-form" onSubmit={handleSubmit}>
        {/* Section: Account Type */}
        <div className="ca-section-label">Account Type</div>
        <div className="ca-role-toggle">
          <button
            type="button"
            className={`ca-role-btn${role === 'officer' ? ' active' : ''}`}
            onClick={() => setRole('officer')}
            disabled={isLoading}
          >
            <IconUser /> Officer
          </button>
          <button
            type="button"
            className={`ca-role-btn${role === 'admin' ? ' active' : ''}`}
            onClick={() => setRole('admin')}
            disabled={isLoading}
          >
            <IconShield /> Admin
          </button>
          <div className={`ca-role-slider ${role === 'admin' ? 'right' : 'left'}`} />
        </div>

        {/* Section: Personal Info */}
        <div className="ca-section-label">Personal Information</div>

        <div className="ca-form-group">
          <div className="ca-input-wrapper">
            <span className="input-icon"><IconUser /></span>
            <input
              id="create-fullname"
              type="text"
              className="ca-input has-icon"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="ca-form-row">
          <div className="ca-form-group">
            <div className="ca-input-wrapper">
              <span className="input-icon"><IconMail /></span>
              <input
                id="create-email"
                type="email"
                className="ca-input has-icon"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="ca-form-group">
            <div className="ca-input-wrapper">
              <span className="input-icon"><IconAtSign /></span>
              <input
                id="create-username"
                type="text"
                className="ca-input has-icon"
                placeholder="Username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Section: Security */}
        <div className="ca-section-label">Security</div>

        <div className="ca-form-group">
          <div className="ca-input-wrapper">
            <span className="input-icon"><IconLock /></span>
            <input
              id="create-password"
              type={showPassword ? 'text' : 'password'}
              className="ca-input has-icon has-action"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button type="button" className="input-action-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
          {/* Password strength bar */}
          {password && (
            <div className="ca-password-strength">
              <div className="ca-strength-bar">
                <div
                  className="ca-strength-fill"
                  style={{
                    width: `${(passwordStrength.level / 3) * 100}%`,
                    background: passwordStrength.color
                  }}
                />
              </div>
              <span className="ca-strength-text" style={{ color: passwordStrength.color }}>
                {passwordStrength.text}
              </span>
            </div>
          )}
        </div>

        <div className="ca-form-group">
          <div className="ca-input-wrapper">
            <span className="input-icon"><IconLock /></span>
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`ca-input has-icon has-action${confirmPassword ? (passwordsMatch ? ' is-success' : ' is-error') : ''}`}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            <button type="button" className="input-action-btn" onClick={() => setShowConfirmPassword(v => !v)} tabIndex={-1}>
              {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
            </button>
            {confirmPassword && (
              <span className={`input-status-icon ${passwordsMatch ? 'success' : 'error'}`}>
                {passwordsMatch ? <IconCheck /> : <IconX />}
              </span>
            )}
          </div>
        </div>

        {/* Admin-only fields */}
        {role === 'admin' && (
          <>
            <div className="ca-section-label">Admin Authorization</div>
            <div className="ca-form-group">
              <div className="ca-input-wrapper">
                <span className="input-icon"><IconKey /></span>
                <input
                  id="create-auth-key"
                  type={showAuthKey ? 'text' : 'password'}
                  className="ca-input has-icon has-action"
                  placeholder="Authorization Key"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  disabled={isLoading}
                />
                <button type="button" className="input-action-btn" onClick={() => setShowAuthKey(v => !v)} tabIndex={-1}>
                  {showAuthKey ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>
            <div className="ca-form-group">
              <div className="ca-input-wrapper">
                <span className="input-icon"><IconBriefcase /></span>
                <input
                  id="create-department"
                  type="text"
                  className="ca-input has-icon"
                  placeholder="Department (e.g. IT)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Submit ── */}
        <button type="submit" className="ca-btn-primary" disabled={isLoading}>
          {isLoading ? (
            <><IconLoader /> Creating Account...</>
          ) : (
            <><IconUserPlus /> Create Account</>
          )}
        </button>
      </form>

      {/* ── Footer ── */}
      <div className="ca-footer">
        Already have an account?{' '}
        <button type="button" onClick={onCancel} disabled={isLoading}>Sign In</button>
      </div>
    </div>
  )
}

export default CreateAccount
