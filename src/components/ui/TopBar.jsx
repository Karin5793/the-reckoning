import { formatTime } from '../../utils/formatUtils'

export function TopBar({ year, turn, maxTurns, turnActive, timeLeft }) {
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
