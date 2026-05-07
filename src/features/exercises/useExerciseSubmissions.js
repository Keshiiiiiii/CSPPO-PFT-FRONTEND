import { useState, useCallback } from 'react'
import useAppStore from '@/stores/appStore'
import {
  toArray,
  normalizePushupRecords,
  normalizeSprintRecords,
  isSprintLikeRecord,
} from '@/lib/utils.js'
import {
  officerCreateWalkTest,
  officerGetWalkTests,
  officerCreateBmi,
  officerGetBmi,
  officerCreateSitupRecord,
  officerGetSitupRecords,
  officerCreatePushupRecord,
  officerGetPushupRecords,
  officerCreateSprintRecord,
  officerGetSprintRecords,
} from '@/services/api.js'

/**
 * useExerciseSubmissions — officer-side exercise forms; toasts + auto-close modal on success.
 */
export function useExerciseSubmissions(toast) {
  const store = useAppStore()
  const t = toast || { success: () => {}, error: () => {}, warning: () => {}, info: () => {} }

  const [isAddingWalkTest, setIsAddingWalkTest] = useState(false)
  const [walkTestForm, setWalkTestForm] = useState({
    gender: 'male',
    minutes: '18',
    seconds: '0',
    test_date: '3-29-2026',
    age: '25',
  })

  const handleSubmitWalkTest = useCallback(async () => {
    if (!walkTestForm.gender || !walkTestForm.age || !walkTestForm.test_date || !walkTestForm.minutes) {
      t.warning('Please fill in gender, age, minutes, and test date.', 'Missing fields')
      return
    }
    try {
      await officerCreateWalkTest({
        gender: walkTestForm.gender,
        minutes: walkTestForm.minutes,
        seconds: walkTestForm.seconds || '0',
        test_date: walkTestForm.test_date,
        age: walkTestForm.age,
      })
      const updated = await officerGetWalkTests()
      store.setUsers(updated)
      store.setOfficerWalkRecords(updated)
      t.success('Walk test record saved successfully.', 'Record created')
      setIsAddingWalkTest(false)
      setWalkTestForm((prev) => ({ ...prev, minutes: '', seconds: '0', age: '' }))
    } catch (error) {
      t.error(error.message || 'Failed to create walk test record.', 'Couldn’t save')
    }
  }, [walkTestForm, store, t])

  const [isAddingBmi, setIsAddingBmi] = useState(false)
  const [bmiForm, setBmiForm] = useState({ height_meter: '', weight_kg: '', month_taken: '' })

  const handleSubmitBmi = useCallback(async () => {
    const height = parseFloat(bmiForm.height_meter)
    const weight = parseFloat(bmiForm.weight_kg)
    const monthTaken = String(bmiForm.month_taken || '').trim()
    if (Number.isNaN(height) || height <= 0) {
      t.warning('Please enter a valid height in meters.', 'Invalid height')
      return
    }
    if (Number.isNaN(weight) || weight <= 0) {
      t.warning('Please enter a valid weight in kilograms.', 'Invalid weight')
      return
    }
    if (!monthTaken) {
      t.warning('Please select month taken.', 'Missing date')
      return
    }
    try {
      await officerCreateBmi({ height_meter: height, weight_kg: weight, month_taken: monthTaken })
      store.setOfficerBmiRecords(toArray(await officerGetBmi().catch(() => [])))
      t.success('BMI record saved successfully.', 'Record created')
      setIsAddingBmi(false)
      setBmiForm({ height_meter: '', weight_kg: '', month_taken: '' })
    } catch (error) {
      t.error(error.message || 'Failed to create BMI record.', 'Couldn’t save')
    }
  }, [bmiForm, store, t])

  const [isAddingSitup, setIsAddingSitup] = useState(false)
  const [situpForm, setSitupForm] = useState({ reps: '', age: '', gender: 'male', test_date: '' })

  const handleSubmitSitup = useCallback(async () => {
    const reps = parseInt(situpForm.reps, 10)
    const age = parseInt(situpForm.age, 10)
    if (Number.isNaN(reps) || reps < 0) {
      t.warning('Please enter valid reps.', 'Invalid reps')
      return
    }
    if (Number.isNaN(age) || age < 0) {
      t.warning('Please enter a valid age.', 'Invalid age')
      return
    }
    try {
      await officerCreateSitupRecord({
        reps,
        age,
        gender: situpForm.gender,
        test_date: situpForm.test_date || undefined,
      })
      store.setOfficerSitupRecords(toArray(await officerGetSitupRecords().catch(() => [])))
      t.success('Sit-up record saved successfully.', 'Record created')
      setIsAddingSitup(false)
      setSitupForm({ reps: '', age: '', gender: 'male', test_date: '' })
    } catch (error) {
      t.error(error.message || 'Failed to create sit-up record.', 'Couldn’t save')
    }
  }, [situpForm, store, t])

  const [isAddingPushup, setIsAddingPushup] = useState(false)
  const [pushupForm, setPushupForm] = useState({ reps: '', age: '', gender: 'male', test_date: '' })

  const handleSubmitPushup = useCallback(async () => {
    const reps = parseInt(pushupForm.reps, 10)
    const age = parseInt(pushupForm.age, 10)
    const testDate = String(pushupForm.test_date || '').trim()
    if (Number.isNaN(reps) || reps < 0) {
      t.warning('Please enter valid reps.', 'Invalid reps')
      return
    }
    if (Number.isNaN(age) || age < 0) {
      t.warning('Please enter a valid age.', 'Invalid age')
      return
    }
    if (!testDate) {
      t.warning('Please select test date.', 'Missing date')
      return
    }
    try {
      const created = await officerCreatePushupRecord({
        reps,
        age,
        gender: pushupForm.gender,
        test_date: testDate,
      })
      const createdRecords = normalizePushupRecords(created)
      if (createdRecords.length > 0) {
        store.setOfficerPushupRecords((prev) => {
          const next = [...createdRecords, ...prev]
          const seen = new Set()
          return next.filter((r, idx) => {
            const key = r?.id ?? `tmp-${idx}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
        })
      }
      const fresh = await officerGetPushupRecords().catch(() => [])
      const normalized = normalizePushupRecords(fresh)
      if (normalized.length > 0) store.setOfficerPushupRecords(normalized)
      else if (createdRecords.length === 0) {
        store.setOfficerPushupRecords((prev) => prev.filter((x) => x && typeof x === 'object'))
      }
      t.success('Push-up record saved successfully.', 'Record created')
      setIsAddingPushup(false)
      setPushupForm({ reps: '', age: '', gender: 'male', test_date: '' })
    } catch (error) {
      const msg = String(error?.message || '')
      t.error(
        msg.toLowerCase().includes('profile not found')
          ? 'Complete your Officer Profile before adding push-up records.'
          : msg || 'Failed to create push-up record.',
        'Couldn’t save'
      )
    }
  }, [pushupForm, store, t])

  const [isAddingSprint, setIsAddingSprint] = useState(false)
  const [sprintForm, setSprintForm] = useState({ minutes: '', seconds: '0', age: '', gender: 'male' })

  const handleSubmitSprint = useCallback(async () => {
    const age = parseInt(sprintForm.age, 10)
    if (Number.isNaN(age) || age <= 0) {
      t.warning('Please enter a valid age.', 'Missing fields')
      return
    }
    if (!sprintForm.gender) {
      t.warning('Please select gender.', 'Missing fields')
      return
    }
    try {
      await officerCreateSprintRecord({
        minutes: parseInt(sprintForm.minutes, 10) || 0,
        seconds: parseInt(sprintForm.seconds, 10) || 0,
        age,
        gender: sprintForm.gender,
      })
      store.setOfficerSprintRecords(
        normalizeSprintRecords(await officerGetSprintRecords().catch(() => [])).filter(isSprintLikeRecord)
      )
      t.success('Sprint record saved successfully.', 'Record created')
      setIsAddingSprint(false)
      setSprintForm({ minutes: '', seconds: '0', age: '', gender: 'male' })
    } catch (error) {
      t.error(error.message || 'Failed to create sprint record.', 'Couldn’t save')
    }
  }, [sprintForm, store, t])

  return {
    isAddingWalkTest,
    setIsAddingWalkTest,
    walkTestForm,
    setWalkTestForm,
    handleSubmitWalkTest,
    isAddingBmi,
    setIsAddingBmi,
    bmiForm,
    setBmiForm,
    handleSubmitBmi,
    isAddingSitup,
    setIsAddingSitup,
    situpForm,
    setSitupForm,
    handleSubmitSitup,
    isAddingPushup,
    setIsAddingPushup,
    pushupForm,
    setPushupForm,
    handleSubmitPushup,
    isAddingSprint,
    setIsAddingSprint,
    sprintForm,
    setSprintForm,
    handleSubmitSprint,
  }
}
