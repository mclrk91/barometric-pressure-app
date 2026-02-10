import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function QuickLogButton() {
  const { addHeadache } = useApp()
  const [open, setOpen] = useState(false)
  const [severity, setSeverity] = useState(5)
  const [notes, setNotes] = useState('')

  function severityColor(val: number): string {
    if (val <= 3) return 'var(--green)'
    if (val <= 6) return 'var(--yellow)'
    return 'var(--red)'
  }

  function handleLog() {
    addHeadache(severity, notes)
    setOpen(false)
    setSeverity(5)
    setNotes('')
  }

  return (
    <>
      <button className="log-headache-btn" onClick={() => setOpen(true)}>
        {'\uD83D\uDCDD'} Log Headache Now
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16, color: '#fff' }}>Log Headache</h3>

            <div className="form-group">
              <label className="form-label">Severity</label>
              <div className="severity-display" style={{ color: severityColor(severity) }}>
                {severity}
              </div>
              <input
                type="range" min={1} max={10} value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="severity-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>Mild</span>
                <span>Severe</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
                placeholder="e.g., took medication, weather change..."
              />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleLog}>
                Log Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
