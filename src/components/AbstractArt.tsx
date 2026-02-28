import { useMemo } from 'react'
import { SCENE_REGISTRY } from '../scenes/registry'
import { seededRandom } from '../lib/seeded-random'
import type { VisualParams } from '../types'

interface Props {
  params: VisualParams
  width?: number
  height?: number
  className?: string
}

export function AbstractArt({ params, width = 600, height = 400, className = '' }: Props) {
  const svgString = useMemo(() => {
    if (params.svgContent) return params.svgContent
    const scene = SCENE_REGISTRY.find(s => s.id === params.sceneId)
    if (!scene) return ''
    const rng = seededRandom(params.seed)
    return scene.render({
      width,
      height,
      seed: params.seed,
      coherence: params.coherence,
      rng,
    })
  }, [params.svgContent, params.seed, params.coherence, params.sceneId, width, height])

  if (!svgString) return null

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  )
}
