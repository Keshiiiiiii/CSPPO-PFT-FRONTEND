import { idsMatch, normalizeId, getUserDisplayName } from '@/lib/utils.js'

/** Exercise types shown in Overall Score (BMI is a separate record type, not counted here). */
export const OVERALL_EXERCISE_KEYS = ['walk', 'situp', 'pushup', 'sprint']
export const OVERALL_EXERCISE_TOTAL = 4

const SUMMARY_SCORE_FIELDS = {
  walk: ['walk_score', 'walkScore', 'walk_test_score', 'walkTestScore'],
  situp: ['situp_score', 'situpScore'],
  pushup: ['pushup_score', 'pushupScore'],
  sprint: ['sprint_score', 'sprintScore'],
}

const SUMMARY_COUNT_FIELDS = {
  walk: ['walk_tests', 'walkTests'],
  situp: ['situp_tests', 'situpTests'],
  pushup: ['pushup_tests', 'pushupTests', 'push_up_tests'],
  sprint: ['sprint_tests', 'sprintTests'],
}

function mapKeyFrom(rowIdSource) {
  const raw =
    rowIdSource?.officer_id ??
    rowIdSource?.officer_profile_id ??
    rowIdSource?.account_id ??
    rowIdSource?.user_id ??
    rowIdSource?.id
  const nk = normalizeId(raw)
  if (nk) return nk.toLowerCase()
  const s = String(raw ?? '').trim()
  return s.toLowerCase() || ''
}

export function dedupeOverallSummaryRows(rows) {
  const map = new Map()
  for (const u of rows) {
    const key = mapKeyFrom(u)
    if (!key) continue
    if (!map.has(key)) {
      map.set(key, { ...u })
      continue
    }
    const a = map.get(key)
    const b = u
    const pick = (x, y) => {
      const has = (v) => v != null && v !== '' && !(typeof v === 'number' && Number.isNaN(v))
      if (has(x)) return x
      if (has(y)) return y
      return x ?? y
    }
    map.set(key, {
      ...a,
      ...b,
      officer_id: pick(a.officer_id, b.officer_id),
      officer_profile_id: pick(a.officer_profile_id, b.officer_profile_id),
      officer_name: pick(a.officer_name ?? a.name, b.officer_name ?? b.name),
      walk_score: pick(a.walk_score ?? a.walkScore, b.walk_score ?? b.walkScore),
      situp_score: pick(a.situp_score ?? a.situpScore, b.situp_score ?? b.situpScore),
      pushup_score: pick(a.pushup_score ?? a.pushupScore, b.pushup_score ?? b.pushupScore),
      sprint_score: pick(a.sprint_score ?? a.sprintScore, b.sprint_score ?? b.sprintScore),
      walk_tests: Math.max(Number(a.walk_tests ?? a.walkTests ?? 0), Number(b.walk_tests ?? b.walkTests ?? 0)),
      situp_tests: Math.max(Number(a.situp_tests ?? a.situpTests ?? 0), Number(b.situp_tests ?? b.situpTests ?? 0)),
      pushup_tests: Math.max(Number(a.pushup_tests ?? a.pushupTests ?? 0), Number(b.pushup_tests ?? b.pushupTests ?? 0)),
      sprint_tests: Math.max(Number(a.sprint_tests ?? a.sprintTests ?? 0), Number(b.sprint_tests ?? b.sprintTests ?? 0)),
      status: pick(a.status, b.status),
      overall_status: pick(a.overall_status ?? a.overallStatus, b.overall_status ?? b.overallStatus),
      is_passed: pick(a.is_passed, b.is_passed),
      isPassed: pick(a.isPassed, b.isPassed),
    })
  }
  return [...map.values()]
}

function scoreValueToGrade(v) {
  if (v == null || v === '') return null
  if (typeof v === 'string' && v.includes('%')) return v.trim()
  const n = parseFloat(v)
  if (!Number.isNaN(n)) return `${n.toFixed(2)}%`
  return String(v).trim()
}

function summaryGrade(u, type) {
  for (const f of SUMMARY_SCORE_FIELDS[type] || []) {
    const g = scoreValueToGrade(u[f])
    if (g) return g
  }
  return null
}

function summaryHasExerciseRow(u, type) {
  for (const f of SUMMARY_COUNT_FIELDS[type] || []) {
    const n = Number(u[f])
    if (!Number.isNaN(n) && n > 0) return true
  }
  return false
}

function latestExerciseRecord(records, oid) {
  if (!records?.length) return null
  const list = records.filter((r) =>
    idsMatch(r.officer_profile_id ?? r.officer_id ?? r.account_id ?? r.user_id, oid)
  )
  if (!list.length) return null
  return [...list].sort((a, b) => {
    const da = new Date(a.test_date || a.month_taken || 0).getTime()
    const db = new Date(b.test_date || b.month_taken || 0).getTime()
    return db - da
  })[0]
}

function gradeFromRecord(type, rec) {
  if (!rec) return null
  if (rec.grade != null && rec.grade !== '') return String(rec.grade)
  return null
}

function buildExerciseTests(u, oid, collections) {
  const tests = {}
  for (const type of OVERALL_EXERCISE_KEYS) {
    let grade = summaryGrade(u, type)
    if (!grade) {
      grade = gradeFromRecord(type, latestExerciseRecord(collections[type], oid))
    }
    tests[type] = { grade: grade || '—' }
  }
  return tests
}

function exerciseCompletionCount(u, tests, oid, collections) {
  let n = 0
  for (const type of OVERALL_EXERCISE_KEYS) {
    const g = tests[type]?.grade
    if (g && g !== '—' && String(g).trim() !== '') {
      n++
      continue
    }
    if (summaryHasExerciseRow(u, type)) n++
    else if (latestExerciseRecord(collections[type], oid)) n++
  }
  return n
}

function overallStatusFromSummary(u) {
  const st = String(u.status || u.overall_status || u.overallStatus || '').toLowerCase()
  if (st.includes('fail')) return 'Failed'
  if (st.includes('pass')) return 'Passed'
  return u.is_passed || u.isPassed ? 'Passed' : 'Failed'
}

/**
 * Builds overall-score rows when adminSummary from API exists.
 */
function buildFromAdminSummary(adminSummary, collections, users, searchQuery, getOfficerName) {
  const qLower = (searchQuery || '').trim().toLowerCase()

  const filtered = adminSummary.filter((u) => {
    const name = (
      u.officer_name ||
      getOfficerName(u.officer_id || u.officer_profile_id || u.id) ||
      ''
    ).toLowerCase()
    const idStr = String(u.officer_id || u.officer_profile_id || u.account_id || u.user_id || u.id || '').toLowerCase()
    return !qLower || name.includes(qLower) || idStr.includes(qLower)
  })

  const deduped = dedupeOverallSummaryRows(filtered)

  return deduped.map((u) => {
    const oid = u.officer_id ?? u.officer_profile_id ?? u.account_id ?? u.user_id ?? u.id
    const tests = buildExerciseTests(u, oid, collections)
    const testCount = exerciseCompletionCount(u, tests, oid, collections)

    return {
      ...u,
      id: oid,
      name: u.officer_name || getOfficerName(oid),
      tests,
      testCount,
      overallStatus: overallStatusFromSummary(u),
      baseUser: users.find((x) => idsMatch(x.id, oid)) || {},
    }
  })
}

function mapKeyForAggregatedRecord(record) {
  const gId = record.officer_profile_id ?? record.officer_id ?? record.account_id ?? record.user_id
  return mapKeyFrom({ officer_id: gId, officer_profile_id: record.officer_profile_id, id: gId })
}

/**
 * Builds overall rows from per-exercise admin records (+ users without tests).
 */
function buildFromAggregatedRecords({
  users,
  adminWalkTests,
  adminBmiRecords,
  adminSitupRecords,
  adminPushupRecords,
  adminSprintRecords,
  searchQuery,
  getOfficerName,
}) {
  const qLower = (searchQuery || '').trim().toLowerCase()
  const map = new Map()

  const addTest = (record, type) => {
    const mk = mapKeyForAggregatedRecord(record)
    if (!mk) return
    if (!map.has(mk)) map.set(mk, { id: mk, name: getOfficerName(record.officer_profile_id || record.officer_id || record.account_id || record.user_id), tests: {} })
    map.get(mk).tests[type] = record
  }

  if (adminWalkTests) adminWalkTests.forEach((r) => addTest(r, 'walk'))
  if (adminBmiRecords) adminBmiRecords.forEach((r) => addTest(r, 'bmi'))
  if (adminSitupRecords) adminSitupRecords.forEach((r) => addTest(r, 'situp'))
  if (adminPushupRecords) adminPushupRecords.forEach((r) => addTest(r, 'pushup'))
  if (adminSprintRecords) adminSprintRecords.forEach((r) => addTest(r, 'sprint'))

  users.forEach((u) => {
    const mk = mapKeyFrom(u)
    if (!mk || !u.id) return
    if (!map.has(mk)) map.set(mk, { id: mk, name: getUserDisplayName(u) || 'Unknown', tests: {}, baseUser: u })
    else {
      const row = map.get(mk)
      row.baseUser = u
      if (!row.name || row.name === 'Unknown') row.name = getUserDisplayName(u) || row.name
    }
  })

  return Array.from(map.values())
    .filter((row) => !qLower || (row.name || '').toLowerCase().includes(qLower))
    .map((u) => {
      let hasFailed = false

      /** Only four exercises factor into completion meter (not BMI). */
      let testCount = 0
      OVERALL_EXERCISE_KEYS.forEach((t) => {
        if (u.tests[t]) testCount++
      })

      if (u.baseUser?.policeGoNoGo === 'NO GO') hasFailed = true

      OVERALL_EXERCISE_KEYS.forEach((t) => {
        if (u.tests[t]?.grade) {
          const g = String(u.tests[t].grade).toLowerCase()
          if (g.includes('fail') || g.includes('poor')) hasFailed = true
        }
      })

      if (u.tests.bmi?.category) {
        const cat = String(u.tests.bmi.category).toLowerCase()
        if (cat.includes('obese')) hasFailed = true
      }

      const testsFormatted = {}
      for (const t of OVERALL_EXERCISE_KEYS) {
        const rec = u.tests[t]
        const grade = rec?.grade != null && rec?.grade !== '' ? rec.grade : '—'
        testsFormatted[t] = { grade }
      }

      return {
        ...u,
        tests: testsFormatted,
        testCount,
        overallStatus: testCount === 0 ? 'No Data' : hasFailed ? 'Failed' : 'Passed',
        hasFailed,
      }
    })
}

/**
 * Main entry: prefers API summary when non-empty (deduped + enriched from live records).
 * Falls back to aggregating raw exercise rows with normalized IDs to prevent duplicate officers.
 */
export function buildOverallScores({
  adminSummary,
  adminWalkTests,
  adminBmiRecords,
  adminSitupRecords,
  adminPushupRecords,
  adminSprintRecords,
  users,
  searchQuery,
  getOfficerName,
}) {
  const collections = {
    walk: adminWalkTests,
    situp: adminSitupRecords,
    pushup: adminPushupRecords,
    sprint: adminSprintRecords,
  }

  if (adminSummary && adminSummary.length > 0) {
    return buildFromAdminSummary(adminSummary, collections, users, searchQuery, getOfficerName)
  }

  return buildFromAggregatedRecords({
    users,
    adminWalkTests,
    adminBmiRecords,
    adminSitupRecords,
    adminPushupRecords,
    adminSprintRecords,
    searchQuery,
    getOfficerName,
  })
}
