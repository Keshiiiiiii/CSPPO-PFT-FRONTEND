import { useState } from 'react'
import { createPortal } from 'react-dom'
import { getInitials, getUserDisplayName, formatBirthdayDisplay, formatSexDisplay } from '@/lib/utils.js'
import { IconCheck as CheckIcon, IconPlus as PlusIcon, IconProfile as UserIcon } from '@/components/icons.jsx'

const inputClass = 'w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-navy placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors duration-fast'
const selectClass = 'w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors duration-fast cursor-pointer appearance-none'
const labelClass = 'block text-xs font-semibold text-navy/70 uppercase tracking-wider mb-1.5'

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
 * Officer Profile page — fully migrated to Tailwind CSS.
 */
function OfficerProfile({ isAdmin, userName, accounts, officerInfo, officerProfileError, officerProfileLoading, adminProfileForPage, onCreateProfile }) {
  const src = isAdmin ? adminProfileForPage || {} : accounts?.[0] || {}
  const profileName = getUserDisplayName(src) || userName || `${src?.first_name || ''} ${src?.last_name || ''}`.trim() || '—'
  const loginId = src?.badge_number || src?.badgeNumber || src?.username || src?.user_name || src?.email || src?.id || '—'
  const hasProfile = Boolean(src?.first_name || src?.last_name)
  const isNewOfficer = !isAdmin && !hasProfile && !officerProfileLoading

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({ first_name: '', middle_name: '', last_name: '', age: '', sex: 'male', birthday: '', office_unit: '' })

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.age || !form.birthday || !form.office_unit) return
    if (onCreateProfile) {
      await onCreateProfile({ ...form, age: parseInt(form.age, 10) })
      setIsModalOpen(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      {/* Hero */}
      <div className="flex items-center gap-5 mb-8">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue to-violet flex items-center justify-center text-xl font-bold text-white shadow-lg">
          {getInitials(userName || 'Officer')}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-navy">
            {isAdmin ? 'Admin Account Profile' : 'Officer Account Profile'}
          </h2>
          <p className="text-sm text-muted mt-0.5">
            {isAdmin ? 'Administrator details from the server.' : 'View your profile details and personal information.'}
          </p>
        </div>
      </div>

      {officerProfileError && !isNewOfficer && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 bg-coral-pale border border-coral/20 rounded-lg text-sm text-coral" role="alert">
          {officerProfileError}
        </div>
      )}

      {/* Empty State */}
      {isNewOfficer && !isModalOpen && (
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-blue to-violet flex items-center justify-center">
            <span className="text-3xl text-white"><UserIcon /></span>
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">Profile Not Found</h3>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed mb-6">
            You haven't set up your physical fitness profile yet. Create your profile to start recording exercise data.
          </p>
          <button
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-light transition-colors duration-fast cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon /> Create Profile
          </button>
        </div>
      )}

      {/* Create Profile Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl animate-scale-in max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue/10 text-blue flex items-center justify-center"><UserIcon /></div>
                <div>
                  <div className="text-base font-semibold text-navy">Create Officer Profile</div>
                  <div className="text-2xs text-muted">Set up your personal information</div>
                </div>
              </div>
              <button className="flex items-center justify-center w-8 h-8 rounded-full text-slate hover:text-coral hover:bg-coral-pale/50 transition-colors duration-fast cursor-pointer text-lg" type="button" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROFILE_FIELDS.map((f) => (
                  <div key={f.name} className={f.full ? 'col-span-full' : ''}>
                    <label className={labelClass}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select className={selectClass} value={form[f.name]} onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}>
                        {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input type={f.type || 'text'} min={f.min} placeholder={f.placeholder || ''} className={inputClass} value={form[f.name]} onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button className="px-5 py-2.5 text-sm font-medium text-slate bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-fast cursor-pointer" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue rounded-lg shadow-sm hover:bg-blue-light transition-colors duration-fast cursor-pointer" type="button" onClick={handleSave}>
                <CheckIcon /> Save Profile
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {!isAdmin && officerProfileLoading && !accounts?.[0] && (
        <p className="text-center text-muted py-12 animate-pulse">Loading profile…</p>
      )}

      {/* Profile Fields Grid */}
      <div className="space-y-6 mt-6">
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
    <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-navy">Officer Profile</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-gray-50">
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
    <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-navy">Identity</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-gray-50">
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
    <div className="px-6 py-3.5">
      <label className="block text-2xs font-semibold text-muted uppercase tracking-wider mb-1">{label}</label>
      <span className="text-sm font-medium text-navy">{value || '—'}</span>
    </div>
  )
}

export default OfficerProfile
