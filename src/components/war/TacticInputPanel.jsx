import { useState } from 'react'

export default function TacticInputPanel({ attacks, role, onSubmit, onCancel }) {
  const [tactics, setTactics] = useState({})
  if (!attacks?.length) return null

  function handleSubmit() {
    const result = {}
    attacks.forEach((_, i) => {
      result[i] = tactics[i]?.trim() || 'AI'
    })
    onSubmit(result)
  }

  return (
    <div className="tactic-input-overlay">
      <div className="tactic-input-panel">
        <h3 className="tactic-input-title">
          {role === 'attack' ? '⚔ Saldırı Taktikleri' : '🛡 Savunma Taktikleri'}
        </h3>
        <p className="tactic-input-sub">Boş bırakırsan AI GM yönetir</p>
        {attacks.map((a, i) => (
          <div key={i} className="tactic-front">
            <label className="tactic-front-label" htmlFor={`tactic-front-${i}`}>
              Cephe {i + 1}: {a.fromName} → {a.toName}
            </label>
            <textarea
              id={`tactic-front-${i}`}
              className="tactic-front-textarea"
              placeholder="Taktik planı... (boş = AI GM)"
              value={tactics[i] || ''}
              onChange={(e) => setTactics((prev) => ({ ...prev, [i]: e.target.value }))}
              rows={3}
            />
          </div>
        ))}
        <div className="tactic-input-actions">
          <button type="button" className="tactic-btn-confirm" onClick={handleSubmit}>
            {role === 'attack' ? '⚔ Saldır!' : '🛡 Savunmayı Gönder'}
          </button>
          <button type="button" className="tactic-btn-cancel" onClick={onCancel}>
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  )
}
