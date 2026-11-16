import { ShieldCheck, Info } from 'lucide-react'
import { getAirQualityStatus } from '../api/weather'

export default function AirQualityCard({ airQualityData }) {
  if (!airQualityData || !airQualityData.current) return null

  const currentAir = airQualityData.current
  const pm10 = Math.round(currentAir.pm10 || 0)
  const pm25 = Math.round(currentAir.pm2_5 || 0)
  const airStatus = getAirQualityStatus(pm10, pm25)

  // PM10 (0~150+), PM2.5 (0~75+) 퍼센트 계산
  const pm10Percent = Math.min(100, Math.max(5, (pm10 / 150) * 100))
  const pm25Percent = Math.min(100, Math.max(5, (pm25 / 75) * 100))

  return (
    <article className="dashboard-card air-card">
      <div className="card-header">
        <div>
          <div className="city-title-row">
            <ShieldCheck size={20} className="air-card-icon" />
            <h3 className="card-title">통합 대기질 지수</h3>
          </div>
          <p className="card-desc">한국 환경부 기준 4단계 평가</p>
        </div>
        <div
          className="air-status-badge"
          style={{ backgroundColor: airStatus.badgeColor }}
        >
          {airStatus.status}
        </div>
      </div>

      <div className="air-metrics-container">
        {/* PM10 미세먼지 */}
        <div className="air-metric-box">
          <div className="metric-header">
            <span className="metric-name">미세먼지 (PM10)</span>
            <span className="metric-unit">μg/m³</span>
          </div>
          <div className="metric-val-row">
            <span className="metric-value">{pm10}</span>
            <span
              className="metric-grade"
              style={{
                color:
                  pm10 <= 30
                    ? '#10b981'
                    : pm10 <= 80
                    ? '#3b82f6'
                    : pm10 <= 150
                    ? '#f97316'
                    : '#ef4444',
              }}
            >
              {pm10 <= 30 ? '좋음' : pm10 <= 80 ? '보통' : pm10 <= 150 ? '나쁨' : '매우 나쁨'}
            </span>
          </div>
          <div className="gauge-bar">
            <div
              className="gauge-fill"
              style={{
                width: `${pm10Percent}%`,
                backgroundColor:
                  pm10 <= 30
                    ? '#10b981'
                    : pm10 <= 80
                    ? '#3b82f6'
                    : pm10 <= 150
                    ? '#f97316'
                    : '#ef4444',
              }}
            />
          </div>
          <div className="gauge-limits">
            <span>0</span>
            <span>30(좋음)</span>
            <span>80(보통)</span>
            <span>150+(나쁨)</span>
          </div>
        </div>

        {/* PM2.5 초미세먼지 */}
        <div className="air-metric-box">
          <div className="metric-header">
            <span className="metric-name">초미세먼지 (PM2.5)</span>
            <span className="metric-unit">μg/m³</span>
          </div>
          <div className="metric-val-row">
            <span className="metric-value">{pm25}</span>
            <span
              className="metric-grade"
              style={{
                color:
                  pm25 <= 15
                    ? '#10b981'
                    : pm25 <= 35
                    ? '#3b82f6'
                    : pm25 <= 75
                    ? '#f97316'
                    : '#ef4444',
              }}
            >
              {pm25 <= 15 ? '좋음' : pm25 <= 35 ? '보통' : pm25 <= 75 ? '나쁨' : '매우 나쁨'}
            </span>
          </div>
          <div className="gauge-bar">
            <div
              className="gauge-fill"
              style={{
                width: `${pm25Percent}%`,
                backgroundColor:
                  pm25 <= 15
                    ? '#10b981'
                    : pm25 <= 35
                    ? '#3b82f6'
                    : pm25 <= 75
                    ? '#f97316'
                    : '#ef4444',
              }}
            />
          </div>
          <div className="gauge-limits">
            <span>0</span>
            <span>15(좋음)</span>
            <span>35(보통)</span>
            <span>75+(나쁨)</span>
          </div>
        </div>
      </div>

      <div className="air-guide-msg">
        <Info size={16} className="guide-icon" />
        <p className="guide-text">
          {airStatus.status === '좋음' &&
            '대기 상태가 매우 청정합니다. 실내 환기 및 야외 활동을 안심하고 즐기세요.'}
          {airStatus.status === '보통' &&
            '무난한 대기질입니다. 민감군을 제외한 일반인의 야외 활동에 지장이 없습니다.'}
          {airStatus.status === '나쁨' &&
            '공기가 탁합니다. 장시간 무리한 실외 활동을 줄이고 마스크 착용을 권장합니다.'}
          {airStatus.status === '매우 나쁨' &&
            '위험 수준의 대기질입니다. 실외 활동을 자제하고 외출 시 KF94 보건용 마스크를 착용하세요.'}
        </p>
      </div>
    </article>
  )
}
