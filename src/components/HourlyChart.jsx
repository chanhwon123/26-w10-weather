import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function HourlyChart({ hourly, currentTime = '', unit = 'C' }) {
  const chartData = useMemo(() => {
    if (!hourly || !hourly.time || !hourly.temperature_2m) return null

    // 기준 시간 인덱스 찾기 (current.time 또는 앞부분 24개 항목)
    const currentHourStr = currentTime ? currentTime.slice(0, 13) : ''
    let startIndex = currentHourStr
      ? hourly.time.findIndex((t) => t.startsWith(currentHourStr))
      : 0
    if (startIndex === -1) startIndex = 0

    // 24시간 데이터 슬라이스
    const sliceCount = 24
    const times = hourly.time.slice(startIndex, startIndex + sliceCount)
    const temps = hourly.temperature_2m.slice(startIndex, startIndex + sliceCount)
    const codes = hourly.weather_code.slice(startIndex, startIndex + sliceCount)

    if (temps.length === 0) return null

    // 온도 변환 함수
    const convertTemp = (c) => (unit === 'F' ? Math.round((c * 9) / 5 + 32) : Math.round(c))
    const displayTemps = temps.map(convertTemp)

    const minTemp = Math.min(...displayTemps)
    const maxTemp = Math.max(...displayTemps)
    const tempRange = Math.max(1, maxTemp - minTemp)

    // SVG 차트 좌표 계산 (가로 720, 세로 160)
    const width = 720
    const height = 160
    const padX = 30
    const padTop = 30
    const padBottom = 35
    const chartHeight = height - padTop - padBottom

    const points = displayTemps.map((temp, i) => {
      const x = padX + (i / (displayTemps.length - 1)) * (width - padX * 2)
      const y = padTop + chartHeight - ((temp - minTemp) / tempRange) * chartHeight
      return { x, y, temp, time: times[i], code: codes[i] }
    })

    const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    const areaPoints = `${points[0].x.toFixed(1)},${height - padBottom} ${polylinePoints} ${points[points.length - 1].x.toFixed(1)},${height - padBottom}`

    return {
      minTemp,
      maxTemp,
      width,
      height,
      points,
      polylinePoints,
      areaPoints,
    }
  }, [hourly, currentTime, unit])

  if (!chartData) return null

  const { minTemp, maxTemp, width, height, points, polylinePoints, areaPoints } = chartData

  return (
    <article className="dashboard-card hourly-card">
      <div className="card-header">
        <div className="city-title-row">
          <Clock size={20} className="card-icon" />
          <h3 className="card-title">24시간 시간별 기온 예보</h3>
        </div>
        <div className="hourly-summary-badge">
          최저 <strong className="min-accent">{minTemp}°</strong> / 최고{' '}
          <strong className="max-accent">{maxTemp}°</strong>
        </div>
      </div>

      <div className="chart-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="hourly-svg-chart"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 그라데이션 영역 */}
          <polygon points={areaPoints} fill="url(#chartGradient)" />

          {/* 꺾은선 */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* 포인트 & 기온 라벨 */}
          {points.map((p, idx) => {
            const isMin = p.temp === minTemp
            const isMax = p.temp === maxTemp
            // 3시간 간격이거나 최고/최저점일 때 라벨 표시
            const showLabel = idx % 3 === 0 || isMin || isMax

            return (
              <g key={`point-${p.time}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isMin || isMax ? 5 : 3.5}
                  fill={isMax ? '#ef4444' : isMin ? '#0ea5e9' : '#3b82f6'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {showLabel && (
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className={`chart-temp-text ${isMax ? 'temp-max' : isMin ? 'temp-min' : ''}`}
                    fontSize="11"
                    fontWeight="700"
                    fill="currentColor"
                  >
                    {p.temp}°
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* 하단 시간별 아이콘 및 시각 스크롤 리스트 */}
        <div className="hourly-ticks-container">
          {points.map((p, idx) => {
            if (idx % 2 !== 0 && idx !== points.length - 1) return null
            const hour = parseInt(p.time.slice(11, 13), 10)
            const timeLabel = idx === 0 ? '지금' : `${hour}시`
            const info = getWeatherInfo(p.code)

            return (
              <div key={`tick-${p.time}`} className="hourly-tick-item">
                <span className="tick-time">{timeLabel}</span>
                <WeatherIcon name={info.icon} size={18} color={info.color} />
                <span className="tick-temp">{p.temp}°</span>
              </div>
            )
          })}
        </div>
      </div>
    </article>
  )
}
