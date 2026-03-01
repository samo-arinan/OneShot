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

/**
 * Map a coherence value (0.0-1.0) to a prompt hint string
 * describing how concrete or abstract the art should be.
 */
export function coherenceToPromptHint(coherence: number): string {
  if (coherence >= 0.8) {
    return 'Draw a clearly recognizable, concrete subject (e.g., lighthouse, cat, sailboat). The viewer should name it in one word within 2 seconds.'
  }
  if (coherence >= 0.65) {
    return 'Draw a recognizable but slightly stylized subject. It should still be nameable but allow some artistic interpretation (e.g., a stormy sea, a twilight garden, a misty mountain).'
  }
  if (coherence >= 0.45) {
    return 'Draw a scene that is open to interpretation. The subject should be suggestive rather than obvious — viewers may see different things (e.g., flowing energy, mysterious glow, organic forms merging).'
  }
  if (coherence >= 0.2) {
    return 'Draw an abstract composition with only subtle hints of a real-world subject. Use shapes, colors, and textures that vaguely evoke something without being identifiable.'
  }
  return 'Draw a purely abstract visual — geometric forms, color fields, or chaotic textures. No recognizable subject needed.'
}
