import type { Scene, SceneRenderParams } from '../../types'
import { ridgePointsToPath } from '../../lib/svg-utils'

export const auroraNight: Scene = {
  id: 'aurora-night',
  name: 'オーロラの夜',
  category: 'sky',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#0A0F1E', '#1B5E3B', '#7B2FBE', '#00E5A0', '#E040FB']

    const snowY = H * 0.75

    // Snow ridge
    const snowPoints = [
      { x: 0, y: snowY },
      { x: W * 0.25, y: snowY - H * 0.04 },
      { x: W * 0.5, y: snowY + H * 0.02 },
      { x: W * 0.75, y: snowY - H * 0.03 },
      { x: W, y: snowY },
    ]

    // Aurora curtain control points
    const a1TopY = H * 0.08
    const a1BotY = H * 0.45
    const a2TopY = H * 0.12
    const a2BotY = H * 0.55

    const auroraOpacity1 = '0.80'
    const auroraOpacity2 = '0.60'

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="100%" stop-color="#070B14" />
        </linearGradient>
        <linearGradient id="aurora1-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[3]}" stop-opacity="0" />
          <stop offset="50%" stop-color="${palette[3]}" stop-opacity="0.8" />
          <stop offset="100%" stop-color="${palette[1]}" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="aurora2-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0" />
          <stop offset="40%" stop-color="${palette[4]}" stop-opacity="0.6" />
          <stop offset="100%" stop-color="${palette[2]}" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="snow-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#C8E6F5" />
          <stop offset="100%" stop-color="#8FB8D0" />
        </linearGradient>
      </defs>

      <!-- Layer 1: Dark sky background -->
      <rect width="${W}" height="${H}" fill="url(#sky-${seed})" />

      <!-- Layer 2: Aurora curtains -->
      <g opacity="${auroraOpacity1}">
        <path d="M ${(W * 0.1).toFixed(1)} ${a1TopY.toFixed(1)}
                 C ${(W * 0.2).toFixed(1)} ${(a1TopY + H * 0.1).toFixed(1)},
                   ${(W * 0.3).toFixed(1)} ${(a1BotY - H * 0.05).toFixed(1)},
                   ${(W * 0.35).toFixed(1)} ${a1BotY.toFixed(1)}
                 C ${(W * 0.4).toFixed(1)} ${(a1BotY + H * 0.05).toFixed(1)},
                   ${(W * 0.5).toFixed(1)} ${(a1TopY + H * 0.15).toFixed(1)},
                   ${(W * 0.55).toFixed(1)} ${a1TopY.toFixed(1)} Z"
              fill="url(#aurora1-${seed})" />
      </g>
      <g opacity="${auroraOpacity2}">
        <path d="M ${(W * 0.4).toFixed(1)} ${a2TopY.toFixed(1)}
                 C ${(W * 0.5).toFixed(1)} ${(a2TopY + H * 0.12).toFixed(1)},
                   ${(W * 0.6).toFixed(1)} ${(a2BotY - H * 0.04).toFixed(1)},
                   ${(W * 0.7).toFixed(1)} ${a2BotY.toFixed(1)}
                 C ${(W * 0.8).toFixed(1)} ${(a2BotY + H * 0.04).toFixed(1)},
                   ${(W * 0.9).toFixed(1)} ${(a2TopY + H * 0.1).toFixed(1)},
                   ${(W * 0.95).toFixed(1)} ${a2TopY.toFixed(1)} Z"
              fill="url(#aurora2-${seed})" />
      </g>

      <!-- Layer 4: Snow field accent -->
      <path d="${ridgePointsToPath(snowPoints, W, H)}"
            fill="url(#snow-${seed})" opacity="0.9" />
    </svg>`
  },
}
