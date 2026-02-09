import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { useApp } from '../../context/AppContext'
import { trendIcon, trendColor } from '../../utils/pressureUtils'

export default function PressureCard() {
  const { pressure, pressureLoading, settings } = useApp()

  if (!settings.latitude) {
    return (
      <div className="card">
        <div className="card-title">Barometric Pressure</div>
        <div className="empty-state">
          <p>Set your location in Settings to see pressure data</p>
        </div>
      </div>
    )
  }

  if (pressureLoading && !pressure) {
    return (
      <div className="card">
        <div className="card-title">Barometric Pressure</div>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    )
  }

  if (!pressure) {
    return (
      <div className="card">
        <div className="card-title">Barometric Pressure</div>
        <p style={{ color: 'var(--color-text-muted)' }}>Unable to load pressure data</p>
      </div>
    )
  }

  const now = Date.now()
  const last24h = pressure.hourly.filter(
    (s) => s.timestamp >= now - 24 * 60 * 60 * 1000 && s.timestamp <= now
  )
  const chartData = last24h.map((s) => ({ p: s.pressure }))

  return (
    <div className="card">
      <div className="card-title">Barometric Pressure</div>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span className="pressure-value">{Math.round(pressure.current)}</span>
        <span className="pressure-unit"> hPa</span>
        <span className="pressure-trend" style={{ color: trendColor(pressure.trend) }}>
          {trendIcon(pressure.trend)}
        </span>
      </div>
      {chartData.length > 2 && (
        <div style={{ height: 60, marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <Area
                type="monotone"
                dataKey="p"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.1}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
