import { useApp } from '../../context/AppContext'
import { weatherCodeToInfo } from '../../utils/weatherUtils'

export default function WeatherForecast() {
  const { weather } = useApp()

  if (!weather) return null

  const currentInfo = weatherCodeToInfo(weather.current.weatherCode)
  const rainyDay = weather.daily.find((d, i) => i > 0 && d.precipProbability > 30)

  return (
    <>
      <div className="card">
        <div className="card-title">{'\u26C5'} Weather Forecast</div>

        <div className="weather-hero">
          <div style={{ textAlign: 'center' }}>
            <div className="weather-temp">{weather.current.temperature}&deg;</div>
            <div className="weather-temp-label">Now</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="weather-condition-icon">{currentInfo.icon}</div>
            <div className="weather-condition-text">{currentInfo.description}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="weather-humidity">{weather.current.humidity}%</div>
            <div className="weather-temp-label">Humidity</div>
          </div>
        </div>

        <div className="daily-forecast">
          {weather.daily.slice(0, 6).map((day) => {
            const info = weatherCodeToInfo(day.weatherCode)
            return (
              <div key={day.date} className="daily-item">
                <div className="daily-day">{day.dayName}</div>
                <div className="daily-icon">{info.icon}</div>
                <div className="daily-temps">{day.tempMax}&deg;/{day.tempMin}&deg;</div>
                {day.precipProbability > 5 && (
                  <div className="daily-rain">{'\uD83D\uDCA7'}{day.precipProbability}%</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {rainyDay && (
        <div className="rain-alert">
          <div className="rain-alert-title">{'\uD83C\uDF27\uFE0F'} Rain in the Forecast</div>
          <div className="rain-alert-text">
            Rain expected {rainyDay.dayName} ({rainyDay.precipProbability}% chance).
            Pressure may drop before the rain arrives - watch for headache triggers.
          </div>
        </div>
      )}
    </>
  )
}
