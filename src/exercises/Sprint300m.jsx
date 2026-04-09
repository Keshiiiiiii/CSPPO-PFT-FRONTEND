import './Sprint300m.css'

function Sprint300m({
  isAddingSprint,
  setIsAddingSprint,
  sprintForm,
  setSprintForm,
  handleSubmitSprint,
  sprintMessage,
  officerSprintRecords,
}) {
  return (
    <div className="user-panel sprint-section">
      <div className="user-header-row sprint-header">
        <h2 className="user-title">300m Sprint Records</h2>
        {!isAddingSprint && <button className="btn btn-primary" onClick={() => setIsAddingSprint(true)}>ADD SPRINT RECORD</button>}
      </div>
      {isAddingSprint && (
        <div className="form-grid sprint-form">
          <div className="form-group"><label>Minutes</label><input type="number" min="0" className="form-input" value={sprintForm.minutes} onChange={(e) => setSprintForm((f) => ({ ...f, minutes: e.target.value }))} /></div>
          <div className="form-group"><label>Seconds</label><input type="number" min="0" max="59" className="form-input" value={sprintForm.seconds} onChange={(e) => setSprintForm((f) => ({ ...f, seconds: e.target.value }))} /></div>
          <div className="form-group"><label>Age</label><input type="number" min="0" className="form-input" value={sprintForm.age} onChange={(e) => setSprintForm((f) => ({ ...f, age: e.target.value }))} /></div>
          <div className="form-group"><label>Gender</label><select className="form-select" value={sprintForm.gender} onChange={(e) => setSprintForm((f) => ({ ...f, gender: e.target.value }))}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
          <div className="form-group full sprint-actions"><button type="button" className="btn btn-primary" onClick={handleSubmitSprint}>Save Sprint</button><button type="button" className="btn sprint-btn-secondary" onClick={() => setIsAddingSprint(false)}>Cancel</button>{sprintMessage && <span className="sprint-message">{sprintMessage}</span>}</div>
        </div>
      )}
      <table className="user-table">
        <thead><tr><th>ID</th><th>Time</th><th>Grade</th><th>Test Date</th></tr></thead>
        <tbody>{officerSprintRecords.map((r, i) => <tr key={`officer-sprint-${r.id ?? i}`}><td>{r.id ?? '—'}</td><td>{r.time_formatted || `${r.minutes ?? 0}:${String(r.seconds ?? 0).padStart(2, '0')}`}</td><td>{r.grade ?? '—'}</td><td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

export default Sprint300m
