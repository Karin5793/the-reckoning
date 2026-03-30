import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
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

// WW1 adından GeoJSON feature NAME'lerine ters eşleme (1-to-many)
const REVERSE_NAMES = Object.entries(WW1_NAMES).reduce((acc, [featureName, ww1Name]) => {
  if (!acc[ww1Name]) acc[ww1Name] = []
  acc[ww1Name].push(featureName)
  return acc
}, {})

function resolveFeatureNames(ww1Name) {
  return REVERSE_NAMES[ww1Name] ?? [ww1Name]
}

const BASE_BORDER = { weight: 1.5, color: '#2c1810' }

const DEFAULT_STYLE = { ...BASE_BORDER, fillColor: '#8b7355', fillOpacity: 0.5 }
const HOVER_STYLE   = { ...BASE_BORDER, fillColor: '#8b7355', fillOpacity: 0.75 }
const SELECTED_STYLE = { ...BASE_BORDER, fillColor: '#6b4423', fillOpacity: 0.85 }
const MY_STYLE      = { ...BASE_BORDER, fillColor: '#2d5a1b', fillOpacity: 0.75 }
const ENEMY_STYLE   = { ...BASE_BORDER, fillColor: '#8b1a1a', fillOpacity: 0.75 }

const RESOURCES = [
  { icon: '🌾', label: 'Buğday', value: 120 },
  { icon: '⚙️', label: 'Demir', value: 85 },
  { icon: '🛢️', label: 'Petrol', value: 40 },
  { icon: '💰', label: 'Para', value: 200 },
  { icon: '👤', label: 'NİG', value: 30 },
]

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

function BottomBar() {
  return (
    <div className="bottom-bar">
      {RESOURCES.map(({ icon, label, value }) => (
        <div key={label} className="resource-item">
          <span className="resource-icon">{icon}</span>
          <span className="resource-label">{label}</span>
          <span className="resource-value">{value}</span>
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
  const selectedLayerRef = useRef(null)
  const geoJsonRef = useRef(null)
  const playersRef = useRef({})
  const playerRef = useRef(null)

  function getFeatureStyle(feature) {
    const rawName = feature.properties.NAME || feature.properties.name || ''
    const ww1Name = resolveCountryName(rawName)
    const myCountry = playerRef.current?.country
    if (myCountry && ww1Name === myCountry) return MY_STYLE
    const isEnemy = Object.values(playersRef.current).some((p) => p.country === ww1Name)
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

  function resetSelected() {
    if (selectedLayerRef.current) {
      const f = selectedLayerRef.current.feature
      selectedLayerRef.current.setStyle(f ? getFeatureStyle(f) : DEFAULT_STYLE)
      selectedLayerRef.current = null
    }
  }

  function onEachFeature(feature, layer) {
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
        resetSelected()
        const l = e.target
        l.setStyle(SELECTED_STYLE)
        selectedLayerRef.current = l
        const modernName = feature.properties.NAME || feature.properties.name || 'Bilinmiyor'
        const ww1Name = resolveCountryName(modernName)
        setSelectedCountry({ name: ww1Name })
        if (socket && player) {
          socket.emit('selectCountry', { name: player.name, country: ww1Name })
        }
      },
    })
  }

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
      </MapContainer>

      <CountryPanel
        country={selectedCountry}
        onClose={() => {
          resetSelected()
          setSelectedCountry(null)
        }}
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
      <BottomBar />
    </>
  )
}

export default App
