import { useMemo } from 'react'
import { CalendarDays, Umbrella } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function WeeklyForecast({ daily, unit = 'C' }) {
  const forecastDays = useMemo(() => {
    if (!daily || !daily.time || !daily.weather_code) return []

    // 온도 변환 함수
    const convertTemp = (c) => (unit === 'F' ? Math.round((c * 9) / 5 + 32) : Math.round(c))

    // 전체 기간의 최저/최고 온도 (막대 비율 계산용)
    const allMins = daily.temperature_2m_min.map(convertTemp)
    const allMaxs = daily.temperature_2m_max.map(convertTemp)
    const globalMin = Math.min(...allMins)
    const globalMax = Math.max(...allMaxs)
    const globalRange = Math.max(1, globalMax - globalMin)

    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']

    return daily.time.slice(0, 7).map((dateStr, idx) => {
      const dateObj = new Date(dateStr)
      const dayOfWeek = daysOfWeek[dateObj.getDay()]
      const month = dateObj.getMonth() + 1
      const day = dateObj.getDate()

      let dayLabel = `${dayOfWeek}요일`
      if (idx === 0) dayLabel = '오늘'
      else if (idx === 1) dayLabel = '내일'

      const min = allMins[idx]
      const max = allMaxs[idx]
      const code = daily.weather_code[idx]
      const precipProb = daily.precipitation_probability_max
        ? daily.precipitation_probability_max[idx]
        : 0
      const info = getWeatherInfo(code)

      // 가로 막대 위치 및 너비 백분율
      const barLeft = ((min - globalMin) / globalRange) * 100
      const barWidth = Math.max(8, ((max - min) / globalRange) * 100)

      return {
        dateStr,
        dayLabel,
        dateFormatted: `${month}.${day}`,
        min,
        max,
        precipProb,
        info,
        barLeft,
        barWidth,
      }
    })
  }, [daily, unit])

  if (!daily || forecastDays.length === 0) return null

  return (
    <article className="dashboard-card weekly-card">
      <div className="card-header">
        <div className="city-title-row">
          <CalendarDays size={20} className="card-icon" />
          <h3 className="card-title">7일간 주간 일기예보</h3>
        </div>
        <span className="card-desc">향후 1주일 기온 및 날씨 전망</span>
      </div>

      <div className="weekly-forecast-list">
        {forecastDays.map((day) => (
          <div key={day.dateStr} className="weekly-row">
            <div className="day-col">
              <span className="day-name">{day.dayLabel}</span>
              <span className="day-date">{day.dateFormatted}</span>
            </div>

            <div className="weather-icon-col">
              <WeatherIcon name={day.info.icon} size={24} color={day.info.color} />
              <span className="weather-condition-text">{day.info.label}</span>
            </div>

            <div className="precip-col">
              {day.precipProb > 0 ? (
                <span className="precip-badge" title={`강수 확률 ${day.precipProb}%`}>
                  <Umbrella size={14} /> {day.precipProb}%
                </span>
              ) : (
                <span className="precip-none">-</span>
              )}
            </div>

            <div className="temp-bar-col">
              <span className="temp-min-text">{day.min}°</span>
              <div className="temp-range-track">
                <div
                  className="temp-range-fill"
                  style={{
                    left: `${day.barLeft}%`,
                    width: `${day.barWidth}%`,
                  }}
                />
              </div>
              <span className="temp-max-text">{day.max}°</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
