import { IconEdit, IconShield } from './icons.jsx'

/**
 * Add / Edit User Modal — used by admin to register or edit officer profiles.
 */
function UserFormModal({ isOpen, editingUser, addForm, setAddForm, onSubmit, onClose }) {
  if (!isOpen && !editingUser) return null

  const updateField = (field) => (e) =>
    setAddForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            {editingUser ? <><IconEdit /> Edit User</> : <><IconShield /> Register New User</>}
          </div>
          <button className="modal-close" type="button" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <FormInput label="First Name *" placeholder="John" value={addForm.firstName} onChange={updateField('firstName')} />
            <FormInput label="Last Name *" placeholder="Doe" value={addForm.lastName} onChange={updateField('lastName')} />

            <div className="form-group">
              <label>Police GO / NO GO *</label>
              <select className="form-select" value={addForm.policeGoNoGo} onChange={updateField('policeGoNoGo')}>
                <option value="GO">GO</option>
                <option value="NO GO">NO GO</option>
              </select>
            </div>

            <FormInput label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" value={addForm.phone} onChange={updateField('phone')} />

            <div className="form-group">
              <label>Gender *</label>
              <select className="form-select" value={addForm.gender} onChange={updateField('gender')}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <FormInput label="Age *" type="number" placeholder="e.g. 34" min="1" max="120" value={addForm.age} onChange={updateField('age')} />
            <FormInput label="Location / City" placeholder="New York, NY" value={addForm.location} onChange={updateField('location')} />

            <div className="form-group">
              <label>Status</label>
              <select className="form-select" value={addForm.status} onChange={updateField('status')}>
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
              </select>
            </div>

            {!editingUser && (
              <>
                <div className="divider-label"><span>Security</span></div>
                <FormInput label="Assign Password" type="password" placeholder="••••••••" value={addForm.password} onChange={updateField('password')} />
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" />
                </div>
              </>
            )}

            <div className="form-group full">
              <label>Notes / Remarks</label>
              <input type="text" className="form-input" placeholder="Optional internal notes..." value={addForm.notes} onChange={updateField('notes')} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="button" onClick={onSubmit}>
            {editingUser ? '✔ Save Changes' : '✔ Register User'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FormInput({ label, type = 'text', placeholder, value, onChange, ...rest }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} className="form-input" placeholder={placeholder} value={value} onChange={onChange} {...rest} />
    </div>
  )
}

export default UserFormModal
