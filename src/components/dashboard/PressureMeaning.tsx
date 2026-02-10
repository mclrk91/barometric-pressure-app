import { useApp } from '../../context/AppContext'
import { hpaToInhg, pressureLevel, getForecastDrop } from '../../utils/pressureUtils'

export default function PressureMeaning() {
  const { pressure, settings } = useApp()

  if (!pressure) return null

  const inhg = hpaToInhg(pressure.current)
  const level = pressureLevel(pressure.current)
  const trend = pressure.trend
  const drop = getForecastDrop(pressure.hourly, pressure.current)

  const levelWord = level === 'normal' ? 'normal range' : level === 'low' ? 'low range' : 'high range'
  const trendWord = trend === 'stable' ? 'holding steady' : trend === 'rising' ? 'rising' : 'falling'

  let riskText: string
  let riskEmoji: string
  if (level === 'normal' && trend === 'stable') {
    riskText = 'Stable pressure is generally easiest on the system. Good conditions for pressure-sensitive individuals.'
    riskEmoji = '\u2705'
  } else if (trend === 'falling' || level === 'low') {
    riskText = 'Dropping or low pressure can trigger headaches in sensitive individuals. Consider preventive measures.'
    riskEmoji = '\u26A0\uFE0F'
  } else if (trend === 'rising') {
    riskText = 'Rising pressure is usually well-tolerated, though rapid changes can sometimes be a trigger.'
    riskEmoji = '\u2705'
  } else {
    riskText = 'Current conditions are moderate. Monitor for any changes.'
    riskEmoji = '\u2705'
  }

  const significantDrop = drop.maxDropNext24h > settings.pressureThreshold
  let forecastText: string
  if (significantDrop) {
    forecastText = `\u26A0\uFE0F Pressure drop of ${drop.maxDropNext24h.toFixed(1)} hPa expected in the next ${drop.dropStartsIn}h. Watch for headache triggers.`
  } else {
    forecastText = '\u2705 No significant pressure changes expected in the next 7 days. Looking good!'
  }

  return (
    <div className="card card-glow-teal">
      <div className="card-title">{'\uD83E\uDDE0'} What This Means For You</div>

      <p style={{ fontSize: 15, lineHeight: 1.6 }}>
        The pressure is in the <span className="meaning-highlight">{levelWord}</span> at{' '}
        {inhg.toFixed(2)} inHg. It's been <span className="meaning-highlight">{trendWord}</span>{' '}
        over the last few hours.
      </p>

      <div className="meaning-risk">
        <strong>{riskEmoji} {trend === 'falling' || level === 'low' ? 'Higher risk:' : 'Lower risk:'}</strong>{' '}
        {riskText}
      </div>

      <div className="meaning-forecast-box" style={significantDrop ? {
        background: 'rgba(241, 196, 15, 0.1)',
        borderColor: 'rgba(241, 196, 15, 0.3)',
        color: 'var(--yellow)',
      } : undefined}>
        {forecastText}
      </div>
    </div>
  )
}
