import { describe, it, expect } from 'vitest'
import { WaitingScreen } from '../src/components/WaitingScreen'

describe('WaitingScreen', () => {
  it('is exported as a function component', () => {
    expect(typeof WaitingScreen).toBe('function')
  })

  it('accepts the correct prop types', () => {
    // Type-level test: these assignments verify the component's prop interface
    const _props: Parameters<typeof WaitingScreen>[0] = {
      roomCode: 'ABC123',
      onCancel: () => {},
    }
    expect(_props.roomCode).toBe('ABC123')
  })
})
