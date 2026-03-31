import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { WAR_TACTIC_SECONDS } from '../constants/gameConstants'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3002'

/**
 * @param {React.MutableRefObject<Record<string, unknown>>} handlersRef
 * Güncel setter ve ref'ler her render'da handlersRef.current içine yazılmalı.
 */
export function useSocket(handlersRef) {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const newSocket = io(SERVER_URL)

    newSocket.on('connect', () => {
      console.log('Sunucuya bağlandı:', newSocket.id)
    })

    newSocket.on('gameState', (state) => {
      const h = handlersRef.current
      h.setGameYear(state.year)
      h.setGameTurn(state.turn)
      h.setGameMaxTurns(state.maxTurns)
      h.setTurnActive(state.turnActive)
      h.setIsHost(state.isHost)
      if (state.turnEndTime) {
        h.setTimeLeft(Math.max(0, state.turnEndTime - Date.now()))
      }
      if (state.units) h.setUnits(state.units)
      if (state.military && typeof state.military === 'object') h.setMilitary(state.military)
      if (state.territories && typeof state.territories === 'object') {
        h.territoriesRef.current = state.territories
        h.setTerritories(state.territories)
      }
    })

    newSocket.on('militaryUpdate', (data) => {
      if (data && typeof data === 'object') handlersRef.current.setMilitary(data)
    })

    newSocket.on('unitsUpdate', (updatedUnits) => {
      handlersRef.current.setUnits(updatedUnits)
    })

    newSocket.on('territoriesUpdate', (payload) => {
      if (payload && typeof payload === 'object') {
        handlersRef.current.territoriesRef.current = payload
        handlersRef.current.setTerritories(payload)
      }
    })

    newSocket.on('resourcesUpdate', (payload) => {
      if (payload && typeof payload === 'object') {
        handlersRef.current.setResources({
          bugday: payload.bugday ?? 0,
          demir: payload.demir ?? 0,
          petrol: payload.petrol ?? 0,
          para: payload.para ?? 0,
          nig: payload.nig ?? 0,
        })
      }
    })

    newSocket.on('turnStarted', ({ year, turn, turnEndTime }) => {
      const h = handlersRef.current
      h.setGameYear(year)
      h.setGameTurn(turn)
      h.setTurnActive(true)
      h.setTimeLeft(Math.max(0, turnEndTime - Date.now()))
    })

    newSocket.on('turnEnded', (payload) => {
      const h = handlersRef.current
      const year = payload?.year
      const turn = payload?.turn
      if (typeof year === 'number') h.setGameYear(year)
      if (typeof turn === 'number') h.setGameTurn(turn)
      h.setTurnActive(false)
      h.setTimeLeft(0)
      h.setNewspaper({
        dispatchYear: payload?.dispatchYear ?? (typeof year === 'number' ? year - 1 : undefined),
        wars: Array.isArray(payload?.wars) ? payload.wars : [],
        territories:
          payload?.territories && typeof payload.territories === 'object'
            ? payload.territories
            : {},
        interceptedTelegraphs: Array.isArray(payload?.interceptedTelegraphs)
          ? payload.interceptedTelegraphs
          : [],
        powerScores: Array.isArray(payload?.powerScores) ? payload.powerScores : [],
        nextCalendarYear: typeof year === 'number' ? year : undefined,
        year: typeof year === 'number' ? year : undefined,
      })
    })

    newSocket.on('telegraphReceived', ({ from, message }) => {
      if (!from) return
      handlersRef.current.setTelegraphInbox((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          from,
          message: String(message ?? ''),
        },
      ])
    })

    newSocket.on('telegraphIntercepted', ({ from, to, message }) => {
      if (!from || !to) return
      handlersRef.current.setInterceptToasts((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          from,
          to,
          message: String(message ?? ''),
        },
      ])
    })

    newSocket.on('turnTimer', ({ remaining }) => {
      handlersRef.current.setTimeLeft(remaining)
    })

    newSocket.on('promotedToHost', () => {
      handlersRef.current.setIsHost(true)
    })

    newSocket.on('playersUpdate', (updatedPlayers) => {
      const h = handlersRef.current
      h.playersRef.current = updatedPlayers
      h.setPlayers(updatedPlayers)
    })

    newSocket.on('warDeclared', (payload) => {
      if (!payload?.warId) return
      const h = handlersRef.current
      h.setWarTacticText('')
      h.setWarPanel({
        role: 'defense',
        warId: payload.warId,
        attacker: payload.attacker,
        defender: payload.defender,
        attackerTactic: payload.attackerTactic || '',
        timeLeftSec: payload.timeLeft ?? WAR_TACTIC_SECONDS,
      })
    })

    newSocket.on('warResult', (payload) => {
      if (!payload?.attacker || !payload?.defender) return
      const h = handlersRef.current
      h.setWarPanel(null)
      h.setWarTacticText('')
      h.setWarResultModal({
        attacker: payload.attacker,
        defender: payload.defender,
        result: typeof payload.result === 'string' ? payload.result : String(payload.result ?? ''),
        parsed: payload.parsed,
      })
    })

    newSocket.on('multiWarDeclared', (payload) => {
      if (!payload?.warId || !Array.isArray(payload.attacks)) return
      const h = handlersRef.current
      h.setTacticPhase({
        role: 'defense',
        attacks: payload.attacks,
        warId: payload.warId,
      })
    })

    newSocket.on('multiWarResult', (payload) => {
      console.log('Savaş sonucu:', payload)
    })

    newSocket.on('locationNameResult', ({ lat, lng, name }) => {
      const h = handlersRef.current
      h.setSelectedCity((prev) => {
        if (!prev) return prev
        return { ...prev, name }
      })
      h.setLoadingLocation(false)
    })

    queueMicrotask(() => {
      setSocket(newSocket)
    })

    return () => newSocket.disconnect()
  }, [handlersRef])

  return { socket }
}
