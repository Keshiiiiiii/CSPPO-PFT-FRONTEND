import './WalkTest.css'

function WalkTest({
  isAddingWalkTest,
  setIsAddingWalkTest,
  walkTestForm,
  setWalkTestForm,
  handleSubmitWalkTest,
  walkTestMessage,
  officerWalkRecords,
}) {
  return (
    <div className="user-panel walktest-section">
      <div className="user-header-row walktest-header">
        <h2 className="user-title">Officer Walk Test Records</h2>
        {!isAddingWalkTest && <button className="btn btn-primary" onClick={() => setIsAddingWalkTest(true)}>ADD WALK TEST RECORD</button>}
      </div>
      {isAddingWalkTest && (
        <div className="form-grid walktest-form">
          <div className="form-group"><label>Gender</label><select className="form-select" value={walkTestForm.gender} onChange={(e) => setWalkTestForm((f) => ({ ...f, gender: e.target.value }))}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
          <div className="form-group"><label>Age</label><input type="number" min="0" className="form-input" value={walkTestForm.age} onChange={(e) => setWalkTestForm((f) => ({ ...f, age: e.target.value }))} /></div>
          <div className="form-group"><label>Minutes</label><input type="number" min="0" className="form-input" value={walkTestForm.minutes} onChange={(e) => setWalkTestForm((f) => ({ ...f, minutes: e.target.value }))} /></div>
          <div className="form-group"><label>Seconds</label><input type="number" min="0" max="59" className="form-input" value={walkTestForm.seconds} onChange={(e) => setWalkTestForm((f) => ({ ...f, seconds: e.target.value }))} /></div>
          <div className="form-group full"><label>Test Date</label><input type="date" className="form-input" value={walkTestForm.test_date} onChange={(e) => setWalkTestForm((f) => ({ ...f, test_date: e.target.value }))} /></div>
          <div className="form-group full walktest-actions"><button type="button" className="btn btn-primary" onClick={handleSubmitWalkTest}>Save Walk Test</button><button type="button" className="btn walktest-btn-secondary" onClick={() => setIsAddingWalkTest(false)}>Cancel</button>{walkTestMessage && <span className="walktest-message">{walkTestMessage}</span>}</div>
        </div>
      )}
      <table className="user-table">
        <thead><tr><th>ID</th><th>Age</th><th>Gender</th><th>Time</th><th>Grade</th><th>Test Date</th><th>GO / NO GO</th></tr></thead>
        <tbody>
          {officerWalkRecords.map((u, i) => (
            <tr key={`officer-walk-${u.id ?? i}`}>
              <td>{u.id}</td><td>{u.age}</td><td>{u.gender}</td><td>{u.time_formatted || u.time || `${u.minutes ?? 0}:${String(u.seconds ?? 0).padStart(2, '0')}`}</td><td>{u.grade}</td><td>{u.test_date ? new Date(u.test_date).toLocaleDateString() : '—'}</td><td>{u.policeGoNoGo ?? u.go_no_go ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default WalkTest
