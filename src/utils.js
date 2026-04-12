/* ============================================================
   Shared Utility Functions
   Used by App.jsx, user.jsx, and other components.
   Eliminates code duplication across the codebase.
   ============================================================ */

/* ── Display Helpers ── */

export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function getUserDisplayName(u) {
  if (!u) return ''
  const full = [u.first_name ?? u.firstName, u.last_name ?? u.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  return String(
    u.full_name ??
      u.name ??
      u.officer_name ??
      u.username ??
      u.user_name ??
      full ??
      ''
  ).trim()
}

export const formatBirthdayDisplay = (v) => {
  if (v == null || v === '') return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export const formatSexDisplay = (v) => {
  if (v == null || v === '') return '—'
  const s = String(v).toLowerCase()
  if (s === 'male' || s === 'female') return s.charAt(0).toUpperCase() + s.slice(1)
  return String(v)
}

export const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/* ── ID Matching ── */

export const normalizeId = (v) =>
  String(v ?? '').trim().replace(/^USR-/i, '').replace(/^0+/, '')

export const idsMatch = (a, b) => {
  const sa = String(a ?? '').trim()
  const sb = String(b ?? '').trim()
  if (!sa || !sb) return false
  if (sa === sb) return true
  return normalizeId(sa) === normalizeId(sb)
}

/* ── Record Normalization ── */

export const normalizeUserRecord = (u) => {
  const idRaw = u?.id ?? u?.officer_id ?? u?.officer_profile_id ?? u?.account_id ?? u?.user_id ?? ''
  return {
    ...u,
    id: String(idRaw),
    name: getUserDisplayName(u),
  }
}

export const toArray = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.items)) return data.data.items
  if (Array.isArray(data?.data?.records)) return data.data.records
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.records)) return data.records
  if (Array.isArray(data?.pushup_records)) return data.pushup_records
  if (Array.isArray(data?.situp_records)) return data.situp_records
  if (Array.isArray(data?.bmi_records)) return data.bmi_records
  if (Array.isArray(data?.sprint_records)) return data.sprint_records
  // Some endpoints return a single record object
  if (data && typeof data === 'object') {
    const looksLikeRecord =
      data.id != null ||
      data.bmi != null ||
      data.height_meter != null ||
      data.weight_kg != null ||
      data.reps != null ||
      data.count != null ||
      data.pushup_count != null ||
      data.situp_count != null ||
      data.minutes != null ||
      data.seconds != null
    if (looksLikeRecord) return [data]
  }
  return []
}

/* ── Pushup Record Normalization ── */

export const isPushupLikeRecord = (r) => {
  if (!r || typeof r !== 'object') return false
  return (
    r.id != null ||
    r.reps != null ||
    r.count != null ||
    r.pushup_count != null ||
    r.push_up_count != null ||
    r.total_reps != null ||
    r.grade != null ||
    r.test_date != null
  )
}

export const normalizePushupRecords = (data) => {
  const candidates = [
    data,
    data?.data,
    data?.data?.data,
    data?.results,
    data?.items,
    data?.records,
    data?.pushup_records,
    data?.push_up_records,
    data?.officer_pushup_records,
    data?.officer_pushup_record,
    data?.pushup_record,
    data?.push_up_record,
  ]

  for (const c of candidates) {
    if (Array.isArray(c)) return c.filter((x) => x && typeof x === 'object')
  }
  for (const c of candidates) {
    if (isPushupLikeRecord(c)) return [c]
    if (c && typeof c === 'object' && isPushupLikeRecord(c.data)) return [c.data]
  }
  return []
}

/* ── Sprint Record Normalization ── */

export const isSprintLikeRecord = (r) => {
  if (!r || typeof r !== 'object') return false
  return (
    r.id != null ||
    r.minutes != null ||
    r.seconds != null ||
    r.time_formatted != null ||
    r.grade != null ||
    r.test_date != null
  )
}

export const normalizeSprintRecords = (data) => {
  const candidates = [
    data,
    data?.data,
    data?.data?.data,
    data?.results,
    data?.items,
    data?.records,
    data?.sprint_records,
    data?.sprint_record,
    data?.officer_sprint_records,
    data?.officer_sprint_record,
  ]

  for (const c of candidates) {
    if (Array.isArray(c)) return c.filter((x) => x && typeof x === 'object')
  }
  for (const c of candidates) {
    if (isSprintLikeRecord(c)) return [c]
    if (c && typeof c === 'object' && isSprintLikeRecord(c.data)) return [c.data]
  }
  return []
}

/* ── Date Normalization ── */

export const normalizeDate = (v) => {
  const s = String(v ?? '').trim()
  if (!s) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/* ── GO/NO GO Normalization ── */

export const normalizeGoNoGo = (val) => {
  if (val == null || val === '') return null
  const s = String(val).trim().toUpperCase()
  if (s === 'GO' || s === 'G O') return 'GO'
  if (s === 'NO GO' || s === 'NOGO' || s === 'NO-GO') return 'NO GO'
  return null
}

/* ── Officer Name Lookup ── */

export const getOfficerName = (officerId, users, accounts) => {
  if (!officerId) return 'Unknown Officer'
  const oid = String(officerId)

  const userMatch = users.find(
    (u) =>
      idsMatch(u.id, oid) ||
      idsMatch(u.user_id, oid) ||
      idsMatch(u.account_id, oid) ||
      idsMatch(u.officer_id, oid) ||
      idsMatch(u.officer_profile_id, oid)
  )

  if (userMatch) {
    const n = getUserDisplayName(userMatch)
    if (n) return n
  }

  const match = accounts.find(
    (account) =>
      idsMatch(account?.id, oid) ||
      idsMatch(account?.officer_id, oid) ||
      idsMatch(account?.officer_profile_id, oid) ||
      idsMatch(account?.account_id, oid) ||
      idsMatch(account?.user_id, oid)
  )

  const name = match ? getUserDisplayName(match) || match.email : null
  if (name) return name

  return `Officer ${officerId}`
}

/* ── Initial Form States ── */

export const EMPTY_ADD_FORM = {
  firstName: '',
  lastName: '',
  policeGoNoGo: 'GO',
  phone: '',
  gender: '',
  age: '',
  location: '',
  status: 'Active',
  password: '',
  notes: '',
}
