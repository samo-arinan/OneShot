import { describe, it, expect } from 'vitest'
import { RoomLobby } from '../src/components/RoomLobby'

describe('RoomLobby', () => {
  it('is exported as a function component', () => {
    expect(typeof RoomLobby).toBe('function')
  })

  it('accepts required props', () => {
    const props = {
      roomCode: 'ABC123',
      nicknameA: 'Alice',
      nicknameB: 'Bob',
      isHost: true,
      onStartGame: () => {},
    }
    const element = RoomLobby(props)
    expect(element).toBeDefined()
  })
})
