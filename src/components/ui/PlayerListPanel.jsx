export function PlayerListPanel({ players, currentPlayer, territories, onTelegraphTo }) {
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
