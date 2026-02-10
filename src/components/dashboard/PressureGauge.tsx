import { useApp } from '../../context/AppContext'
import { pressureToGaugeAngle, pressureLevel } from '../../utils/pressureUtils'

export default function PressureGauge() {
  const { pressure } = useApp()

  if (!pressure) return null

  const angle = pressureToGaugeAngle(pressure.current)
  const level = pressureLevel(pressure.current)

  // SVG gauge: semicircle from 180 to 0 degrees (left to right)
  const cx = 140
  const cy = 130
  const r = 110

  // Create arc segments: green (low-normal), yellow-green (normal), orange, red (high)
  function arcPath(startAngle: number, endAngle: number): string {
    const s1 = (Math.PI * (180 - startAngle)) / 180
    const s2 = (Math.PI * (180 - endAngle)) / 180
    const x1 = cx + r * Math.cos(s1)
    const y1 = cy - r * Math.sin(s1)
    const x2 = cx + r * Math.cos(s2)
    const y2 = cy - r * Math.sin(s2)
    const largeArc = endAngle - startAngle > 90 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  // Needle position
  const needleAngle = (Math.PI * (180 - angle)) / 180
  const needleX = cx + (r - 20) * Math.cos(needleAngle)
  const needleY = cy - (r - 20) * Math.sin(needleAngle)

  const levelColors: Record<string, string> = {
    low: 'var(--text-muted)',
    normal: 'var(--green)',
    high: 'var(--text-muted)',
  }

  return (
    <div className="card card-glow-teal">
      <div className="gauge-container">
        <svg width="280" height="160" viewBox="0 0 280 160">
          {/* Background arcs */}
          <path d={arcPath(0, 36)} stroke="#2ecc71" strokeWidth="20" fill="none" strokeLinecap="round" />
          <path d={arcPath(36, 72)} stroke="#82e0aa" strokeWidth="20" fill="none" />
          <path d={arcPath(72, 108)} stroke="#f1c40f" strokeWidth="20" fill="none" />
          <path d={arcPath(108, 144)} stroke="#e67e22" strokeWidth="20" fill="none" />
          <path d={arcPath(144, 180)} stroke="#e74c3c" strokeWidth="20" fill="none" strokeLinecap="round" />

          {/* Needle */}
          <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#e0e6f0" strokeWidth="3" />
          <circle cx={cx} cy={cy} r="8" fill="#1a2044" stroke="var(--cyan)" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="4" fill="var(--cyan)" />
        </svg>

        <div className="gauge-labels">
          <span className="gauge-label-low">LOW</span>
          <span className="gauge-label-normal" style={{ color: levelColors[level] }}>
            {level.toUpperCase()}
          </span>
          <span className="gauge-label-high">HIGH</span>
        </div>
      </div>
    </div>
  )
}
