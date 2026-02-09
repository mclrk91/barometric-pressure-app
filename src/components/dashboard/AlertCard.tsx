import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useCyclePhase } from '../../hooks/useCyclePhase'
import { getForecastDrop } from '../../utils/pressureUtils'
import type { Alert } from '../../types'

export default function AlertCard() {
  const { cycles, settings, pressure } = useApp()
  const cycleInfo = useCyclePhase(cycles, settings.averageCycleLength, settings.averagePeriodLength)

  const alerts = useMemo((): Alert[] => {
    const result: Alert[] = []
    const isPMS = cycleInfo?.isPMSWindow ?? false

    let dropInfo = { maxDropNext24h: 0, dropStartsIn: 0 }
    if (pressure) {
      dropInfo = getForecastDrop(pressure.hourly, pressure.current)
    }

    const significantDrop = dropInfo.maxDropNext24h > settings.pressureThreshold

    if (isPMS && significantDrop) {
      result.push({
        level: 'high',
        message: `High risk: PMS window + ${dropInfo.maxDropNext24h.toFixed(1)} hPa pressure drop expected in ${dropInfo.dropStartsIn}h`,
      })
    } else if (isPMS) {
      result.push({
        level: 'medium',
        message: `PMS window (day ${cycleInfo!.cycleDay}). Monitor for headache triggers.`,
      })
    } else if (significantDrop) {
      result.push({
        level: 'medium',
        message: `Pressure dropping ${dropInfo.maxDropNext24h.toFixed(1)} hPa in next ${dropInfo.dropStartsIn}h`,
      })
    }

    if (cycleInfo && cycleInfo.daysUntilNextPeriod <= 3 && cycleInfo.daysUntilNextPeriod > 0) {
      result.push({
        level: 'medium',
        message: `Period expected in ~${cycleInfo.daysUntilNextPeriod} days`,
      })
    }

    return result
  }, [cycleInfo, pressure, settings.pressureThreshold])

  if (alerts.length === 0) {
    return (
      <div className="alert alert-low">
        No active warnings - low headache risk right now
      </div>
    )
  }

  return (
    <>
      {alerts.map((alert, i) => (
        <div key={i} className={`alert alert-${alert.level}`}>
          {alert.message}
        </div>
      ))}
    </>
  )
}
