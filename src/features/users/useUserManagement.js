import { useState, useMemo, useCallback } from 'react'
import * as XLSX from 'xlsx'
import useAppStore from '@/stores/appStore'
import {
  getUserDisplayName,
  normalizeGoNoGo,
  EMPTY_ADD_FORM,
} from '@/lib/utils.js'
import { createUser, updateUser, deleteUser } from '@/services/api.js'

/**
 * useUserManagement — handles user CRUD, filtering, Excel import/export,
 * and the user form modal state.
 */
export function useUserManagement(toast, confirm) {
  const store = useAppStore()

  // ─── User Form Modal State ───
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM)

  // ─── Filtered Users ───
  const filteredUsers = useMemo(() => {
    const searchLower = store.search.toLowerCase()
    return store.users.filter((u) => {
      const matchSearch =
        !searchLower ||
        getUserDisplayName(u).toLowerCase().includes(searchLower) ||
        String(u.id ?? '').toLowerCase().includes(searchLower)
      return matchSearch
    })
  }, [store.users, store.search, store.gender, store.ageMin, store.ageMax])

  // ─── Register User ───
  const handleRegisterUser = useCallback(async () => {
    const name = [addForm.firstName.trim(), addForm.lastName.trim()].filter(Boolean).join(' ')
    if (!name || !addForm.gender || !addForm.age) {
      toast.warning('Please fill in required fields: First Name, Last Name, Gender, Age.')
      return
    }
    try {
      const newUser = await createUser({
        name,
        policeGoNoGo: 'GO',
        gender: addForm.gender,
        age: parseInt(addForm.age, 10) || 0,
        location: addForm.location || '',
        status: addForm.status || 'Active',
        date: new Date().toISOString().slice(0, 10),
      })
      store.setUsers((prev) => [...prev, newUser])
      setAddForm(EMPTY_ADD_FORM)
      setIsModalOpen(false)
    } catch {
      toast.error('Failed to register user. Please try again.')
    }
  }, [addForm, toast])

  // ─── Save Edited User ───
  const handleSaveEditUser = useCallback(async () => {
    if (!editingUser) return
    const name = [addForm.firstName.trim(), addForm.lastName.trim()].filter(Boolean).join(' ')
    if (!name || !addForm.gender || !addForm.age) {
      toast.warning('Please fill in required fields: First Name, Last Name, Gender, Age.')
      return
    }
    try {
      const updatedUser = await updateUser(editingUser.id, {
        name,
        policeGoNoGo: editingUser.policeGoNoGo,
        gender: addForm.gender,
        age: parseInt(addForm.age, 10) || editingUser.age,
        location: addForm.location ?? editingUser.location,
        status: addForm.status ?? editingUser.status,
      })
      store.setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updatedUser : u)))
      setEditingUser(null)
      setIsModalOpen(false)
      setAddForm(EMPTY_ADD_FORM)
    } catch {
      toast.error('Failed to update user. Please try again.')
    }
  }, [editingUser, addForm, toast])

  // ─── Delete User ───
  const handleDeleteUser = useCallback(
    async (id) => {
      const confirmed = await confirm({
        title: 'Delete User',
        message: `Are you sure you want to delete user ${id}?`,
        variant: 'danger',
        confirmText: 'Delete',
      })
      if (!confirmed) return
      try {
        await deleteUser(id)
        store.setUsers((prev) => prev.filter((u) => u.id !== id))
        toast.success('User deleted successfully.')
      } catch {
        toast.error('Failed to delete user. Please try again.')
      }
    },
    [confirm, toast]
  )

  // ─── Open Edit Modal ───
  const openEditModal = useCallback((user) => {
    const [first = '', ...rest] = (user.name || '').split(' ')
    setAddForm({
      ...EMPTY_ADD_FORM,
      firstName: first,
      lastName: rest.join(' '),
      gender: user.gender || '',
      age: String(user.age ?? ''),
      location: user.location || '',
      status: user.status || 'Active',
    })
    setEditingUser(user)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingUser(null)
  }, [])

  // ─── Export CSV ───
  const exportCsv = useCallback(
    (usersToExport, label) => {
      if (!usersToExport.length) {
        toast.warning('No users to export for this selection.')
        return
      }
      const headers = ['ID', 'Name', 'Gender', 'Age', 'Location', 'Status', 'Registered']
      const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
      const rows = usersToExport.map((u) => [
        u.id, u.name, u.gender, u.age,
        u.location ?? '', u.status ?? '', u.date ?? '',
      ])
      const csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\n')
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users-${label}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    [toast]
  )

  // ─── Import Excel ───
  const handleImportExcel = useCallback(
    (file) => {
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' })
          if (!rows.length) { toast.warning('Excel file is empty or has no data.'); return }
          const headers = rows[0].map((h) => String(h ?? '').trim())
          const idIdx = headers.findIndex((h) => /^id$/i.test(h))
          const nameIdx = headers.findIndex((h) => /^name$/i.test(h))
          const goNoGoIdx = headers.findIndex((h) =>
            /go\s*[\/\-]?\s*no\s*go|police\s*go|go\s*no\s*go|status/i.test(h)
          )
          if (goNoGoIdx < 0) {
            toast.warning('Excel must have a column for GO/NO GO.')
            return
          }
          const nameCol = nameIdx >= 0 ? nameIdx : headers.findIndex((_, i) => i === 1)
          const idCol = idIdx >= 0 ? idIdx : headers.findIndex((_, i) => i === 0)
          store.setUsers((prev) => {
            const next = prev.map((u) => ({ ...u }))
            const nums = next.map((u) => parseInt(String(u.id).replace(/\D/g, ''), 10)).filter(Boolean)
            let nextNum = nums.length ? Math.max(...nums) + 1 : 1
            let updated = 0, added = 0
            for (let r = 1; r < rows.length; r++) {
              const row = rows[r]
              const goNoGoVal = normalizeGoNoGo(row[goNoGoIdx])
              if (goNoGoVal !== 'GO' && goNoGoVal !== 'NO GO') continue
              const rowId = idCol >= 0 && row[idCol] != null ? String(row[idCol]).trim() : ''
              const rowName = nameCol >= 0 && row[nameCol] != null ? String(row[nameCol]).trim() : ''
              const existing = next.find(
                (u) =>
                  (rowId && u.id === rowId) ||
                  (rowName && u.name.toLowerCase() === rowName.toLowerCase())
              )
              if (existing) { existing.policeGoNoGo = goNoGoVal; updated++ }
              else if (rowName && goNoGoVal) {
                next.push({
                  id: `USR-${String(nextNum++).padStart(3, '0')}`,
                  name: rowName,
                  policeGoNoGo: goNoGoVal,
                  gender: 'Male',
                  age: 0,
                  location: '',
                  status: 'Active',
                  date: new Date().toISOString().slice(0, 10),
                })
                added++
              }
            }
            setTimeout(
              () => toast.success(`Import complete. Updated ${updated} user(s), added ${added} new user(s).`),
              0
            )
            return next
          })
        } catch (err) {
          console.error(err)
          toast.error('Failed to read Excel file.')
        }
      }
      reader.readAsArrayBuffer(file)
    },
    [toast]
  )

  return {
    // Modal
    isModalOpen, setIsModalOpen,
    editingUser, setEditingUser,
    addForm, setAddForm,
    openEditModal, closeModal,
    // CRUD
    handleRegisterUser,
    handleSaveEditUser,
    handleDeleteUser,
    // Filter
    filteredUsers,
    // Import/Export
    exportCsv,
    handleImportExcel,
  }
}
