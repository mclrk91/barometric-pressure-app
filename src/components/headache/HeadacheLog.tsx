import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { formatDate, formatTime } from '../../utils/dateUtils'

function severityColor(val: number): string {
  if (val <= 3) return '#27ae60'
  if (val <= 6) return '#f39c12'
  return '#e74c3c'
}

export default function HeadacheLog() {
  const { headaches, addHeadache, deleteHeadache } = useApp()
  const [severity, setSeverity] = useState(5)
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(() => {
    const d = new Date()
    return d.toISOString().slice(0, 16)
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const timestamp = new Date(date).getTime()
    addHeadache(severity, notes, timestamp)
    setNotes('')
    setSeverity(5)
    setDate(new Date().toISOString().slice(0, 16))
  }

  const sorted = [...headaches].sort((a, b) => b.timestamp - a.timestamp)

  // Group by date
  const grouped = new Map<string, typeof headaches>()
  for (const h of sorted) {
    const key = formatDate(h.timestamp)
    const arr = grouped.get(key) ?? []
    arr.push(h)
    grouped.set(key, arr)
  }

  return (
    <>
      <div className="card">
        <div className="card-title">Log a Headache</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">When</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
            />
          </div>

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

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
              placeholder="e.g., took medication, weather was stormy..."
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Log Headache
          </button>
        </form>
      </div>

      <h3 className="section-title">History</h3>

      {sorted.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">&#128203;</div>
            <p>No headaches logged yet</p>
          </div>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([dateStr, entries]) => (
          <div key={dateStr} className="card">
            <div className="card-title">{dateStr}</div>
            {entries.map((h) => (
              <div key={h.id} className="list-item">
                <span
                  className="severity-badge"
                  style={{ background: severityColor(h.severity) }}
                >
                  {h.severity}
                </span>
                <div className="list-item-content">
                  <div className="list-item-title">{formatTime(h.timestamp)}</div>
                  <div className="list-item-sub">
                    {h.notes && <>{h.notes} &middot; </>}
                    {h.pressureAtTime && <>{h.pressureAtTime} hPa &middot; </>}
                    {h.cyclePhase && <>Cycle: {h.cyclePhase}</>}
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => deleteHeadache(h.id)}
                  style={{ color: 'var(--color-danger)', flexShrink: 0 }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </>
  )
}
