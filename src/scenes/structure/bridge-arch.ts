import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const bridgeArch: Scene = {
  id: 'bridge-arch',
  name: 'アーチ橋',
  category: 'structure',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#4A6FA5', '#2C3E50', '#7F8C8D', '#BDC3C7', '#F39C12'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background
    const horizonY = jitter(H * 0.5, coherence, rng, H * 0.08)

    // Layer 2: Bridge arch - semicircular arch on horizon
    const archCx = jitter(W * 0.5, coherence, rng, W * 0.05)
    const archCy = jitter(horizonY, coherence, rng, H * 0.03)
    const archRx = jitter(W * 0.3, coherence, rng, W * 0.05)
    const archRy = jitter(H * 0.22, coherence, rng, H * 0.04)
    const archThickness = jitter(H * 0.04, coherence, rng, H * 0.01)

    // Bridge deck
    const deckY = jitter(horizonY, coherence, rng, H * 0.02)
    const deckH = jitter(H * 0.03, coherence, rng, H * 0.01)

    // Layer 3: Water reflection
    const waterOpacity = (0.4 + coherence * 0.3).toFixed(2)
    const reflectionScale = jitter(0.6, coherence, rng, 0.1)

    // Layer 4: Sky glow accent
    const glowX = jitter(archCx, coherence, rng, W * 0.08)
    const glowY = jitter(archCy - archRy * 0.6, coherence, rng, H * 0.05)

    const texOpacity = ((1.0 - coherence) * 0.2).toFixed(2)
    const horizonPct = (horizonY / H * 100).toFixed(1)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="${horizonPct}%" stop-color="${palette[0]}" />
          </linearGradient>
          <linearGradient id="water-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.6" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background sky and water -->
        <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
        <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#water-${seed})" />

        <!-- Layer 2: Bridge arch structure -->
        <g filter="url(#${filterId})">
          <!-- Arch outer -->
          <ellipse cx="${archCx.toFixed(1)}" cy="${archCy.toFixed(1)}"
                   rx="${archRx.toFixed(1)}" ry="${archRy.toFixed(1)}"
                   fill="none" stroke="${palette[2]}"
                   stroke-width="${archThickness.toFixed(1)}"
                   clip-path="url(#upper-half-${seed})" />
          <!-- Bridge deck -->
          <rect x="${(archCx - archRx).toFixed(1)}" y="${deckY.toFixed(1)}"
                width="${(archRx * 2).toFixed(1)}" height="${deckH.toFixed(1)}"
                fill="${palette[2]}" opacity="0.9" />
          <!-- Pylons -->
          <rect x="${(archCx - archRx - archThickness / 2).toFixed(1)}" y="${(deckY).toFixed(1)}"
                width="${archThickness.toFixed(1)}" height="${(H * 0.1).toFixed(1)}"
                fill="${palette[2]}" opacity="0.85" />
          <rect x="${(archCx + archRx - archThickness / 2).toFixed(1)}" y="${(deckY).toFixed(1)}"
                width="${archThickness.toFixed(1)}" height="${(H * 0.1).toFixed(1)}"
                fill="${palette[2]}" opacity="0.85" />
        </g>

        <!-- Water reflection -->
        <g opacity="${waterOpacity}" transform="translate(${archCx.toFixed(1)}, ${(horizonY * 2).toFixed(1)}) scale(1, -${reflectionScale.toFixed(2)}) translate(-${archCx.toFixed(1)}, 0)"
           filter="url(#${filterId})">
          <ellipse cx="${archCx.toFixed(1)}" cy="${archCy.toFixed(1)}"
                   rx="${archRx.toFixed(1)}" ry="${archRy.toFixed(1)}"
                   fill="none" stroke="${palette[3]}"
                   stroke-width="${archThickness.toFixed(1)}" />
        </g>

        <!-- Layer 3: Texture overlay -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${texOpacity}" />

        <!-- Layer 4: Sky glow -->
        <circle cx="${glowX.toFixed(1)}" cy="${glowY.toFixed(1)}" r="${(W * 0.18).toFixed(1)}"
                fill="url(#glow-${seed})" />
      </svg>`
  },
}
