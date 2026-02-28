import { t } from './i18n'

export const GAME_URL = 'https://one-shot-nine.vercel.app'

export function buildShareText(score: number): string {
  const message = score === 0 ? t().shareZero : t().shareScore(score)
  return `${message}\n${GAME_URL}`
}

export function buildTwitterUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
}

export function shareToTwitter(text: string): void {
  window.open(buildTwitterUrl(text), '_blank', 'noopener,noreferrer')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
