import type { GenerateRoundRequest, GenerateRoundResponse } from '../types'
import { getLocale } from './i18n'

export async function generateRound(request: GenerateRoundRequest): Promise<GenerateRoundResponse> {
  const res = await fetch('/api/generate-svg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, lang: request.lang ?? getLocale() }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API error ${res.status}: ${body}`)
  }

  return res.json()
}

/**
 * Extract an SVG element from LLM response text.
 * Handles raw SVG, markdown code fences (```svg, ```xml), and surrounding text.
 */
export function extractSvgFromResponse(text: string): string | null {
  const match = text.match(/<svg[\s\S]*?<\/svg>/i)
  return match ? match[0] : null
}

/**
 * Validate an SVG string for safety and structural correctness.
 * Returns the cleaned SVG string if valid, null otherwise.
 *
 * Security: rejects <script>, on* event handlers, javascript: URIs
 * to prevent XSS via dangerouslySetInnerHTML.
 */
export function validateSvg(raw: string): string | null {
  if (raw.length < 50 || raw.length > 50000) return null
  if (!raw.includes('<svg')) return null
  if (!raw.includes('</svg>')) return null
  if (!raw.includes('xmlns')) return null
  if (/<script/i.test(raw)) return null
  if (/\bon\w+\s*=/i.test(raw)) return null
  if (/javascript\s*:/i.test(raw)) return null
  return raw
}
