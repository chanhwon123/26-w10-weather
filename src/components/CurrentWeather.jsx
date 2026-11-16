import {
  Thermometer,
  Droplets,
  Wind,
  Activity,
  SunMedium,
  Moon,
} from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function CurrentWeather({
  city,
  current,
  lastUpdated,
  unit = 'C',
  onToggleUnit,
}) {
  if (!current) return null

  const weatherInfo = getWeatherInfo(current.weather_code)

  // 단위 변환: 섭씨(C) <-> 화씨(F)
  const formatTemp = (celsius) => {
    if (unit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`
    }
    return `${Math.round(celsius)}°C`
  }

  return (
    <article className="dashboard-card weather-card">
      <div className="card-header">
        <div>
          <div className="city-title-row">
            <h3 className="city-heading">{city.name}</h3>
            {current.is_day === 1 ? (
              <span className="day-night-badge day" title="낮 시간대">
                <SunMedium size={14} /> 낮
              </span>
            ) : (
              <span className="day-night-badge night" title="밤 시간대">
                <Moon size={14} /> 밤
              </span>
            )}
          </div>
          <span className="time-badge">{lastUpdated ? `${lastUpdated} 기준` : '실시간'}</span>
        </div>

        <div className="header-actions">
          {onToggleUnit && (
            <button
              type="button"
              className="unit-toggle-btn"
              onClick={onToggleUnit}
              title="온도 단위 전환 (°C / °F)"
            >
              단위: {unit === 'C' ? '°C' : '°F'}
            </button>
          )}
          <div
            className="weather-badge"
            style={{ backgroundColor: `${weatherInfo.color}22`, color: weatherInfo.color }}
          >
            {weatherInfo.label}
          </div>
        </div>
      </div>

      <div className="current-temp-wrap">
        <WeatherIcon
          name={weatherInfo.icon}
          size={72}
          color={weatherInfo.color}
          className="main-weather-icon"
        />
        <div className="temp-numbers">
          <span className="main-temp">{formatTemp(current.temperature_2m)}</span>
          <span className="apparent-temp">
            체감 {formatTemp(current.apparent_temperature)}
          </span>
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <Thermometer size={18} className="detail-icon" />
          <span className="detail-label">체감 기온</span>
          <span className="detail-value">{formatTemp(current.apparent_temperature)}</span>
        </div>
        <div className="detail-item">
          <Droplets size={18} className="detail-icon" />
          <span className="detail-label">상대 습도</span>
          <span className="detail-value">{current.relative_humidity_2m}%</span>
        </div>
        <div className="detail-item">
          <Wind size={18} className="detail-icon" />
          <span className="detail-label">풍속</span>
          <span className="detail-value">{current.wind_speed_10m} m/s</span>
        </div>
        <div className="detail-item">
          <Activity size={18} className="detail-icon" />
          <span className="detail-label">강수량</span>
          <span className="detail-value">{current.precipitation} mm</span>
        </div>
      </div>
    </article>
  )
}
