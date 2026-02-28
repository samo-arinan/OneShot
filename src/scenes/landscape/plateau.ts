import type { Scene, SceneRenderParams } from '../../types'
import { jitter, distortPath, buildDistortionFilter, distortPalette, ridgePointsToPath } from '../../lib/coherence-utils'

export const plateau: Scene = {
  id: 'plateau',
  name: '台地',
  category: 'landscape',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#C0522A', '#8B3A1A', '#D46A3A', '#5A8FCC', '#E8C8A0'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background - wide sky
    const horizonY = jitter(H * 0.48, coherence, rng, H * 0.1)
    const horizonPct = (horizonY / H * 100).toFixed(1)

    // Layer 2: Mesa/plateau flat-top ridge
    const mesaTopY = jitter(H * 0.42, coherence, rng, H * 0.06)
    const mesaLeftX = jitter(W * 0.08, coherence, rng, W * 0.06)
    const mesaRightX = jitter(W * 0.92, coherence, rng, W * 0.06)

    const mesaPoints = distortPath([
      { x: 0, y: horizonY + H * 0.05 },
      { x: mesaLeftX - W * 0.04, y: horizonY + H * 0.02 },
      { x: mesaLeftX, y: mesaTopY },
      { x: W * 0.3, y: mesaTopY + jitter(0, coherence, rng, H * 0.02) },
      { x: W * 0.5, y: mesaTopY + jitter(0, coherence, rng, H * 0.015) },
      { x: W * 0.7, y: mesaTopY + jitter(0, coherence, rng, H * 0.02) },
      { x: mesaRightX, y: mesaTopY },
      { x: mesaRightX + W * 0.04, y: horizonY + H * 0.02 },
      { x: W, y: horizonY + H * 0.05 },
    ], coherence, rng)

    // Layer 3: Texture overlay
    const texOpacity = ((1.0 - coherence) * 0.28).toFixed(2)

    // Layer 4: Cloud accent in wide sky
    const cloudX = jitter(W * 0.35, coherence, rng, W * 0.2)
    const cloudY = jitter(H * 0.2, coherence, rng, H * 0.1)
    const cloudR = jitter(28, coherence, rng, 12)
    const showCloud = coherence > 0.45 || rng() > 0.45

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
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
        <g filter="url(#${filterId})">
          <path d="${ridgePointsToPath(mesaPoints, W, H)}"
                fill="url(#mesa-${seed})" opacity="0.94" />
        </g>

        <!-- Layer 3: Texture overlay -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${texOpacity}" />

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
