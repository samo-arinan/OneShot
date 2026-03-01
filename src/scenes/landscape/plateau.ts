import type { Scene, SceneRenderParams } from '../../types'
import { ridgePointsToPath } from '../../lib/svg-utils'

export const plateau: Scene = {
  id: 'plateau',
  name: '台地',
  category: 'landscape',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#C0522A', '#8B3A1A', '#D46A3A', '#5A8FCC', '#E8C8A0']

    // Layer 1: Background - wide sky
    const horizonY = H * 0.48
    const horizonPct = (horizonY / H * 100).toFixed(1)

    // Layer 2: Mesa/plateau flat-top ridge
    const mesaTopY = H * 0.42
    const mesaLeftX = W * 0.08
    const mesaRightX = W * 0.92

    const mesaPoints = [
      { x: 0, y: horizonY + H * 0.05 },
      { x: mesaLeftX - W * 0.04, y: horizonY + H * 0.02 },
      { x: mesaLeftX, y: mesaTopY },
      { x: W * 0.3, y: mesaTopY + 0 },
      { x: W * 0.5, y: mesaTopY + 0 },
      { x: W * 0.7, y: mesaTopY + 0 },
      { x: mesaRightX, y: mesaTopY },
      { x: mesaRightX + W * 0.04, y: horizonY + H * 0.02 },
      { x: W, y: horizonY + H * 0.05 },
    ]

    // Layer 4: Cloud accent in wide sky
    const cloudX = W * 0.35
    const cloudY = H * 0.2
    const cloudR = 28
    const showCloud = true

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[3]}" />
            <stop offset="${horizonPct}%" stop-color="#A8C8E8" />
          </linearGradient>
          <linearGradient id="mesa-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <linearGradient id="ground-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Background sky -->
        <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
        <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#ground-${seed})" />

        <!-- Layer 2: Plateau/mesa silhouette -->
        <path d="${ridgePointsToPath(mesaPoints, W, H)}"
              fill="url(#mesa-${seed})" opacity="0.94" />

        <!-- Layer 4: Cloud accent -->
        ${showCloud ? `
          <ellipse cx="${cloudX.toFixed(1)}" cy="${cloudY.toFixed(1)}" rx="${(cloudR * 3).toFixed(1)}" ry="${cloudR.toFixed(1)}"
                   fill="white" opacity="0.5" />
          <ellipse cx="${(cloudX + cloudR * 1.5).toFixed(1)}" cy="${(cloudY - cloudR * 0.4).toFixed(1)}" rx="${(cloudR * 2).toFixed(1)}" ry="${(cloudR * 0.75).toFixed(1)}"
                   fill="white" opacity="0.4" />
          <ellipse cx="${(cloudX - cloudR * 1.2).toFixed(1)}" cy="${(cloudY - cloudR * 0.2).toFixed(1)}" rx="${(cloudR * 1.6).toFixed(1)}" ry="${(cloudR * 0.65).toFixed(1)}"
                   fill="white" opacity="0.35" />
        ` : ''}
      </svg>`
  },
}
