import { useState } from 'react'
import clsx from 'clsx'
import { officerSignup, adminSignup } from '@/services/api'
import {
  IconArrowLeft,
  IconAtSign,
  IconBriefcase,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconKey,
  IconLoader,
  IconLock,
  IconMail,
  IconProfile as IconUser,
  IconShield,
  IconUserPlus,
  IconX,
} from '@/components/icons.jsx'

const inputClassDark = 'w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-muted/40 focus:outline-none focus:ring-2 focus:ring-royal/50 focus:border-royal/50 transition-all duration-fast'
const inputClassLight = 'w-full rounded-2xl bg-white py-3.5 pl-11 pr-4 text-sm text-navy shadow-sm ring-1 ring-blue/10 placeholder-slate/45 transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-blue/25'

const iconWrapDark = 'absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/60 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none'
const iconWrapLight = 'absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/60 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none'

const actionBtnDark = 'absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 hover:text-white/70 transition-colors cursor-pointer [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none'
const actionBtnLight = 'absolute right-3 top-1/2 -translate-y-1/2 text-slate/40 hover:text-navy/80 transition-colors cursor-pointer [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none'

const sectionLabelDark = 'text-2xs font-semibold text-blue-bright/50 uppercase tracking-[0.15em] mb-3 mt-5 first:mt-0'
const sectionLabelLight = 'text-2xs font-semibold text-slate/70 uppercase tracking-[0.18em] mb-3 mt-5 first:mt-0'

function CreateAccount({ onRegister, onCancel, variant = 'dark', className }) {
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
    if (score <= 1) return { level: 1, text: 'Weak', color: '#ef4444' }
    if (score <= 3) return { level: 2, text: 'Fair', color: '#f59e0b' }
    return { level: 3, text: 'Strong', color: '#10b981' }
  })()

  const passwordsMatch = confirmPassword && password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !fullName || !userName || !password || !confirmPassword || !role) { setError('Please fill all fields to create account.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters long.'); return }
    if (role === 'admin' && !authKey) { setError('Authorization key is required for admin accounts.'); return }
    setIsLoading(true)
    try {
      const signupData = { email, full_name: fullName, user_name: userName, password, status }
      if (role === 'admin') { signupData.role = 'admin'; signupData.department = department }
      const result = role === 'admin' ? await adminSignup(signupData, authKey) : await officerSignup(signupData)
      onRegister({ email, fullName, userName, role, ...result })
      setEmail(''); setFullName(''); setUserName(''); setPassword(''); setConfirmPassword(''); setRole('officer'); setDepartment('IT'); setStatus('active'); setAuthKey('')
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={clsx(
        'relative w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto',
        variant === 'light'
          ? 'bg-white rounded-[28px] shadow-xl shadow-blue/10 ring-1 ring-blue/5'
          : 'bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/10 shadow-deep animate-scale-in',
        className
      )}
    >
      {/* Back Button */}
      <button
        type="button"
        className={clsx(
          'flex items-center gap-2 text-sm transition-colors mb-6 cursor-pointer hover:-translate-x-0.5 duration-fast',
          variant === 'light' ? 'text-slate hover:text-navy' : 'text-muted hover:text-white'
        )}
        onClick={onCancel}
        disabled={isLoading}
      >
        <IconArrowLeft /> Back to Sign In
      </button>

      {/* Header */}
      <div className="text-center mb-6 animate-slide-up">
        <div
          className={clsx(
            'w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center',
            variant === 'light'
              ? 'bg-blue/10 border border-blue/15 text-blue'
              : 'bg-royal/20 border border-royal/30 text-blue-bright'
          )}
        >
          <IconUserPlus />
        </div>
        <h2 className={clsx('text-xl font-bold font-display', variant === 'light' ? 'text-navy' : 'text-white')}>
          Create Account
        </h2>
        <p className={clsx('text-xs mt-1', variant === 'light' ? 'text-slate' : 'text-muted')}>
          Join the PNP HRDD Portal
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={clsx(
          'flex items-center gap-2 px-4 py-3 mb-5 rounded-2xl text-xs animate-slide-up',
          variant === 'light'
            ? 'bg-coral/10 border border-coral/20 text-coral'
            : 'bg-coral/10 border border-coral/20 text-coral-light'
        )}>
          <IconX /> {error}
        </div>
      )}

      {/* Form */}
      <form className="space-y-4 animate-slide-up stagger-1" onSubmit={handleSubmit}>
        {/* Account Type */}
        <div className={variant === 'light' ? sectionLabelLight : sectionLabelDark}>Account Type</div>
        <div className={clsx(
          'relative flex rounded-2xl p-1.5',
          variant === 'light' ? 'bg-white shadow-sm ring-1 ring-blue/10' : 'bg-white/5 border border-white/10'
        )}>
          <button type="button" className={clsx('z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none', role === 'officer' ? (variant === 'light' ? 'text-white' : 'text-white') : (variant === 'light' ? 'text-slate hover:text-navy' : 'text-muted'))} onClick={() => setRole('officer')} disabled={isLoading}>
            <IconUser /> Officer
          </button>
          <button type="button" className={clsx('z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none', role === 'admin' ? (variant === 'light' ? 'text-white' : 'text-white') : (variant === 'light' ? 'text-slate hover:text-navy' : 'text-muted'))} onClick={() => setRole('admin')} disabled={isLoading}>
            <IconShield /> Admin
          </button>
          <div className={clsx(
            'absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-xl transition-transform duration-300 ease-spring',
            variant === 'light' ? 'bg-blue shadow-sm' : 'bg-royal/60',
            role === 'admin' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'
          )} />
        </div>

        {/* Personal Info */}
        <div className={variant === 'light' ? sectionLabelLight : sectionLabelDark}>Personal Information</div>
        <div className="relative">
          <span className={variant === 'light' ? iconWrapLight : iconWrapDark}><IconUser /></span>
          <input type="text" className={variant === 'light' ? inputClassLight : inputClassDark} placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <span className={variant === 'light' ? iconWrapLight : iconWrapDark}><IconMail /></span>
            <input type="email" className={variant === 'light' ? inputClassLight : inputClassDark} placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
          </div>
          <div className="relative">
            <span className={variant === 'light' ? iconWrapLight : iconWrapDark}><IconAtSign /></span>
            <input type="text" className={variant === 'light' ? inputClassLight : inputClassDark} placeholder="Username" value={userName} onChange={(e) => setUserName(e.target.value)} disabled={isLoading} />
          </div>
        </div>

        {/* Security */}
        <div className={variant === 'light' ? sectionLabelLight : sectionLabelDark}>Security</div>
        <div>
          <div className="relative">
            <span className={variant === 'light' ? iconWrapLight : iconWrapDark}><IconLock /></span>
            <input type={showPassword ? 'text' : 'password'} className={clsx(variant === 'light' ? inputClassLight : inputClassDark, '!pr-12')} placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
            <button type="button" className={variant === 'light' ? actionBtnLight : actionBtnDark} onClick={() => setShowPassword(v => !v)} tabIndex={-1}>{showPassword ? <IconEyeOff /> : <IconEye />}</button>
          </div>
          {password && (
            <div className="flex items-center gap-3 mt-2">
              <div className={clsx('flex-1 h-1 rounded-full overflow-hidden', variant === 'light' ? 'bg-gray-100' : 'bg-white/10')}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(passwordStrength.level / 3) * 100}%`, background: passwordStrength.color }} />
              </div>
              <span className="text-2xs font-medium" style={{ color: passwordStrength.color }}>{passwordStrength.text}</span>
            </div>
          )}
        </div>

        <div className="relative">
          <span className={variant === 'light' ? iconWrapLight : iconWrapDark}><IconLock /></span>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className={clsx(variant === 'light' ? inputClassLight : inputClassDark, '!pr-16', confirmPassword && (passwordsMatch ? 'border-emerald/40 ring-1 ring-emerald/20' : 'border-coral/40 ring-1 ring-coral/20'))}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
          <button type="button" className={variant === 'light' ? actionBtnLight : actionBtnDark} onClick={() => setShowConfirmPassword(v => !v)} tabIndex={-1}>{showConfirmPassword ? <IconEyeOff /> : <IconEye />}</button>
          {confirmPassword && (
            <span className={clsx('absolute right-10 top-1/2 -translate-y-1/2', passwordsMatch ? 'text-emerald' : 'text-coral')}>
              {passwordsMatch ? <IconCheck /> : <IconX />}
            </span>
          )}
        </div>

        {/* Admin-only fields */}
        {role === 'admin' && (
          <>
            <div className={variant === 'light' ? sectionLabelLight : sectionLabelDark}>Admin Authorization</div>
            <div className="relative">
              <span className={variant === 'light' ? iconWrapLight : iconWrapDark}><IconKey /></span>
              <input type={showAuthKey ? 'text' : 'password'} className={clsx(variant === 'light' ? inputClassLight : inputClassDark, '!pr-12')} placeholder="Authorization Key" value={authKey} onChange={(e) => setAuthKey(e.target.value)} disabled={isLoading} />
              <button type="button" className={variant === 'light' ? actionBtnLight : actionBtnDark} onClick={() => setShowAuthKey(v => !v)} tabIndex={-1}>{showAuthKey ? <IconEyeOff /> : <IconEye />}</button>
            </div>
            <div className="relative">
              <span className={variant === 'light' ? iconWrapLight : iconWrapDark}><IconBriefcase /></span>
              <input type="text" className={variant === 'light' ? inputClassLight : inputClassDark} placeholder="Department (e.g. IT)" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={isLoading} />
            </div>
          </>
        )}

        {/* Submit */}
        <button
          type="submit"
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-3.5 mt-6 text-sm font-semibold rounded-2xl transition-all duration-normal disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5 active:translate-y-0',
            variant === 'light'
              ? 'bg-blue text-white shadow-lg shadow-blue/20 hover:bg-blue-light'
              : 'bg-royal text-white shadow-glow hover:bg-blue-light'
          )}
          disabled={isLoading}
        >
          {isLoading ? <><IconLoader /> Creating Account...</> : <><IconUserPlus /> Create Account</>}
        </button>
      </form>

      {/* Footer */}
      <div className={clsx('text-center mt-5 text-xs', variant === 'light' ? 'text-slate/70' : 'text-muted/50')}>
        Already have an account?{' '}
        <button
          type="button"
          className={clsx('hover:underline cursor-pointer', variant === 'light' ? 'text-blue' : 'text-blue-bright')}
          onClick={onCancel}
          disabled={isLoading}
        >
          Sign In
        </button>
      </div>
    </div>
  )
}

export default CreateAccount
