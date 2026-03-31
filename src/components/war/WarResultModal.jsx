export function WarResultModal({ data, onClose }) {
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
