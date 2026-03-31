import { useState, useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet'
import L from 'leaflet'
import { io } from 'socket.io-client'
import ww1Countries from './data/ww1Countries'
import { fetchWW1Borders } from './data/ww1Borders'
import './App.css'

const WW1_NAMES = {
  'Turkey': 'Osmanlı İmparatorluğu',
  'Russia': 'Çarlık Rusyası',
  'Germany': 'Alman İmparatorluğu',
  'Austria': 'Avusturya-Macaristan',
  'Hungary': 'Avusturya-Macaristan',
  'Czechia': 'Avusturya-Macaristan (Bohemya)',
  'France': 'Fransa Cumhuriyeti',
  'United Kingdom': 'Büyük Britanya İmparatorluğu',
  'Italy': 'İtalya Krallığı',
  'Serbia': 'Sırbistan Krallığı',
  'Bulgaria': 'Bulgaristan Çarlığı',
  'Romania': 'Romanya Krallığı',
  'Greece': 'Yunanistan Krallığı',
  'Belgium': 'Belçika Krallığı',
  'Montenegro': 'Karadağ Krallığı',
  'Albania': 'Arnavutluk',
  'Poland': 'Polonya (Rus Kontrolü)',
  'Ukraine': 'Ukrayna (Rus Kontrolü)',
  'Belarus': 'Belarus (Rus Kontrolü)',
  'Finland': 'Finlandiya (Rus Kontrolü)',
  'Estonia': 'Baltık (Rus Kontrolü)',
  'Latvia': 'Baltık (Rus Kontrolü)',
  'Lithuania': 'Baltık (Rus Kontrolü)',
  'Jordan': 'Hicaz (Osmanlı)',
  'Israel': 'Filistin (Osmanlı)',
  'Saudi Arabia': 'Arabistan (Osmanlı)',
  'Morocco': 'Fas (Fransız Protektora)',
  'Algeria': 'Cezayir (Fransız)',
  'Tunisia': 'Tunus (Fransız)',
  'Egypt': 'Mısır (İngiliz)',
  'Sudan': 'Sudan (İngiliz-Mısır)',
  'Iran': 'Persia (İran)',
  'Afghanistan': 'Afganistan',
  'India': 'Britanya Hindistanı',
  'Pakistan': 'Britanya Hindistanı (Kuzeybatı)',
  'Bangladesh': 'Britanya Hindistanı (Bengal)',
  'United States of America': 'Amerika Birleşik Devletleri',
  'Canada': 'Kanada (Britanya Dominion)',
  'Australia': 'Avustralya (Britanya Dominion)',
  'New Zealand': 'Yeni Zelanda (Britanya Dominion)',
  'South Africa': 'Güney Afrika (Britanya Dominion)',
  'Japan': 'Japon İmparatorluğu',
  'China': 'Çin Cumhuriyeti',
  'Portugal': 'Portekiz Krallığı',
  'Spain': 'İspanya Krallığı',
  'Netherlands': 'Hollanda Krallığı',
  'Denmark': 'Danimarka Krallığı',
  'Sweden': 'İsveç Krallığı',
  'Norway': 'Norveç Krallığı',
  'Switzerland': 'İsviçre Konfederasyonu',
  'Georgia': 'Çarlık Rusyası (Kafkasya)',
  'Armenia': 'Çarlık Rusyası (Kafkasya)',
  'Azerbaijan': 'Çarlık Rusyası (Kafkasya)',
  'Kazakhstan': 'Çarlık Rusyası (Orta Asya)',
  'Uzbekistan': 'Çarlık Rusyası (Orta Asya)',
  'Turkmenistan': 'Çarlık Rusyası (Orta Asya)',
  'Kyrgyzstan': 'Çarlık Rusyası (Orta Asya)',
  'Tajikistan': 'Çarlık Rusyası (Orta Asya)',
  'Mongolia': 'Çarlık Rusyası (Nüfuz Alanı)',
  'Moldova': 'Çarlık Rusyası (Bessarabya)',
  'Slovenia': 'Avusturya-Macaristan',
  'Croatia': 'Avusturya-Macaristan',
  'Bosnia and Herzegovina': 'Avusturya-Macaristan',
  'Slovakia': 'Avusturya-Macaristan (Slovakya)',
  'Kosovo': 'Osmanlı İmparatorluğu',
  'North Macedonia': 'Osmanlı İmparatorluğu (Makedonya)',
  'Iraq': 'Osmanlı İmparatorluğu (Mezopotamya)',
  'Syria': 'Osmanlı İmparatorluğu (Suriye)',
  'Lebanon': 'Osmanlı İmparatorluğu (Lübnan)',
  'Palestine': 'Osmanlı İmparatorluğu (Filistin)',
  'Kuwait': 'Osmanlı İmparatorluğu (Kuveyt)',
  'Yemen': 'Osmanlı İmparatorluğu (Yemen)',
  'Eritrea': 'İtalya Krallığı (Sömürge)',
  'Libya': 'İtalya Krallığı (Sömürge)',
  'Somalia': 'İtalya Krallığı (Sömürge)',
  'Djibouti': 'Fransa Cumhuriyeti (Sömürge)',
  'Namibia': 'Alman İmparatorluğu (Sömürge)',
  'Tanzania': 'Alman İmparatorluğu (Sömürge)',
  'Cameroon': 'Alman İmparatorluğu (Sömürge)',
  'Togo': 'Alman İmparatorluğu (Sömürge)',
  'Ottoman Empire': 'Osmanlı İmparatorluğu',
  'United Kingdom of Great Britain and Ireland': 'Büyük Britanya İmparatorluğu',
  'Russian Empire': 'Çarlık Rusyası',
  'German Empire': 'Alman İmparatorluğu',
  'Austria-Hungary': 'Avusturya-Macaristan',
  'French Republic': 'Fransa Cumhuriyeti',
  'Kingdom of Italy': 'İtalya Krallığı',
  'Kingdom of Serbia': 'Sırbistan Krallığı',
  'Kingdom of Romania': 'Romanya Krallığı',
  'Kingdom of Bulgaria': 'Bulgaristan Çarlığı',
  'Kingdom of Greece': 'Yunanistan Krallığı',
  'Kingdom of Belgium': 'Belçika Krallığı',
  'Empire of Japan': 'Japon İmparatorluğu',
  'United States': 'Amerika Birleşik Devletleri',
  'British India': 'Britanya Hindistanı',
  'Persia': 'Persia (İran)',
  'Ethiopia': 'Habeşistan',
}

function resolveCountryName(modernName) {
  return WW1_NAMES[modernName] ?? modernName
}

const BASE_BORDER = { weight: 1.5, color: '#2c1810' }

const DEFAULT_STYLE = { ...BASE_BORDER, fillColor: '#8b7355', fillOpacity: 0.5 }
const HOVER_STYLE   = { ...BASE_BORDER, fillColor: '#8b7355', fillOpacity: 0.75 }
const SELECTED_STYLE = { ...BASE_BORDER, fillColor: '#6b4423', fillOpacity: 0.85 }
const MY_STYLE      = { ...BASE_BORDER, fillColor: '#2d5a1b', fillOpacity: 0.75 }

/** Oyuncu ülkeleri — haritada sahip rengi (sıra lobideki oyuncu listesiyle uyumlu) */
const PLAYER_TERRITORY_COLORS = [
  '#8b1a1a',
  '#1e5a8c',
  '#6b2d8b',
  '#8b6914',
  '#238b6a',
  '#8c2d5c',
  '#5c4a8b',
  '#3d7a6b',
  '#7a4a3d',
]

const EMPTY_RESOURCES = { bugday: 0, demir: 0, petrol: 0, para: 0, nig: 0 }

const BOTTOM_BAR_ITEMS = [
  { icon: '🌾', label: 'Buğday', key: 'bugday' },
  { icon: '⚙️', label: 'Demir',  key: 'demir'  },
  { icon: '🛢️', label: 'Petrol', key: 'petrol'  },
  { icon: '💰', label: 'Para',   key: 'para'   },
  { icon: '👤', label: 'NİG',    key: 'nig'    },
]

const UNIT_TYPES = {
  infantry: { label: 'Piyade Yerleştir',  icon: '⚔',  cost: { bugday: 10, para: 5  } },
  artillery: { label: 'Topçu Yerleştir',  icon: '💣',  cost: { demir: 15,  para: 10 } },
  cavalry:   { label: 'Süvari Yerleştir', icon: '🐴',  cost: { bugday: 8,  para: 8  } },
}

const RES_LABELS = { bugday: 'Buğday', demir: 'Demir', petrol: 'Petrol', para: 'Para', nig: 'NİG' }

const countryCoordinates = {
  'Osmanlı İmparatorluğu': [39, 35],
  'Osmanlı İmparatorluğu (Kuveyt)': [29.3, 47.9],
  'Osmanlı İmparatorluğu (Suriye)': [34, 38],
  'Osmanlı İmparatorluğu (Mezopotamya)': [33, 44],
  'Osmanlı İmparatorluğu (Lübnan)': [33.8, 35.9],
  'Osmanlı İmparatorluğu (Filistin)': [31.9, 35.2],
  'Osmanlı İmparatorluğu (Yemen)': [15.5, 44],
  'Osmanlı İmparatorluğu (Makedonya)': [41.6, 21.7],
  'Alman İmparatorluğu': [51, 10],
  'Alman İmparatorluğu (Sömürge)': [-6, 35],
  'Çarlık Rusyası': [60, 50],
  'Çarlık Rusyası (Kafkasya)': [42, 44],
  'Çarlık Rusyası (Orta Asya)': [43, 59],
  'Çarlık Rusyası (Nüfuz Alanı)': [47, 106],
  'Avusturya-Macaristan': [47, 16],
  'Avusturya-Macaristan (Bohemya)': [50, 15.5],
  'Avusturya-Macaristan (Slovakya)': [48.7, 19.5],
  'Büyük Britanya İmparatorluğu': [52, -1],
  'Fransa Cumhuriyeti': [46, 2],
  'Fransa Cumhuriyeti (Sömürge)': [14, 2],
  'İtalya Krallığı': [42, 12],
  'İtalya Krallığı (Sömürge)': [32, 13],
  'Japon İmparatorluğu': [36, 138],
  'Amerika Birleşik Devletleri': [38, -97],
  'Sırbistan Krallığı': [44, 21],
  'Romanya Krallığı': [45, 25],
  'Bulgaristan Çarlığı': [42, 25],
  'Yunanistan Krallığı': [39, 22],
  'Belçika Krallığı': [50, 4],
  'Britanya Hindistanı': [22, 78],
  'Britanya Hindistanı (Kuzeybatı)': [30, 70],
  'Britanya Hindistanı (Bengal)': [23, 90],
  'Polonya (Rus Kontrolü)': [52, 20],
  'Ukrayna (Rus Kontrolü)': [49, 32],
  'Belarus (Rus Kontrolü)': [53, 28],
  'Finlandiya (Rus Kontrolü)': [64, 26],
  'Baltık (Rus Kontrolü)': [57, 25],
  'Fas (Fransız Protektora)': [32, -6],
  'Mısır (İngiliz)': [26, 30],
  'Persia (İran)': [32, 53],
}

function isOwnTerritory(countryKey, myCountry) {
  if (!myCountry || !countryKey) return false
  if (countryKey === myCountry) return true
  return countryKey.startsWith(myCountry + ' (')
}

const WAR_TACTIC_SECONDS = 60

function formatWarCountdown(sec) {
  const s = Math.max(0, sec)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

function collectOwnUnits(units, myCountry) {
  const totals = { infantry: 0, artillery: 0, cavalry: 0 }
  Object.entries(units).forEach(([region, u]) => {
    if (!isOwnTerritory(region, myCountry)) return
    totals.infantry += u.infantry || 0
    totals.artillery += u.artillery || 0
    totals.cavalry += u.cavalry || 0
  })
  return totals
}

function empireAtTerritory(ww1Name, playersRecord) {
  const sorted = Object.values(playersRecord)
    .filter((p) => p?.country)
    .sort((a, b) => b.country.length - a.country.length)
  for (const p of sorted) {
    if (ww1Name === p.country || ww1Name.startsWith(p.country + ' (')) return p.country
  }
  return null
}

function effectiveEmpireWithConquests(baseEmpire, conquests) {
  if (!baseEmpire || !conquests || typeof conquests !== 'object') return baseEmpire
  let e = baseEmpire
  const seen = new Set()
  while (conquests[e] != null && conquests[e] !== '') {
    if (seen.has(e)) break
    seen.add(e)
    e = conquests[e]
  }
  return e
}

/** Harita bölgesinin efektif sahibi (fetihler: territories[eskiSahip] = yeniSahip) */
function territoryController(ww1Name, playersRecord, conquests) {
  const base = empireAtTerritory(ww1Name, playersRecord)
  if (!base) return null
  return effectiveEmpireWithConquests(base, conquests || {})
}

function formatTime(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function TopBar({ year, turn, maxTurns, turnActive, timeLeft }) {
  return (
    <div className="top-bar">
      <span className="bar-logo">THE RECKONING</span>
      <div className="bar-center">
        <span className="bar-year">{year}</span>
        {turnActive && <span className="bar-timer">{formatTime(timeLeft)}</span>}
      </div>
      <span className="bar-turn">
        {turnActive ? `TUR: ${turn} / ${maxTurns}` : 'TUR KAPALI — Diplomatik Ara'}
      </span>
    </div>
  )
}

function BottomBar({ resources }) {
  return (
    <div className="bottom-bar">
      {BOTTOM_BAR_ITEMS.map(({ icon, label, key }) => (
        <div key={key} className="resource-item">
          <span className="resource-icon">{icon}</span>
          <span className="resource-label">{label}</span>
          <span className="resource-value">{resources[key]}</span>
        </div>
      ))}
    </div>
  )
}

const PANEL_ROWS = [
  { label: 'Nüfus', key: 'nufus' },
  { label: 'Kaynaklar', key: 'kaynaklar' },
  { label: 'Arazi', key: 'arazi' },
  { label: 'Stratejik Değer', key: 'stratejik' },
]

const NA = 'Veri mevcut değil'

function CountryPanel({ country, onClose }) {
  if (!country) return null
  const data = ww1Countries[country.name] ?? null
  return (
    <div className="country-panel">
      <span className="panel-logo">THE RECKONING</span>
      <button className="panel-close" onClick={onClose}>✕</button>
      <h3 className="panel-country-name">{country.name}</h3>
      <div className="panel-divider" />
      <ul className="panel-stats">
        {PANEL_ROWS.map(({ label, key }) => (
          <li key={key}>
            <span className="stat-label">{label}</span>
            <span className="stat-value">{data?.[key] ?? NA}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const PLAYABLE_COUNTRIES = [
  'Osmanlı İmparatorluğu',
  'Alman İmparatorluğu',
  'Çarlık Rusyası',
  'Avusturya-Macaristan',
  'Büyük Britanya İmparatorluğu',
  'Fransa Cumhuriyeti',
  'İtalya Krallığı',
  'Japon İmparatorluğu',
  'Amerika Birleşik Devletleri',
  'Sırbistan Krallığı',
  'Romanya Krallığı',
  'Bulgaristan Çarlığı',
]

function LobbyScreen({ onEnter, socket }) {
  const [playerName, setPlayerName] = useState('')
  const [chosenCountry, setChosenCountry] = useState(PLAYABLE_COUNTRIES[0])

  function handleSubmit(e) {
    e.preventDefault()
    if (!playerName.trim()) return
    if (socket) {
      socket.emit('selectCountry', { name: playerName.trim(), country: chosenCountry })
    }
    onEnter({ name: playerName.trim(), country: chosenCountry })
  }

  return (
    <div className="lobby-screen">
      <div className="lobby-card">
        <h1 className="lobby-title">THE RECKONING</h1>
        <p className="lobby-year">1914</p>
        <form className="lobby-form" onSubmit={handleSubmit}>
          <input
            className="lobby-input"
            type="text"
            placeholder="Adın"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={32}
          />
          <select
            className="lobby-select"
            value={chosenCountry}
            onChange={(e) => setChosenCountry(e.target.value)}
          >
            {PLAYABLE_COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className="lobby-btn" type="submit">Savaşa Gir</button>
        </form>
      </div>
    </div>
  )
}

function TelegraphPanel({ targetCountry, messageText, onChange, onSend, onClose }) {
  if (!targetCountry) return null
  return (
    <div className="telegraph-panel-overlay" role="dialog" aria-modal="true">
      <div className="telegraph-panel">
        <h3 className="telegraph-panel-title">TELEGRAF — {targetCountry}</h3>
        <textarea
          className="telegraph-panel-textarea"
          placeholder="Mesajınızı yazın..."
          value={messageText}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          maxLength={2000}
        />
        <div className="telegraph-panel-actions">
          <button type="button" className="telegraph-panel-btn telegraph-panel-btn--primary" onClick={onSend}>
            Gönder
          </button>
          <button type="button" className="telegraph-panel-btn" onClick={onClose}>
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}

function ContextMenu({ menu, resources, onSelectUnit, onDeclareWar }) {
  if (!menu) return null
  const kind = menu.type || 'units'
  return (
    <div
      className="context-menu"
      style={{ left: menu.x, top: menu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {kind === 'war' ? (
        <>
          <div className="context-menu-header">{menu.defender}</div>
          <button type="button" className="context-menu-item" onClick={onDeclareWar}>
            <span className="cm-label">Savaş İlan Et</span>
          </button>
        </>
      ) : (
        <>
          <div className="context-menu-header">{menu.country}</div>
          {Object.entries(UNIT_TYPES).map(([type, { label, icon, cost }]) => {
            const canAfford = Object.entries(cost).every(([res, amt]) => resources[res] >= amt)
            const costStr = Object.entries(cost)
              .map(([res, amt]) => `${RES_LABELS[res]} ${amt}`)
              .join(', ')
            return (
              <button
                key={type}
                className={`context-menu-item${canAfford ? '' : ' context-menu-item--disabled'}`}
                onClick={() => canAfford && onSelectUnit(type)}
                disabled={!canAfford}
              >
                <span className="cm-icon">{icon}</span>
                <span className="cm-label">{label}</span>
                <span className="cm-cost">{costStr}</span>
              </button>
            )
          })}
        </>
      )}
    </div>
  )
}

function WarTacticPanel({
  panel,
  tacticText,
  onTacticChange,
  timeLeftSec,
  onAttack,
  onDefenseSubmit,
}) {
  if (!panel) return null
  const isDefense = panel.role === 'defense'
  const canAct = timeLeftSec > 0

  return (
    <div className="war-tactic-panel">
      <div className="war-tactic-panel-head">
        {isDefense && <span className="war-tactic-badge">SAVUNMA</span>}
        <h3 className="war-tactic-title">
          SAVAŞ: {panel.attacker} vs {panel.defender}
        </h3>
      </div>
      {isDefense && panel.attackerTactic ? (
        <p className="war-tactic-enemy-note">Rakip taktik: {panel.attackerTactic}</p>
      ) : null}
      <textarea
        className="war-tactic-textarea"
        placeholder="Taktik planını yaz... (isteğe bağlı)"
        value={tacticText}
        onChange={(e) => onTacticChange(e.target.value)}
        rows={4}
        disabled={!canAct}
      />
      <div className="war-tactic-actions">
        <span className="war-tactic-timer">{formatWarCountdown(timeLeftSec)}</span>
        {isDefense ? (
          <button
            type="button"
            className="war-tactic-btn"
            disabled={!canAct}
            onClick={onDefenseSubmit}
          >
            Savunmayı Gönder
          </button>
        ) : (
          <button
            type="button"
            className="war-tactic-btn"
            disabled={!canAct}
            onClick={onAttack}
          >
            Saldır
          </button>
        )}
      </div>
    </div>
  )
}

function shuffleForNewspaper(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function formatWarHeadlineForPaper(w) {
  const { attacker, defender, winner } = w
  if (winner == null || winner === 'BERABERLIK') {
    return `⚔ ${attacker} vs ${defender} — Beraberlik`
  }
  return `⚔ ${attacker} vs ${defender} — ${winner} zafer kazandı`
}

const NEWSPAPER_NAME = 'The World Dispatch'

function NewspaperModal({ data, players, onClose }) {
  const rankedPlayers = useMemo(() => {
    const list = Object.values(players || {}).filter((p) => p?.name && p?.country)
    return shuffleForNewspaper(list)
  }, [data, players])

  if (!data) return null

  const dispatchYear =
    data.dispatchYear ??
    (typeof data.year === 'number' ? data.year - 1 : null)
  const wars = Array.isArray(data.wars) ? data.wars : []
  const territoryDelta =
    data.territories && typeof data.territories === 'object' ? data.territories : {}
  const territoryLines = Object.entries(territoryDelta).filter(([from, to]) => from && to)
  const interceptedTel = Array.isArray(data.interceptedTelegraphs)
    ? data.interceptedTelegraphs
    : []
  const nextYear = data.nextCalendarYear ?? data.year
  const mastheadEmpty =
    wars.length === 0 &&
    territoryLines.length === 0 &&
    interceptedTel.length === 0

  return (
    <div className="newspaper-overlay" role="dialog" aria-modal="true">
      <div className="newspaper-sheet">
        <span className="newspaper-kicker">THE RECKONING</span>
        <h1 className="newspaper-masthead">— {dispatchYear ?? '—'} —</h1>
        <p className="newspaper-name">{NEWSPAPER_NAME}</p>
        <hr className="newspaper-rule" />
        <h2 className="newspaper-section-title">MANŞET</h2>
        <ul className="newspaper-headlines">
          {mastheadEmpty ? (
            <li className="newspaper-headline newspaper-headline--muted">
              Bu tur kayda geçen savaş, toprak değişimi veya ele geçirilen telegraf olmadı.
            </li>
          ) : null}
          {wars.map((w, i) => (
            <li key={`w-${i}-${w.attacker}-${w.defender}`} className="newspaper-headline">
              {formatWarHeadlineForPaper(w)}
            </li>
          ))}
          {territoryLines.map(([region]) => (
            <li key={`t-${region}`} className="newspaper-headline">
              🏴 {region} el değiştirdi
            </li>
          ))}
          {interceptedTel.map((t, i) => (
            <li key={`tel-${i}-${t.from}-${t.to}`} className="newspaper-headline newspaper-headline--intercept">
              <span className="newspaper-intercept-line">
                📰 {t.from} → {t.to} telegrafı ele geçirildi!
              </span>
              <span className="newspaper-intercept-msg">“{t.message}”</span>
            </li>
          ))}
        </ul>
        <hr className="newspaper-rule" />
        <h2 className="newspaper-section-title">GÜÇ SIRALAMASI</h2>
        <ol className="newspaper-ranking">
          {rankedPlayers.map((p, idx) => (
            <li key={`${p.name}-${p.country}-${idx}`} className="newspaper-ranking-row">
              <span className="newspaper-rank-num">{idx + 1}.</span>
              <span className="newspaper-rank-main">
                <span className="newspaper-rank-name">{p.name}</span>
                <span className="newspaper-rank-country">{p.country}</span>
              </span>
            </li>
          ))}
        </ol>
        {rankedPlayers.length === 0 ? (
          <p className="newspaper-ranking-empty">Oyuncu yok.</p>
        ) : null}
        <hr className="newspaper-rule" />
        <p className="newspaper-footer">
          Bir sonraki tur 1 Ocak {nextYear} tarihinde başlayacak
        </p>
        <button type="button" className="newspaper-close" onClick={onClose}>
          KAPAT
        </button>
      </div>
    </div>
  )
}

function WarResultModal({ data, onClose }) {
  if (!data) return null
  const { attacker, defender, result, parsed } = data
  const body =
    typeof result === 'string'
      ? result
      : result != null
        ? JSON.stringify(result, null, 2)
        : ''

  return (
    <div className="war-result-overlay" role="dialog" aria-modal="true">
      <div className="war-result-modal">
        <h2 className="war-result-title">⚔ SAVAŞ SONUCU</h2>
        <p className="war-result-matchup">
          {attacker} <span className="war-result-vs">vs</span> {defender}
        </p>
        {parsed?.winner != null && (
          <p className="war-result-winner">Kazanan: {String(parsed.winner)}</p>
        )}
        <div className="war-result-body">{body}</div>
        <button type="button" className="war-result-close" onClick={onClose}>
          Kapat
        </button>
      </div>
    </div>
  )
}

function PlayerListPanel({ players, currentPlayer, territories, onTelegraphTo }) {
  const entries = Object.values(players)
  const conquestRows = Object.entries(territories || {}).filter(
    ([from, to]) => from && to && from !== to,
  )
  return (
    <div className="player-list-panel">
      <span className="player-list-title">LOBİ</span>
      <div className="player-list-divider" />
      <ul className="player-list">
        {entries.length === 0 ? (
          <li className="player-list-empty">Bağlı oyuncu yok</li>
        ) : (
          entries.map((p, i) => {
            const isSelf = p.name === currentPlayer?.name
            return (
              <li
                key={i}
                className={`player-list-row${isSelf ? ' player-list-row--self' : ''}`}
              >
                <div className="player-list-info">
                  <span className="player-list-name">{p.name}</span>
                  <span className="player-list-country">{p.country}</span>
                </div>
                <div className="player-list-row-actions">
                  {!isSelf && onTelegraphTo ? (
                    <button
                      type="button"
                      className="player-list-telegraph-btn"
                      title="Telegraf gönder"
                      aria-label={`${p.country} ülkesine telegraf gönder`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onTelegraphTo(p.country)
                      }}
                    >
                      📨
                    </button>
                  ) : null}
                  <span className="player-list-dot">●</span>
                </div>
              </li>
            )
          })
        )}
      </ul>
      {conquestRows.length > 0 ? (
        <>
          <div className="player-list-divider player-list-divider--tight" />
          <span className="player-list-subtitle">ELE GEÇİRİLEN TOPRAKLAR</span>
          <ul className="player-list player-list--conquests">
            {conquestRows.map(([defenderEmpire, attackerEmpire]) => (
              <li key={defenderEmpire} className="player-list-conquest-row">
                <span className="player-list-conquest-from">{defenderEmpire}</span>
                <span className="player-list-conquest-arrow"> → </span>
                <span className="player-list-conquest-tag">ele geçirildi</span>
                <span className="player-list-conquest-by"> ({attackerEmpire})</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}

function App() {
  const [geoData, setGeoData] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [socket, setSocket] = useState(null)
  const [players, setPlayers] = useState({})
  const [player, setPlayer] = useState(null)
  const [gameYear, setGameYear] = useState(1914)
  const [gameTurn, setGameTurn] = useState(1)
  const [gameMaxTurns, setGameMaxTurns] = useState(4)
  const [turnActive, setTurnActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isHost, setIsHost] = useState(false)
  const [resources, setResources] = useState(EMPTY_RESOURCES)
  const [units, setUnits] = useState({})
  const [territories, setTerritories] = useState({})
  const [contextMenu, setContextMenu] = useState(null)
  const [warPanel, setWarPanel] = useState(null)
  const [warTacticText, setWarTacticText] = useState('')
  const [warResultModal, setWarResultModal] = useState(null)
  const [newspaper, setNewspaper] = useState(null)
  const [telegraphPanelCountry, setTelegraphPanelCountry] = useState(null)
  const [telegraphDraft, setTelegraphDraft] = useState('')
  const [telegraphInbox, setTelegraphInbox] = useState([])
  const [telegraphReadOpen, setTelegraphReadOpen] = useState(null)
  const [interceptToasts, setInterceptToasts] = useState([])
  const [turnClosedToast, setTurnClosedToast] = useState(null)
  const selectedLayerRef = useRef(null)
  const geoJsonRef = useRef(null)
  const playersRef = useRef({})
  const territoriesRef = useRef({})
  const playerRef = useRef(null)
  const turnActiveRef = useRef(turnActive)
  const toastTimeoutRef = useRef(null)

  turnActiveRef.current = turnActive

  function getFeatureStyle(feature) {
    const rawName = feature.properties.NAME || feature.properties.name || ''
    const ww1Name = resolveCountryName(rawName)
    const myCountry = playerRef.current?.country
    const playersRec = playersRef.current
    const ctrl = territoryController(ww1Name, playersRec, territoriesRef.current)
    if (!ctrl) return DEFAULT_STYLE
    if (myCountry && ctrl === myCountry) return MY_STYLE
    const playerCountries = [
      ...new Set(
        Object.values(playersRec)
          .map((p) => p.country)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b, 'tr'))
    const idx = playerCountries.indexOf(ctrl)
    if (idx === -1) return DEFAULT_STYLE
    const fillColor = PLAYER_TERRITORY_COLORS[idx % PLAYER_TERRITORY_COLORS.length]
    return { ...BASE_BORDER, fillColor, fillOpacity: 0.75 }
  }

  function handleEnterGame(p) {
    playerRef.current = p
    setPlayer(p)
  }

  useEffect(() => {
    fetchWW1Borders()
      .then((data) => setGeoData(data))
      .catch((err) => console.error('WW1 sınırları yüklenemedi:', err))
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const newSocket = io('http://localhost:3002')

    newSocket.on('connect', () => {
      console.log('Sunucuya bağlandı:', newSocket.id)
    })

    newSocket.on('gameState', (state) => {
      setGameYear(state.year)
      setGameTurn(state.turn)
      setGameMaxTurns(state.maxTurns)
      setTurnActive(state.turnActive)
      setIsHost(state.isHost)
      if (state.turnEndTime) {
        setTimeLeft(Math.max(0, state.turnEndTime - Date.now()))
      }
      if (state.units) setUnits(state.units)
      if (state.territories && typeof state.territories === 'object') {
        territoriesRef.current = state.territories
        setTerritories(state.territories)
      }
    })

    newSocket.on('unitsUpdate', (updatedUnits) => {
      setUnits(updatedUnits)
    })

    newSocket.on('territoriesUpdate', (payload) => {
      if (payload && typeof payload === 'object') {
        territoriesRef.current = payload
        setTerritories(payload)
      }
    })

    newSocket.on('resourcesUpdate', (payload) => {
      if (payload && typeof payload === 'object') {
        setResources({
          bugday: payload.bugday ?? 0,
          demir: payload.demir ?? 0,
          petrol: payload.petrol ?? 0,
          para: payload.para ?? 0,
          nig: payload.nig ?? 0,
        })
      }
    })

    newSocket.on('turnStarted', ({ year, turn, turnEndTime }) => {
      setGameYear(year)
      setGameTurn(turn)
      setTurnActive(true)
      setTimeLeft(Math.max(0, turnEndTime - Date.now()))
    })

    newSocket.on('turnEnded', (payload) => {
      const year = payload?.year
      const turn = payload?.turn
      if (typeof year === 'number') setGameYear(year)
      if (typeof turn === 'number') setGameTurn(turn)
      setTurnActive(false)
      setTimeLeft(0)
      setNewspaper({
        dispatchYear: payload?.dispatchYear ?? (typeof year === 'number' ? year - 1 : undefined),
        wars: Array.isArray(payload?.wars) ? payload.wars : [],
        territories:
          payload?.territories && typeof payload.territories === 'object'
            ? payload.territories
            : {},
        interceptedTelegraphs: Array.isArray(payload?.interceptedTelegraphs)
          ? payload.interceptedTelegraphs
          : [],
        nextCalendarYear: typeof year === 'number' ? year : undefined,
        year: typeof year === 'number' ? year : undefined,
      })
    })

    newSocket.on('telegraphReceived', ({ from, message }) => {
      if (!from) return
      setTelegraphInbox((prev) => [
        ...prev,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, from, message: String(message ?? '') },
      ])
    })

    newSocket.on('telegraphIntercepted', ({ from, to, message }) => {
      if (!from || !to) return
      setInterceptToasts((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          from,
          to,
          message: String(message ?? ''),
        },
      ])
    })

    newSocket.on('turnTimer', ({ remaining }) => {
      setTimeLeft(remaining)
    })

    newSocket.on('promotedToHost', () => {
      setIsHost(true)
    })

    newSocket.on('playersUpdate', (updatedPlayers) => {
      playersRef.current = updatedPlayers
      setPlayers(updatedPlayers)
    })

    newSocket.on('warDeclared', (payload) => {
      if (!payload?.warId) return
      setWarTacticText('')
      setWarPanel({
        role: 'defense',
        warId: payload.warId,
        attacker: payload.attacker,
        defender: payload.defender,
        attackerTactic: payload.attackerTactic || '',
        timeLeftSec: payload.timeLeft ?? WAR_TACTIC_SECONDS,
      })
    })

    newSocket.on('warResult', (payload) => {
      if (!payload?.attacker || !payload?.defender) return
      setWarPanel(null)
      setWarTacticText('')
      setWarResultModal({
        attacker: payload.attacker,
        defender: payload.defender,
        result: typeof payload.result === 'string' ? payload.result : String(payload.result ?? ''),
        parsed: payload.parsed,
      })
    })

    setSocket(newSocket)

    return () => newSocket.disconnect()
  }, [])

  useEffect(() => {
    if (!geoJsonRef.current) return
    geoJsonRef.current.eachLayer((layer) => {
      if (!layer.feature || layer === selectedLayerRef.current) return
      layer.setStyle(getFeatureStyle(layer.feature))
    })
  }, [players, territories])

  const warPanelKey = warPanel
    ? `${warPanel.role}-${warPanel.warId ?? 'atk'}-${warPanel.attacker}-${warPanel.defender}`
    : ''

  useEffect(() => {
    if (!warPanelKey) return
    const id = setInterval(() => {
      setWarPanel((prev) => {
        if (!prev) return null
        if (prev.timeLeftSec <= 1) return { ...prev, timeLeftSec: 0 }
        return { ...prev, timeLeftSec: prev.timeLeftSec - 1 }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [warPanelKey])

  function resetSelected() {
    if (selectedLayerRef.current) {
      const f = selectedLayerRef.current.feature
      selectedLayerRef.current.setStyle(f ? getFeatureStyle(f) : DEFAULT_STYLE)
      selectedLayerRef.current = null
    }
  }

  function onEachFeature(feature, layer) {
    const rawName = feature.properties.NAME || feature.properties.name || ''
    const ww1Name = resolveCountryName(rawName)

    layer.on({
      mouseover(e) {
        const l = e.target
        if (l !== selectedLayerRef.current) {
          l.setStyle(HOVER_STYLE)
        }
      },
      mouseout(e) {
        const l = e.target
        if (l !== selectedLayerRef.current) {
          l.setStyle(getFeatureStyle(feature))
        }
      },
      click(e) {
        setContextMenu(null)
        resetSelected()
        const l = e.target
        l.setStyle(SELECTED_STYLE)
        selectedLayerRef.current = l
        const modernName = feature.properties.NAME || feature.properties.name || 'Bilinmiyor'
        const resolved = resolveCountryName(modernName)
        setSelectedCountry({ name: resolved })
        if (socket && player) {
          socket.emit('selectCountry', { name: player.name, country: resolved })
        }
      },
      contextmenu(e) {
        e.originalEvent.preventDefault()
        if (!turnActiveRef.current) {
          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
          setTurnClosedToast('Tur kapalı — askeri eylemler için turu başlat')
          toastTimeoutRef.current = setTimeout(() => {
            setTurnClosedToast(null)
            toastTimeoutRef.current = null
          }, 2000)
          return
        }
        const myCountry = playerRef.current?.country
        const myName = playerRef.current?.name
        if (!myCountry) return

        const empire = territoryController(ww1Name, playersRef.current, territoriesRef.current)
        if (empire === myCountry) {
          setContextMenu({
            type: 'units',
            x: e.originalEvent.clientX,
            y: e.originalEvent.clientY,
            country: ww1Name,
          })
          return
        }

        if (!empire) return
        const enemyHere = Object.values(playersRef.current).some(
          (p) => p.country === empire && p.name !== myName,
        )
        if (!enemyHere) return

        setContextMenu({
          type: 'war',
          x: e.originalEvent.clientX,
          y: e.originalEvent.clientY,
          defender: empire,
        })
      },
    })
  }

  function placeUnit(unitType) {
    if (!contextMenu || contextMenu.type !== 'units') return
    const cost = UNIT_TYPES[unitType].cost
    const canAfford = Object.entries(cost).every(([res, amt]) => resources[res] >= amt)
    if (!canAfford) return
    socket?.emit('placeUnit', {
      country: contextMenu.country,
      unitType,
      playerId: socket.id,
    })
    setContextMenu(null)
  }

  function openWarPanelFromMenu() {
    if (!contextMenu || contextMenu.type !== 'war' || !player) return
    const defender = contextMenu.defender
    setContextMenu(null)
    setWarTacticText('')
    setWarPanel({
      role: 'attack',
      attacker: player.country,
      defender,
      timeLeftSec: WAR_TACTIC_SECONDS,
    })
  }

  function handleDeclareWarSubmit() {
    if (!warPanel || warPanel.role !== 'attack' || !socket || !player) return
    socket.emit('declareWar', {
      attacker: warPanel.attacker,
      defender: warPanel.defender,
      attackerTactic: warTacticText,
      attackerUnits: collectOwnUnits(units, player.country),
    })
    setWarPanel(null)
    setWarTacticText('')
  }

  function handleDefenseSubmit() {
    if (!warPanel || warPanel.role !== 'defense' || !socket || !warPanel.warId) return
    socket.emit('submitDefense', {
      warId: warPanel.warId,
      defenderTactic: warTacticText,
    })
    setWarPanel(null)
    setWarTacticText('')
  }

  useEffect(() => {
    if (!contextMenu) return
    function handleOutsideClick() { setContextMenu(null) }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [contextMenu])

  function handleOpenTelegraphPanel(targetCountry) {
    setTelegraphDraft('')
    setTelegraphPanelCountry(targetCountry)
  }

  function handleSubmitTelegraph() {
    if (!socket || !telegraphPanelCountry) return
    const text = telegraphDraft.trim()
    if (!text) return
    socket.emit('sendTelegraph', {
      to: telegraphPanelCountry,
      from: player?.country,
      message: text,
    })
    setTelegraphDraft('')
    setTelegraphPanelCountry(null)
  }

  useEffect(() => {
    console.log('[units] detail:', JSON.stringify(units, null, 2))
  }, [units])

  if (!player) {
    return <LobbyScreen onEnter={handleEnterGame} socket={socket} />
  }

  return (
    <>
      <TopBar
        year={gameYear}
        turn={gameTurn}
        maxTurns={gameMaxTurns}
        turnActive={turnActive}
        timeLeft={timeLeft}
      />
      <div className="map-wrapper">
      {turnClosedToast && (
        <div className="turn-closed-toast" role="status">
          {turnClosedToast}
        </div>
      )}

      <div className="telegraph-notify-stack" aria-live="polite">
        {telegraphInbox.map((t) => (
          <button
            key={t.id}
            type="button"
            className="telegraph-inbox-chip"
            onClick={() => {
              setTelegraphReadOpen({ from: t.from, message: t.message })
              setTelegraphInbox((prev) => prev.filter((x) => x.id !== t.id))
            }}
          >
            📨 {t.from} ülkesinden telegraf geldi
          </button>
        ))}
        {interceptToasts.map((t) => (
          <div key={t.id} className="telegraph-intercept-card">
            <button
              type="button"
              className="telegraph-intercept-dismiss"
              aria-label="Kapat"
              onClick={() => setInterceptToasts((prev) => prev.filter((x) => x.id !== t.id))}
            >
              ✕
            </button>
            <p className="telegraph-intercept-title">
              📰 {t.from} → {t.to} telegrafı ele geçirildi!
            </p>
            <p className="telegraph-intercept-body">{t.message}</p>
          </div>
        ))}
      </div>
      <MapContainer
        center={[20, 10]}
        zoom={3}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg"
          attribution='Map tiles by <a href="https://stamen.com">Stamen Design</a>, under <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="https://openstreetmap.org">OpenStreetMap</a>, under <a href="https://opendatacommons.org/licenses/odbl">ODbL</a>.'
        />
        {geoData && (
          <GeoJSON
            ref={geoJsonRef}
            data={geoData}
            style={getFeatureStyle}
            onEachFeature={onEachFeature}
          />
        )}
        {Object.entries(units).map(([country, unitData]) => {
          if (!isOwnTerritory(country, player.country)) return null
          const coords = countryCoordinates[country]
          if (!coords || !unitData) return null
          const piyade = unitData.piyade ?? unitData.infantry
          const topcu = unitData.topcu ?? unitData.artillery
          const suvari = unitData.suvari ?? unitData.cavalry
          let text = ''
          if (piyade) text += '⚔' + piyade + ' '
          if (topcu) text += '💣' + topcu + ' '
          if (suvari) text += '🐴' + suvari
          if (!text.trim()) return null
          const icon = L.divIcon({
            className: '',
            html: '<div style="background:rgba(0,0,0,0.85);color:white;padding:2px 5px;border-radius:3px;font-size:12px;border:1px solid #6b5a3e">' + text.trim() + '</div>',
            iconSize: [80, 24],
            iconAnchor: [40, 12],
          })
          return <Marker key={country} position={coords} icon={icon} />
        })}
      </MapContainer>

      <CountryPanel
        country={selectedCountry}
        onClose={() => {
          resetSelected()
          setSelectedCountry(null)
        }}
      />

      <PlayerListPanel
        players={players}
        currentPlayer={player}
        territories={territories}
        onTelegraphTo={(country) => handleOpenTelegraphPanel(country)}
      />

      <TelegraphPanel
        targetCountry={telegraphPanelCountry}
        messageText={telegraphDraft}
        onChange={setTelegraphDraft}
        onSend={handleSubmitTelegraph}
        onClose={() => {
          setTelegraphPanelCountry(null)
          setTelegraphDraft('')
        }}
      />

      {telegraphReadOpen ? (
        <div
          className="telegraph-read-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setTelegraphReadOpen(null)}
        >
          <div className="telegraph-read-modal" onClick={(e) => e.stopPropagation()}>
            <h4 className="telegraph-read-from">{telegraphReadOpen.from}</h4>
            <p className="telegraph-read-body">{telegraphReadOpen.message}</p>
            <button
              type="button"
              className="telegraph-read-close"
              onClick={() => setTelegraphReadOpen(null)}
            >
              Kapat
            </button>
          </div>
        </div>
      ) : null}

      <ContextMenu
        menu={contextMenu}
        resources={resources}
        onSelectUnit={placeUnit}
        onDeclareWar={openWarPanelFromMenu}
      />


      <WarTacticPanel
        panel={warPanel}
        tacticText={warTacticText}
        onTacticChange={setWarTacticText}
        timeLeftSec={warPanel?.timeLeftSec ?? 0}
        onAttack={handleDeclareWarSubmit}
        onDefenseSubmit={handleDefenseSubmit}
      />

      <WarResultModal
        data={warResultModal}
        onClose={() => setWarResultModal(null)}
      />

      <NewspaperModal
        data={newspaper}
        players={players}
        onClose={() => setNewspaper(null)}
      />

      {isHost && !turnActive && (
        <button
          className="start-turn-btn"
          onClick={() => socket?.emit('startTurn')}
        >
          Turu Başlat
        </button>
      )}
      </div>
      <BottomBar resources={resources} />
    </>
  )
}

export default App
