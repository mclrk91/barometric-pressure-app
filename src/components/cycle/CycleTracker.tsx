import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useCyclePhase } from '../../hooks/useCyclePhase'
import { phaseLabel, phaseColor } from '../../services/cycleCalculations'
import { toDateString, formatDate } from '../../utils/dateUtils'

export default function CycleTracker() {
  const { cycles, settings, addCyclePeriod, endCyclePeriod, deleteCyclePeriod } = useApp()
  const cycleInfo = useCyclePhase(cycles, settings.averageCycleLength, settings.averagePeriodLength)
  const [startDate, setStartDate] = useState(toDateString(new Date()))

  const sorted = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )

  const ongoingPeriod = sorted.find((c) => c.endDate === null)

  function handleStartPeriod() {
    addCyclePeriod(startDate)
  }

  function handleEndPeriod() {
    if (ongoingPeriod) {
      endCyclePeriod(ongoingPeriod.id, toDateString(new Date()))
    }
  }

  const phases = [
    { phase: 'menstrual' as const, label: 'Menstrual' },
    { phase: 'follicular' as const, label: 'Follicular' },
    { phase: 'ovulation' as const, label: 'Ovulation' },
    { phase: 'luteal' as const, label: 'Luteal' },
  ]

  return (
    <>
      {/* Current Phase */}
      {cycleInfo && (
        <div className="card">
          <div className="card-title">Current Phase</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="phase-dot" style={{ background: phaseColor(cycleInfo.phase) }} />
            <span style={{ fontSize: 20, fontWeight: 600, color: phaseColor(cycleInfo.phase) }}>
              {phaseLabel(cycleInfo.phase)}
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>Day {cycleInfo.cycleDay}</span>
          </div>

          {/* Phase timeline bar */}
          <div className="cycle-timeline">
            {phases.map(({ phase, label }) => {
              let width: number
              const len = settings.averageCycleLength
              const pLen = settings.averagePeriodLength
              const ovDay = len - 14
              if (phase === 'menstrual') width = (pLen / len) * 100
              else if (phase === 'follicular') width = ((ovDay - 1 - pLen) / len) * 100
              else if (phase === 'ovulation') width = (3 / len) * 100
              else width = ((len - ovDay - 2) / len) * 100

              return (
                <div
                  key={phase}
                  className="cycle-timeline-segment"
                  style={{
                    width: `${Math.max(width, 5)}%`,
                    background: phaseColor(phase),
                    opacity: cycleInfo.phase === phase ? 1 : 0.3,
                  }}
                  title={label}
                />
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {phases.map(({ phase, label }) => (
              <span key={phase} style={{ color: phaseColor(phase) }}>{label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Log Period */}
      <div className="card">
        <div className="card-title">Log Period</div>

        {ongoingPeriod ? (
          <div>
            <p style={{ marginBottom: 12 }}>
              Period started {formatDate(new Date(ongoingPeriod.startDate + 'T00:00:00').getTime())}
            </p>
            <button className="btn btn-primary btn-block" onClick={handleEndPeriod}>
              End Period (Today)
            </button>
          </div>
        ) : (
          <div>
            <div className="form-group">
              <label className="form-label">Period Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => { setStartDate(toDateString(new Date())); handleStartPeriod() }}
              >
                Started Today
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleStartPeriod}>
                Log Start Date
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Period History */}
      <h3 className="section-title">Period History</h3>
      {sorted.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">&#128197;</div>
            <p>No periods logged yet</p>
          </div>
        </div>
      ) : (
        <div className="card">
          {sorted.map((c) => (
            <div key={c.id} className="list-item">
              <span className="phase-dot" style={{ background: '#e74c3c' }} />
              <div className="list-item-content">
                <div className="list-item-title">
                  {formatDate(new Date(c.startDate + 'T00:00:00').getTime())}
                  {c.endDate ? ` - ${formatDate(new Date(c.endDate + 'T00:00:00').getTime())}` : ' (ongoing)'}
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => deleteCyclePeriod(c.id)}
                style={{ color: 'var(--color-danger)', flexShrink: 0 }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
