import { describe, it, expect } from 'vitest'
import { RemoteGameScreen } from '../src/components/RemoteGameScreen'

describe('RemoteGameScreen', () => {
  it('is exported as a function component', () => {
    expect(typeof RemoteGameScreen).toBe('function')
  })

  it('accepts the correct prop types', () => {
    const _props: Parameters<typeof RemoteGameScreen>[0] = {
      round: 1,
      params: { seed: 42, coherence: 0.9, sceneId: 'test' },
      myNickname: 'Alice',
      opponentNickname: 'Bob',
      matchCount: 0,
      isJudging: false,
      myGuessSubmitted: false,
      opponentGuessSubmitted: false,
      onSubmitGuess: () => {},
    }
    expect(_props.round).toBe(1)
    expect(_props.myNickname).toBe('Alice')
  })
})
