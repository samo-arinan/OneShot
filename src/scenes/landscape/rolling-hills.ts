import type { Scene, SceneRenderParams } from '../../types'
import { ridgePointsToPath } from '../../lib/svg-utils'

export const rollingHills: Scene = {
  id: 'rolling-hills',
  name: '連なる丘',
  category: 'landscape',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#87CEAB', '#5A8F5A', '#8B6914', '#D4A96A', '#2E5E2E']

    // Layer 1: Background sky gradient
    const skyY = H * 0.35
    const skyPct = (skyY / H * 100).toFixed(1)

    // Layer 2: Far hill ridge
    const farHillY = H * 0.55
    const farRidgePoints = [
      { x: 0, y: farHillY + 0 },
      { x: W * 0.2, y: farHillY - H * 0.12 },
      { x: W * 0.45, y: farHillY - H * 0.06 },
      { x: W * 0.65, y: farHillY - H * 0.14 },
      { x: W * 0.85, y: farHillY - H * 0.07 },
      { x: W, y: farHillY + 0 },
    ]

    // Layer 2: Near hill ridge
    const nearHillY = H * 0.7
    const nearRidgePoints = [
      { x: 0, y: nearHillY + 0 },
      { x: W * 0.15, y: nearHillY - H * 0.1 },
      { x: W * 0.4, y: nearHillY - H * 0.15 },
      { x: W * 0.6, y: nearHillY - H * 0.08 },
      { x: W * 0.8, y: nearHillY - H * 0.13 },
      { x: W, y: nearHillY + 0 },
    ]

    // Layer 4: Accent - small sun or haze
    const sunX = W * 0.75
    const sunY = H * 0.2
    const sunR = 18

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#B8D4E8" />
            <stop offset="${skyPct}%" stop-color="#D8EAC8" />
          </linearGradient>
          <linearGradient id="far-hill-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <linearGradient id="near-hill-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="100%" stop-color="${palette[2]}" />
          </linearGradient>
          <radialGradient id="sun-glow-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFF8DC" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#FFD700" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background sky -->
        <rect width="${W}" height="${H}" fill="url(#sky-${seed})" />

        <!-- Layer 2: Far hill silhouette -->
        <path d="${ridgePointsToPath(farRidgePoints, W, H)}"
              fill="url(#far-hill-${seed})" opacity="0.85" />

        <!-- Layer 2: Near hill silhouette -->
        <path d="${ridgePointsToPath(nearRidgePoints, W, H)}"
              fill="url(#near-hill-${seed})" opacity="0.92" />

        <!-- Layer 4: Sun accent -->
        <circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${(sunR * 3).toFixed(1)}"
                fill="url(#sun-glow-${seed})" />
        <circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${sunR.toFixed(1)}"
                fill="#FFF5A0" opacity="0.9" />
      </svg>`
  },
}
