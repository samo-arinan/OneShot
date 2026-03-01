import { useMemo, useState, useCallback } from 'react'
import { LocalGame } from './components/LocalGame'
import { RemoteGame } from './components/RemoteGame'
import { OnboardingScreen } from './components/OnboardingScreen'
import { parseRoomFromUrl } from './lib/room-code'
import { generateRoomCode } from './lib/room-code'
import { hasSeenOnboarding } from './lib/onboarding'
import type { PlayerRole } from './types'

interface RemoteSession {
  roomCode: string
  role: PlayerRole
}

export default function App() {
  const roomCodeFromUrl = useMemo(() => parseRoomFromUrl(), [])
  const [remoteSession, setRemoteSession] = useState<RemoteSession | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(() => !roomCodeFromUrl && !hasSeenOnboarding())

  const createRoom = useCallback(() => {
    setRemoteSession({
      roomCode: generateRoomCode(),
      role: 'host',
    })
  }, [])

  const joinRoom = useCallback(() => {
    if (roomCodeFromUrl) {
      setRemoteSession({
        roomCode: roomCodeFromUrl,
        role: 'guest',
      })
    }
  }, [roomCodeFromUrl])

  const leaveRoom = useCallback(() => {
    setRemoteSession(null)
    window.history.replaceState(null, '', '/')
  }, [])

  if (showOnboarding) {
    return <OnboardingScreen onDone={() => setShowOnboarding(false)} />
  }

  if (remoteSession) {
    return (
      <RemoteGame
        roomCode={remoteSession.roomCode}
        role={remoteSession.role}
        onLeave={leaveRoom}
      />
    )
  }

  return (
    <LocalGame
      roomCodeFromUrl={roomCodeFromUrl}
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
    />
  )
}
