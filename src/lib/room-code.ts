const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomCode(): string {
  return Array.from({ length: 6 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

export function parseRoomFromUrl(pathname: string = window.location.pathname): string | null {
  const match = pathname.match(/^\/room\/([A-Za-z0-9]{4,8})$/)
  return match ? match[1].toUpperCase() : null
}
