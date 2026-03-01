import type { Scene, SceneRenderParams } from '../../types'
import { ridgePointsToPath } from '../../lib/svg-utils'

export const starrySky: Scene = {
  id: 'starry-sky',
  name: '星空',
  category: 'sky',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#06071A', '#0D1033', '#1A1A4A', '#F5F5FF', '#B0C4DE']

    const ridgeY = H * 0.7
    const ridgePoints = [
      { x: 0, y: ridgeY },
      { x: W * 0.15, y: ridgeY - H * 0.06 },
      { x: W * 0.3, y: ridgeY - H * 0.12 },
      { x: W * 0.5, y: ridgeY - H * 0.08 },
      { x: W * 0.7, y: ridgeY - H * 0.14 },
      { x: W * 0.85, y: ridgeY - H * 0.05 },
      { x: W, y: ridgeY },
    ]

    // Generate stars
    const starCount = 60
    const stars: Array<{ x: number; y: number; r: number; op: number }> = []
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: rng() * W,
        y: rng() * ridgeY * 0.9,
        r: 0.5 + rng() * 2.5,
        op: 0.4 + rng() * 0.6,
      })
    }

    const starElements = stars.map(s =>
      `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${s.r.toFixed(1)}" fill="${palette[3]}" opacity="${s.op.toFixed(2)}" />`
    ).join('\n        ')

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="60%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[2]}" />
        </linearGradient>
        <linearGradient id="ridge-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1C1C2E" />
          <stop offset="100%" stop-color="#0A0A14" />
        </linearGradient>
      </defs>

      <!-- Layer 1: Dark sky background -->
      <rect width="${W}" height="${H}" fill="url(#sky-${seed})" />

      <!-- Layer 2: Stars scattered across sky -->
      <g>
        ${starElements}
      </g>

      <!-- Layer 4: Ridge silhouette accent -->
      <g>
        <path d="${ridgePointsToPath(ridgePoints, W, H)}"
              fill="url(#ridge-${seed})" opacity="0.95" />
      </g>
    </svg>`
  },
}
