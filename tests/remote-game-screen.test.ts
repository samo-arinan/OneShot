import { describe, it, expect } from 'vitest'
import { RemoteGameScreen } from '../src/components/RemoteGameScreen'

describe('RemoteGameScreen', () => {
  it('is exported as a function component', () => {
    expect(typeof RemoteGameScreen).toBe('function')
  })

  it('accepts the correct prop types with myRole', () => {
    const _props: Parameters<typeof RemoteGameScreen>[0] = {
      round: 1,
      params: { seed: 42, coherence: 0.9, sceneId: 'test' },
      myRole: 'host',
      matchCount: 0,
      isJudging: false,
      myGuessSubmitted: false,
      opponentGuessSubmitted: false,
      onSubmitGuess: () => {},
    }
    expect(_props.round).toBe(1)
    expect(_props.myRole).toBe('host')
  })

  it('accepts revealed guess props for judging phase display', () => {
    const _props: Parameters<typeof RemoteGameScreen>[0] = {
      round: 1,
      params: { seed: 42, coherence: 0.9, sceneId: 'test' },
      myRole: 'guest',
      matchCount: 0,
      isJudging: true,
      myGuessSubmitted: true,
      opponentGuessSubmitted: true,
      onSubmitGuess: () => {},
      revealedGuessA: 'sunset',
      revealedGuessB: 'ocean',
    }
    expect(_props.isJudging).toBe(true)
    expect(_props.revealedGuessA).toBe('sunset')
    expect(_props.revealedGuessB).toBe('ocean')
  })
})
