import { useApp } from '../../context/AppContext'
import { useCyclePhase } from '../../hooks/useCyclePhase'
import { phaseLabel, phaseColor } from '../../services/cycleCalculations'

export default function CyclePhaseCard() {
  const { cycles, settings } = useApp()
  const cycleInfo = useCyclePhase(cycles, settings.averageCycleLength, settings.averagePeriodLength)

  if (!cycleInfo) {
    return (
      <div className="card">
        <div className="card-title">Cycle Phase</div>
        <div className="empty-state">
          <p>Log a period in the Cycle tab to see your current phase</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-title">Cycle Phase</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span
          className="phase-dot"
          style={{ background: phaseColor(cycleInfo.phase) }}
        />
        <span style={{ fontSize: 20, fontWeight: 600, color: phaseColor(cycleInfo.phase) }}>
          {phaseLabel(cycleInfo.phase)}
        </span>
      </div>
      <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
        Day {cycleInfo.cycleDay} of cycle
        {cycleInfo.daysUntilNextPeriod > 0 && (
          <> &middot; ~{cycleInfo.daysUntilNextPeriod} days until next period</>
        )}
      </div>
      {cycleInfo.isPMSWindow && (
        <div
          className="alert alert-medium"
          style={{ marginTop: 8, marginBottom: 0 }}
        >
          PMS window - monitor for headache triggers
        </div>
      )}
    </div>
  )
}
