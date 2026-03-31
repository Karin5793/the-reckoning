import { formatWarCountdown } from '../../utils/formatUtils'

export function WarTacticPanel({
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
