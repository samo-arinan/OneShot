import type { Scene, SceneRenderParams } from '../../types'
import { jitter, distortPath, buildDistortionFilter, distortPalette, ridgePointsToPath } from '../../lib/coherence-utils'

export const desertDunes: Scene = {
  id: 'desert-dunes',
  name: '砂漠の砂丘',
  category: 'landscape',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#D4AA60', '#E8852A', '#C0562A', '#F5C842', '#8B3A1A'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background - sky to horizon
    const horizonY = jitter(H * 0.4, coherence, rng, H * 0.08)
    const horizonPct = (horizonY / H * 100).toFixed(1)

    // Layer 2: Back dune ridge
    const backDuneY = jitter(H * 0.55, coherence, rng, H * 0.08)
    const backRidgePoints = distortPath([
      { x: 0, y: backDuneY },
      { x: W * 0.18, y: backDuneY - H * 0.12 },
      { x: W * 0.38, y: backDuneY - H * 0.18 },
      { x: W * 0.55, y: backDuneY - H * 0.08 },
      { x: W * 0.72, y: backDuneY - H * 0.16 },
      { x: W * 0.9, y: backDuneY - H * 0.1 },
      { x: W, y: backDuneY },
    ], coherence, rng)

    // Layer 2: Front dune ridge
    const frontDuneY = jitter(H * 0.72, coherence, rng, H * 0.08)
    const frontRidgePoints = distortPath([
      { x: 0, y: frontDuneY },
      { x: W * 0.25, y: frontDuneY - H * 0.2 },
      { x: W * 0.5, y: frontDuneY - H * 0.14 },
      { x: W * 0.75, y: frontDuneY - H * 0.22 },
      { x: W, y: frontDuneY - H * 0.05 },
    ], coherence, rng)

    // Layer 3: Texture overlay - heat shimmer effect
    const texOpacity = ((1.0 - coherence) * 0.3).toFixed(2)

    // Layer 4: Sun accent
    const sunX = jitter(W * 0.8, coherence, rng, W * 0.12)
    const sunY = jitter(H * 0.18, coherence, rng, H * 0.1)
    const sunR = jitter(22, coherence, rng, 8)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F0C060" />
            <stop offset="${horizonPct}%" stop-color="#E88030" />
          </linearGradient>
          <linearGradient id="back-dune-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <linearGradient id="front-dune-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="100%" stop-color="${palette[2]}" />
          </linearGradient>
          <radialGradient id="sun-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFF0" stop-opacity="0.95" />
            <stop offset="60%" stop-color="${palette[3]}" stop-opacity="0.6" />
            <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background sky -->
        <rect width="${W}" height="${H}" fill="url(#sky-${seed})" />

        <!-- Layer 2: Back dune -->
        <g filter="url(#${filterId})">
          <path d="${ridgePointsToPath(backRidgePoints, W, H)}"
                fill="url(#back-dune-${seed})" opacity="0.88" />
        </g>

        <!-- Layer 2: Front dune -->
        <g filter="url(#${filterId})">
          <path d="${ridgePointsToPath(frontRidgePoints, W, H)}"
                fill="url(#front-dune-${seed})" opacity="0.95" />
        </g>

        <!-- Layer 3: Texture overlay -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${texOpacity}" />

        <!-- Layer 4: Sun -->
        <circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${(sunR * 3.5).toFixed(1)}"
                fill="url(#sun-${seed})" />
        <circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${sunR.toFixed(1)}"
                fill="#FFFFE0" opacity="0.92" />
      </svg>`
  },
}
