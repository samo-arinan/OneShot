import PartySocket from 'partysocket'
import { useEffect, useRef, useState, useCallback } from 'react'
import type { ClientMessage, ServerMessage } from '../../party/protocol'

const PARTYKIT_HOST = import.meta.env.DEV
  ? 'localhost:1999'
  : 'oneshot.samo-arinan.partykit.dev'

export interface UseRoomOptions {
  roomCode: string
  role: 'host' | 'guest'
  onMessage: (msg: ServerMessage) => void
}

export interface UseRoomReturn {
  send: (msg: ClientMessage) => void
  connected: boolean
  disconnect: () => void
  reconnect: () => void
}

export function useRoom({ roomCode, role, onMessage }: UseRoomOptions): UseRoomReturn {
  const socketRef = useRef<PartySocket | null>(null)
  const onMessageRef = useRef(onMessage)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    onMessageRef.current = onMessage
  })

  useEffect(() => {
    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomCode,
      query: { role },
    })

    socket.addEventListener('open', () => {
      setConnected(true)
      socket.send(JSON.stringify({
        type: 'join',
        role,
      } satisfies ClientMessage))
    })

    socket.addEventListener('message', (e: MessageEvent) => {
      const msg: ServerMessage = JSON.parse(e.data as string)
      onMessageRef.current(msg)
    })

    socket.addEventListener('close', () => setConnected(false))

    // Force reconnect when returning from background (mobile sleep/tab switch)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && socket.readyState !== WebSocket.OPEN) {
        socket.reconnect()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    socketRef.current = socket

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      socket.close()
      socketRef.current = null
    }
  }, [roomCode, role])

  const send = useCallback((msg: ClientMessage) => {
    socketRef.current?.send(JSON.stringify(msg))
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.close()
    socketRef.current = null
  }, [])

  const reconnect = useCallback(() => {
    socketRef.current?.reconnect()
  }, [])

  return { send, connected, disconnect, reconnect }
}

export { PARTYKIT_HOST }
