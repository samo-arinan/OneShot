import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn()
const mockClose = vi.fn()
const listeners = new Map<string, Function>()

vi.mock('partysocket', () => {
  return {
    default: class MockPartySocket {
      host: string
      room: string
      query: Record<string, string>

      constructor(opts: { host: string; room: string; query: Record<string, string> }) {
        this.host = opts.host
        this.room = opts.room
        this.query = opts.query
        MockPartySocket.lastInstance = this
        MockPartySocket.constructorCalls.push(opts)
      }

      send = mockSend
      close = mockClose
      addEventListener(event: string, handler: Function) {
        listeners.set(event, handler)
      }

      static lastInstance: MockPartySocket | null = null
      static constructorCalls: Array<{ host: string; room: string; query: Record<string, string> }> = []
    },
  }
})

vi.stubEnv('VITE_PARTYKIT_HOST', 'localhost:1999')

import PartySocket from 'partysocket'

describe('room client module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listeners.clear()
    ;(PartySocket as unknown as { constructorCalls: unknown[] }).constructorCalls = []
  })

  it('useRoom hook is exported as a function', async () => {
    const { useRoom } = await import('../src/lib/room')
    expect(typeof useRoom).toBe('function')
  })

  it('PARTYKIT_HOST defaults to localhost:1999', async () => {
    const { PARTYKIT_HOST } = await import('../src/lib/room')
    expect(PARTYKIT_HOST).toBe('localhost:1999')
  })

  it('PartySocket constructor creates instance with send and close', () => {
    const socket = new PartySocket({
      host: 'localhost:1999',
      room: 'TEST',
      query: { role: 'host' },
    })

    expect(socket.send).toBeDefined()
    expect(socket.close).toBeDefined()
  })

  it('PartySocket send forwards messages', () => {
    const socket = new PartySocket({
      host: 'localhost:1999',
      room: 'TEST',
      query: { role: 'host' },
    })

    const msg = JSON.stringify({ type: 'join', nickname: 'Alice', role: 'host' })
    socket.send(msg)

    expect(mockSend).toHaveBeenCalledWith(msg)
  })

  it('PartySocket constructor receives correct params', () => {
    const socket = new PartySocket({
      host: 'localhost:1999',
      room: 'ABC123',
      query: { role: 'guest' },
    })

    expect(socket.host).toBe('localhost:1999')
    expect(socket.room).toBe('ABC123')
    expect(socket.query).toEqual({ role: 'guest' })
  })

  it('addEventListener registers event handlers', () => {
    const socket = new PartySocket({
      host: 'localhost:1999',
      room: 'TEST',
      query: { role: 'host' },
    })

    const handler = vi.fn()
    socket.addEventListener('message', handler)

    expect(listeners.get('message')).toBe(handler)
  })
})
