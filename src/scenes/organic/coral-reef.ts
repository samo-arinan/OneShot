import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const coralReef: Scene = {
  id: 'coral-reef',
  name: '珊瑚礁',
  category: 'organic',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#0D1B3E', '#1A3A5C', '#CC4444', '#E8885A', '#B06090'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Ocean background
    const seaFloorY = jitter(H * 0.82, coherence, rng, H * 0.06)

    // Layer 2: Branching coral shapes from bottom up
    const branchCount = Math.floor(jitter(5, coherence, rng, 2)) + 3
    const branches: string[] = []
    for (let i = 0; i < branchCount; i++) {
      const bx = jitter((W / branchCount) * i + W / branchCount / 2, coherence, rng, W * 0.06)
      const baseY = jitter(H * 0.98, coherence, rng, H * 0.02)
      const height = jitter(H * 0.4, coherence, rng, H * 0.15)
      const tipY = baseY - height
      const branchW = jitter(W * 0.025, coherence, rng, W * 0.008)
      const colorIdx = (i % (palette.length - 2)) + 2

      // Main stem
      branches.push(`<line x1="${bx.toFixed(1)}" y1="${baseY.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${tipY.toFixed(1)}" stroke="${palette[colorIdx]}" stroke-width="${(branchW * 2).toFixed(1)}" stroke-linecap="round" opacity="0.9" />`)

      // Sub-branches
      const subCount = Math.floor(jitter(3, coherence, rng, 1)) + 2
      for (let j = 0; j < subCount; j++) {
        const t = 0.3 + j * (0.5 / subCount)
        const subBaseY = baseY - height * t
        const subBaseX = bx
        const side = j % 2 === 0 ? 1 : -1
        const subLen = jitter(height * 0.25, coherence, rng, height * 0.08)
        const subEndX = jitter(subBaseX + side * subLen * 0.7, coherence, rng, W * 0.02)
        const subEndY = jitter(subBaseY - subLen * 0.7, coherence, rng, H * 0.02)
        branches.push(`<line x1="${subBaseX.toFixed(1)}" y1="${subBaseY.toFixed(1)}" x2="${subEndX.toFixed(1)}" y2="${subEndY.toFixed(1)}" stroke="${palette[colorIdx]}" stroke-width="${(branchW).toFixed(1)}" stroke-linecap="round" opacity="0.8" />`)
      }
    }

    // Layer 3: Texture
    const texOpacity = ((1.0 - coherence) * 0.3).toFixed(2)

    // Layer 4: Light rays from top
    const rayX = jitter(W * 0.4, coherence, rng, W * 0.2)
    const seaFloorPct = (seaFloorY / H * 100).toFixed(1)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <linearGradient id="sea-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="${seaFloorPct}%" stop-color="${palette[1]}" />
        </linearGradient>
        <linearGradient id="floor-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </linearGradient>
        <radialGradient id="ray-${seed}" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stop-color="${palette[3]}" stop-opacity="0.25" />
          <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Ocean background -->
      <rect width="${W}" height="${seaFloorY.toFixed(1)}" fill="url(#sea-${seed})" />
      <rect y="${seaFloorY.toFixed(1)}" width="${W}" height="${(H - seaFloorY).toFixed(1)}" fill="url(#floor-${seed})" />

      <!-- Layer 2: Coral branches -->
      <g filter="url(#${filterId})">
        ${branches.join('\n        ')}
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[0]}" opacity="${texOpacity}" />

      <!-- Layer 4: Light ray accent -->
      <ellipse cx="${rayX.toFixed(1)}" cy="0"
               rx="${(W * 0.3).toFixed(1)}" ry="${(H * 0.6).toFixed(1)}"
               fill="url(#ray-${seed})" />
    </svg>`
  },
}
