import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function QuickLogButton() {
  const { addHeadache } = useApp()
  const [open, setOpen] = useState(false)
  const [severity, setSeverity] = useState(5)

  function severityColor(val: number): string {
    if (val <= 3) return '#27ae60'
    if (val <= 6) return '#f39c12'
    return '#e74c3c'
  }

  function handleLog() {
    addHeadache(severity)
    setOpen(false)
    setSeverity(5)
  }

  return (
    <>
      <button className="fab" onClick={() => setOpen(true)}>+</button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>Quick Log Headache</h3>

            <div className="form-group">
              <label className="form-label">Severity</label>
              <div className="severity-display" style={{ color: severityColor(severity) }}>
                {severity}
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="severity-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
                <span>Mild</span>
                <span>Severe</span>
              </div>
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
