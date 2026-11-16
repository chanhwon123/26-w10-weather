import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
import CitySearch from './components/CitySearch'
import CitySelector from './components/CitySelector'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import { CloudSunRain, RefreshCw, AlertCircle } from 'lucide-react'
import './App.css'

const STORAGE_KEY_RECENT = 'w10_recent_cities'
const STORAGE_KEY_UNIT = 'w10_temp_unit'

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [lastUpdated, setLastUpdated] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 커스터마이징 1: 온도 단위 변환 토글 (°C / °F)
  const [tempUnit, setTempUnit] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_UNIT) || 'C'
  })

  // 커스터마이징 2: 최근 본 도시 저장 (localStorage 연동)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const toggleTempUnit = () => {
    setTempUnit((prev) => {
      const next = prev === 'C' ? 'F' : 'C'
      localStorage.setItem(STORAGE_KEY_UNIT, next)
      return next
    })
  }

  // 도시 선택 및 최근 본 도시 업데이트
  const handleSelectCity = useCallback((city) => {
    setSelectedCity(city)

    // 기본 프리셋에 없는 검색 도시일 때 최근 본 도시 목록에 추가 (최대 5개 유지)
    const isDefault = DEFAULT_CITIES.some((dc) => dc.name === city.name)
    if (!isDefault) {
      setRecentCities((prev) => {
        const filtered = prev.filter((c) => c.name !== city.name)
        const updated = [city, ...filtered].slice(0, 5)
        localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated))
        return updated
      })
    }
  }, [])

  const handleRemoveRecentCity = (cityName) => {
    setRecentCities((prev) => {
      const updated = prev.filter((c) => c.name !== cityName)
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated))
      return updated
    })
  }

  // 데이터 로딩 Effect
  useEffect(() => {
    let ignore = false

    async function loadAllData() {
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
          console.error('날씨 데이터 조회 에러:', err)
          setError('기상 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadAllData()

    return () => {
      ignore = true
    }
  }, [selectedCity])

  // 현재 날씨 코드에 따른 동적 배경 테마 클래스 산출
  const weatherCode = weatherData?.current?.weather_code
  const isDay = weatherData?.current?.is_day ?? 1
  let themeClass = isDay === 1 ? 'theme-day' : 'theme-night'
  if (weatherCode !== undefined) {
    if ([0, 1].includes(weatherCode)) themeClass += ' weather-clear'
    else if ([2, 3].includes(weatherCode)) themeClass += ' weather-cloudy'
    else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode))
      themeClass += ' weather-rainy'
    else if ([71, 73, 75, 77].includes(weatherCode)) themeClass += ' weather-snowy'
  }

  return (
    <div className={`weather-dashboard ${themeClass}`}>
      {/* 최상단 헤더 */}
      <header className="dashboard-header">
        <div className="header-brand">
          <CloudSunRain className="header-logo-icon" size={32} />
          <div>
            <h1 className="header-title">스마트 기상 & 대기질 대시보드</h1>
            <p className="header-subtitle">
              Open-Meteo 실시간 기상 관측 및 한국 환경부 대기질 모니터링
            </p>
          </div>
        </div>

        {/* 도시 검색 입력창 (400ms 디바운스) */}
        <div className="header-search-wrap">
          <CitySearch onSelectCity={handleSelectCity} />
        </div>
      </header>

      {/* 도시 선택 바 (프리셋 + 최근 검색 목록) */}
      <CitySelector
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        recentCities={recentCities}
        onRemoveRecentCity={handleRemoveRecentCity}
      />

      {/* 대시보드 메인 본문 */}
      <main className="dashboard-content">
        {loading && (
          <div className="status-container loading-container">
            <RefreshCw className="spinner-icon" size={40} />
            <p className="status-title">
              <strong>{selectedCity.name}</strong> 기상 데이터를 갱신하고 있습니다...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="status-container error-container">
            <AlertCircle className="error-icon" size={40} />
            <p className="status-title">{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => setSelectedCity({ ...selectedCity })}
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && weatherData && airQualityData && (
          <div className="dashboard-grid-layout">
            {/* 상단 2열: 현재 날씨 & 대기질 카드 */}
            <div className="top-cards-row">
              <CurrentWeather
                city={selectedCity}
                current={weatherData.current}
                lastUpdated={lastUpdated}
                unit={tempUnit}
                onToggleUnit={toggleTempUnit}
              />
              <AirQualityCard airQualityData={airQualityData} />
            </div>

            {/* 중단: 24시간 시간별 기온 차트 */}
            <HourlyChart
              hourly={weatherData.hourly}
              currentTime={weatherData.current?.time}
              unit={tempUnit}
            />

            {/* 하단: 7일간 주간 일기예보 */}
            <WeeklyForecast daily={weatherData.daily} unit={tempUnit} />
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>
            <strong>데이터 출처:</strong> Open-Meteo Weather & Air-Quality API (HTTPS 비인증 공개 API)
          </p>
          <p>
            <strong>사이버보안 체크포인트:</strong> 프론트엔드 통신 분리, 400ms 디바운스 DoS 방지, HTTPS 암호화 프로토콜 적용
          </p>
          <p className="footer-copy">© 2026 한국폴리텍대학 강서캠퍼스 사이버보안과 실습 과제</p>
        </div>
      </footer>
    </div>
  )
}
