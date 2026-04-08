import './PushUp.css'

function PushUp({
  isAddingPushup,
  setIsAddingPushup,
  pushupForm,
  setPushupForm,
  handleSubmitPushup,
  pushupMessage,
  officerPushupRecords,
}) {
  return (
    <div className="user-panel pushup-section">
      <div className="user-header-row pushup-header">
        <h2 className="user-title">Push-up Test Records</h2>
        {!isAddingPushup && <button className="btn btn-primary" onClick={() => setIsAddingPushup(true)}>ADD PUSH-UP RECORD</button>}
      </div>
      {isAddingPushup && (
        <div className="form-grid pushup-form">
          <div className="form-group"><label>Count</label><input type="number" min="0" className="form-input" value={pushupForm.count} onChange={(e) => setPushupForm((f) => ({ ...f, count: e.target.value }))} /></div>
          <div className="form-group"><label>Age</label><input type="number" min="0" className="form-input" value={pushupForm.age} onChange={(e) => setPushupForm((f) => ({ ...f, age: e.target.value }))} /></div>
          <div className="form-group"><label>Gender</label><select className="form-select" value={pushupForm.gender} onChange={(e) => setPushupForm((f) => ({ ...f, gender: e.target.value }))}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
          <div className="form-group"><label>Test Date</label><input type="date" className="form-input" value={pushupForm.test_date} onChange={(e) => setPushupForm((f) => ({ ...f, test_date: e.target.value }))} /></div>
          <div className="form-group full pushup-actions"><button type="button" className="btn btn-primary" onClick={handleSubmitPushup}>Save Push-up</button><button type="button" className="btn pushup-btn-secondary" onClick={() => setIsAddingPushup(false)}>Cancel</button>{pushupMessage && <span className="pushup-message">{pushupMessage}</span>}</div>
        </div>
      )}
      <table className="user-table">
        <thead><tr><th>ID</th><th>Count</th><th>Grade</th><th>Test Date</th></tr></thead>
        <tbody>{officerPushupRecords.map((r, i) => <tr key={`officer-pushup-${r.id ?? i}`}><td>{r.id ?? '—'}</td><td>{r.count ?? r.reps ?? r.pushup_count ?? '—'}</td><td>{r.grade ?? '—'}</td><td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

export default PushUp
