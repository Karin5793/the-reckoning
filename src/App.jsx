import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { LobbyScreen } from './components/lobby/LobbyScreen'
import MapboxMap from './components/map/MapboxMap'
import { TelegraphPanel } from './components/diplomacy/TelegraphPanel'
import { NewspaperModal } from './components/newspaper/NewspaperModal'
import { BottomBar } from './components/ui/BottomBar'
import { ContextMenu } from './components/ui/ContextMenu'
import { CountryPanel } from './components/ui/CountryPanel'
import { PlayerListPanel } from './components/ui/PlayerListPanel'
import { TopBar } from './components/ui/TopBar'
import CityPanel from './components/ui/CityPanel'
import AttackArrowSystem from './components/war/AttackArrowSystem'
import { WarResultModal } from './components/war/WarResultModal'
import TacticInputPanel from './components/war/TacticInputPanel'
import { WarTacticPanel } from './components/war/WarTacticPanel'
import { EMPTY_RESOURCES, UNIT_TYPES, WAR_TACTIC_SECONDS } from './constants/gameConstants'
import { useSocket } from './hooks/useSocket'
import { collectOwnUnits } from './utils/territoryUtils'
import './App.css'

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [players, setPlayers] = useState({})
  const [player, setPlayer] = useState(null)
  const [gameYear, setGameYear] = useState(1910)
  const [gameTurn, setGameTurn] = useState(1)
  const [gameMaxTurns, setGameMaxTurns] = useState(4)
  const [turnActive, setTurnActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isHost, setIsHost] = useState(false)
  const [resources, setResources] = useState(EMPTY_RESOURCES)
  const [units, setUnits] = useState({})
  const [territories, setTerritories] = useState({})
  const [contextMenu, setContextMenu] = useState(null)
  const [warPanel, setWarPanel] = useState(null)
  const [warTacticText, setWarTacticText] = useState('')
  const [warResultModal, setWarResultModal] = useState(null)
  const [newspaper, setNewspaper] = useState(null)
  const [telegraphPanelCountry, setTelegraphPanelCountry] = useState(null)
  const [telegraphDraft, setTelegraphDraft] = useState('')
  const [telegraphInbox, setTelegraphInbox] = useState([])
  const [telegraphReadOpen, setTelegraphReadOpen] = useState(null)
  const [interceptToasts, setInterceptToasts] = useState([])
  const [turnClosedToast, _setTurnClosedToast] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedCityPanel, setSelectedCityPanel] = useState(null)
  const [military, setMilitary] = useState({})
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [tacticPhase, setTacticPhase] = useState(null)
  const [warContextMenu, setWarContextMenu] = useState(null)

  const attackArrowRef = useRef(null)
  const playersRef = useRef({})
  const territoriesRef = useRef({})
  const playerRef = useRef(null)
  const turnActiveRef = useRef(turnActive)
  const toastTimeoutRef = useRef(null)

  const socketHandlersRef = useRef({})

  useLayoutEffect(() => {
    socketHandlersRef.current = {
      setGameYear,
      setGameTurn,
      setGameMaxTurns,
      setTurnActive,
      setIsHost,
      setTimeLeft,
      setUnits,
      setTerritories,
      setResources,
      setTelegraphInbox,
      setInterceptToasts,
      setPlayers,
      setWarTacticText,
      setWarPanel,
      setWarResultModal,
      setNewspaper,
      setTacticPhase,
      setSelectedCity,
      setLoadingLocation,
      setMilitary,
      territoriesRef,
      playersRef,
    }
  }, [])

  const { socket } = useSocket(socketHandlersRef)

  useEffect(() => {
    turnActiveRef.current = turnActive
  }, [turnActive])

  const clearMapSelection = useCallback(() => {}, [])

  const onCountrySelect = useCallback((ww1Name) => {
    setContextMenu(null)
    setSelectedCountry({ name: ww1Name })
  }, [])

  function handleEnterGame(p) {
    playerRef.current = p
    setPlayer(p)
  }

  useEffect(() => {
    const toastRef = toastTimeoutRef
    return () => {
      const id = toastRef.current
      if (id != null) clearTimeout(id)
    }
  }, [])

  const warPanelKey = warPanel
    ? `${warPanel.role}-${warPanel.warId ?? 'atk'}-${warPanel.attacker}-${warPanel.defender}`
    : ''

  useEffect(() => {
    if (!warPanelKey) return
    const id = setInterval(() => {
      setWarPanel((prev) => {
        if (!prev) return null
        if (prev.timeLeftSec <= 1) return { ...prev, timeLeftSec: 0 }
        return { ...prev, timeLeftSec: prev.timeLeftSec - 1 }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [warPanelKey])

  function placeUnit(unitType) {
    if (!contextMenu || contextMenu.type !== 'units') return
    const cost = UNIT_TYPES[unitType].cost
    const canAfford = Object.entries(cost).every(([res, amt]) => resources[res] >= amt)
    if (!canAfford) return
    socket?.emit('placeUnit', {
      country: contextMenu.country,
      unitType,
      playerId: socket.id,
    })
    setContextMenu(null)
  }

  function openWarPanelFromMenu() {
    if (!contextMenu || contextMenu.type !== 'war' || !player) return
    const defender = contextMenu.defender
    setContextMenu(null)
    setWarTacticText('')
    setWarPanel({
      role: 'attack',
      attacker: player.country,
      defender,
      timeLeftSec: WAR_TACTIC_SECONDS,
    })
  }

  function handleDeclareWarSubmit() {
    if (!warPanel || warPanel.role !== 'attack' || !socket || !player) return
    socket.emit('declareWar', {
      attacker: warPanel.attacker,
      defender: warPanel.defender,
      attackerTactic: warTacticText,
      attackerUnits: collectOwnUnits(units, player.country),
    })
    setWarPanel(null)
    setWarTacticText('')
  }

  function handleDefenseSubmit() {
    if (!warPanel || warPanel.role !== 'defense' || !socket || !warPanel.warId) return
    socket.emit('submitDefense', {
      warId: warPanel.warId,
      defenderTactic: warTacticText,
    })
    setWarPanel(null)
    setWarTacticText('')
  }

  useEffect(() => {
    if (!contextMenu) return
    function handleOutsideClick() {
      setContextMenu(null)
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [contextMenu])

  useEffect(() => {
    if (!warContextMenu) return
    function handleClick() {
      setWarContextMenu(null)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [warContextMenu])

  function handleOpenTelegraphPanel(targetCountry) {
    setTelegraphDraft('')
    setTelegraphPanelCountry(targetCountry)
  }

  function handleSubmitTelegraph() {
    if (!socket || !telegraphPanelCountry) return
    const text = telegraphDraft.trim()
    if (!text) return
    socket.emit('sendTelegraph', {
      to: telegraphPanelCountry,
      from: player?.country,
      message: text,
    })
    setTelegraphDraft('')
    setTelegraphPanelCountry(null)
  }

  if (!player) {
    return <LobbyScreen onEnter={handleEnterGame} socket={socket} />
  }

  return (
    <>
      <TopBar
        year={gameYear}
        turn={gameTurn}
        maxTurns={gameMaxTurns}
        turnActive={turnActive}
        timeLeft={timeLeft}
      />
      <div className="map-wrapper">
        {turnClosedToast && (
          <div className="turn-closed-toast" role="status">
            {turnClosedToast}
          </div>
        )}

        <div className="telegraph-notify-stack" aria-live="polite">
          {telegraphInbox.map((t) => (
            <button
              key={t.id}
              type="button"
              className="telegraph-inbox-chip"
              onClick={() => {
                setTelegraphReadOpen({ from: t.from, message: t.message })
                setTelegraphInbox((prev) => prev.filter((x) => x.id !== t.id))
              }}
            >
              📨 {t.from} ülkesinden telegraf geldi
            </button>
          ))}
          {interceptToasts.map((t) => (
            <div key={t.id} className="telegraph-intercept-card">
              <button
                type="button"
                className="telegraph-intercept-dismiss"
                aria-label="Kapat"
                onClick={() => setInterceptToasts((prev) => prev.filter((x) => x.id !== t.id))}
              >
                ✕
              </button>
              <p className="telegraph-intercept-title">
                📰 {t.from} → {t.to} telegrafı ele geçirildi!
              </p>
              <p className="telegraph-intercept-body">{t.message}</p>
            </div>
          ))}
        </div>

        <MapboxMap
          player={player}
          onCountrySelect={onCountrySelect}
          onCityClick={(city) => {
            if (!player) return
            setSelectedCityPanel(city)
            if (city.empire === player.country) {
              setSelectedCity(city)
            } else if (selectedCity) {
              attackArrowRef.current?.handleCityClick?.(city)
            }
          }}
          military={military}
          onMapClick={({ lng, lat }) => {
            if (!player) return
            setLoadingLocation(true)
            socket?.emit('getLocationName', { lat, lng })
            setSelectedCity({
              id: `custom_${lng.toFixed(3)}_${lat.toFixed(3)}`,
              name: 'Konum belirleniyor...',
              empire: null,
              lng,
              lat,
              isCustom: true,
            })
          }}
          onRightClick={(data) => {
            if (!player || !turnActive) return
            setWarContextMenu(data)
          }}
        />

        {warContextMenu && (
          <div
            className="war-context-menu"
            style={{
              position: 'fixed',
              left: warContextMenu.x,
              top: warContextMenu.y,
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
            role="menu"
          >
            <div className="war-context-menu-header">
              {warContextMenu.targetName || 'Bu Bölge'}
            </div>
            <button
              type="button"
              className="war-context-menu-item"
              onClick={() => {
                if (!selectedCity) {
                  alert('Önce kendi şehrine tıklayarak birlik seç!')
                  setWarContextMenu(null)
                  return
                }
                const target = {
                  id:
                    warContextMenu.targetId ||
                    `custom_${warContextMenu.lng.toFixed(3)}_${warContextMenu.lat.toFixed(3)}`,
                  name: warContextMenu.targetName || 'Belirsiz Bölge',
                  empire: null,
                  lng: warContextMenu.lng,
                  lat: warContextMenu.lat,
                }
                attackArrowRef.current?.handleCityClick?.(target)
                setWarContextMenu(null)
              }}
            >
              ⚔ Savaş İlan Et
            </button>
            <button
              type="button"
              className="war-context-menu-item war-context-menu-item--cancel"
              onClick={() => setWarContextMenu(null)}
            >
              İptal
            </button>
          </div>
        )}

        <CityPanel
          city={selectedCityPanel}
          military={military}
          myCountry={player?.country}
          onClose={() => setSelectedCityPanel(null)}
          onMoveUnits={({ fromCityId, toCityId, units: moveUnitsPayload }) => {
            socket?.emit('moveUnits', { fromCityId, toCityId, units: moveUnitsPayload })
          }}
        />

        <CountryPanel
          country={selectedCountry}
          onClose={() => {
            clearMapSelection()
            setSelectedCountry(null)
          }}
        />

        <PlayerListPanel
          players={players}
          currentPlayer={player}
          territories={territories}
          onTelegraphTo={(country) => handleOpenTelegraphPanel(country)}
        />

        <TelegraphPanel
          targetCountry={telegraphPanelCountry}
          messageText={telegraphDraft}
          onChange={setTelegraphDraft}
          onSend={handleSubmitTelegraph}
          onClose={() => {
            setTelegraphPanelCountry(null)
            setTelegraphDraft('')
          }}
        />

        {telegraphReadOpen ? (
          <div
            className="telegraph-read-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setTelegraphReadOpen(null)}
          >
            <div className="telegraph-read-modal" onClick={(e) => e.stopPropagation()}>
              <h4 className="telegraph-read-from">{telegraphReadOpen.from}</h4>
              <p className="telegraph-read-body">{telegraphReadOpen.message}</p>
              <button
                type="button"
                className="telegraph-read-close"
                onClick={() => setTelegraphReadOpen(null)}
              >
                Kapat
              </button>
            </div>
          </div>
        ) : null}

        <ContextMenu
          menu={contextMenu}
          resources={resources}
          onSelectUnit={placeUnit}
          onDeclareWar={openWarPanelFromMenu}
        />

        <WarTacticPanel
          panel={warPanel}
          tacticText={warTacticText}
          onTacticChange={setWarTacticText}
          timeLeftSec={warPanel?.timeLeftSec ?? 0}
          onAttack={handleDeclareWarSubmit}
          onDefenseSubmit={handleDefenseSubmit}
        />

        <AttackArrowSystem
          key={selectedCity?.id ?? 'attack-plan-closed'}
          ref={attackArrowRef}
          selectedCity={selectedCity}
          resolvingLocation={loadingLocation && Boolean(selectedCity?.isCustom)}
          onAttackConfirm={(attacks) => {
            setTacticPhase({ role: 'attack', attacks })
            setSelectedCity(null)
          }}
          onCancel={() => {
            setSelectedCity(null)
            setLoadingLocation(false)
          }}
        />

        {tacticPhase && (
          <TacticInputPanel
            attacks={tacticPhase.attacks}
            role={tacticPhase.role}
            onSubmit={(tactics) => {
              if (tacticPhase.role === 'attack') {
                socket?.emit('declareMultiWarAttack', {
                  attacks: tacticPhase.attacks,
                  attackerId: socket?.id,
                  tactics,
                })
              } else {
                socket?.emit('submitMultiDefense', {
                  warId: tacticPhase.warId,
                  defenseTactics: tactics,
                })
              }
              setTacticPhase(null)
            }}
            onCancel={() => {
              setTacticPhase(null)
            }}
          />
        )}

        <WarResultModal data={warResultModal} onClose={() => setWarResultModal(null)} />

        <NewspaperModal data={newspaper} players={players} onClose={() => setNewspaper(null)} />

        {isHost && !turnActive && (
          <button type="button" className="start-turn-btn" onClick={() => socket?.emit('startTurn')}>
            Turu Başlat
          </button>
        )}
      </div>
      <BottomBar resources={resources} />
    </>
  )
}

export default App
