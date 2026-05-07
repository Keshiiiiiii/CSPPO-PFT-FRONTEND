import { useState, useCallback } from 'react'
import useAppStore from '@/stores/appStore'
import { normalizeDate, toArray, getBmiHeight } from '@/lib/utils.js'
import {
  officerCreateOtherBmi,
  officerCreateOtherSprint,
  officerCreateOtherPushup,
  officerCreateOtherSitup,
  officerCreateOtherWalkTest,
  adminGetWalkTests,
  adminGetOfficerBmi,
  adminGetSitupRecords,
  adminGetPushupRecords,
  adminGetSprintRecords,
  adminUpdateWalkTest,
  adminDeleteWalkTest,
  adminUpdateOfficerBmi,
  adminDeleteOfficerBmi,
  adminUpdateSitupRecord,
  adminDeleteSitupRecord,
  adminUpdatePushupRecord,
  adminDeletePushupRecord,
  adminUpdateSprintRecord,
  adminDeleteSprintRecord,
} from '@/services/api.js'

/**
 * useAdminRecords — manages all admin CRUD operations, modal states,
 * and "Add Other" record forms for all exercise types.
 *
 * Eliminates ~400 lines from App.jsx.
 */
export function useAdminRecords(toast, confirm) {
  const store = useAppStore()
  const isAdmin = store.userRole === 'admin'

  // ─── Edit Modal State (Walk) ───
  const [isWalkTestModalOpen, setIsWalkTestModalOpen] = useState(false)
  const [editingWalkTest, setEditingWalkTest] = useState(null)
  const [walkTestEditForm, setWalkTestEditForm] = useState({ minutes: '', seconds: '0', test_date: '', gender: '', age: '' })

  // ─── Edit Modal State (BMI) ───
  const [isBmiModalOpen, setIsBmiModalOpen] = useState(false)
  const [editingBmi, setEditingBmi] = useState(null)
  const [bmiEditForm, setBmiEditForm] = useState({ height_meter: '', weight_kg: '', month_taken: '' })

  // ─── Edit Modal State (Situp) ───
  const [isSitupModalOpen, setIsSitupModalOpen] = useState(false)
  const [editingSitup, setEditingSitup] = useState(null)
  const [situpEditForm, setSitupEditForm] = useState({ reps: '', age: '', gender: 'male', test_date: '' })

  // ─── Edit Modal State (Pushup) ───
  const [isPushupModalOpen, setIsPushupModalOpen] = useState(false)
  const [editingPushup, setEditingPushup] = useState(null)
  const [pushupEditForm, setPushupEditForm] = useState({ reps: '', age: '', gender: 'male', test_date: '' })

  // ─── Edit Modal State (Sprint) ───
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState(null)
  const [sprintEditForm, setSprintEditForm] = useState({ minutes: '', seconds: '0', age: '', gender: 'male', test_date: '' })

  // ─── "Add Other" Modal States ───
  const [isAddOtherBmiModalOpen, setIsAddOtherBmiModalOpen] = useState(false)
  const [addOtherBmiForm, setAddOtherBmiForm] = useState({ officer_profile_id: '', height_meter: '', weight_kg: '', month_taken: '' })

  const [isAddOtherSprintModalOpen, setIsAddOtherSprintModalOpen] = useState(false)
  const [addOtherSprintForm, setAddOtherSprintForm] = useState({ officer_id: '', minutes: '', seconds: '0', age: '', gender: 'male', test_date: '' })

  const [isAddOtherPushupModalOpen, setIsAddOtherPushupModalOpen] = useState(false)
  const [addOtherPushupForm, setAddOtherPushupForm] = useState({ officer_id: '', reps: '', age: '', gender: 'male', test_date: '' })

  const [isAddOtherSitupModalOpen, setIsAddOtherSitupModalOpen] = useState(false)
  const [addOtherSitupForm, setAddOtherSitupForm] = useState({ officer_id: '', reps: '', age: '', gender: 'male', test_date: '' })

  const [isAddOtherWalkTestModalOpen, setIsAddOtherWalkTestModalOpen] = useState(false)
  const [addOtherWalkTestForm, setAddOtherWalkTestForm] = useState({ officer_id: '', minutes: '', seconds: '0', age: '', gender: 'male', test_date: '' })

  // ────────────────────────────────────────────────
  //  "Add Other" Handlers
  // ────────────────────────────────────────────────

  const handleAddOtherBmi = useCallback(async () => {
    const profileId = parseInt(addOtherBmiForm.officer_profile_id, 10)
    const height = parseFloat(addOtherBmiForm.height_meter)
    const weight = parseFloat(addOtherBmiForm.weight_kg)
    const monthTaken = normalizeDate(addOtherBmiForm.month_taken) || normalizeDate(new Date().toISOString())
    if (!profileId || Number.isNaN(profileId)) { toast.warning('Please enter a valid Officer Profile ID.'); return }
    if (!height || Number.isNaN(height)) { toast.warning('Please enter a valid height in meters.'); return }
    if (!weight || Number.isNaN(weight)) { toast.warning('Please enter a valid weight in kg.'); return }
    try {
      await officerCreateOtherBmi({ officer_profile_id: profileId, height_meter: height, weight_kg: weight, month_taken: monthTaken })
      toast.success('Other BMI record created successfully.')
      setIsAddOtherBmiModalOpen(false)
      setAddOtherBmiForm({ officer_profile_id: '', height_meter: '', weight_kg: '', month_taken: '' })
      if (isAdmin) { const fresh = await adminGetOfficerBmi().catch(() => null); if (fresh) store.setAdminBmiRecords(toArray(fresh)) }
    } catch (error) { toast.error('Failed to create other BMI record: ' + (error?.message || 'Unknown error')) }
  }, [addOtherBmiForm, isAdmin, toast])

  const handleAddOtherSprint = useCallback(async () => {
    const officerId = parseInt(addOtherSprintForm.officer_id, 10)
    const minutes = parseInt(addOtherSprintForm.minutes, 10) || 0
    const seconds = parseInt(addOtherSprintForm.seconds, 10) || 0
    const age = parseInt(addOtherSprintForm.age, 10)
    const gender = addOtherSprintForm.gender
    const testDate = normalizeDate(addOtherSprintForm.test_date) || normalizeDate(new Date().toISOString())
    if (!officerId || Number.isNaN(officerId)) { toast.warning('Please enter a valid Officer ID.'); return }
    if (!age || Number.isNaN(age)) { toast.warning('Please enter a valid age.'); return }
    if (!gender) { toast.warning('Please select a gender.'); return }
    try {
      await officerCreateOtherSprint({ officer_id: officerId, minutes, seconds, age, gender, test_date: testDate })
      toast.success('Other Sprint record created successfully.')
      setIsAddOtherSprintModalOpen(false)
      setAddOtherSprintForm({ officer_id: '', minutes: '', seconds: '0', age: '', gender: 'male', test_date: '' })
      if (isAdmin) { const fresh = await adminGetSprintRecords().catch(() => null); if (fresh) store.setAdminSprintRecords(toArray(fresh)) }
    } catch (error) { toast.error('Failed to create other Sprint record: ' + (error?.message || 'Unknown error')) }
  }, [addOtherSprintForm, isAdmin, toast])

  const handleAddOtherPushup = useCallback(async () => {
    const officerId = parseInt(addOtherPushupForm.officer_id, 10)
    const reps = parseInt(addOtherPushupForm.reps, 10)
    const age = parseInt(addOtherPushupForm.age, 10)
    const gender = addOtherPushupForm.gender
    const testDate = normalizeDate(addOtherPushupForm.test_date) || normalizeDate(new Date().toISOString())
    if (!officerId || Number.isNaN(officerId)) { toast.warning('Please enter a valid Officer ID.'); return }
    if (!reps || Number.isNaN(reps)) { toast.warning('Please enter valid reps.'); return }
    if (!age || Number.isNaN(age)) { toast.warning('Please enter a valid age.'); return }
    if (!gender) { toast.warning('Please select a gender.'); return }
    try {
      await officerCreateOtherPushup({ officer_id: officerId, reps, age, gender, test_date: testDate })
      toast.success('Other Push-up record created successfully.')
      setIsAddOtherPushupModalOpen(false)
      setAddOtherPushupForm({ officer_id: '', reps: '', age: '', gender: 'male', test_date: '' })
      if (isAdmin) { const fresh = await adminGetPushupRecords().catch(() => null); if (fresh) store.setAdminPushupRecords(toArray(fresh)) }
    } catch (error) { toast.error('Failed to create other Push-up record: ' + (error?.message || 'Unknown error')) }
  }, [addOtherPushupForm, isAdmin, toast])

  const handleAddOtherSitup = useCallback(async () => {
    const officerId = parseInt(addOtherSitupForm.officer_id, 10)
    const reps = parseInt(addOtherSitupForm.reps, 10)
    const age = parseInt(addOtherSitupForm.age, 10)
    const gender = addOtherSitupForm.gender
    const testDate = normalizeDate(addOtherSitupForm.test_date) || normalizeDate(new Date().toISOString())
    if (!officerId || Number.isNaN(officerId)) { toast.warning('Please enter a valid Officer ID.'); return }
    if (!reps || Number.isNaN(reps)) { toast.warning('Please enter valid reps.'); return }
    if (!age || Number.isNaN(age)) { toast.warning('Please enter a valid age.'); return }
    if (!gender) { toast.warning('Please select a gender.'); return }
    try {
      await officerCreateOtherSitup({ officer_id: officerId, reps, age, gender, test_date: testDate })
      toast.success('Other Sit-up record created successfully.')
      setIsAddOtherSitupModalOpen(false)
      setAddOtherSitupForm({ officer_id: '', reps: '', age: '', gender: 'male', test_date: '' })
      if (isAdmin) { const fresh = await adminGetSitupRecords().catch(() => null); if (fresh) store.setAdminSitupRecords(toArray(fresh)) }
    } catch (error) { toast.error('Failed to create other Sit-up record: ' + (error?.message || 'Unknown error')) }
  }, [addOtherSitupForm, isAdmin, toast])

  const handleAddOtherWalkTest = useCallback(async () => {
    const officerId = parseInt(addOtherWalkTestForm.officer_id, 10)
    const minutes = parseInt(addOtherWalkTestForm.minutes, 10) || 0
    const seconds = parseInt(addOtherWalkTestForm.seconds, 10) || 0
    const age = parseInt(addOtherWalkTestForm.age, 10)
    const gender = addOtherWalkTestForm.gender
    const testDate = normalizeDate(addOtherWalkTestForm.test_date) || normalizeDate(new Date().toISOString())
    if (!officerId || Number.isNaN(officerId)) { toast.warning('Please enter a valid Officer ID.'); return }
    if (!age || Number.isNaN(age)) { toast.warning('Please enter a valid age.'); return }
    if (!gender) { toast.warning('Please select a gender.'); return }
    try {
      await officerCreateOtherWalkTest({ officer_id: officerId, minutes, seconds, age, gender, test_date: testDate })
      toast.success('Other Walk Test record created successfully.')
      setIsAddOtherWalkTestModalOpen(false)
      setAddOtherWalkTestForm({ officer_id: '', minutes: '', seconds: '0', age: '', gender: 'male', test_date: '' })
      if (isAdmin) { const fresh = await adminGetWalkTests().catch(() => null); if (fresh) store.setAdminWalkTests(toArray(fresh)) }
    } catch (error) { toast.error('Failed to create other Walk Test record: ' + (error?.message || 'Unknown error')) }
  }, [addOtherWalkTestForm, isAdmin, toast])

  // ────────────────────────────────────────────────
  //  Delete / Edit / Save Handlers
  // ────────────────────────────────────────────────

  const handleDeleteWalkTest = useCallback(async (testId) => {
    const confirmed = await confirm({ title: 'Delete Walk Test', message: 'Are you sure you want to delete this walk test record?', variant: 'danger', confirmText: 'Delete' })
    if (!confirmed) return
    try { await adminDeleteWalkTest(testId); store.setAdminWalkTests((prev) => prev.filter((t) => t.id !== testId)); toast.success('Walk test deleted.') }
    catch { toast.error('Failed to delete walk test. Please try again.') }
  }, [confirm, toast])

  const openWalkTestModal = useCallback((test) => {
    setEditingWalkTest(test)
    setWalkTestEditForm({ minutes: String(test.minutes || ''), seconds: String(test.seconds || '0'), test_date: normalizeDate(test.test_date), gender: test.gender || '', age: String(test.age || '') })
    setIsWalkTestModalOpen(true)
  }, [])

  const handleSaveWalkTest = useCallback(async () => {
    if (!editingWalkTest) return
    try {
      const age = parseInt(walkTestEditForm.age, 10) || 0
      const minutes = parseInt(walkTestEditForm.minutes, 10) || 0
      const seconds = Math.min(59, Math.max(0, parseInt(walkTestEditForm.seconds, 10) || 0))
      await adminUpdateWalkTest(editingWalkTest.id, { age, gender: String(walkTestEditForm.gender || '').toLowerCase(), minutes, seconds, test_date: normalizeDate(walkTestEditForm.test_date) })
      store.setAdminWalkTests(await adminGetWalkTests())
      setEditingWalkTest(null); setIsWalkTestModalOpen(false)
      toast.success('Walk test updated successfully.')
    } catch (error) { toast.error('Failed to update walk test: ' + error.message) }
  }, [editingWalkTest, walkTestEditForm, toast])

  const handleDeleteBmi = useCallback(async (id) => {
    if (!id) return
    const confirmed = await confirm({ title: 'Delete BMI Record', message: 'Are you sure you want to delete this BMI record?', variant: 'danger', confirmText: 'Delete' })
    if (!confirmed) return
    try {
      await adminDeleteOfficerBmi(id)
      const fresh = await adminGetOfficerBmi().catch(() => null)
      if (fresh) store.setAdminBmiRecords(toArray(fresh)); else store.setAdminBmiRecords((prev) => prev.filter((r) => r.id !== id))
      toast.success('BMI record deleted.')
    } catch (error) { toast.error('Failed to delete BMI record: ' + (error?.message || 'Unknown error')) }
  }, [confirm, toast])

  const openBmiModal = useCallback((record) => {
    setEditingBmi(record)
    const h = getBmiHeight(record)
    setBmiEditForm({ height_meter: h != null ? String(h) : '', weight_kg: String(record?.weight_kg ?? ''), month_taken: normalizeDate(record?.month_taken) })
    setIsBmiModalOpen(true)
  }, [])

  const handleSaveBmi = useCallback(async () => {
    if (!editingBmi?.id) return
    try {
      const monthTaken = normalizeDate(bmiEditForm.month_taken) || normalizeDate(editingBmi.month_taken) || normalizeDate(new Date().toISOString())
      const payload = { height_meter: parseFloat(bmiEditForm.height_meter) || 0, weight_kg: parseFloat(bmiEditForm.weight_kg) || 0, month_taken: monthTaken }
      const computedBmi = payload.height_meter > 0 ? Number((payload.weight_kg / (payload.height_meter * payload.height_meter)).toFixed(2)) : 0
      const computedCategory = computedBmi <= 0 ? '—' : computedBmi < 18.5 ? 'Underweight' : computedBmi < 25 ? 'Normal' : computedBmi < 30 ? 'Overweight' : 'Obese'
      const optimistic = { ...editingBmi, ...payload, bmi: computedBmi, category: computedCategory }
      const updated = await adminUpdateOfficerBmi(editingBmi.id, payload).catch(() => null)
      store.setAdminBmiRecords((prev) => prev.map((r) => r.id === editingBmi.id ? { ...optimistic, ...(updated && typeof updated === 'object' && !Array.isArray(updated) ? updated : {}) } : r))
      const fresh = await adminGetOfficerBmi().catch(() => null)
      if (fresh) {
        const fetched = toArray(fresh)
        store.setAdminBmiRecords((prev) => prev.map((r) => {
          const serverRow = fetched.find((f) => f?.id === r?.id)
          if (!serverRow) return r
          if (r.id === editingBmi.id) return { ...serverRow, height_meter: payload.height_meter, weight_kg: payload.weight_kg, month_taken: payload.month_taken, bmi: serverRow.bmi ?? computedBmi, category: serverRow.category ?? computedCategory }
          return serverRow
        }))
      }
      setIsBmiModalOpen(false); setEditingBmi(null)
      toast.success('BMI record updated successfully.')
    } catch (error) { toast.error('Failed to update BMI record: ' + (error?.message || 'Unknown error')) }
  }, [editingBmi, bmiEditForm, toast])

  const handleDeleteSitup = useCallback(async (id) => {
    if (!id) return
    const confirmed = await confirm({ title: 'Delete Sit-up Record', message: 'Are you sure you want to delete this sit-up record?', variant: 'danger', confirmText: 'Delete' })
    if (!confirmed) return
    try {
      await adminDeleteSitupRecord(id)
      const fresh = await adminGetSitupRecords().catch(() => null)
      if (fresh) store.setAdminSitupRecords(toArray(fresh)); else store.setAdminSitupRecords((prev) => prev.filter((r) => r.id !== id))
      toast.success('Sit-up record deleted.')
    } catch (error) { toast.error('Failed to delete sit-up record: ' + (error?.message || 'Unknown error')) }
  }, [confirm, toast])

  const openSitupModal = useCallback((record) => {
    setEditingSitup(record)
    setSitupEditForm({ reps: String(record.count ?? record.reps ?? record.situp_count ?? ''), age: String(record.age || ''), gender: record.gender || '', test_date: normalizeDate(record.test_date) })
    setIsSitupModalOpen(true)
  }, [])

  const handleSaveSitup = useCallback(async () => {
    if (!editingSitup?.id) return
    try {
      const payload = { age: parseInt(situpEditForm.age, 10) || 0, gender: String(situpEditForm.gender || '').toLowerCase(), reps: parseInt(situpEditForm.reps, 10) || 0, count: parseInt(situpEditForm.reps, 10) || 0, minutes: 1, seconds: 0, test_date: normalizeDate(situpEditForm.test_date) || normalizeDate(new Date().toISOString()) }
      await adminUpdateSitupRecord(editingSitup.id, payload)
      const fresh = await adminGetSitupRecords().catch(() => null)
      if (fresh) store.setAdminSitupRecords(toArray(fresh))
      else store.setAdminSitupRecords((prev) => prev.map(r => r.id === editingSitup.id ? { ...r, ...payload } : r))
      setIsSitupModalOpen(false); setEditingSitup(null)
      toast.success('Sit-up record updated successfully.')
    } catch (error) { toast.error('Failed to update sit-up record: ' + (error?.message || 'Unknown error')) }
  }, [editingSitup, situpEditForm, toast])

  const handleDeletePushup = useCallback(async (id) => {
    if (!id) return
    const confirmed = await confirm({ title: 'Delete Push-up Record', message: 'Are you sure you want to delete this push-up record?', variant: 'danger', confirmText: 'Delete' })
    if (!confirmed) return
    try {
      await adminDeletePushupRecord(id)
      const fresh = await adminGetPushupRecords().catch(() => null)
      if (fresh) store.setAdminPushupRecords(toArray(fresh)); else store.setAdminPushupRecords((prev) => prev.filter((r) => r.id !== id))
      toast.success('Push-up record deleted.')
    } catch (error) { toast.error('Failed to delete push-up record: ' + (error?.message || 'Unknown error')) }
  }, [confirm, toast])

  const openPushupModal = useCallback((record) => {
    setEditingPushup(record)
    setPushupEditForm({ reps: String(record.count ?? record.reps ?? record.pushup_count ?? ''), age: String(record.age || ''), gender: record.gender || '', test_date: normalizeDate(record.test_date) })
    setIsPushupModalOpen(true)
  }, [])

  const handleSavePushup = useCallback(async () => {
    if (!editingPushup?.id) return
    try {
      const payload = { age: parseInt(pushupEditForm.age, 10) || 0, gender: String(pushupEditForm.gender || '').toLowerCase(), reps: parseInt(pushupEditForm.reps, 10) || 0, count: parseInt(pushupEditForm.reps, 10) || 0, test_date: normalizeDate(pushupEditForm.test_date) || normalizeDate(new Date().toISOString()) }
      await adminUpdatePushupRecord(editingPushup.id, payload)
      const fresh = await adminGetPushupRecords().catch(() => null)
      if (fresh) store.setAdminPushupRecords(toArray(fresh))
      else store.setAdminPushupRecords((prev) => prev.map(r => r.id === editingPushup.id ? { ...r, ...payload } : r))
      setIsPushupModalOpen(false); setEditingPushup(null)
      toast.success('Push-up record updated successfully.')
    } catch (error) { toast.error('Failed to update push-up record: ' + (error?.message || 'Unknown error')) }
  }, [editingPushup, pushupEditForm, toast])

  const handleDeleteSprint = useCallback(async (id) => {
    const confirmed = await confirm({ title: 'Delete Sprint Record', message: 'Are you sure you want to delete this sprint record?', variant: 'danger', confirmText: 'Delete' })
    if (!confirmed) return
    try {
      await adminDeleteSprintRecord(id)
      const fresh = await adminGetSprintRecords().catch(() => null)
      if (fresh) store.setAdminSprintRecords(toArray(fresh)); else store.setAdminSprintRecords((prev) => prev.filter((r) => r.id !== id))
    } catch (error) { toast.error('Failed to delete sprint record: ' + (error?.message || 'Unknown error')) }
  }, [confirm, toast])

  const openSprintModal = useCallback((record) => {
    setEditingSprint(record)
    setSprintEditForm({ minutes: String(record.minutes || '0'), seconds: String(record.seconds || '0'), age: String(record.age || ''), gender: record.gender || '', test_date: normalizeDate(record.test_date) })
    setIsSprintModalOpen(true)
  }, [])

  const handleSaveSprint = useCallback(async () => {
    if (!editingSprint?.id) return
    try {
      const payload = { age: parseInt(sprintEditForm.age, 10) || 0, gender: String(sprintEditForm.gender || '').toLowerCase(), minutes: parseInt(sprintEditForm.minutes, 10) || 0, seconds: parseInt(sprintEditForm.seconds, 10) || 0, test_date: normalizeDate(sprintEditForm.test_date) || normalizeDate(new Date().toISOString()) }
      await adminUpdateSprintRecord(editingSprint.id, payload)
      const fresh = await adminGetSprintRecords().catch(() => null)
      if (fresh) store.setAdminSprintRecords(toArray(fresh))
      else store.setAdminSprintRecords((prev) => prev.map(r => r.id === editingSprint.id ? { ...r, ...payload } : r))
      setIsSprintModalOpen(false); setEditingSprint(null)
      toast.success('Sprint record updated successfully.')
    } catch (error) { toast.error('Failed to update sprint record: ' + (error?.message || 'Unknown error')) }
  }, [editingSprint, sprintEditForm, toast])

  return {
    // Walk Test Modal
    isWalkTestModalOpen, setIsWalkTestModalOpen, editingWalkTest, setEditingWalkTest,
    walkTestEditForm, setWalkTestEditForm, openWalkTestModal, handleSaveWalkTest, handleDeleteWalkTest,
    // BMI Modal
    isBmiModalOpen, setIsBmiModalOpen, editingBmi, setEditingBmi,
    bmiEditForm, setBmiEditForm, openBmiModal, handleSaveBmi, handleDeleteBmi,
    // Situp Modal
    isSitupModalOpen, setIsSitupModalOpen, editingSitup, setEditingSitup,
    situpEditForm, setSitupEditForm, openSitupModal, handleSaveSitup, handleDeleteSitup,
    // Pushup Modal
    isPushupModalOpen, setIsPushupModalOpen, editingPushup, setEditingPushup,
    pushupEditForm, setPushupEditForm, openPushupModal, handleSavePushup, handleDeletePushup,
    // Sprint Modal
    isSprintModalOpen, setIsSprintModalOpen, editingSprint, setEditingSprint,
    sprintEditForm, setSprintEditForm, openSprintModal, handleSaveSprint, handleDeleteSprint,
    // Add Other BMI
    isAddOtherBmiModalOpen, setIsAddOtherBmiModalOpen,
    addOtherBmiForm, setAddOtherBmiForm, handleAddOtherBmi,
    // Add Other Sprint
    isAddOtherSprintModalOpen, setIsAddOtherSprintModalOpen,
    addOtherSprintForm, setAddOtherSprintForm, handleAddOtherSprint,
    // Add Other Pushup
    isAddOtherPushupModalOpen, setIsAddOtherPushupModalOpen,
    addOtherPushupForm, setAddOtherPushupForm, handleAddOtherPushup,
    // Add Other Situp
    isAddOtherSitupModalOpen, setIsAddOtherSitupModalOpen,
    addOtherSitupForm, setAddOtherSitupForm, handleAddOtherSitup,
    // Add Other Walk Test
    isAddOtherWalkTestModalOpen, setIsAddOtherWalkTestModalOpen,
    addOtherWalkTestForm, setAddOtherWalkTestForm, handleAddOtherWalkTest,
  }
}
