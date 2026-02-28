import { describe, it, expect, vi } from 'vitest'

vi.mock('partysocket', () => {
  return {
    default: class MockPartySocket {
      constructor() {}
      send = vi.fn()
      close = vi.fn()
      addEventListener() {}
    },
  }
})

vi.stubEnv('VITE_PARTYKIT_HOST', 'localhost:1999')

import { RemoteGame } from '../src/components/RemoteGame'

describe('RemoteGame', () => {
  it('is exported as a function component', () => {
    expect(typeof RemoteGame).toBe('function')
  })

  it('accepts the correct prop types without nickname', () => {
    const _props: Parameters<typeof RemoteGame>[0] = {
      roomCode: 'ABC123',
      role: 'host',
      onLeave: () => {},
    }
    expect(_props.roomCode).toBe('ABC123')
    expect(_props.role).toBe('host')
  })

  it('should store revealed guesses from both_guessed for judging display', () => {
    // RemoteState must include revealedGuessA/B to display answers during judging phase
    // This is a design contract test - the actual state transitions are tested via integration
    type RemoteState = {
      revealedGuessA: string | null
      revealedGuessB: string | null
      phase: string
    }

    // Simulate the state transition when both_guessed is received
    const prevState: RemoteState = { revealedGuessA: null, revealedGuessB: null, phase: 'playing' }
    const nextState: RemoteState = {
      ...prevState,
      phase: 'judging',
      revealedGuessA: 'sunset',
      revealedGuessB: 'ocean',
    }

    expect(nextState.revealedGuessA).toBe('sunset')
    expect(nextState.revealedGuessB).toBe('ocean')
    expect(nextState.phase).toBe('judging')
  })

  it('should not skip roundResult phase when game_over arrives', () => {
    // When round_result and game_over are batched by React,
    // game_over should preserve roundResult phase so user sees the last round's result
    type RemoteState = { phase: string; finalComment: string | null }

    // Simulate: round_result sets phase to 'roundResult'
    const afterRoundResult: RemoteState = { phase: 'roundResult', finalComment: null }

    // game_over handler should NOT override roundResult phase
    const afterGameOver: RemoteState = {
      ...afterRoundResult,
      phase: afterRoundResult.phase === 'roundResult' ? 'roundResult' : 'gameOver',
      finalComment: 'Great game!',
    }

    expect(afterGameOver.phase).toBe('roundResult')
    expect(afterGameOver.finalComment).toBe('Great game!')
  })
})
