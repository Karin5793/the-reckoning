import { useState } from 'react'
import { PLAYABLE_COUNTRIES } from '../../constants/gameConstants'

export function LobbyScreen({ onEnter, socket }) {
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
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button className="lobby-btn" type="submit">
            Savaşa Gir
          </button>
        </form>
      </div>
    </div>
  )
}
