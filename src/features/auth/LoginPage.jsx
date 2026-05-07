import React, { useState } from 'react'
import clsx from 'clsx'
import CreateAccount from '@/features/auth/CreateAccountPage.jsx'
import Modal from '@/components/ui/Modal.jsx'
import { officerLogin, adminLogin } from '@/services/api'
import {
  IconArrowRight,
  IconEye,
  IconEyeOff,
  IconLoader,
  IconLock,
  IconMail,
  IconShield,
  IconUserPlus,
  IconProfile as IconUser,
} from '@/components/icons.jsx'

function Login({ onLogin, onCreateAccount, loginError, setLoginError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [messageType, setMessageType] = useState('error')
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState('officer')
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
      const result = userType === 'admin'
        ? await adminLogin({ email, password })
        : await officerLogin({ email, password })
      onLogin({ email, password, userType, user: result })
      setEmail('')
      setPassword('')
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please try again.')
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
      setLoginError('Account created successfully! Please sign in.')
      setMessageType('success')
      setShowErrorModal(true)
    } catch (error) {
      setLoginError(error.message || 'Failed to create account.')
      setMessageType('error')
      setShowErrorModal(true)
    }
  }

  React.useEffect(() => {
    if (loginError) setShowErrorModal(true)
  }, [loginError])

  return (
    <div className="min-h-screen bg-surface">
      <div className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f8faff_48%,#eef4ff_100%)]">
        {/* Ambient structure */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.45] [background-image:linear-gradient(rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.08)_1px,transparent_1px)] [background-size:48px_48px]"
        />

        {/* Sliding navy panel */}
        <div
          aria-hidden="true"
          className={clsx(
            'pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-1/2 overflow-hidden bg-gradient-to-br from-navy via-navy-mid to-navy-light shadow-deep lg:block',
            'transition-[transform,border-radius] duration-700 ease-spring will-change-transform',
            isRegistering ? '-translate-x-full rounded-r-[96px]' : 'translate-x-0 rounded-l-[96px]'
          )}
        >
          <div className="absolute inset-x-12 top-12 h-px bg-white/15" />
          <div className="absolute bottom-16 left-12 h-24 w-24 rounded-[28px] border border-white/10" />
          <div className="absolute right-14 top-24 h-16 w-16 rotate-12 rounded-[22px] border border-blue-bright/20" />
          <div className="absolute bottom-0 right-0 h-1/3 w-28 bg-white/[0.04]" />
          <div className="absolute left-0 top-0 h-full w-16 bg-white/[0.03]" />
        </div>

        {/* Navy panel content */}
        <div
          className={clsx(
            'absolute inset-y-0 left-1/2 z-20 hidden w-1/2 items-center p-10 lg:flex',
            'transition-transform duration-700 ease-spring will-change-transform',
            isRegistering ? '-translate-x-full' : 'translate-x-0'
          )}
        >
          <div className="mx-auto w-full max-w-md text-white">
            <div className="mb-12 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-glow-blue backdrop-blur-sm">
                <div className="h-6 w-6 rounded-full border border-white/30 bg-blue-bright/30" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-bright/80">HRDD Portal</div>
                <div className="font-display text-xl font-bold tracking-tight">PNP Fitness System</div>
              </div>
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-2xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {isRegistering ? 'Account Setup' : 'Secure Access'}
            </div>

            <div className="max-w-sm font-display text-4xl font-extrabold leading-tight tracking-tight">
              {isRegistering ? 'Welcome Back' : 'Ready for duty'}
            </div>
            <div className="mt-3 text-sm text-white/70 leading-relaxed">
              {isRegistering
                ? 'Return to your secured dashboard and continue managing your fitness records.'
                : 'Sign in to continue. Authorized personnel only, with activity logged and audited.'}
            </div>

            <button
              type="button"
              className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-normal hover:-translate-y-0.5 hover:bg-white/15 active:translate-y-0 cursor-pointer"
              onClick={() => setIsRegistering((v) => !v)}
              disabled={isLoading}
            >
              {isRegistering ? (<><IconArrowRight /> Sign in</>) : (<><IconUserPlus /> Create account</>)}
            </button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="relative grid min-h-screen lg:grid-cols-2">
          {/* Right column: Create Account (white) */}
          <div className={clsx('relative min-h-screen items-center p-6 sm:p-10 lg:order-2 lg:flex lg:p-12', isRegistering ? 'flex' : 'hidden')}>
            <div
              className={clsx(
                'mx-auto w-full max-w-lg transition-all duration-500 ease-smooth lg:duration-700',
                isRegistering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
              )}
            >
              <CreateAccount
                variant="light"
                className="max-w-none max-h-none overflow-visible !rounded-none !border-0 !bg-transparent !p-0 !shadow-none"
                onRegister={handleRegister}
                onCancel={() => setIsRegistering(false)}
              />
            </div>
          </div>

          {/* Left column: Login (white) */}
          <div className={clsx('relative min-h-screen items-center p-6 sm:p-10 lg:order-1 lg:flex lg:p-12', isRegistering ? 'hidden' : 'flex')}>
            <div
              className={clsx(
                'mx-auto w-full max-w-md rounded-[28px] bg-white/[0.82] p-6 shadow-xl shadow-blue/10 ring-1 ring-blue/5 backdrop-blur-md transition-all duration-500 ease-smooth sm:p-8 lg:duration-700',
                isRegistering ? 'opacity-0 -translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'
              )}
            >
              {/* Header */}
              <div className="mb-8 animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue/10 text-blue shadow-sm ring-1 ring-blue/15">
                    <IconShield />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate/70 uppercase tracking-[0.22em]">
                      Philippine National Police
                    </div>
                    <div className="font-display text-3xl font-bold tracking-tight text-navy">
                      Sign in to HRDD
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Type Toggle */}
              <div className="relative mb-6 flex rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-blue/10 animate-slide-up stagger-1">
                <button
                  type="button"
                  className={clsx(
                    'z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors cursor-pointer',
                    '[&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none',
                    userType === 'officer' ? 'text-navy' : 'text-slate hover:text-navy/80'
                  )}
                  onClick={() => setUserType('officer')}
                  disabled={isLoading}
                >
                  <IconUser /> Officer
                </button>
                <button
                  type="button"
                  className={clsx(
                    'z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors cursor-pointer',
                    '[&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none',
                    userType === 'admin' ? 'text-navy' : 'text-slate hover:text-navy/80'
                  )}
                  onClick={() => setUserType('admin')}
                  disabled={isLoading}
                >
                  <IconShield /> Admin
                </button>
                <div
                  className={clsx(
                    'absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-xl bg-blue/15 shadow-sm transition-transform duration-300 ease-spring',
                    userType === 'admin' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                  )}
                />
              </div>

              {/* Form */}
              <form className="space-y-5 animate-slide-up stagger-2" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate/70 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/60 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none">
                      <IconMail />
                    </span>
                    <input
                      id="email"
                      type="email"
                      className="w-full rounded-2xl bg-white py-3.5 pl-11 pr-4 text-sm text-navy shadow-sm ring-1 ring-blue/10 placeholder-slate/45 transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-blue/25"
                      placeholder="e.g. officer@pnp.gov.ph"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-slate/70 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/60 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none">
                      <IconLock />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl bg-white py-3.5 pl-11 pr-12 text-sm text-navy shadow-sm ring-1 ring-blue/10 placeholder-slate/45 transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-blue/25"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/40 hover:text-navy/80 transition-colors cursor-pointer [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none"
                      onClick={() => setShowPassword(v => !v)}
                      tabIndex={-1}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue/20 transition-all duration-normal hover:-translate-y-0.5 hover:bg-blue-light disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-0 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><IconLoader /> Signing in...</>
                  ) : (
                    <>Sign In <IconArrowRight /></>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3 animate-slide-up stagger-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-2xs text-slate/60 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-navy shadow-sm ring-1 ring-blue/10 transition-all duration-fast hover:-translate-y-0.5 hover:bg-gray-50 cursor-pointer"
                onClick={() => setIsRegistering(true)}
                disabled={isLoading}
              >
                <IconUserPlus /> Create New Account
              </button>

              <div className="mt-6 text-center text-2xs text-slate/60">
                Authorized personnel only &bull; All access is audited
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={messageType === 'success' ? 'Success' : 'Login Failed'}
      >
        <p>{loginError || 'Please enter both name and password.'}</p>
      </Modal>
    </div>
  )
}

export default Login
