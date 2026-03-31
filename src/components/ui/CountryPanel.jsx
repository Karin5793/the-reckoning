import ww1Countries from '../../data/ww1Countries'

const PANEL_ROWS = [
  { label: 'Nüfus', key: 'nufus' },
  { label: 'Kaynaklar', key: 'kaynaklar' },
  { label: 'Arazi', key: 'arazi' },
  { label: 'Stratejik Değer', key: 'stratejik' },
]

const NA = 'Veri mevcut değil'

export function CountryPanel({ country, onClose }) {
  if (!country) return null
  const data = ww1Countries[country.name] ?? null
  return (
    <div className="country-panel">
      <span className="panel-logo">THE RECKONING</span>
      <button type="button" className="panel-close" onClick={onClose}>
        ✕
      </button>
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
