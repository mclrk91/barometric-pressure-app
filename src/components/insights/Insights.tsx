import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import { useHeadachePatterns } from '../../hooks/useHeadachePatterns'
import { phaseLabel, phaseColor } from '../../services/cycleCalculations'
import type { CyclePhase } from '../../types'

export default function Insights() {
  const { headaches, pressure } = useApp()
  const patterns = useHeadachePatterns(headaches, pressure)
  const [tab, setTab] = useState<'overview' | 'pressure' | 'cycle'>('overview')

  if (headaches.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">&#128202;</div>
          <p>Log some headaches first to see patterns and insights</p>
        </div>
      </div>
    )
  }

  const phases: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal']
  const phaseData = phases.map((p) => ({
    name: phaseLabel(p),
    count: patterns.headachesByPhase[p].count,
    avgSeverity: Number(patterns.headachesByPhase[p].avgSeverity.toFixed(1)),
    fill: phaseColor(p),
  }))

  return (
    <>
      <div className="tabs">
        <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button className={`tab ${tab === 'pressure' ? 'active' : ''}`} onClick={() => setTab('pressure')}>
          Pressure
        </button>
        <button className={`tab ${tab === 'cycle' ? 'active' : ''}`} onClick={() => setTab('cycle')}>
          Cycle
        </button>
      </div>

      {tab === 'overview' && (
        <>
          <div className="card">
            <div className="card-title">Summary</div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{patterns.totalHeadaches}</div>
                <div className="stat-label">Total headaches</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{patterns.last30Days}</div>
                <div className="stat-label">Last 30 days</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{patterns.avgSeverity.toFixed(1)}</div>
                <div className="stat-label">Avg severity</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {patterns.mostCommonPhase ? phaseLabel(patterns.mostCommonPhase) : '-'}
                </div>
                <div className="stat-label">Most common phase</div>
              </div>
            </div>
          </div>

          {patterns.weeklyFrequency.length > 1 && (
            <div className="card">
              <div className="card-title">Weekly Frequency</div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patterns.weeklyFrequency}>
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'pressure' && (
        <>
          <div className="card">
            <div className="card-title">Pressure Correlation</div>
            {patterns.pressureDropCorrelation > 0 ? (
              <p style={{ fontSize: 14 }}>
                <strong>{patterns.pressureDropCorrelation.toFixed(0)}%</strong> of your headaches
                occurred during low pressure conditions (&lt;1010 hPa).
              </p>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                Not enough data with pressure readings yet. Keep logging!
              </p>
            )}
          </div>

          {pressure && (
            <div className="card">
              <div className="card-title">48h Pressure Forecast</div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pressure.hourly.map((s) => ({
                    time: new Date(s.timestamp).toLocaleTimeString('en-US', { hour: 'numeric' }),
                    pressure: s.pressure,
                  }))}>
                    <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={5} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} width={40} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="pressure"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'cycle' && (
        <>
          <div className="card">
            <div className="card-title">Headaches by Cycle Phase</div>
            {phaseData.some((d) => d.count > 0) ? (
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={phaseData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {phaseData.map((entry, i) => (
                        <rect key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                Log periods in the Cycle tab to see phase correlations.
              </p>
            )}
          </div>

          <div className="card">
            <div className="card-title">Average Severity by Phase</div>
            <div className="stats-grid">
              {phaseData.map((d) => (
                <div key={d.name} className="stat-item">
                  <div className="stat-value" style={{ color: d.fill }}>
                    {d.count > 0 ? d.avgSeverity : '-'}
                  </div>
                  <div className="stat-label">{d.name}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
