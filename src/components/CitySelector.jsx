import { MapPin, History, X } from 'lucide-react'
import { DEFAULT_CITIES } from '../api/weather'

export default function CitySelector({
  selectedCity,
  onSelectCity,
  recentCities = [],
  onRemoveRecentCity,
  onClearRecentCities,
}) {
  return (
    <div className="city-selector-section">
      <div className="selector-group">
        <div className="group-header">
          <MapPin size={16} className="group-icon" />
          <h2 className="section-title">주요 도시 바로가기</h2>
        </div>
        <div className="city-btn-group">
          {DEFAULT_CITIES.map((city) => {
            const isActive = selectedCity.name === city.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCity(city)}
              >
                {city.name}
              </button>
            )
          })}
        </div>
      </div>

      {recentCities.length > 0 && (
        <div className="selector-group recent-group">
          <div className="group-header">
            <History size={16} className="group-icon" />
            <h2 className="section-title">최근 본 도시</h2>
            {onClearRecentCities && (
              <button
                type="button"
                className="recent-clear-all-btn"
                onClick={onClearRecentCities}
                title="최근 검색 기록 전체 삭제"
              >
                전체 삭제
              </button>
            )}
          </div>
          <div className="city-btn-group">
            {recentCities.map((city) => {
              const isActive = selectedCity.name === city.name
              return (
                <div key={`${city.name}-${city.lat}`} className="recent-city-pill-wrap">
                  <button
                    type="button"
                    className={`city-btn recent-btn ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectCity(city)}
                  >
                    {city.name}
                  </button>
                  {onRemoveRecentCity && (
                    <button
                      type="button"
                      className="recent-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveRecentCity(city.name)
                      }}
                      title="목록에서 삭제"
                      aria-label={`${city.name} 삭제`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
