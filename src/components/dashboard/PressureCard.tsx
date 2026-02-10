import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { hpaToInhg, trendLabel, trendArrow } from '../../utils/pressureUtils'

type TimeRange = '8h' | '24h' | '3d' | '7d'

export default function PressureCard() {
  const { pressure, pressureLoading, settings } = useApp()
  const [range, setRange] = useState<TimeRange>('8h')

  const bars = useMemo(() => {
    if (!pressure) return []
    const now = Date.now()
    const rangeMs: Record<TimeRange, number> = {
      '8h': 8 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    }
    const stepCount: Record<TimeRange, number> = { '8h': 9, '24h': 9, '3d': 7, '7d': 7 }
    const ms = rangeMs[range]
    const steps = stepCount[range]
    const start = now - ms

    const filtered = pressure.hourly.filter((s) => s.timestamp >= start && s.timestamp <= now + ms * 0.3)
    if (filtered.length === 0) return []

    const interval = (now - start) / (steps - 1)
    const result = []

    for (let i = 0; i < steps; i++) {
      const targetTime = start + interval * i
      let closest = filtered[0]
      let minDist = Math.abs(filtered[0].timestamp - targetTime)
      for (const s of filtered) {
        const dist = Math.abs(s.timestamp - targetTime)
        if (dist < minDist) { closest = s; minDist = dist }
      }
      const isCurrent = Math.abs(targetTime - now) < interval * 0.6
      const d = new Date(targetTime)
      let label: string
      if (range === '3d' || range === '7d') {
        label = d.toLocaleDateString('en-US', { weekday: 'short' })
      } else {
        label = d.toLocaleTimeString('en-US', { hour: 'numeric' })
      }
      if (isCurrent && (range === '8h' || range === '24h')) label = 'Now'

      result.push({ inhg: hpaToInhg(closest.pressure), label, isCurrent })
    }
    return result
  }, [pressure, range])

  if (!settings.latitude) {
    return (
      <div className="card card-glow-cyan">
        <div className="empty-state">
          <p>Set your location in Settings to see pressure data</p>
        </div>
      </div>
    )
  }

  if (pressureLoading && !pressure) {
    return (
      <div className="card card-glow-cyan">
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Loading pressure...</p>
      </div>
    )
  }

  if (!pressure) return null

  const currentInhg = hpaToInhg(pressure.current)
  const minVal = bars.length > 0 ? Math.min(...bars.map((b) => b.inhg)) : currentInhg - 0.1
  const maxVal = bars.length > 0 ? Math.max(...bars.map((b) => b.inhg)) : currentInhg + 0.1
  const barRange = Math.max(maxVal - minVal, 0.05)

  return (
    <div className="card card-glow-cyan">
      <div className="pressure-hero">
        <span className="pressure-value">{currentInhg.toFixed(2)}</span>
        <span className="pressure-unit">inHg</span>
        <span className="pressure-trend-label">
          <span className="pressure-trend-arrow">{trendArrow(pressure.trend)}</span>
          {trendLabel(pressure.trend)}
        </span>
      </div>

      <div className="time-tabs">
        {(['8h', '24h', '3d', '7d'] as TimeRange[]).map((t) => (
          <button key={t} className={`time-tab ${range === t ? 'active' : ''}`} onClick={() => setRange(t)}>
            {t === '8h' ? '8 Hours' : t === '24h' ? '24 Hours' : t === '3d' ? '3 Days' : '7 Days'}
          </button>
        ))}
      </div>

      {bars.length > 0 && (
        <div className="pressure-bars">
          {bars.map((bar, i) => {
            const height = Math.max(((bar.inhg - minVal) / barRange) * 60 + 10, 10)
            return (
              <div key={i} className="pressure-bar-item">
                <span className="pressure-bar-value">{bar.inhg.toFixed(2)}</span>
                <div className={`pressure-bar ${bar.isCurrent ? 'current' : ''}`} style={{ height }} />
                <span className={`pressure-bar-time ${bar.isCurrent ? 'current' : ''}`}>{bar.label}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="pressure-footer">
        <span>{'\uD83D\uDCCD'} {settings.locationName || 'Unknown'}</span>
        <span>{'\uD83D\uDD04'} {new Date(pressure.fetchedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
      </div>
    </div>
  )
}
