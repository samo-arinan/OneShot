import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useRoom } from '../lib/room'
import { WaitingScreen } from './WaitingScreen'
import { RoomLobby } from './RoomLobby'
import { RemoteGameScreen } from './RemoteGameScreen'
import { RoundResultScreen } from './RoundResultScreen'
import { ResultsScreen } from './ResultsScreen'
import { judgeGuesses } from '../lib/api'
import { generateParams } from '../lib/scene-selector'
import { SCENE_REGISTRY } from '../scenes/registry'
import { buildShareText, shareToTwitter } from '../lib/share'
import { t } from '../lib/i18n'
import type { ServerMessage } from '../../party/protocol'
import type { ClientMessage } from '../../party/protocol'
import type { VisualParams, RoundRecord } from '../types'

type RemotePhase = 'waiting' | 'lobby' | 'playing' | 'judging' | 'roundResult' | 'gameOver'

interface RemoteState {
  phase: RemotePhase
  hasOpponent: boolean
  currentRound: number
  currentParams: VisualParams | null
  previousSceneIds: string[]
  history: RoundRecord[]
  finalComment: string | null
  myGuessSubmitted: boolean
  opponentGuessSubmitted: boolean
  opponentDisconnected: boolean
  revealedGuessA: string | null
  revealedGuessB: string | null
}

interface RemoteGameProps {
  roomCode: string
  role: 'host' | 'guest'
  onLeave: () => void
}

export function RemoteGame({ roomCode, role, onLeave }: RemoteGameProps) {
  const [state, setState] = useState<RemoteState>({
    phase: 'waiting',
    hasOpponent: false,
    currentRound: 0,
    currentParams: null,
    previousSceneIds: [],
    history: [],
    finalComment: null,
    myGuessSubmitted: false,
    opponentGuessSubmitted: false,
    opponentDisconnected: false,
    revealedGuessA: null,
    revealedGuessB: null,
  })

  const stateRef = useRef(state)
  stateRef.current = state
  const sendRef = useRef<(msg: ClientMessage) => void>(() => {})
  const judgingRef = useRef(false)

  const callJudge = useCallback(async (guessA: string, guessB: string) => {
    if (judgingRef.current) return
    judgingRef.current = true

    const { currentRound, history, currentParams } = stateRef.current

    try {
      const result = await judgeGuesses({
        round: currentRound,
        nicknameA: t().player1Label,
        nicknameB: t().player2Label,
        guessA,
        guessB,
        history,
      })

      const isGameOver = result.match === 'different' || result.match === 'opposite'

      if (isGameOver) {
        const fullHistory: RoundRecord[] = [...history, {
          round: currentRound,
          params: currentParams!,
          guessA, guessB,
          match: result.match,
          comment: result.comment,
        }]
        try {
          const finalResult = await judgeGuesses({
            round: currentRound,
            nicknameA: t().player1Label,
            nicknameB: t().player2Label,
            guessA, guessB,
            history: fullHistory,
            isFinal: true,
          })
          sendRef.current({
            type: 'judge_result',
            result: {
              match: result.match,
              comment: result.comment,
              finalComment: finalResult.comment,
            },
          })
        } catch {
          sendRef.current({
            type: 'judge_result',
            result: { match: result.match, comment: result.comment },
          })
        }
      } else {
        sendRef.current({
          type: 'judge_result',
          result: { match: result.match, comment: result.comment },
        })
      }
    } catch {
      sendRef.current({
        type: 'judge_result',
        result: { match: 'different', comment: t().aiFallback },
      })
    } finally {
      judgingRef.current = false
    }
  }, [])

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'room_state': {
        const rs = msg.state
        const hasOpponent = rs.hasHost && rs.hasGuest
        let phase: RemotePhase = 'waiting'
        if (rs.phase === 'gameOver') phase = 'gameOver'
        else if (rs.phase === 'roundResult') phase = 'roundResult'
        else if (rs.phase === 'judging') phase = 'judging'
        else if (rs.phase === 'playing') phase = 'playing'
        else if (hasOpponent) phase = 'lobby'

        setState((prev) => ({
          ...prev,
          phase,
          hasOpponent,
          currentRound: rs.currentRound,
          currentParams: rs.currentParams,
          history: rs.history.map((r) => ({
            round: r.round, params: r.params,
            guessA: r.guessA, guessB: r.guessB,
            match: r.match, comment: r.comment,
          })),
          finalComment: rs.finalComment,
          myGuessSubmitted: role === 'host' ? rs.guessASubmitted : rs.guessBSubmitted,
          opponentGuessSubmitted: role === 'host' ? rs.guessBSubmitted : rs.guessASubmitted,
        }))
        break
      }

      case 'player_joined':
        // State transition handled by room_state broadcast that follows
        break

      case 'round_start':
        setState((prev) => ({
          ...prev,
          phase: 'playing',
          currentRound: msg.round,
          currentParams: msg.params,
          myGuessSubmitted: false,
          opponentGuessSubmitted: false,
          revealedGuessA: null,
          revealedGuessB: null,
        }))
        break

      case 'guess_received': {
        const isMyGuess = (role === 'host' && msg.from === 'A') || (role === 'guest' && msg.from === 'B')
        if (!isMyGuess) {
          setState((prev) => ({ ...prev, opponentGuessSubmitted: true }))
        }
        break
      }

      case 'both_guessed':
        setState((prev) => ({
          ...prev,
          phase: 'judging',
          myGuessSubmitted: true,
          opponentGuessSubmitted: true,
          revealedGuessA: msg.guessA,
          revealedGuessB: msg.guessB,
        }))
        if (role === 'host') {
          callJudge(msg.guessA, msg.guessB)
        }
        break

      case 'round_result': {
        const record: RoundRecord = {
          round: msg.record.round, params: msg.record.params,
          guessA: msg.record.guessA, guessB: msg.record.guessB,
          match: msg.record.match, comment: msg.record.comment,
        }
        setState((prev) => ({
          ...prev,
          phase: 'roundResult',
          history: [...prev.history, record],
        }))
        break
      }

      case 'game_over':
        setState((prev) => ({
          ...prev,
          // Don't override roundResult phase — let user see last round's result first
          phase: prev.phase === 'roundResult' ? 'roundResult' : 'gameOver',
          finalComment: msg.finalComment,
        }))
        break

      case 'opponent_disconnected':
        setState((prev) => ({ ...prev, opponentDisconnected: true }))
        break

      case 'opponent_reconnected':
        setState((prev) => ({ ...prev, opponentDisconnected: false }))
        break

      case 'error':
        break
    }
  }, [role, callJudge])

  const { send, connected } = useRoom({
    roomCode,
    role,
    onMessage: handleMessage,
  })

  useEffect(() => {
    sendRef.current = send
  })

  const matchCount = useMemo(() =>
    state.history.filter((r) => r.match === 'perfect' || r.match === 'close').length,
    [state.history]
  )

  const handleStartGame = useCallback(() => {
    const params = generateParams(1, [], SCENE_REGISTRY)
    setState((prev) => ({ ...prev, previousSceneIds: [params.sceneId] }))
    send({ type: 'start_round', round: 1, params })
  }, [send])

  const handleSubmitGuess = useCallback((guess: string) => {
    setState((prev) => ({ ...prev, myGuessSubmitted: true }))
    send({ type: 'submit_guess', guess })
  }, [send])

  const handleNextRound = useCallback(() => {
    if (role !== 'host') return
    const { currentRound, previousSceneIds } = stateRef.current
    const nextRoundNum = currentRound + 1
    const params = generateParams(nextRoundNum, previousSceneIds, SCENE_REGISTRY)
    setState((prev) => ({ ...prev, previousSceneIds: [...prev.previousSceneIds, params.sceneId] }))
    send({ type: 'start_round', round: nextRoundNum, params })
  }, [role, send])

  const handleViewResults = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'gameOver' }))
  }, [])

  const handleRestart = useCallback(() => {
    send({ type: 'play_again' })
  }, [send])

  const handleShare = useCallback(() => {
    shareToTwitter(buildShareText(matchCount))
  }, [matchCount])

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">{t().reconnecting}</div>
      </div>
    )
  }

  if (state.opponentDisconnected && state.phase !== 'gameOver') {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-yellow-400 mb-4">{t().opponentDisconnected}</div>
          <button
            onClick={onLeave}
            className="text-gray-500 hover:text-gray-300 text-sm cursor-pointer"
          >
            Leave
          </button>
        </div>
      </div>
    )
  }

  switch (state.phase) {
    case 'waiting':
      return (
        <WaitingScreen
          roomCode={roomCode}
          onCancel={onLeave}
        />
      )

    case 'lobby':
      return (
        <RoomLobby
          roomCode={roomCode}
          isHost={role === 'host'}
          onStartGame={handleStartGame}
        />
      )

    case 'playing':
    case 'judging':
      return state.currentParams ? (
        <RemoteGameScreen
          round={state.currentRound}
          params={state.currentParams}
          myRole={role}
          matchCount={matchCount}
          isJudging={state.phase === 'judging'}
          myGuessSubmitted={state.myGuessSubmitted}
          opponentGuessSubmitted={state.opponentGuessSubmitted}
          onSubmitGuess={handleSubmitGuess}
          revealedGuessA={state.revealedGuessA}
          revealedGuessB={state.revealedGuessB}
        />
      ) : null

    case 'roundResult': {
      const lastRecord = state.history[state.history.length - 1]
      if (!lastRecord) return null
      const isGameOver = lastRecord.match === 'different' || lastRecord.match === 'opposite'
      return (
        <RoundResultScreen
          record={lastRecord}
          isGameOver={isGameOver}
          onNext={isGameOver ? handleViewResults : handleNextRound}
        />
      )
    }

    case 'gameOver':
      return (
        <ResultsScreen
          history={state.history}
          finalComment={state.finalComment}
          onRestart={handleRestart}
          onShare={handleShare}
        />
      )
  }
}
