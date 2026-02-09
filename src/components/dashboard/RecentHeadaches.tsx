import { useApp } from '../../context/AppContext'
import { formatDateTime } from '../../utils/dateUtils'

function severityColor(val: number): string {
  if (val <= 3) return '#27ae60'
  if (val <= 6) return '#f39c12'
  return '#e74c3c'
}

export default function RecentHeadaches() {
  const { headaches } = useApp()

  const recent = [...headaches]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)

  if (recent.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Recent Headaches</div>
        <div className="empty-state">
          <p>No headaches logged yet. Use the + button to log one.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-title">Recent Headaches</div>
      {recent.map((h) => (
        <div key={h.id} className="list-item">
          <span
            className="severity-badge"
            style={{ background: severityColor(h.severity) }}
          >
            {h.severity}
          </span>
          <div className="list-item-content">
            <div className="list-item-title">{formatDateTime(h.timestamp)}</div>
            {h.notes && (
              <div className="list-item-sub">{h.notes}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
