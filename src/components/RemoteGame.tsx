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
  nicknameA: string
  nicknameB: string
  currentRound: number
  currentParams: VisualParams | null
  previousSceneIds: string[]
  history: RoundRecord[]
  finalComment: string | null
  myGuessSubmitted: boolean
  opponentGuessSubmitted: boolean
  opponentDisconnected: boolean
}

interface RemoteGameProps {
  roomCode: string
  role: 'host' | 'guest'
  myNickname: string
  onLeave: () => void
}

export function RemoteGame({ roomCode, role, myNickname, onLeave }: RemoteGameProps) {
  const [state, setState] = useState<RemoteState>({
    phase: 'waiting',
    nicknameA: '',
    nicknameB: '',
    currentRound: 0,
    currentParams: null,
    previousSceneIds: [],
    history: [],
    finalComment: null,
    myGuessSubmitted: false,
    opponentGuessSubmitted: false,
    opponentDisconnected: false,
  })

  const sendRef = useRef<(msg: ClientMessage) => void>(() => {})

  const callJudge = useCallback(async (guessA: string, guessB: string) => {
    setState((prev) => {
      // Capture values from current state for the async call
      const round = prev.currentRound
      const nickA = prev.nicknameA
      const nickB = prev.nicknameB
      const history = prev.history
      const params = prev.currentParams

      judgeGuesses({
        round,
        nicknameA: nickA,
        nicknameB: nickB,
        guessA,
        guessB,
        history,
      }).then(async (result) => {
        const isGameOver = result.match === 'different' || result.match === 'opposite'

        if (isGameOver) {
          const fullHistory: RoundRecord[] = [...history, {
            round,
            params: params!,
            guessA, guessB,
            match: result.match,
            comment: result.comment,
          }]
          try {
            const finalResult = await judgeGuesses({
              round,
              nicknameA: nickA,
              nicknameB: nickB,
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
      }).catch(() => {
        sendRef.current({
          type: 'judge_result',
          result: { match: 'different', comment: t().aiFallback },
        })
      })

      return prev // no state change from setState
    })
  }, [])

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'room_state': {
        const rs = msg.state
        const hasOpponent = role === 'host' ? !!rs.nicknameB : !!rs.nicknameA
        let phase: RemotePhase = 'waiting'
        if (rs.phase === 'gameOver') phase = 'gameOver'
        else if (rs.phase === 'roundResult') phase = 'roundResult'
        else if (rs.phase === 'judging') phase = 'judging'
        else if (rs.phase === 'playing') phase = 'playing'
        else if (hasOpponent) phase = 'lobby'

        setState((prev) => ({
          ...prev,
          phase,
          nicknameA: rs.nicknameA,
          nicknameB: rs.nicknameB,
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
        setState((prev) => {
          const next = { ...prev }
          if (msg.role === 'host') next.nicknameA = msg.nickname
          else next.nicknameB = msg.nickname
          if (next.nicknameA && next.nicknameB && next.phase === 'waiting') {
            next.phase = 'lobby'
          }
          return next
        })
        break

      case 'round_start':
        setState((prev) => ({
          ...prev,
          phase: 'playing',
          currentRound: msg.round,
          currentParams: msg.params,
          myGuessSubmitted: false,
          opponentGuessSubmitted: false,
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
          phase: 'gameOver',
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
    nickname: myNickname,
    onMessage: handleMessage,
  })

  useEffect(() => {
    sendRef.current = send
  })

  const myNick = role === 'host' ? state.nicknameA : state.nicknameB
  const opponentNick = role === 'host' ? state.nicknameB : state.nicknameA

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
    setState((prev) => {
      const nextRoundNum = prev.currentRound + 1
      const params = generateParams(nextRoundNum, prev.previousSceneIds, SCENE_REGISTRY)
      send({ type: 'start_round', round: nextRoundNum, params })
      return { ...prev, previousSceneIds: [...prev.previousSceneIds, params.sceneId] }
    })
  }, [role, send])

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
          myNickname={myNick || myNickname}
          onCancel={onLeave}
        />
      )

    case 'lobby':
      return (
        <RoomLobby
          roomCode={roomCode}
          nicknameA={state.nicknameA}
          nicknameB={state.nicknameB}
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
          myNickname={myNick || myNickname}
          opponentNickname={opponentNick}
          matchCount={matchCount}
          isJudging={state.phase === 'judging'}
          myGuessSubmitted={state.myGuessSubmitted}
          opponentGuessSubmitted={state.opponentGuessSubmitted}
          onSubmitGuess={handleSubmitGuess}
        />
      ) : null

    case 'roundResult': {
      const lastRecord = state.history[state.history.length - 1]
      if (!lastRecord) return null
      const isGameOver = lastRecord.match === 'different' || lastRecord.match === 'opposite'
      return (
        <RoundResultScreen
          record={lastRecord}
          nicknameA={state.nicknameA}
          nicknameB={state.nicknameB}
          isGameOver={isGameOver}
          onNext={handleNextRound}
        />
      )
    }

    case 'gameOver':
      return (
        <ResultsScreen
          nicknameA={state.nicknameA}
          nicknameB={state.nicknameB}
          history={state.history}
          finalComment={state.finalComment}
          onRestart={handleRestart}
          onShare={handleShare}
        />
      )
  }
}
