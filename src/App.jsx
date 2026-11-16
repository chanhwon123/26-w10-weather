import { useState, useEffect } from 'react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  AlertCircle,
  MapPin,
  Activity,
} from 'lucide-react'
import './App.css'

const ICON_MAP = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
}

function WeatherIcon({ name, size = 48, color = 'currentColor', className = '' }) {
  const IconComponent = ICON_MAP[name] || Cloud
  return <IconComponent size={size} color={color} className={IconComponent ? className : ''} />
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [lastUpdated, setLastUpdated] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async (city) => {
    setLoading(true)
    setError(null)
    try {
      const [weather, airQuality] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ])
      setWeatherData(weather)
      setAirQualityData(airQuality)
      setLastUpdated(
        new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      )
    } catch (err) {
      console.error(err)
      setError('기상 정보를 불러오는 데 실패했습니다. 네트워크 상태를 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [weather, airQuality] = await Promise.all([
          fetchWeatherData(selectedCity.lat, selectedCity.lon),
          fetchAirQualityData(selectedCity.lat, selectedCity.lon),
        ])
        if (!ignore) {
          setWeatherData(weather)
          setAirQualityData(airQuality)
          setLastUpdated(
            new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })
          )
        }
      } catch (err) {
        if (!ignore) {
          console.error(err)
          setError('기상 정보를 불러오는 데 실패했습니다. 네트워크 상태를 확인해 주세요.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [selectedCity])

  const currentWeather = weatherData?.current
  const currentAir = airQualityData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const airQuality = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null

  return (
    <div className="weather-dashboard">
      {/* 헤더 */}
      <header className="dashboard-header">
        <div className="header-title-wrap">
          <MapPin className="header-icon" size={28} />
          <h1>실시간 날씨 & 미세먼지 대시보드</h1>
        </div>
        <p className="header-subtitle">Open-Meteo 실시간 기상 관측 데이터</p>
      </header>

      {/* 1. 주요 도시 빠른 선택 버튼 목록 */}
      <section className="city-selector-section">
        <h2 className="section-title">주요 도시 바로가기</h2>
        <div className="city-btn-group">
          {DEFAULT_CITIES.map((city) => {
            const isActive = selectedCity.name === city.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                {city.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* 상태별 콘텐츠 렌더링 (로딩 / 에러 / 데이터 카드) */}
      <main className="dashboard-content">
        {loading && (
          <div className="status-container loading-container">
            <RefreshCw className="spinner-icon" size={36} />
            <p><strong>{selectedCity.name}</strong>의 최신 기상 데이터를 조회하고 있습니다...</p>
          </div>
        )}

        {error && !loading && (
          <div className="status-container error-container">
            <AlertCircle className="error-icon" size={36} />
            <p>{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => loadData(selectedCity)}
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && currentWeather && currentAir && (
          <div className="cards-grid">
            {/* 2. 현재 날씨 카드 */}
            <article className="dashboard-card weather-card">
              <div className="card-header">
                <div>
                  <h3 className="city-heading">{selectedCity.name}</h3>
                  <span className="time-badge">
                    {lastUpdated ? `${lastUpdated} 기준` : '최신 데이터'}
                  </span>
                </div>
                <div
                  className="weather-badge"
                  style={{ backgroundColor: `${weatherInfo.color}22`, color: weatherInfo.color }}
                >
                  {weatherInfo.label}
                </div>
              </div>

              <div className="current-temp-wrap">
                <WeatherIcon
                  name={weatherInfo.icon}
                  size={64}
                  color={weatherInfo.color}
                />
                <div className="temp-numbers">
                  <span className="main-temp">{Math.round(currentWeather.temperature_2m)}°C</span>
                  <span className="apparent-temp">
                    체감 {Math.round(currentWeather.apparent_temperature)}°C
                  </span>
                </div>
              </div>

              <div className="weather-details-grid">
                <div className="detail-item">
                  <Thermometer size={18} className="detail-icon" />
                  <span className="detail-label">체감 기온</span>
                  <span className="detail-value">{currentWeather.apparent_temperature}°C</span>
                </div>
                <div className="detail-item">
                  <Droplets size={18} className="detail-icon" />
                  <span className="detail-label">상대 습도</span>
                  <span className="detail-value">{currentWeather.relative_humidity_2m}%</span>
                </div>
                <div className="detail-item">
                  <Wind size={18} className="detail-icon" />
                  <span className="detail-label">풍속</span>
                  <span className="detail-value">{currentWeather.wind_speed_10m} m/s</span>
                </div>
                <div className="detail-item">
                  <Activity size={18} className="detail-icon" />
                  <span className="detail-label">강수량</span>
                  <span className="detail-value">{currentWeather.precipitation} mm</span>
                </div>
              </div>
            </article>

            {/* 3. 미세먼지 카드 */}
            <article className="dashboard-card air-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">통합 대기질 지수</h3>
                  <p className="card-desc">한국 환경부 기준 4단계</p>
                </div>
                <div
                  className="air-status-badge"
                  style={{ backgroundColor: airQuality.badgeColor }}
                >
                  {airQuality.status}
                </div>
              </div>

              <div className="air-metrics-container">
                <div className="air-metric-box">
                  <div className="metric-header">
                    <span className="metric-name">미세먼지 (PM10)</span>
                    <span className="metric-unit">μg/m³</span>
                  </div>
                  <div className="metric-val-row">
                    <span className="metric-value">{Math.round(currentAir.pm10)}</span>
                    <span
                      className="metric-grade"
                      style={{
                        color:
                          currentAir.pm10 <= 30
                            ? '#10b981'
                            : currentAir.pm10 <= 80
                            ? '#3b82f6'
                            : currentAir.pm10 <= 150
                            ? '#f97316'
                            : '#ef4444',
                      }}
                    >
                      {currentAir.pm10 <= 30
                        ? '좋음'
                        : currentAir.pm10 <= 80
                        ? '보통'
                        : currentAir.pm10 <= 150
                        ? '나쁨'
                        : '매우 나쁨'}
                    </span>
                  </div>
                  <div className="gauge-bar">
                    <div
                      className="gauge-fill"
                      style={{
                        width: `${Math.min(100, (currentAir.pm10 / 150) * 100)}%`,
                        backgroundColor: airQuality.badgeColor,
                      }}
                    />
                  </div>
                </div>

                <div className="air-metric-box">
                  <div className="metric-header">
                    <span className="metric-name">초미세먼지 (PM2.5)</span>
                    <span className="metric-unit">μg/m³</span>
                  </div>
                  <div className="metric-val-row">
                    <span className="metric-value">{Math.round(currentAir.pm2_5)}</span>
                    <span
                      className="metric-grade"
                      style={{
                        color:
                          currentAir.pm2_5 <= 15
                            ? '#10b981'
                            : currentAir.pm2_5 <= 35
                            ? '#3b82f6'
                            : currentAir.pm2_5 <= 75
                            ? '#f97316'
                            : '#ef4444',
                      }}
                    >
                      {currentAir.pm2_5 <= 15
                        ? '좋음'
                        : currentAir.pm2_5 <= 35
                        ? '보통'
                        : currentAir.pm2_5 <= 75
                        ? '나쁨'
                        : '매우 나쁨'}
                    </span>
                  </div>
                  <div className="gauge-bar">
                    <div
                      className="gauge-fill"
                      style={{
                        width: `${Math.min(100, (currentAir.pm2_5 / 75) * 100)}%`,
                        backgroundColor: airQuality.badgeColor,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="air-guide-msg">
                {airQuality.status === '좋음' && '🌿 대기 상태가 매우 깨끗합니다. 환기와 야외 활동을 즐기기에 좋습니다.'}
                {airQuality.status === '보통' && '🌤️ 무난한 대기질입니다. 일상적인 야외 활동에 지장이 없습니다.'}
                {airQuality.status === '나쁨' && '😷 미세먼지가 다소 높습니다. 마스크 착용을 권장하며 환기를 자제하세요.'}
                {airQuality.status === '매우 나쁨' && '🚨 대기질이 매우 나쁩니다. 노약자는 야외 활동을 자제하고 외출 시 KF94 마스크를 착용하세요.'}
              </div>
            </article>
          </div>
        )}
      </main>

      <footer className="dashboard-footer">
        <p>기상청 데이터 출처: Open-Meteo API (WMO 기상 데이터 및 대기질 모델)</p>
        <p>© 2026 실시간 기상 대시보드. All rights reserved.</p>
      </footer>
    </div>
  )
}
