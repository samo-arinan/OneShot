import type { ArtMode, VisualParams } from '../types'
import { generateRound } from './svg-generator'
import { executeSvgScript } from './script-svg-executor'
import { generateParams, computeCoherence } from './scene-selector'
import { SCENE_REGISTRY } from '../scenes/registry'

const MAX_SVG_RETRIES = 2

export interface GeneratedArt {
  svgContent: string | null
  theme: string | undefined
}

export interface PrefetchedRound {
  params: VisualParams
  svgContent: string | null
  theme: string | undefined
  promise: Promise<void> | null
}

export function convertRoundToSvg(
  content: string,
  fallback: boolean,
  _mode: 'script',
): string | null {
  if (fallback || !content) return null
  return executeSvgScript(content, 360, 360)
}

/**
 * Generate SVG with retry logic.
 * On failure (invalid SVG or API error), retries up to MAX_SVG_RETRIES additional times.
 * Returns { svgContent, theme } — svgContent is null only after all attempts exhausted.
 */
export async function generateSvgWithRetry(
  coherence: number,
  previousThemes: string[],
): Promise<GeneratedArt> {
  for (let attempt = 0; attempt <= MAX_SVG_RETRIES; attempt++) {
    try {
      const response = await generateRound({
        mode: 'script',
        coherence,
        previousThemes,
      })
      const svg = convertRoundToSvg(response.content, response.fallback, 'script')
      if (svg) {
        return { svgContent: svg, theme: response.theme }
      }
    } catch {
      // API error — continue to next attempt
    }
  }
  return { svgContent: null, theme: undefined }
}

export function startPrefetch(
  round: number,
  _artMode: ArtMode,
  previousThemes: string[],
): PrefetchedRound {
  const params = generateParams(0, [], SCENE_REGISTRY)
  const coherence = computeCoherence(round)

  const prefetched: PrefetchedRound = {
    params,
    svgContent: null,
    theme: undefined,
    promise: null,
  }

  const doFetch = async () => {
    const result = await generateSvgWithRetry(coherence, previousThemes)
    prefetched.svgContent = result.svgContent
    prefetched.theme = result.theme
    prefetched.promise = null
  }

  prefetched.promise = doFetch()
  return prefetched
}
