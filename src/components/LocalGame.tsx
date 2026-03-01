import { useState, useCallback, useRef, useEffect } from 'react'
import { StartScreen } from './StartScreen'
import { GameScreen } from './GameScreen'
import { RoundResultScreen } from './RoundResultScreen'
import { ResultsScreen } from './ResultsScreen'
import { judgeGuesses } from '../lib/api'
import { generateParams } from '../lib/scene-selector'
import { SCENE_REGISTRY } from '../scenes/registry'
import { buildShareText, shareToTwitter } from '../lib/share'
import { t } from '../lib/i18n'
import { generateSvgWithRetry, startPrefetch } from '../lib/art-prefetch'
import type { PrefetchedRound } from '../lib/art-prefetch'
import type { GameState, RoundRecord, VisualParams } from '../types'

function createInitialState(): GameState {
  return {
    phase: 'start',
    currentRound: 0,
    currentParams: { seed: 0, sceneId: '' },
    previousSceneIds: [],
    history: [],
    lastResult: null,
    isJudging: false,
    error: null,
    finalComment: null,
    mode: 'local',
    artMode: 'ai-script',
    remote: null,
  }
}

interface LocalGameProps {
  roomCodeFromUrl?: string | null
  onCreateRoom?: () => void
  onJoinRoom?: () => void
}

export function LocalGame({ roomCodeFromUrl, onCreateRoom, onJoinRoom }: LocalGameProps = {}) {
  const [state, setState] = useState<GameState>(createInitialState)
  const [isGeneratingArt, setIsGeneratingArt] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state
  const judgingRef = useRef(false)
  const prefetchRef = useRef<PrefetchedRound | null>(null)
  const previousThemesRef = useRef<string[]>([])
  const round1PrefetchRef = useRef<PrefetchedRound | null>(null)

  // Pre-generate round 1 image when start screen is shown
  useEffect(() => {
    round1PrefetchRef.current = startPrefetch('ai-script', [])
  }, [])

  const startGame = useCallback(async () => {
    const fallbackParams = generateParams(1, [], SCENE_REGISTRY)
    setState({
      ...createInitialState(),
      phase: 'playing',
      currentRound: 1,
      currentParams: fallbackParams,
      previousSceneIds: [fallbackParams.sceneId],
      artMode: 'ai-script',
    })

    // Use pre-generated round 1 if available
    const round1Prefetch = round1PrefetchRef.current
    round1PrefetchRef.current = null

    if (round1Prefetch) {
      if (round1Prefetch.promise) {
        setIsGeneratingArt(true)
        await round1Prefetch.promise
        setIsGeneratingArt(false)
      }
      if (round1Prefetch.svgContent) {
        const theme = round1Prefetch.theme
        if (theme) previousThemesRef.current.push(theme)
        setState((prev) => ({
          ...prev,
          currentParams: { ...prev.currentParams, svgContent: round1Prefetch.svgContent!, theme },
        }))
      }
    } else {
      // Fallback: generate on demand if prefetch was somehow missing
      setIsGeneratingArt(true)
      const art = await generateSvgWithRetry([])
      if (art.svgContent) {
        if (art.theme) previousThemesRef.current.push(art.theme)
        setState((prev) => ({
          ...prev,
          currentParams: { ...prev.currentParams, svgContent: art.svgContent!, theme: art.theme },
        }))
      }
      setIsGeneratingArt(false)
    }

    // Start prefetching round 2
    prefetchRef.current = startPrefetch('ai-script', previousThemesRef.current)
  }, [])

  const submitGuesses = useCallback(async (guessA: string, guessB: string) => {
    if (!guessA || !guessB || judgingRef.current) return
    judgingRef.current = true

    const { currentRound, currentParams, history } = stateRef.current
    setState((prev) => ({ ...prev, isJudging: true, error: null }))

    try {
      const result = await judgeGuesses({
        round: currentRound,
        nicknameA: t().player1Label,
        nicknameB: t().player2Label,
        guessA,
        guessB,
        history,
      })

      const record: RoundRecord = {
        round: currentRound,
        params: currentParams,
        guessA,
        guessB,
        match: result.match,
        comment: result.comment,
      }

      const isGameOver = result.match === 'different' || result.match === 'opposite'

      setState((prev) => ({
        ...prev,
        phase: 'roundResult',
        history: [...prev.history, record],
        lastResult: result,
        isJudging: false,
      }))

      if (isGameOver) {
        const fullHistory = [...history, record]
        judgeGuesses({
          round: currentRound,
          nicknameA: t().player1Label,
          nicknameB: t().player2Label,
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
    } finally {
      judgingRef.current = false
    }
  }, [])

  const nextRound = useCallback(async () => {
    const prev = stateRef.current
    const lastRecord = prev.history[prev.history.length - 1]
    if (!lastRecord) return

    const isGameOver = lastRecord.match === 'different' || lastRecord.match === 'opposite'
    if (isGameOver) {
      setState((s) => ({ ...s, phase: 'results' }))
      return
    }

    const nextRoundNum = prev.currentRound + 1

    // Use prefetched round or generate on demand
    const prefetched = prefetchRef.current
    prefetchRef.current = null

    if (prefetched) {
      if (prefetched.promise) {
        // Prefetch still in progress — show loading and wait
        setIsGeneratingArt(true)
        const fallbackParams = prefetched.params
        setState((s) => ({
          ...s,
          phase: 'playing',
          currentRound: nextRoundNum,
          currentParams: fallbackParams,
        }))
        await prefetched.promise
        setIsGeneratingArt(false)
      }

      // Prefetch complete — use result
      const params: VisualParams = {
        ...prefetched.params,
        svgContent: prefetched.svgContent ?? undefined,
        theme: prefetched.theme,
      }
      if (prefetched.theme) previousThemesRef.current.push(prefetched.theme)

      setState((s) => ({
        ...s,
        phase: 'playing',
        currentRound: nextRoundNum,
        currentParams: params,
      }))
    } else {
      // No prefetch available — generate on demand
      const fallbackParams = generateParams(nextRoundNum, prev.previousSceneIds, SCENE_REGISTRY)
      setState((s) => ({
        ...s,
        phase: 'playing',
        currentRound: nextRoundNum,
        currentParams: fallbackParams,
      }))
      setIsGeneratingArt(true)
      const art = await generateSvgWithRetry(previousThemesRef.current)
      if (art.svgContent) {
        if (art.theme) previousThemesRef.current.push(art.theme)
        setState((s) => ({
          ...s,
          currentParams: { ...s.currentParams, svgContent: art.svgContent!, theme: art.theme },
        }))
      }
      setIsGeneratingArt(false)
    }

    // Start prefetching next round
    prefetchRef.current = startPrefetch('ai-script', previousThemesRef.current)
  }, [])

  const restart = useCallback(() => {
    prefetchRef.current = null
    previousThemesRef.current = []
    setState(createInitialState())
    // Re-start prefetching round 1 for the new game
    round1PrefetchRef.current = startPrefetch('ai-script', [])
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
      return (
        <StartScreen
          onStart={startGame}
          onCreateRoom={onCreateRoom}
          onJoinRoom={onJoinRoom}
          roomCodeFromUrl={roomCodeFromUrl}
        />
      )

    case 'playing':
      return (
        <>
          <GameScreen
            round={state.currentRound}
            params={state.currentParams}
            matchCount={matchCount}
            isJudging={state.isJudging}
            isGeneratingArt={isGeneratingArt}
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
          isGameOver={isGameOver}
          onNext={nextRound}
        />
      )
    }

    case 'results':
      return (
        <ResultsScreen
          history={state.history}
          finalComment={state.finalComment}
          onRestart={restart}
          onShare={share}
        />
      )
  }
}
