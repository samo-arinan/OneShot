import { t } from './i18n'

export function buildShareText(score: number): string {
  if (score === 0) {
    return t().shareZero
  }
  return t().shareScore(score)
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
