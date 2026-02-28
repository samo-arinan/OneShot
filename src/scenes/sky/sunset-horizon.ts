import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const sunsetHorizon: Scene = {
  id: 'sunset-horizon',
  name: '水平線の夕焼け',
  category: 'sky',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#FF6B35', '#C1440E', '#7B2D8B', '#1A0A2E', '#FFB347'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    const groundY = jitter(H * 0.67, coherence, rng, H * 0.08)
    const horizonY = jitter(H * 0.62, coherence, rng, H * 0.05)
    const sunX = jitter(W * 0.5, coherence, rng, W * 0.15)
    const sunY = jitter(horizonY - H * 0.02, coherence, rng, H * 0.04)
    const sunR = jitter(22, coherence, rng, 8)

    const texOpacity = ((1.0 - coherence) * 0.25).toFixed(2)
    const groundPct = (groundY / H * 100).toFixed(1)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[3]}" />
          <stop offset="40%" stop-color="${palette[2]}" />
          <stop offset="${groundPct}%" stop-color="${palette[0]}" />
          <stop offset="100%" stop-color="${palette[1]}" />
        </linearGradient>
        <linearGradient id="ground-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="#0A0510" />
        </linearGradient>
        <radialGradient id="sun-glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.9" />
          <stop offset="60%" stop-color="${palette[0]}" stop-opacity="0.4" />
          <stop offset="100%" stop-color="${palette[0]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background gradient sky -->
      <rect width="${W}" height="${H}" fill="url(#sky-${seed})" />

      <!-- Layer 2: Ground silhouette -->
      <rect y="${groundY.toFixed(1)}" width="${W}" height="${(H - groundY).toFixed(1)}"
            fill="url(#ground-${seed})" />

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[0]}" opacity="${texOpacity}" />

      <!-- Layer 4: Sun accent -->
      <circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${(sunR * 3).toFixed(1)}"
              fill="url(#sun-glow-${seed})" />
      <circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${sunR.toFixed(1)}"
              fill="${palette[4]}" opacity="0.95" />
    </svg>`
  },
}
