import { useMemo } from 'react'
import { NEWSPAPER_NAME } from '../../constants/gameConstants'
import { shuffleForNewspaper, formatWarHeadlineForPaper } from '../../utils/formatUtils'

export function NewspaperModal({ data, players, onClose }) {
  const rankingRows = useMemo(() => {
    const scores =
      Array.isArray(data?.powerScores) && data.powerScores.length > 0
        ? data.powerScores
        : null
    if (scores) {
      return scores.map((row, idx) => {
        const pl = Object.values(players || {}).find((p) => p.country === row.country)
        return {
          rank: idx + 1,
          country: row.country,
          score: row.score,
          playerName: pl?.name,
        }
      })
    }
    const list = Object.values(players || {}).filter((p) => p?.name && p?.country)
    return shuffleForNewspaper(list).map((p, idx) => ({
      rank: idx + 1,
      country: p.country,
      score: null,
      playerName: p.name,
    }))
  }, [data, players])

  if (!data) return null

  const dispatchYear =
    data.dispatchYear ?? (typeof data.year === 'number' ? data.year - 1 : null)
  const wars = Array.isArray(data.wars) ? data.wars : []
  const territoryDelta =
    data.territories && typeof data.territories === 'object' ? data.territories : {}
  const territoryLines = Object.entries(territoryDelta).filter(([from, to]) => from && to)
  const interceptedTel = Array.isArray(data.interceptedTelegraphs)
    ? data.interceptedTelegraphs
    : []
  const nextYear = data.nextCalendarYear ?? data.year
  const mastheadEmpty =
    wars.length === 0 && territoryLines.length === 0 && interceptedTel.length === 0

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
          {rankingRows.map((row) => (
            <li
              key={`${row.rank}-${row.country}`}
              className={`newspaper-ranking-row${row.rank === 1 ? ' newspaper-ranking-row--leader' : ''}`}
            >
              <span className="newspaper-rank-num">{row.rank}.</span>
              <span className="newspaper-rank-main">
                <span className="newspaper-rank-country-line">
                  {row.country} — {row.score != null ? `${row.score} puan` : '—'}
                </span>
                {row.playerName ? (
                  <span className="newspaper-rank-name-sub">{row.playerName}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
        {rankingRows.length === 0 ? (
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
