import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useCyclePhase } from '../../hooks/useCyclePhase'
import { phaseLabel, phaseColor, estimateNextPeriod } from '../../services/cycleCalculations'
import { toDateString } from '../../utils/dateUtils'

const phaseDescriptions: Record<string, string> = {
  menstrual: 'Rest & recover',
  follicular: 'Energy rising',
  ovulation: 'Peak energy',
  luteal: 'Winding down',
}

const PHASE_COLORS = {
  menstrual: '#ff4a8d',
  follicular: '#a855f7',
  ovulation: '#2ecc71',
  luteal: '#f1c40f',
  pms: '#e67e22',
}

export default function CyclePhaseCard() {
  const { cycles, settings, addCyclePeriod, endCyclePeriod } = useApp()
  const cycleInfo = useCyclePhase(cycles, settings.averageCycleLength, settings.averagePeriodLength)
  const navigate = useNavigate()

  const sorted = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )
  const ongoingPeriod = sorted.find((c) => c.endDate === null)

  if (!cycleInfo && cycles.length === 0) {
    return (
      <div className="card card-glow-purple">
        <div className="card-title">{'\uD83C\uDF38'} Cycle Tracker</div>
        <div className="empty-state">
          <p>Log a period to start tracking your cycle</p>
        </div>
        <div className="cycle-actions" style={{ marginTop: 12 }}>
          <button className="cycle-btn cycle-btn-start" onClick={() => addCyclePeriod(toDateString(new Date()))}>
            {'\uD83D\uDD34'} Period Started
          </button>
        </div>
      </div>
    )
  }

  const nextPeriod = estimateNextPeriod(cycles, settings.averageCycleLength)
  const nextPeriodFormatted = nextPeriod
    ? new Date(nextPeriod + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : null

  const len = settings.averageCycleLength
  const pLen = settings.averagePeriodLength
  const ovDay = len - 14
  const pmsStart = len - 7

  const segments = [
    { phase: 'menstrual', width: (pLen / len) * 100, color: PHASE_COLORS.menstrual },
    { phase: 'follicular', width: ((ovDay - 1 - pLen) / len) * 100, color: PHASE_COLORS.follicular },
    { phase: 'ovulation', width: (3 / len) * 100, color: PHASE_COLORS.ovulation },
    { phase: 'luteal', width: ((pmsStart - ovDay - 2) / len) * 100, color: PHASE_COLORS.luteal },
    { phase: 'pms', width: (7 / len) * 100, color: PHASE_COLORS.pms },
  ]

  const markerPos = cycleInfo ? ((cycleInfo.cycleDay - 1) / len) * 100 : 0
  const pmsInDays = cycleInfo ? Math.max(0, pmsStart - cycleInfo.cycleDay) : null

  return (
    <div className="card card-glow-purple">
      <div className="cycle-header">
        <div className="card-title" style={{ marginBottom: 0 }}>{'\uD83C\uDF38'} Cycle Tracker</div>
        <button onClick={() => navigate('/settings')} style={{ color: 'var(--text-muted)', fontSize: 20 }}>
          {'\u2699\uFE0F'}
        </button>
      </div>

      {cycleInfo && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div className="cycle-day-number">{cycleInfo.cycleDay}</div>
              <div className="cycle-day-label">Day of Cycle</div>
            </div>
            <div className="cycle-phase-badge">
              <div className="cycle-phase-name" style={{ color: phaseColor(cycleInfo.phase) }}>
                {phaseLabel(cycleInfo.phase)}
              </div>
              <div className="cycle-phase-desc">{phaseDescriptions[cycleInfo.phase]}</div>
            </div>
          </div>

          <div className="cycle-timeline">
            {segments.map((seg) => (
              <div key={seg.phase} className="cycle-timeline-segment"
                style={{ width: `${Math.max(seg.width, 3)}%`, background: seg.color }} />
            ))}
            <div className="cycle-timeline-marker" style={{ left: `${markerPos}%` }} />
          </div>

          <div className="cycle-legend">
            {[
              { label: 'Period', color: PHASE_COLORS.menstrual },
              { label: 'Follicular', color: PHASE_COLORS.follicular },
              { label: 'Ovulation', color: PHASE_COLORS.ovulation },
              { label: 'Luteal', color: PHASE_COLORS.luteal },
              { label: 'PMS', color: PHASE_COLORS.pms },
            ].map((item) => (
              <div key={item.label} className="cycle-legend-item">
                <span className="cycle-legend-dot" style={{ background: item.color }} />
                <span style={{ color: item.color }}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="cycle-insight">
            <div className="cycle-insight-title">{'\uD83D\uDCA1'} Cycle Insight</div>
            <div className="cycle-insight-text">
              You're in your <strong>{phaseLabel(cycleInfo.phase).toLowerCase()} phase</strong>.
              {nextPeriodFormatted && <> Next period expected around {nextPeriodFormatted}.</>}
              {pmsInDays !== null && pmsInDays > 0 && <> PMS may begin in ~{pmsInDays} days.</>}
              {cycleInfo.isPMSWindow && <> <strong>You're in your PMS window - watch for headache triggers.</strong></>}
            </div>
          </div>
        </>
      )}

      <div className="cycle-actions">
        {ongoingPeriod ? (
          <button className="cycle-btn cycle-btn-end"
            onClick={() => endCyclePeriod(ongoingPeriod.id, toDateString(new Date()))}>
            {'\u26AA'} Period Ended
          </button>
        ) : (
          <>
            <button className="cycle-btn cycle-btn-start" onClick={() => addCyclePeriod(toDateString(new Date()))}>
              {'\uD83D\uDD34'} Period Started
            </button>
            <button className="cycle-btn cycle-btn-end" onClick={() => navigate('/settings')}>
              {'\u26AA'} Period Ended
            </button>
          </>
        )}
      </div>
    </div>
  )
}
