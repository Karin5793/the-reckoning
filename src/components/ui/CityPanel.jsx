import { useState } from 'react'

export default function CityPanel({ city, military, myCountry, onClose, onMoveUnits }) {
  const [moveMode, setMoveMode] = useState(false)
  const [targetCity, setTargetCity] = useState('')
  const [moveUnits, setMoveUnits] = useState({ piyade: 0, topcu: 0, suvari: 0 })

  if (!city) return null
  const units = military?.[city.id] || { piyade: 0, topcu: 0, suvari: 0, moral: 0 }
  const isOwn = city.empire === myCountry

  return (
    <div className="city-panel">
      <div className="city-panel-header">
        <span className="city-panel-logo">THE RECKONING</span>
        <button type="button" className="city-panel-close" onClick={onClose}>
          ✕
        </button>
      </div>
      <h3 className="city-panel-name">{city.name}</h3>
      <p className="city-panel-empire">{city.empire ?? '—'}</p>
      <div className="city-panel-divider" />

      <div className="city-panel-section">
        <span className="city-panel-section-title">ASKERİ GÜÇ</span>
        <div className="city-panel-units">
          <div className="city-unit-row">
            <span>⚔ Piyade</span>
            <span>{units.piyade}k</span>
          </div>
          <div className="city-unit-row">
            <span>💣 Topçu</span>
            <span>{units.topcu} top</span>
          </div>
          <div className="city-unit-row">
            <span>🐴 Süvari</span>
            <span>{units.suvari}k</span>
          </div>
          <div className="city-unit-row city-unit-moral">
            <span>💪 Moral</span>
            <span>{units.moral}/100</span>
          </div>
        </div>
      </div>

      {city.resources && (
        <>
          <div className="city-panel-divider" />
          <div className="city-panel-section">
            <span className="city-panel-section-title">KAYNAKLAR</span>
            <div className="city-panel-units">
              <div className="city-unit-row">
                <span>🌾 Buğday</span>
                <span>{city.resources.bugday}</span>
              </div>
              <div className="city-unit-row">
                <span>⚙️ Demir</span>
                <span>{city.resources.demir}</span>
              </div>
              <div className="city-unit-row">
                <span>🛢️ Petrol</span>
                <span>{city.resources.petrol}</span>
              </div>
              <div className="city-unit-row">
                <span>💰 Para</span>
                <span>{city.resources.para}</span>
              </div>
              {city.resources.nig != null && (
                <div className="city-unit-row">
                  <span>📜 NİG</span>
                  <span>{city.resources.nig}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {isOwn && !moveMode && (
        <>
          <div className="city-panel-divider" />
          <button type="button" className="city-panel-btn" onClick={() => setMoveMode(true)}>
            🚶 Asker Taşı
          </button>
        </>
      )}

      {isOwn && moveMode && (
        <div className="city-move-panel">
          <input
            className="city-move-input"
            placeholder="Hedef şehir ID (örn: erzurum)"
            value={targetCity}
            onChange={(e) => setTargetCity(e.target.value)}
          />
          <div className="city-move-units">
            {['piyade', 'topcu', 'suvari'].map((type) => (
              <div key={type} className="city-move-row">
                <label htmlFor={`city-move-${type}`}>{type}</label>
                <input
                  id={`city-move-${type}`}
                  type="number"
                  min={0}
                  max={units[type]}
                  value={moveUnits[type]}
                  onChange={(e) =>
                    setMoveUnits((prev) => ({
                      ...prev,
                      [type]: Math.min(Number(e.target.value) || 0, units[type]),
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="city-move-actions">
            <button
              type="button"
              className="city-panel-btn"
              onClick={() => {
                if (!targetCity) return
                onMoveUnits({ fromCityId: city.id, toCityId: targetCity, units: moveUnits })
                setMoveMode(false)
                setMoveUnits({ piyade: 0, topcu: 0, suvari: 0 })
                setTargetCity('')
              }}
            >
              Taşı
            </button>
            <button
              type="button"
              className="city-panel-btn city-panel-btn--cancel"
              onClick={() => setMoveMode(false)}
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
