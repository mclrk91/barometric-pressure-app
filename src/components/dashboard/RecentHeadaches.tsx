import type { HeadacheEntry } from '../../types'
import { useApp } from '../../context/AppContext'
import { formatDateTime } from '../../utils/dateUtils'

function severityColor(val: number): string {
  if (val <= 3) return '#27ae60'
  if (val <= 6) return '#f39c12'
  return '#e74c3c'
}

export default function RecentHeadaches({ headaches }: { headaches: HeadacheEntry[] }) {
  const { deleteHeadache } = useApp()

  const sorted = [...headaches].sort((a, b) => b.timestamp - a.timestamp)

  function handleClearAll() {
    if (confirm('Clear all headache entries?')) {
      for (const h of headaches) {
        deleteHeadache(h.id)
      }
    }
  }

  return (
    <div className="card">
      <div className="history-header">
        <div className="card-title" style={{ marginBottom: 0 }}>Recent Entries</div>
        {sorted.length > 0 && (
          <button className="clear-all" onClick={handleClearAll}>Clear All</button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <p style={{ color: 'var(--text-muted)' }}>No headaches logged yet</p>
        </div>
      ) : (
        sorted.slice(0, 10).map((h) => (
          <div key={h.id} className="list-item">
            <span className="severity-badge" style={{ background: severityColor(h.severity) }}>
              {h.severity}
            </span>
            <div className="list-item-content">
              <div className="list-item-title">{formatDateTime(h.timestamp)}</div>
              <div className="list-item-sub">
                {h.notes && <>{h.notes} &middot; </>}
                {h.cyclePhase && <>Cycle: {h.cyclePhase} &middot; </>}
                {h.pressureAtTime && <>{(h.pressureAtTime * 0.02953).toFixed(2)} inHg</>}
              </div>
            </div>
            <button className="btn btn-sm btn-outline" onClick={() => deleteHeadache(h.id)}
              style={{ color: 'var(--red)', flexShrink: 0 }}>
              &times;
            </button>
          </div>
        ))
      )}
    </div>
  )
}
