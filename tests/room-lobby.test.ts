import { describe, it, expect } from 'vitest'
import { RoomLobby } from '../src/components/RoomLobby'

describe('RoomLobby', () => {
  it('is exported as a function component', () => {
    expect(typeof RoomLobby).toBe('function')
  })

  it('accepts required props type signature', () => {
    const props: Parameters<typeof RoomLobby>[0] = {
      roomCode: 'ABC123',
      isHost: true,
      onStartGame: () => {},
    }
    expect(props.roomCode).toBe('ABC123')
    expect(props.isHost).toBe(true)
    expect(typeof props.onStartGame).toBe('function')
  })
})
