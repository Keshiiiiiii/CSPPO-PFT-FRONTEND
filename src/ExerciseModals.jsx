const EditIcon = () => (<svg viewBox="0 0 24 24" style={{width:18,height:18,stroke:'currentColor',strokeWidth:1.8,fill:'none',opacity:0.9}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>)

function ExerciseModals({
  isWalkTestModalOpen,
  editingWalkTest,
  setIsWalkTestModalOpen,
  setEditingWalkTest,
  walkTestEditForm,
  setWalkTestEditForm,
  handleSaveWalkTest,
  isBmiModalOpen,
  editingBmi,
  setIsBmiModalOpen,
  setEditingBmi,
  bmiEditForm,
  setBmiEditForm,
  handleSaveBmi,
}) {
  return (
    <>
      {/* EDIT WALK TEST MODAL */}
      {isWalkTestModalOpen && editingWalkTest && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsWalkTestModalOpen(false)
              setEditingWalkTest(null)
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title"><EditIcon /> Edit Walk Test Record</div>
              <button
                className="modal-close"
                type="button"
                onClick={() => {
                  setIsWalkTestModalOpen(false)
                  setEditingWalkTest(null)
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    className="form-select"
                    value={walkTestEditForm.gender}
                    onChange={(e) => setWalkTestEditForm((f) => ({ ...f, gender: e.target.value }))}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={walkTestEditForm.age}
                    onChange={(e) => setWalkTestEditForm((f) => ({ ...f, age: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Minutes</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={walkTestEditForm.minutes}
                    onChange={(e) => setWalkTestEditForm((f) => ({ ...f, minutes: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className="form-input"
                    value={walkTestEditForm.seconds}
                    onChange={(e) => setWalkTestEditForm((f) => ({ ...f, seconds: e.target.value }))}
                  />
                </div>
                <div className="form-group full">
                  <label>Test Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={walkTestEditForm.test_date}
                    onChange={(e) => setWalkTestEditForm((f) => ({ ...f, test_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                type="button"
                onClick={() => {
                  setIsWalkTestModalOpen(false)
                  setEditingWalkTest(null)
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="button" onClick={handleSaveWalkTest}>
                ✔ Save Walk Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BMI MODAL */}
      {isBmiModalOpen && editingBmi && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsBmiModalOpen(false)
              setEditingBmi(null)
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title"><EditIcon /> Edit BMI Record</div>
              <button
                className="modal-close"
                type="button"
                onClick={() => {
                  setIsBmiModalOpen(false)
                  setEditingBmi(null)
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Height (m)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    value={bmiEditForm.height_meter}
                    onChange={(e) => setBmiEditForm((f) => ({ ...f, height_meter: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="form-input"
                    value={bmiEditForm.weight_kg}
                    onChange={(e) => setBmiEditForm((f) => ({ ...f, weight_kg: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>BMI (auto)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={
                      parseFloat(bmiEditForm.height_meter) > 0 && parseFloat(bmiEditForm.weight_kg) > 0
                        ? (
                            parseFloat(bmiEditForm.weight_kg) /
                            (parseFloat(bmiEditForm.height_meter) * parseFloat(bmiEditForm.height_meter))
                          ).toFixed(2)
                        : '—'
                    }
                    readOnly
                  />
                </div>
                <div className="form-group full">
                  <label>Month Taken</label>
                  <input
                    type="date"
                    className="form-input"
                    value={bmiEditForm.month_taken}
                    onChange={(e) => setBmiEditForm((f) => ({ ...f, month_taken: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                type="button"
                onClick={() => {
                  setIsBmiModalOpen(false)
                  setEditingBmi(null)
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="button" onClick={handleSaveBmi}>
                ✔ Save BMI
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ExerciseModals
