import type { Scene, SceneRenderParams } from '../../types'
import { ridgePointsToPath } from '../../lib/svg-utils'

export const snowyPeak: Scene = {
  id: 'snowy-peak',
  name: '雪山',
  category: 'landscape',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#B8D4F0', '#7AA8D8', '#4A7AAA', '#E8F4FF', '#FFFFFF']

    // Layer 1: Background sky
    const horizonY = H * 0.65
    const horizonPct = (horizonY / H * 100).toFixed(1)

    // Layer 2: Mountain silhouette - sharp triangular peak
    const peakX = W * 0.48
    const peakY = H * 0.12
    const leftFootX = 0
    const rightFootX = W

    const mountainPoints = [
      { x: leftFootX, y: horizonY },
      { x: W * 0.1, y: horizonY - H * 0.08 },
      { x: W * 0.28, y: peakY + H * 0.18 },
      { x: peakX, y: peakY },
      { x: W * 0.62, y: peakY + H * 0.15 },
      { x: W * 0.82, y: horizonY - H * 0.05 },
      { x: rightFootX, y: horizonY },
    ]

    // Layer 2: Snow cap highlight
    const snowPoints = [
      { x: peakX - W * 0.06, y: peakY + H * 0.1 },
      { x: peakX - W * 0.02, y: peakY + H * 0.04 },
      { x: peakX, y: peakY },
      { x: peakX + W * 0.03, y: peakY + H * 0.05 },
      { x: peakX + W * 0.08, y: peakY + H * 0.12 },
    ]

    // Layer 4: Cloud accent
    const cloudX = W * 0.2
    const cloudY = H * 0.25
    const cloudR = 30
    const showCloud = true

    const snowPath = (() => {
      const pts = snowPoints
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]
        const curr = pts[i]
        const cpx = (prev.x + curr.x) / 2
        d += ` Q ${cpx.toFixed(1)} ${prev.y.toFixed(1)} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`
      }
      d += ` Z`
      return d
    })()

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[3]}" />
            <stop offset="${horizonPct}%" stop-color="${palette[0]}" />
          </linearGradient>
          <linearGradient id="mountain-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <linearGradient id="ground-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="100%" stop-color="${palette[2]}" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Background sky -->
        <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
        <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#ground-${seed})" />

        <!-- Layer 2: Mountain silhouette -->
        <path d="${ridgePointsToPath(mountainPoints, W, H)}"
              fill="url(#mountain-${seed})" opacity="0.93" />

        <!-- Layer 2: Snow cap -->
        <path d="${snowPath}"
              fill="${palette[4]}" opacity="0.9" />

        <!-- Layer 4: Cloud accent -->
        ${showCloud ? `
          <ellipse cx="${cloudX.toFixed(1)}" cy="${cloudY.toFixed(1)}" rx="${(cloudR * 2.5).toFixed(1)}" ry="${cloudR.toFixed(1)}"
                   fill="${palette[4]}" opacity="0.55" />
          <ellipse cx="${(cloudX + cloudR * 1.2).toFixed(1)}" cy="${(cloudY - cloudR * 0.3).toFixed(1)}" rx="${(cloudR * 1.8).toFixed(1)}" ry="${(cloudR * 0.8).toFixed(1)}"
                   fill="${palette[4]}" opacity="0.45" />
        ` : ''}
      </svg>`
  },
}
