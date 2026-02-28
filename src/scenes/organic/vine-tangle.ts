import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const vineTangle: Scene = {
  id: 'vine-tangle',
  name: '蔓の絡まり',
  category: 'organic',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#0A1A0A', '#1A2E10', '#2E5A1A', '#4A7A2A', '#8B6914'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Dark background
    // Layer 2: Intertwining vine curves
    const vineCount = Math.floor(jitter(7, coherence, rng, 3)) + 4
    const vines: string[] = []
    for (let i = 0; i < vineCount; i++) {
      const startX = jitter(rng() * W, coherence, rng, W * 0.1)
      const startY = jitter(rng() * H, coherence, rng, H * 0.1)

      // Generate a winding path with multiple control points
      let d = `M ${startX.toFixed(1)} ${startY.toFixed(1)}`
      let px = startX
      let py = startY
      const segments = Math.floor(jitter(5, coherence, rng, 2)) + 3
      for (let s = 0; s < segments; s++) {
        const cp1x = jitter(px + (rng() - 0.5) * W * 0.5, coherence, rng, W * 0.08)
        const cp1y = jitter(py + (rng() - 0.5) * H * 0.4, coherence, rng, H * 0.08)
        const cp2x = jitter(cp1x + (rng() - 0.5) * W * 0.3, coherence, rng, W * 0.06)
        const cp2y = jitter(cp1y + (rng() - 0.5) * H * 0.3, coherence, rng, H * 0.06)
        const nextX = jitter(rng() * W, coherence, rng, W * 0.1)
        const nextY = jitter(rng() * H, coherence, rng, H * 0.1)
        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${nextX.toFixed(1)} ${nextY.toFixed(1)}`
        px = nextX
        py = nextY
      }

      const strokeW = jitter(2.5, coherence, rng, 1.2)
      const colorIdx = i % (palette.length - 1) + 1
      const opacity = (0.55 + (i % 3) * 0.12).toFixed(2)
      vines.push(`<path d="${d}" stroke="${palette[colorIdx]}" stroke-width="${strokeW.toFixed(1)}" fill="none" stroke-linecap="round" opacity="${opacity}" />`)
    }

    // Small leaf nodes along vines
    const leafCount = Math.floor(jitter(8, coherence, rng, 4)) + 4
    const leaves: string[] = []
    for (let i = 0; i < leafCount; i++) {
      const lx = jitter(rng() * W, coherence, rng, W * 0.05)
      const ly = jitter(rng() * H, coherence, rng, H * 0.05)
      const lr = jitter(5, coherence, rng, 3)
      leaves.push(`<ellipse cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="${(lr * 2).toFixed(1)}" ry="${lr.toFixed(1)}" fill="${palette[2]}" opacity="0.6" />`)
    }

    // Layer 3: Texture
    const texOpacity = ((1.0 - coherence) * 0.32).toFixed(2)

    // Layer 4: Warm highlight accent
    const accentX = jitter(W * 0.6, coherence, rng, W * 0.2)
    const accentY = jitter(H * 0.4, coherence, rng, H * 0.2)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="accent-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.35" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Vine curves and leaves -->
      <g filter="url(#${filterId})">
        ${vines.join('\n        ')}
        ${leaves.join('\n        ')}
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[0]}" opacity="${texOpacity}" />

      <!-- Layer 4: Warm light accent -->
      <ellipse cx="${accentX.toFixed(1)}" cy="${accentY.toFixed(1)}"
               rx="${(W * 0.22).toFixed(1)}" ry="${(H * 0.18).toFixed(1)}"
               fill="url(#accent-${seed})" />
    </svg>`
  },
}
