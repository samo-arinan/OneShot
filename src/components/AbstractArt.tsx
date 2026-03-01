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
      rng,
    })
  }, [params.svgContent, params.seed, params.sceneId, width, height])

  const dataUri = useMemo(() => {
    if (!svgString) return ''
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
  }, [svgString])

  if (!dataUri) return null

  return (
    <img
      src={dataUri}
      width={width}
      height={height}
      className={`art-container ${className}`}
      style={{ width, height }}
      alt="Abstract art"
      draggable
    />
  )
}
