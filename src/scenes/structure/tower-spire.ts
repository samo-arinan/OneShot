import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const towerSpire: Scene = {
  id: 'tower-spire',
  name: '塔',
  category: 'structure',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#1A1A2E', '#16213E', '#0F3460', '#E2E2E2', '#F0C27F'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background gradient
    const skyMidPct = jitter(55, coherence, rng, 15).toFixed(1)

    // Layer 2: Tower spire - central thin tall triangle
    const spireBaseW = jitter(W * 0.06, coherence, rng, W * 0.02)
    const spireTopX = jitter(W * 0.5, coherence, rng, W * 0.04)
    const spireTopY = jitter(H * 0.05, coherence, rng, H * 0.04)
    const spireBaseY = jitter(H * 0.85, coherence, rng, H * 0.05)
    const spireBaseX = W * 0.5

    // Tower body below spire tip
    const towerW = jitter(W * 0.12, coherence, rng, W * 0.02)
    const towerTopY = jitter(H * 0.35, coherence, rng, H * 0.05)

    // Layer 3: Texture overlay
    const texOpacity = ((1.0 - coherence) * 0.25).toFixed(2)

    // Layer 4: Light source above spire
    const lightX = jitter(spireTopX, coherence, rng, W * 0.05)
    const lightY = jitter(spireTopY - H * 0.05, coherence, rng, H * 0.03)
    const lightR = jitter(20, coherence, rng, 8)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="${skyMidPct}%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[2]}" />
          </linearGradient>
          <linearGradient id="tower-${seed}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="50%" stop-color="${palette[3]}" stop-opacity="0.9" />
            <stop offset="100%" stop-color="${palette[2]}" />
          </linearGradient>
          <radialGradient id="light-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.95" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${H}" fill="url(#sky-${seed})" />

        <!-- Layer 2: Tower structure -->
        <g filter="url(#${filterId})">
          <!-- Tower body -->
          <rect x="${(spireBaseX - towerW / 2).toFixed(1)}" y="${towerTopY.toFixed(1)}"
                width="${towerW.toFixed(1)}" height="${(spireBaseY - towerTopY).toFixed(1)}"
                fill="url(#tower-${seed})" opacity="0.92" />
          <!-- Spire triangle -->
          <polygon points="${spireTopX.toFixed(1)},${spireTopY.toFixed(1)} ${(spireBaseX - spireBaseW / 2).toFixed(1)},${towerTopY.toFixed(1)} ${(spireBaseX + spireBaseW / 2).toFixed(1)},${towerTopY.toFixed(1)}"
                   fill="${palette[3]}" opacity="0.95" />
        </g>

        <!-- Layer 3: Texture overlay -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${texOpacity}" />

        <!-- Layer 4: Light source above spire -->
        <circle cx="${lightX.toFixed(1)}" cy="${lightY.toFixed(1)}" r="${(lightR * 3).toFixed(1)}"
                fill="url(#light-${seed})" />
        <circle cx="${lightX.toFixed(1)}" cy="${lightY.toFixed(1)}" r="${lightR.toFixed(1)}"
                fill="${palette[4]}" opacity="0.9" />
      </svg>`
  },
}
