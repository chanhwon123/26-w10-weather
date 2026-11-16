import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X, MapPin } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // 400ms 디바운스 검색 로직
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) return

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await searchCities(trimmed)
        setResults(data)
        setIsOpen(true)
      } catch (err) {
        console.error('검색 중 오류 발생:', err)
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  const handleQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length < 2) {
      setResults([])
      setSearching(false)
      setIsOpen(false)
    }
  }

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (city) => {
    const cityName = city.admin1
      ? `${city.name} (${city.admin1})`
      : `${city.name}, ${city.country || ''}`

    onSelectCity({
      name: cityName,
      lat: city.latitude,
      lon: city.longitude,
    })
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="city-search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="도시 이름 검색 (예: Seoul, Tokyo, London, Paris, 부산)..."
          value={query}
          onChange={handleQueryChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false)
          }}
        />
        {searching && <Loader2 className="search-spinner" size={18} />}
        {!searching && query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            aria-label="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <ul className="search-dropdown">
          {results.length === 0 ? (
            <li className="search-no-result">
              {searching ? '검색 중...' : '일치하는 도시를 찾을 수 없습니다.'}
            </li>
          ) : (
            results.map((city) => (
              <li
                key={`${city.id}-${city.latitude}-${city.longitude}`}
                className="search-result-item"
                onClick={() => handleSelect(city)}
              >
                <MapPin size={16} className="result-pin" />
                <div className="result-info">
                  <span className="result-name">{city.name}</span>
                  <span className="result-details">
                    {[city.admin1, city.country].filter(Boolean).join(', ')} ·{' '}
                    위도 {city.latitude.toFixed(2)}°, 경도 {city.longitude.toFixed(2)}°
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
