import type { ArtMode, VisualParams } from '../types'
import { generateRound } from './svg-generator'
import { executeSvgScript } from './script-svg-executor'
import { renderJsonToSvg } from './json-svg-renderer'
import { computeCoherence, generateParams } from './scene-selector'
import { SCENE_REGISTRY } from '../scenes/registry'

export interface PrefetchedRound {
  params: VisualParams
  svgContent: string | null
  theme: string | undefined
  promise: Promise<void> | null
}

export function convertRoundToSvg(
  content: string,
  fallback: boolean,
  mode: 'script' | 'json',
): string | null {
  if (fallback || !content) return null
  if (mode === 'script') {
    return executeSvgScript(content, 360, 360)
  }
  try {
    return renderJsonToSvg(JSON.parse(content))
  } catch {
    return null
  }
}

export function startPrefetch(
  roundNum: number,
  artMode: ArtMode,
  previousThemes: string[],
): PrefetchedRound {
  const coherence = computeCoherence(roundNum)
  const params = generateParams(roundNum, [], SCENE_REGISTRY)
  const mode = artMode === 'ai-script' ? 'script' as const : 'json' as const

  const prefetched: PrefetchedRound = {
    params,
    svgContent: null,
    theme: undefined,
    promise: null,
  }

  const doFetch = async () => {
    try {
      const response = await generateRound({
        mode,
        coherence,
        previousThemes,
      })
      prefetched.theme = response.theme
      const svg = convertRoundToSvg(response.content, response.fallback, mode)
      prefetched.svgContent = svg
    } catch {
      // Leave svgContent null — caller falls back to classic scene
    } finally {
      prefetched.promise = null
    }
  }

  prefetched.promise = doFetch()
  return prefetched
}
