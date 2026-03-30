import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
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

const DEFAULT_STYLE = {
  fillColor: '#8b7355',
  weight: 1.5,
  color: '#2c1810',
  fillOpacity: 0.5,
}

const HOVER_STYLE = {
  ...DEFAULT_STYLE,
  fillOpacity: 0.75,
}

const SELECTED_STYLE = {
  fillColor: '#6b4423',
  weight: 1.5,
  color: '#2c1810',
  fillOpacity: 0.85,
}

const RESOURCES = [
  { icon: '🌾', label: 'Buğday', value: 120 },
  { icon: '⚙️', label: 'Demir', value: 85 },
  { icon: '🛢️', label: 'Petrol', value: 40 },
  { icon: '💰', label: 'Para', value: 200 },
  { icon: '👤', label: 'NİG', value: 30 },
]

function TopBar() {
  return (
    <div className="top-bar">
      <span className="bar-logo">THE RECKONING</span>
      <span className="bar-year">1914</span>
      <span className="bar-turn">TUR: 1 / 4</span>
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

function App() {
  const [geoData, setGeoData] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const selectedLayerRef = useRef(null)
  const geoJsonRef = useRef(null)

  useEffect(() => {
    fetchWW1Borders()
      .then((data) => setGeoData(data))
      .catch((err) => console.error('WW1 sınırları yüklenemedi:', err))
  }, [])

  function resetSelected() {
    if (selectedLayerRef.current) {
      selectedLayerRef.current.setStyle(DEFAULT_STYLE)
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
          l.setStyle(DEFAULT_STYLE)
        }
      },
      click(e) {
        resetSelected()
        const l = e.target
        l.setStyle(SELECTED_STYLE)
        selectedLayerRef.current = l
        const modernName = feature.properties.NAME || feature.properties.name || 'Bilinmiyor'
        setSelectedCountry({
          name: resolveCountryName(modernName),
        })
      },
    })
  }

  return (
    <>
      <TopBar />
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
            style={DEFAULT_STYLE}
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
      </div>
      <BottomBar />
    </>
  )
}

export default App
