import { IconEdit, IconShield } from '@/components/icons.jsx'

const inputClass = 'w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-navy placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors duration-fast'
const selectClass = 'w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors duration-fast cursor-pointer appearance-none'
const labelClass = 'block text-xs font-semibold text-navy/70 uppercase tracking-wider mb-1.5'

/**
 * Add / Edit User Modal — used by admin to register or edit officer profiles.
 * Fully migrated to Tailwind CSS.
 */
function UserFormModal({ isOpen, editingUser, addForm, setAddForm, onSubmit, onClose }) {
  if (!isOpen && !editingUser) return null

  const updateField = (field) => (e) =>
    setAddForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-lg font-semibold text-navy [&_svg]:w-5 [&_svg]:h-5 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-2">
            {editingUser ? <><IconEdit /> Edit User</> : <><IconShield /> Register New User</>}
          </div>
          <button className="flex items-center justify-center w-8 h-8 rounded-full text-slate hover:text-coral hover:bg-coral-pale/50 transition-colors duration-fast cursor-pointer text-lg" type="button" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="First Name *" placeholder="John" value={addForm.firstName} onChange={updateField('firstName')} />
            <FormInput label="Last Name *" placeholder="Doe" value={addForm.lastName} onChange={updateField('lastName')} />

            <FormInput label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" value={addForm.phone} onChange={updateField('phone')} />

            <div>
              <label className={labelClass}>Gender *</label>
              <select className={selectClass} value={addForm.gender} onChange={updateField('gender')}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <FormInput label="Age *" type="number" placeholder="e.g. 34" min="1" max="120" value={addForm.age} onChange={updateField('age')} />
            <FormInput label="Location / City" placeholder="New York, NY" value={addForm.location} onChange={updateField('location')} />

            <div>
              <label className={labelClass}>Status</label>
              <select className={selectClass} value={addForm.status} onChange={updateField('status')}>
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
              </select>
            </div>

            {!editingUser && (
              <>
                <div className="col-span-full flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-2xs font-semibold text-muted uppercase tracking-widest">Security</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <FormInput label="Assign Password" type="password" placeholder="••••••••" value={addForm.password} onChange={updateField('password')} />
                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input type="password" className={inputClass} placeholder="••••••••" />
                </div>
              </>
            )}

            <div className="col-span-full">
              <label className={labelClass}>Notes / Remarks</label>
              <input type="text" className={inputClass} placeholder="Optional internal notes..." value={addForm.notes} onChange={updateField('notes')} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button className="px-5 py-2.5 text-sm font-medium text-slate bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-fast cursor-pointer" type="button" onClick={onClose}>Cancel</button>
          <button className="px-5 py-2.5 text-sm font-semibold text-white bg-blue rounded-lg hover:bg-blue-light shadow-sm transition-colors duration-fast cursor-pointer" type="button" onClick={onSubmit}>
            {editingUser ? '✔ Save Changes' : '✔ Register User'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FormInput({ label, type = 'text', placeholder, value, onChange, ...rest }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input type={type} className={inputClass} placeholder={placeholder} value={value} onChange={onChange} {...rest} />
    </div>
  )
}

export default UserFormModal
