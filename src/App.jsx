import { useState, useEffect, useRef } from 'react'
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
const ENEMY_STYLE   = { ...BASE_BORDER, fillColor: '#8b1a1a', fillOpacity: 0.75 }

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

function PlayerListPanel({ players, currentPlayer }) {
  const entries = Object.values(players)
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
              <li key={i} className={`player-list-row${isSelf ? ' player-list-row--self' : ''}`}>
                <div className="player-list-info">
                  <span className="player-list-name">{p.name}</span>
                  <span className="player-list-country">{p.country}</span>
                </div>
                <span className="player-list-dot">●</span>
              </li>
            )
          })
        )}
      </ul>
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
  const [contextMenu, setContextMenu] = useState(null)
  const [warPanel, setWarPanel] = useState(null)
  const [warTacticText, setWarTacticText] = useState('')
  const [turnClosedToast, setTurnClosedToast] = useState(null)
  const selectedLayerRef = useRef(null)
  const geoJsonRef = useRef(null)
  const playersRef = useRef({})
  const playerRef = useRef(null)
  const turnActiveRef = useRef(turnActive)
  const toastTimeoutRef = useRef(null)

  turnActiveRef.current = turnActive

  function getFeatureStyle(feature) {
    const rawName = feature.properties.NAME || feature.properties.name || ''
    const ww1Name = resolveCountryName(rawName)
    const myCountry = playerRef.current?.country
    if (myCountry && ww1Name.startsWith(myCountry)) return MY_STYLE
    const isEnemy = Object.values(playersRef.current).some(
      (p) => p.country && ww1Name.startsWith(p.country)
    )
    if (isEnemy) return ENEMY_STYLE
    return DEFAULT_STYLE
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
    })

    newSocket.on('unitsUpdate', (updatedUnits) => {
      setUnits(updatedUnits)
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

    newSocket.on('turnEnded', ({ year, turn }) => {
      setGameYear(year)
      setGameTurn(turn)
      setTurnActive(false)
      setTimeLeft(0)
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

    setSocket(newSocket)

    return () => newSocket.disconnect()
  }, [])

  useEffect(() => {
    if (!geoJsonRef.current) return
    geoJsonRef.current.eachLayer((layer) => {
      if (!layer.feature || layer === selectedLayerRef.current) return
      layer.setStyle(getFeatureStyle(layer.feature))
    })
  }, [players])

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

        const empire = empireAtTerritory(ww1Name, playersRef.current)
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

      <PlayerListPanel players={players} currentPlayer={player} />

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
