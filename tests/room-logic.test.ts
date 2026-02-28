import { describe, it, expect } from 'vitest'
import {
  createEmptyState,
  handleJoin,
  handleStartRound,
  handleGuess,
  handleJudgeResult,
  handlePlayAgain,
} from '../party/logic'
import type { RoomSyncState } from '../party/protocol'

describe('createEmptyState', () => {
  it('returns waiting phase with empty fields', () => {
    const state = createEmptyState()
    expect(state.phase).toBe('waiting')
    expect(state.hasHost).toBe(false)
    expect(state.hasGuest).toBe(false)
    expect(state.currentRound).toBe(0)
    expect(state.currentParams).toBeNull()
    expect(state.history).toHaveLength(0)
    expect(state.lastResult).toBeNull()
    expect(state.finalComment).toBeNull()
    expect(state.guessASubmitted).toBe(false)
    expect(state.guessBSubmitted).toBe(false)
  })
})

describe('handleJoin', () => {
  it('sets hasHost for host', () => {
    const state = createEmptyState()
    const result = handleJoin(state, 'host')
    expect(result.state.hasHost).toBe(true)
    expect(result.state.hasGuest).toBe(false)
  })

  it('sets hasGuest for guest', () => {
    const state = createEmptyState()
    const result = handleJoin(state, 'guest')
    expect(result.state.hasGuest).toBe(true)
    expect(result.state.hasHost).toBe(false)
  })

  it('broadcasts player_joined and room_state', () => {
    const state = createEmptyState()
    const result = handleJoin(state, 'host')
    expect(result.messages).toHaveLength(2)
    expect(result.messages[0]).toEqual({
      type: 'player_joined',
      role: 'host',
    })
    expect(result.messages[1]).toEqual({
      type: 'room_state',
      state: result.state,
    })
  })

  it('does not mutate original state', () => {
    const state = createEmptyState()
    handleJoin(state, 'host')
    expect(state.hasHost).toBe(false)
  })
})

describe('handleStartRound', () => {
  it('sets round, params, and phase to playing', () => {
    const state: RoomSyncState = {
      ...createEmptyState(),
      hasHost: true,
      hasGuest: true,
    }
    const params = { seed: 42, coherence: 0.9, sceneId: 'landscape_1' }
    const result = handleStartRound(state, 'host', 1, params)

    expect(result.state.phase).toBe('playing')
    expect(result.state.currentRound).toBe(1)
    expect(result.state.currentParams).toEqual(params)
    expect(result.state.guessASubmitted).toBe(false)
    expect(result.state.guessBSubmitted).toBe(false)
  })

  it('broadcasts round_start message', () => {
    const state = createEmptyState()
    const params = { seed: 42, coherence: 0.9, sceneId: 'landscape_1' }
    const result = handleStartRound(state, 'host', 1, params)

    expect(result.messages).toHaveLength(1)
    expect(result.messages[0]).toEqual({
      type: 'round_start',
      round: 1,
      params,
    })
  })

  it('rejects start_round from guest', () => {
    const state = createEmptyState()
    const params = { seed: 42, coherence: 0.9, sceneId: 'landscape_1' }
    const result = handleStartRound(state, 'guest', 1, params)

    expect(result.state).toBe(state)
    expect(result.messages[0].type).toBe('error')
  })
})

describe('handleGuess', () => {
  const playingState: RoomSyncState = {
    ...createEmptyState(),
    phase: 'playing',
    hasHost: true,
    hasGuest: true,
    currentRound: 1,
    currentParams: { seed: 42, coherence: 0.9, sceneId: 'test' },
  }

  it('stores host guess as guessA', () => {
    const result = handleGuess(playingState, 'host', 'mountain', null, null)
    expect(result.guessA).toBe('mountain')
    expect(result.guessB).toBeNull()
    expect(result.state.guessASubmitted).toBe(true)
    expect(result.state.guessBSubmitted).toBe(false)
  })

  it('stores guest guess as guessB', () => {
    const result = handleGuess(playingState, 'guest', 'hill', null, null)
    expect(result.guessB).toBe('hill')
    expect(result.guessA).toBeNull()
    expect(result.state.guessBSubmitted).toBe(true)
    expect(result.state.guessASubmitted).toBe(false)
  })

  it('broadcasts guess_received A for host', () => {
    const result = handleGuess(playingState, 'host', 'mountain', null, null)
    expect(result.messages[0]).toEqual({ type: 'guess_received', from: 'A' })
  })

  it('broadcasts guess_received B for guest', () => {
    const result = handleGuess(playingState, 'guest', 'hill', null, null)
    expect(result.messages[0]).toEqual({ type: 'guess_received', from: 'B' })
  })

  it('does not broadcast both_guessed when only one guess is in', () => {
    const result = handleGuess(playingState, 'host', 'mountain', null, null)
    expect(result.messages).toHaveLength(1)
    expect(result.state.phase).toBe('playing')
  })

  it('broadcasts both_guessed when both guesses are in', () => {
    const result = handleGuess(playingState, 'guest', 'hill', 'mountain', null)
    expect(result.messages).toHaveLength(2)
    expect(result.messages[1]).toEqual({
      type: 'both_guessed',
      guessA: 'mountain',
      guessB: 'hill',
    })
    expect(result.state.phase).toBe('judging')
  })

  it('transitions to judging when host guess completes the pair', () => {
    const result = handleGuess(playingState, 'host', 'mountain', null, 'hill')
    expect(result.state.phase).toBe('judging')
    expect(result.messages).toHaveLength(2)
  })
})

describe('handleJudgeResult', () => {
  const judgingState: RoomSyncState = {
    ...createEmptyState(),
    phase: 'judging',
    hasHost: true,
    hasGuest: true,
    currentRound: 1,
    currentParams: { seed: 42, coherence: 0.9, sceneId: 'test' },
  }

  it('creates round record and adds to history', () => {
    const result = handleJudgeResult(
      judgingState, 'host',
      { match: 'perfect', comment: 'wow' },
      'mountain', 'mountain'
    )
    expect(result.state.history).toHaveLength(1)
    expect(result.state.history[0].match).toBe('perfect')
    expect(result.state.history[0].guessA).toBe('mountain')
    expect(result.state.history[0].guessB).toBe('mountain')
  })

  it('transitions to roundResult for perfect/close', () => {
    const result = handleJudgeResult(
      judgingState, 'host',
      { match: 'close', comment: 'nice' },
      'mountain', 'hill'
    )
    expect(result.state.phase).toBe('roundResult')
  })

  it('transitions to gameOver for different', () => {
    const result = handleJudgeResult(
      judgingState, 'host',
      { match: 'different', comment: 'oh no' },
      'mountain', 'ocean'
    )
    expect(result.state.phase).toBe('gameOver')
  })

  it('transitions to gameOver for opposite', () => {
    const result = handleJudgeResult(
      judgingState, 'host',
      { match: 'opposite', comment: 'wow contrast' },
      'sun', 'moon'
    )
    expect(result.state.phase).toBe('gameOver')
  })

  it('broadcasts round_result', () => {
    const result = handleJudgeResult(
      judgingState, 'host',
      { match: 'perfect', comment: 'wow' },
      'mountain', 'mountain'
    )
    expect(result.messages[0].type).toBe('round_result')
  })

  it('broadcasts game_over on game-ending match', () => {
    const result = handleJudgeResult(
      judgingState, 'host',
      { match: 'different', comment: 'oh no' },
      'mountain', 'ocean'
    )
    expect(result.messages).toHaveLength(2)
    expect(result.messages[1].type).toBe('game_over')
  })

  it('does not broadcast game_over for continuing match', () => {
    const result = handleJudgeResult(
      judgingState, 'host',
      { match: 'perfect', comment: 'wow' },
      'mountain', 'mountain'
    )
    expect(result.messages).toHaveLength(1)
  })

  it('stores finalComment when provided', () => {
    const result = handleJudgeResult(
      judgingState, 'host',
      { match: 'different', comment: 'oh no', finalComment: 'Great game!' },
      'mountain', 'ocean'
    )
    expect(result.state.finalComment).toBe('Great game!')
  })

  it('resets guess submitted flags', () => {
    const result = handleJudgeResult(
      { ...judgingState, guessASubmitted: true, guessBSubmitted: true },
      'host',
      { match: 'perfect', comment: 'wow' },
      'mountain', 'mountain'
    )
    expect(result.state.guessASubmitted).toBe(false)
    expect(result.state.guessBSubmitted).toBe(false)
  })

  it('rejects judge_result from guest', () => {
    const result = handleJudgeResult(
      judgingState, 'guest',
      { match: 'perfect', comment: 'wow' },
      'mountain', 'mountain'
    )
    expect(result.state).toBe(judgingState)
    expect(result.messages[0].type).toBe('error')
  })

  it('preserves existing history across multiple rounds', () => {
    const stateWithHistory: RoomSyncState = {
      ...judgingState,
      currentRound: 2,
      history: [{
        round: 1,
        params: { seed: 10, coherence: 0.9, sceneId: 'old' },
        guessA: 'a', guessB: 'b', match: 'perfect', comment: 'nice',
      }],
    }
    const result = handleJudgeResult(
      stateWithHistory, 'host',
      { match: 'close', comment: 'ok' },
      'x', 'y'
    )
    expect(result.state.history).toHaveLength(2)
    expect(result.state.history[0].round).toBe(1)
    expect(result.state.history[1].round).toBe(2)
  })
})

describe('handlePlayAgain', () => {
  it('resets state but preserves player presence', () => {
    const state: RoomSyncState = {
      ...createEmptyState(),
      phase: 'gameOver',
      hasHost: true,
      hasGuest: true,
      currentRound: 3,
      history: [
        { round: 1, params: { seed: 1, coherence: 0.9, sceneId: 'a' },
          guessA: 'x', guessB: 'y', match: 'perfect', comment: 'wow' },
      ],
      finalComment: 'Great game!',
    }
    const result = handlePlayAgain(state)
    expect(result.state.phase).toBe('waiting')
    expect(result.state.hasHost).toBe(true)
    expect(result.state.hasGuest).toBe(true)
    expect(result.state.currentRound).toBe(0)
    expect(result.state.history).toHaveLength(0)
    expect(result.state.finalComment).toBeNull()
  })

  it('broadcasts room_state with reset state', () => {
    const state: RoomSyncState = {
      ...createEmptyState(),
      phase: 'gameOver',
      hasHost: true,
      hasGuest: true,
    }
    const result = handlePlayAgain(state)
    expect(result.messages).toHaveLength(1)
    expect(result.messages[0].type).toBe('room_state')
  })
})
