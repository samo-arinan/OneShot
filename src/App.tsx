import { useState, useCallback } from 'react'
import { StartScreen } from './components/StartScreen'
import { GameScreen } from './components/GameScreen'
import { RoundResultScreen } from './components/RoundResultScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { judgeGuesses } from './lib/api'
import { generateParams } from './lib/scene-selector'
import { SCENE_REGISTRY } from './scenes/registry'
import { buildShareText, shareToTwitter } from './lib/share'
import { t } from './lib/i18n'
import type { GameState, RoundRecord } from './types'

function createInitialState(): GameState {
  return {
    phase: 'start',
    nicknameA: '',
    nicknameB: '',
    currentRound: 0,
    currentParams: { seed: 0, coherence: 1, sceneId: '' },
    previousSceneIds: [],
    history: [],
    lastResult: null,
    isJudging: false,
    error: null,
    finalComment: null,
  }
}

export default function App() {
  const [state, setState] = useState<GameState>(createInitialState)

  const startGame = useCallback((nicknameA: string, nicknameB: string) => {
    const params = generateParams(1, [], SCENE_REGISTRY)
    setState({
      ...createInitialState(),
      phase: 'playing',
      nicknameA,
      nicknameB,
      currentRound: 1,
      currentParams: params,
      previousSceneIds: [params.sceneId],
    })
  }, [])

  const submitGuesses = useCallback(async (guessA: string, guessB: string) => {
    setState((prev) => ({ ...prev, isJudging: true, error: null }))

    try {
      const result = await judgeGuesses({
        round: state.currentRound,
        nicknameA: state.nicknameA,
        nicknameB: state.nicknameB,
        guessA,
        guessB,
        history: state.history,
      })

      const record: RoundRecord = {
        round: state.currentRound,
        params: state.currentParams,
        guessA,
        guessB,
        match: result.match,
        comment: result.comment,
      }

      const isGameOver = result.match === 'different' || result.match === 'opposite'
      const fullHistory = [...state.history, record]

      setState((prev) => ({
        ...prev,
        phase: 'roundResult',
        history: [...prev.history, record],
        lastResult: result,
        isJudging: false,
      }))

      if (isGameOver) {
        judgeGuesses({
          round: state.currentRound,
          nicknameA: state.nicknameA,
          nicknameB: state.nicknameB,
          guessA,
          guessB,
          history: fullHistory,
          isFinal: true,
        }).then((finalResult) => {
          setState((prev) => ({ ...prev, finalComment: finalResult.comment }))
        }).catch(() => {
          // Final comment is optional; silently ignore errors
        })
      }
    } catch {
      setState((prev) => ({
        ...prev,
        isJudging: false,
        error: t().judgeFailed,
      }))
    }
  }, [state.currentRound, state.nicknameA, state.nicknameB, state.currentParams, state.history])

  const nextRound = useCallback(() => {
    setState((prev) => {
      const lastRecord = prev.history[prev.history.length - 1]
      if (!lastRecord) return prev

      const isGameOver = lastRecord.match === 'different' || lastRecord.match === 'opposite'

      if (isGameOver) {
        return { ...prev, phase: 'results' }
      }

      const nextRoundNum = prev.currentRound + 1
      const params = generateParams(nextRoundNum, prev.previousSceneIds, SCENE_REGISTRY)
      return {
        ...prev,
        phase: 'playing',
        currentRound: nextRoundNum,
        currentParams: params,
        previousSceneIds: [...prev.previousSceneIds, params.sceneId],
      }
    })
  }, [])

  const restart = useCallback(() => {
    setState(createInitialState())
  }, [])

  const share = useCallback(() => {
    const score = state.history.filter(
      (r) => r.match === 'perfect' || r.match === 'close'
    ).length
    shareToTwitter(buildShareText(score))
  }, [state.history])

  const matchCount = state.history.filter(
    (r) => r.match === 'perfect' || r.match === 'close'
  ).length

  switch (state.phase) {
    case 'start':
      return <StartScreen onStart={startGame} />

    case 'playing':
      return (
        <>
          <GameScreen
            round={state.currentRound}
            params={state.currentParams}
            nicknameA={state.nicknameA}
            nicknameB={state.nicknameB}
            matchCount={matchCount}
            isJudging={state.isJudging}
            onSubmit={submitGuesses}
          />
          {state.error && (
            <div className="fixed bottom-4 left-4 right-4 bg-red-900/90 text-red-100 p-3 rounded-lg text-center text-sm">
              {state.error}
            </div>
          )}
        </>
      )

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
          onNext={nextRound}
        />
      )
    }

    case 'results':
      return (
        <ResultsScreen
          nicknameA={state.nicknameA}
          nicknameB={state.nicknameB}
          history={state.history}
          finalComment={state.finalComment}
          onRestart={restart}
          onShare={share}
        />
      )
  }
}
