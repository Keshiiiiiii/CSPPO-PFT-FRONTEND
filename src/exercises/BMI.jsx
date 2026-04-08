import './BMI.css'

function BMI({
  isAddingBmi,
  setIsAddingBmi,
  bmiForm,
  setBmiForm,
  handleSubmitBmi,
  bmiMessage,
  officerBmiRecords,
}) {
  return (
    <div className="user-panel bmi-section">
      <div className="user-header-row bmi-header">
        <h2 className="user-title">BMI Test Records</h2>
        {!isAddingBmi && <button className="btn btn-primary" onClick={() => setIsAddingBmi(true)}>ADD BMI RECORD</button>}
      </div>
      {isAddingBmi && (
        <div className="form-grid bmi-form">
          <div className="form-group"><label>Height (m)</label><input type="number" step="0.01" min="0" className="form-input" value={bmiForm.height_meter} onChange={(e) => setBmiForm((f) => ({ ...f, height_meter: e.target.value }))} /></div>
          <div className="form-group"><label>Weight (kg)</label><input type="number" step="0.1" min="0" className="form-input" value={bmiForm.weight_kg} onChange={(e) => setBmiForm((f) => ({ ...f, weight_kg: e.target.value }))} /></div>
          <div className="form-group"><label>Month Taken</label><input type="date" className="form-input" value={bmiForm.month_taken} onChange={(e) => setBmiForm((f) => ({ ...f, month_taken: e.target.value }))} /></div>
          <div className="form-group full bmi-actions"><button type="button" className="btn btn-primary" onClick={handleSubmitBmi}>Save BMI</button><button type="button" className="btn bmi-btn-secondary" onClick={() => setIsAddingBmi(false)}>Cancel</button>{bmiMessage && <span className="bmi-message">{bmiMessage}</span>}</div>
        </div>
      )}
      <table className="user-table">
        <thead><tr><th>ID</th><th>Height (m)</th><th>Weight (kg)</th><th>BMI</th><th>Category</th><th>Month Taken</th></tr></thead>
        <tbody>{officerBmiRecords.map((r, i) => <tr key={`officer-bmi-${r.id ?? i}`}><td>{r.id ?? '—'}</td><td>{r.height_meter != null ? Number(r.height_meter).toFixed(2) : '—'}</td><td>{r.weight_kg ?? '—'}</td><td>{r.bmi ?? '—'}</td><td>{r.category ?? '—'}</td><td>{r.month_taken ? new Date(r.month_taken).toLocaleDateString() : '—'}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

export default BMI
