import type { Scene, SceneRenderParams } from '../../types'
import { ridgePointsToPath } from '../../lib/svg-utils'

export const fujiMoonlight: Scene = {
  id: 'fuji-moonlight',
  name: '月夜の富士',
  category: 'landscape',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#1B3A5C', '#0D1B2A', '#2C2C2C', '#C9A959', '#F5F0E8']

    // Layer 1: Background
    const horizonY = H * 0.55

    // Layer 2: Mountain ridge
    const peakX = W * 0.45
    const peakY = H * 0.2
    const ridgePoints = [
      { x: 0, y: horizonY },
      { x: W * 0.2, y: horizonY - H * 0.05 },
      { x: peakX, y: peakY },
      { x: W * 0.7, y: horizonY - H * 0.03 },
      { x: W, y: horizonY + H * 0.02 },
    ]

    // Layer 4: Moon accent
    const moonX = W * 0.78
    const moonY = H * 0.15
    const moonR = 25
    const showMoon = true

    const horizonPct = (horizonY / H * 100).toFixed(1)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="${horizonPct}%" stop-color="${palette[0]}" />
          </linearGradient>
          <linearGradient id="ground-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <radialGradient id="moon-glow-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.9" />
            <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
        <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#ground-${seed})" />

        <!-- Layer 2: Mountain silhouette -->
        <path d="${ridgePointsToPath(ridgePoints, W, H)}"
              fill="${palette[2]}" opacity="0.9" />

        <!-- Layer 4: Moon -->
        ${showMoon ? `
          <circle cx="${moonX.toFixed(1)}" cy="${moonY.toFixed(1)}" r="${(moonR * 2.5).toFixed(1)}"
                  fill="url(#moon-glow-${seed})" />
          <circle cx="${moonX.toFixed(1)}" cy="${moonY.toFixed(1)}" r="${moonR.toFixed(1)}"
                  fill="${palette[4]}" opacity="0.85" />
        ` : ''}
      </svg>`
  },
}
