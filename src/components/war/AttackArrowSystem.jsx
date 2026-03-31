import { forwardRef, useImperativeHandle, useState } from 'react'

const AttackArrowSystem = forwardRef(function AttackArrowSystem(
  { selectedCity, onAttackConfirm, onCancel, resolvingLocation = false },
  ref,
) {
  const [attacks, setAttacks] = useState([])

  useImperativeHandle(
    ref,
    () => ({
      handleCityClick(targetCity) {
        if (!selectedCity) return
        if (targetCity.id === selectedCity.id) return
        setAttacks((prev) => {
          const exists = prev.find(
            (a) => a.fromId === selectedCity.id && a.toId === targetCity.id,
          )
          if (exists) return prev
          return [
            ...prev,
            {
              fromId: selectedCity.id,
              fromName: selectedCity.name,
              fromEmpire: selectedCity.empire,
              toId: targetCity.id,
              toName: targetCity.name,
              toEmpire: targetCity.empire,
              toLng: targetCity.lng,
              toLat: targetCity.lat,
            },
          ]
        })
      },
    }),
    [selectedCity],
  )

  function removeAttack(idx) {
    setAttacks((prev) => prev.filter((_, i) => i !== idx))
  }

  function confirmAttacks() {
    if (!attacks.length) return
    onAttackConfirm(attacks)
    setAttacks([])
  }

  if (!selectedCity) return null

  return (
    <div
      className={`attack-arrow-panel${resolvingLocation ? ' attack-arrow-panel--busy' : ''}`}
      aria-busy={resolvingLocation || undefined}
    >
      <div className="attack-arrow-header">
        <span>
          ⚔ {selectedCity.name} — Saldırı Planı
        </span>
        <button
          type="button"
          onClick={() => {
            setAttacks([])
            onCancel()
          }}
        >
          ✕
        </button>
      </div>
      <p className="attack-arrow-hint">
        {attacks.length === 0
          ? 'Saldırmak istediğin şehre tıkla'
          : `${attacks.length} cephe planlandı`}
      </p>
      <ul className="attack-arrow-list">
        {attacks.map((a, i) => (
          <li key={i} className="attack-arrow-item">
            <span>
              🗡 {a.fromName} → {a.toName}
            </span>
            <button type="button" onClick={() => removeAttack(i)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      {attacks.length > 0 && (
        <button type="button" className="attack-arrow-confirm" onClick={confirmAttacks}>
          Saldırıyı Onayla ({attacks.length} Cephe)
        </button>
      )}
    </div>
  )
})

export default AttackArrowSystem
