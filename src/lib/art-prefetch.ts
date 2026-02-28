import type { ArtMode, VisualParams } from '../types'
import { generateRound } from './svg-generator'
import { executeSvgScript } from './script-svg-executor'
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
  _mode: 'script',
): string | null {
  if (fallback || !content) return null
  return executeSvgScript(content, 360, 360)
}

export function startPrefetch(
  roundNum: number,
  _artMode: ArtMode,
  previousThemes: string[],
): PrefetchedRound {
  const coherence = computeCoherence(roundNum)
  const params = generateParams(roundNum, [], SCENE_REGISTRY)

  const prefetched: PrefetchedRound = {
    params,
    svgContent: null,
    theme: undefined,
    promise: null,
  }

  const doFetch = async () => {
    try {
      const response = await generateRound({
        mode: 'script',
        coherence,
        previousThemes,
      })
      prefetched.theme = response.theme
      const svg = convertRoundToSvg(response.content, response.fallback, 'script')
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
