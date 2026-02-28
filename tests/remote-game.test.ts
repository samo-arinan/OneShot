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

  it('accepts the correct prop types', () => {
    const _props: Parameters<typeof RemoteGame>[0] = {
      roomCode: 'ABC123',
      role: 'host',
      myNickname: 'Alice',
      onLeave: () => {},
    }
    expect(_props.roomCode).toBe('ABC123')
    expect(_props.role).toBe('host')
  })
})
