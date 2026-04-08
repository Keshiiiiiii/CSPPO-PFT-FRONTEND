import './SitUp.css'

function SitUp({
  isAddingSitup,
  setIsAddingSitup,
  situpForm,
  setSitupForm,
  handleSubmitSitup,
  situpMessage,
  officerSitupRecords,
}) {
  return (
    <div className="user-panel situp-section">
      <div className="user-header-row situp-header">
        <h2 className="user-title">1 Min Sit-up Records</h2>
        {!isAddingSitup && <button className="btn btn-primary" onClick={() => setIsAddingSitup(true)}>ADD SIT-UP RECORD</button>}
      </div>
      {isAddingSitup && (
        <div className="form-grid situp-form">
          <div className="form-group"><label>Reps</label><input type="number" min="0" className="form-input" value={situpForm.reps} onChange={(e) => setSitupForm((f) => ({ ...f, reps: e.target.value }))} /></div>
          <div className="form-group"><label>Age</label><input type="number" min="0" className="form-input" value={situpForm.age} onChange={(e) => setSitupForm((f) => ({ ...f, age: e.target.value }))} /></div>
          <div className="form-group"><label>Gender</label><select className="form-select" value={situpForm.gender} onChange={(e) => setSitupForm((f) => ({ ...f, gender: e.target.value }))}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
          <div className="form-group"><label>Test Date</label><input type="date" className="form-input" value={situpForm.test_date} onChange={(e) => setSitupForm((f) => ({ ...f, test_date: e.target.value }))} /></div>
          <div className="form-group full situp-actions"><button type="button" className="btn btn-primary" onClick={handleSubmitSitup}>Save Sit-up</button><button type="button" className="btn situp-btn-secondary" onClick={() => setIsAddingSitup(false)}>Cancel</button>{situpMessage && <span className="situp-message">{situpMessage}</span>}</div>
        </div>
      )}
      <table className="user-table">
        <thead><tr><th>ID</th><th>Count</th><th>Grade</th><th>Test Date</th></tr></thead>
        <tbody>{officerSitupRecords.map((r, i) => <tr key={`officer-situp-${r.id ?? i}`}><td>{r.id ?? '—'}</td><td>{r.count ?? r.reps ?? r.situp_count ?? '—'}</td><td>{r.grade ?? '—'}</td><td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

export default SitUp
