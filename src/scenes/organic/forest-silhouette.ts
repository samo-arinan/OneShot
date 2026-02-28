import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const forestSilhouette: Scene = {
  id: 'forest-silhouette',
  name: '森のシルエット',
  category: 'organic',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#1A2E1A', '#2D4A2D', '#0A1A2E', '#1B3A5C', '#C9A959'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Sky background
    const horizonY = jitter(H * 0.65, coherence, rng, H * 0.1)

    // Layer 2: Tree silhouettes
    const treeCount = Math.floor(jitter(8, coherence, rng, 3)) + 5
    const trees: string[] = []
    for (let i = 0; i < treeCount; i++) {
      const tx = jitter((W / treeCount) * i + W / treeCount / 2, coherence, rng, W * 0.05)
      const treeH = jitter(H * 0.35, coherence, rng, H * 0.15)
      const treeW = jitter(W * 0.06, coherence, rng, W * 0.02)
      const baseY = jitter(H * 0.98, coherence, rng, H * 0.02)
      const tipY = baseY - treeH
      const d = `M ${(tx - treeW / 2).toFixed(1)} ${baseY.toFixed(1)} Q ${tx.toFixed(1)} ${(tipY + treeH * 0.1).toFixed(1)} ${(tx + treeW * 0.15).toFixed(1)} ${tipY.toFixed(1)} Q ${(tx + treeW / 2).toFixed(1)} ${(tipY + treeH * 0.15).toFixed(1)} ${(tx + treeW / 2).toFixed(1)} ${baseY.toFixed(1)} Z`
      trees.push(`<path d="${d}" fill="${palette[0]}" opacity="0.95" />`)
    }

    // Layer 3: Texture overlay
    const texOpacity = ((1.0 - coherence) * 0.25).toFixed(2)

    // Layer 4: Accent - a distant glowing light behind trees
    const glowX = jitter(W * 0.5, coherence, rng, W * 0.3)
    const glowY = jitter(horizonY * 0.8, coherence, rng, horizonY * 0.2)

    const horizonPct = (horizonY / H * 100).toFixed(1)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[2]}" />
          <stop offset="${horizonPct}%" stop-color="${palette[3]}" />
        </linearGradient>
        <linearGradient id="ground-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </linearGradient>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.4" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background sky and ground -->
      <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
      <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#ground-${seed})" />

      <!-- Layer 2: Tree silhouettes -->
      <g filter="url(#${filterId})">
        ${trees.join('\n        ')}
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[2]}" opacity="${texOpacity}" />

      <!-- Layer 4: Accent glow -->
      <ellipse cx="${glowX.toFixed(1)}" cy="${glowY.toFixed(1)}"
               rx="${(W * 0.2).toFixed(1)}" ry="${(H * 0.12).toFixed(1)}"
               fill="url(#glow-${seed})" />
    </svg>`
  },
}
