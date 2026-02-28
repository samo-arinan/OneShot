import { useMemo } from 'react'
import { LocalGame } from './components/LocalGame'
import { parseRoomFromUrl } from './lib/room-code'

export default function App() {
  const roomCode = useMemo(() => parseRoomFromUrl(), [])

  if (roomCode) {
    // RemoteGame will be added in a later commit
    return <LocalGame />
  }

  return <LocalGame />
}
