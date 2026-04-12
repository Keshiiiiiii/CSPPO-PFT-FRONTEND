import { getInitials, getUserDisplayName, formatBirthdayDisplay, formatSexDisplay } from './utils.js'

/**
 * Officer Profile page — shows profile fields for both officer and admin.
 */
function OfficerProfile({
  isAdmin,
  userName,
  accounts,
  officerInfo,
  officerProfileError,
  officerProfileLoading,
  adminProfileForPage,
}) {
  const src = isAdmin ? adminProfileForPage || {} : accounts?.[0] || {}
  const profileName =
    getUserDisplayName(src) ||
    userName ||
    `${src?.first_name || ''} ${src?.last_name || ''}`.trim() ||
    '—'
  const loginId =
    src?.badge_number || src?.badgeNumber || src?.username || src?.user_name || src?.email || src?.id || '—'
  const goNoGo =
    src?.policeGoNoGo || src?.police_go_no_go || src?.go_no_go || '—'

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar">{getInitials(userName || 'Officer')}</div>
        <div style={{ flex: 1 }}>
          <h2>{isAdmin ? 'Admin Account Profile' : 'Officer Account Profile'}</h2>
          <p>
            {isAdmin
              ? 'Administrator details from the server.'
              : 'View only — data from GET /auth/officer/profile and GET /auth/officer/info.'}
          </p>
        </div>
      </div>

      {officerProfileError && (
        <div className="profile-banner profile-banner--error" role="alert">
          {officerProfileError}
        </div>
      )}

      {!isAdmin && officerProfileLoading && !accounts?.[0] && (
        <p className="profile-loading">Loading profile…</p>
      )}

      <div className="profile-grid">
        {!isAdmin ? (
          <OfficerFields src={src} officerInfo={officerInfo} />
        ) : (
          <AdminFields src={src} profileName={profileName} loginId={loginId} goNoGo={goNoGo} />
        )}
      </div>
    </div>
  )
}

/* ── Sub-components for cleaner JSX ── */

function OfficerFields({ src, officerInfo }) {
  const accountEmail = officerInfo?.email ?? officerInfo?.user_email ?? src?.email ?? '—'

  return (
    <div className="profile-card profile-card--full">
      <h3>Officer profile</h3>
      <div className="profile-fields">
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

function AdminFields({ src, profileName, loginId, goNoGo }) {
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
