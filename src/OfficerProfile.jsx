import { useState } from 'react'
import { createPortal } from 'react-dom'
import { getInitials, getUserDisplayName, formatBirthdayDisplay, formatSexDisplay } from './utils.js'
import './css/ExerciseModal.css'

/* ── Inline SVG Icons ── */
const UserIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
)
const PlusIcon = () => (
  <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)

/* ── Profile Field Definitions ── */
const PROFILE_FIELDS = [
  { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'e.g. Juan', required: true },
  { name: 'middle_name', label: 'Middle Name', type: 'text', placeholder: 'e.g. Dela Cruz' },
  { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'e.g. Santos', required: true },
  { name: 'age', label: 'Age', type: 'number', min: 18, placeholder: 'e.g. 25', required: true },
  { name: 'sex', label: 'Sex', type: 'select', options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }], required: true },
  { name: 'birthday', label: 'Birthday', type: 'date', full: true, required: true },
  { name: 'office_unit', label: 'Office Unit', type: 'text', placeholder: 'e.g. IT Department', full: true, required: true },
]

/**
 * Officer Profile page — shows profile fields for both officer and admin.
 * New officers without a profile see a premium modal to create one.
 */
function OfficerProfile({
  isAdmin,
  userName,
  accounts,
  officerInfo,
  officerProfileError,
  officerProfileLoading,
  adminProfileForPage,
  onCreateProfile,
}) {
  const src = isAdmin ? adminProfileForPage || {} : accounts?.[0] || {}
  const profileName =
    getUserDisplayName(src) ||
    userName ||
    `${src?.first_name || ''} ${src?.last_name || ''}`.trim() ||
    '—'
  const loginId =
    src?.badge_number || src?.badgeNumber || src?.username || src?.user_name || src?.email || src?.id || '—'

  const hasProfile = Boolean(src?.first_name || src?.last_name)
  const isNewOfficer = !isAdmin && !hasProfile && !officerProfileLoading

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    first_name: '', middle_name: '', last_name: '',
    age: '', sex: 'male', birthday: '', office_unit: '',
  })

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.age || !form.birthday || !form.office_unit) {
      window.alert('Please fill in all required fields.')
      return
    }
    if (onCreateProfile) {
      await onCreateProfile({ ...form, age: parseInt(form.age, 10) })
      setIsModalOpen(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar">{getInitials(userName || 'Officer')}</div>
        <div style={{ flex: 1 }}>
          <h2>{isAdmin ? 'Admin Account Profile' : 'Officer Account Profile'}</h2>
          <p>{isAdmin ? 'Administrator details from the server.' : 'View your profile details and personal information.'}</p>
        </div>
      </div>

      {officerProfileError && !isNewOfficer && (
        <div className="profile-banner profile-banner--error" role="alert">{officerProfileError}</div>
      )}

      {/* ── Empty State: No profile yet ── */}
      {isNewOfficer && !isModalOpen && (
        <div className="profile-card profile-card--full" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Profile Not Found</h3>
          <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 360, marginInline: 'auto', lineHeight: 1.6 }}>
            You haven't set up your physical fitness profile yet. Create your profile to start recording exercise data.
          </p>
          <button
            className="exercise-modal__btn-save"
            style={{ display: 'inline-flex', padding: '12px 32px', fontSize: 14 }}
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon /> Create Profile
          </button>
        </div>
      )}

      {/* ── Create Profile Modal (Portal) ── */}
      {isModalOpen && createPortal(
        <div className="exercise-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="exercise-modal">
            <div className="exercise-modal__header">
              <div className="exercise-modal__header-left">
                <div className="exercise-modal__icon-ring"><UserIcon /></div>
                <div>
                  <div className="exercise-modal__title">Create Officer Profile</div>
                  <div className="exercise-modal__subtitle">Set up your personal information</div>
                </div>
              </div>
              <button className="exercise-modal__close" type="button" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="exercise-modal__body">
              <div className="exercise-modal__grid">
                {PROFILE_FIELDS.map((f) => (
                  <div key={f.name} className={`exercise-modal__field${f.full ? ' full' : ''}`}>
                    <label className="exercise-modal__label">{f.label}</label>
                    {f.type === 'select' ? (
                      <select
                        className="exercise-modal__select"
                        value={form[f.name]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                      >
                        {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type || 'text'}
                        min={f.min}
                        placeholder={f.placeholder || ''}
                        className="exercise-modal__input"
                        value={form[f.name]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="exercise-modal__footer">
              <button className="exercise-modal__btn-cancel" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="exercise-modal__btn-save" type="button" onClick={handleSave}><CheckIcon /> Save Profile</button>
            </div>
          </div>
        </div>
      , document.body)}

      {!isAdmin && officerProfileLoading && !accounts?.[0] && (
        <p className="profile-loading">Loading profile…</p>
      )}

      <div className="profile-grid">
        {!isAdmin && hasProfile && <OfficerFields src={src} officerInfo={officerInfo} />}
        {isAdmin && <AdminFields src={src} profileName={profileName} loginId={loginId} />}
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function OfficerFields({ src, officerInfo }) {
  const accountEmail = officerInfo?.email ?? officerInfo?.user_email ?? src?.email ?? '—'
  const fullName = [src?.first_name, src?.middle_name, src?.last_name].filter(Boolean).join(' ') || '—'

  return (
    <div className="profile-card profile-card--full">
      <h3>Officer profile</h3>
      <div className="profile-fields">
        <ProfileField label="Full name" value={fullName} />
        <ProfileField label="First name" value={src?.first_name} />
        <ProfileField label="Last name" value={src?.last_name} />
        <ProfileField label="Middle name" value={src?.middle_name} />
        <ProfileField label="Email" value={accountEmail} />
        <ProfileField label="Sex" value={formatSexDisplay(src?.sex ?? src?.gender)} />
        <ProfileField label="Birthday" value={formatBirthdayDisplay(src?.birthday)} />
        <ProfileField label="Office unit" value={src?.office_unit} />
      </div>
    </div>
  )
}

function AdminFields({ src, profileName, loginId }) {
  return (
    <div className="profile-card profile-card--full">
      <h3>Identity</h3>
      <div className="profile-fields">
        <ProfileField label="Full Name" value={profileName} />
        <ProfileField label="Role" value="Administrator" />
        <ProfileField label="Login / Badge" value={loginId} />
        <ProfileField label="Email" value={src?.email} />
      </div>
    </div>
  )
}

function ProfileField({ label, value }) {
  return (
    <div className="profile-field">
      <label>{label}</label>
      <span>{value || '—'}</span>
    </div>
  )
}

export default OfficerProfile
