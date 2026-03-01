import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const yinYang: Scene = {
  id: 'yin-yang',
  name: '陰陽',
  category: 'abstract',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#0A0A0A', '#1A1A1A', '#888888', '#E0E0E0', '#FFFFFF'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    const cx = jitter(W * 0.5, coherence, rng, W * 0.08)
    const cy = jitter(H * 0.5, coherence, rng, H * 0.08)
    const R = Math.min(W, H) * 0.38
    const r = jitter(R, coherence, rng, R * 0.05)
    const halfR = r / 2

    // Yin-yang shape: two halves separated by S-curve
    // Top half white, bottom half black
    // S-curve: large semicircle top (white pushes down), large semicircle bottom (black pushes up)
    // White half: right semicircle + top small circle - bottom small circle
    const whiteHalf = [
      `M ${cx.toFixed(2)} ${(cy - r).toFixed(2)}`,
      `A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${cx.toFixed(2)} ${(cy + r).toFixed(2)}`,
      `A ${halfR.toFixed(2)} ${halfR.toFixed(2)} 0 0 1 ${cx.toFixed(2)} ${(cy).toFixed(2)}`,
      `A ${halfR.toFixed(2)} ${halfR.toFixed(2)} 0 0 0 ${cx.toFixed(2)} ${(cy - r).toFixed(2)}`,
      `Z`,
    ].join(' ')

    const blackHalf = [
      `M ${cx.toFixed(2)} ${(cy - r).toFixed(2)}`,
      `A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 0 ${cx.toFixed(2)} ${(cy + r).toFixed(2)}`,
      `A ${halfR.toFixed(2)} ${halfR.toFixed(2)} 0 0 0 ${cx.toFixed(2)} ${(cy).toFixed(2)}`,
      `A ${halfR.toFixed(2)} ${halfR.toFixed(2)} 0 0 1 ${cx.toFixed(2)} ${(cy - r).toFixed(2)}`,
      `Z`,
    ].join(' ')

    // Small dot radii
    const dotR = jitter(halfR * 0.35, coherence, rng, halfR * 0.08)

    const texOpacity = ((1.0 - coherence) * 0.2).toFixed(2)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${palette[2]}" />
          <stop offset="100%" stop-color="${palette[1]}" />
        </radialGradient>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[3]}" stop-opacity="0.4" />
          <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Yin-yang halves -->
      <g filter="url(#${filterId})">
        <!-- White (Yang) half -->
        <path d="${whiteHalf}" fill="${palette[4]}" opacity="0.92" />
        <!-- Black (Yin) half -->
        <path d="${blackHalf}" fill="${palette[0]}" opacity="0.92" />
        <!-- Outer ring -->
        <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"
                fill="none" stroke="${palette[2]}" stroke-width="2" opacity="0.5" />
        <!-- Small contrasting dots -->
        <circle cx="${cx.toFixed(1)}" cy="${(cy - halfR).toFixed(1)}" r="${dotR.toFixed(1)}"
                fill="${palette[0]}" opacity="0.9" />
        <circle cx="${cx.toFixed(1)}" cy="${(cy + halfR).toFixed(1)}" r="${dotR.toFixed(1)}"
                fill="${palette[4]}" opacity="0.9" />
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[1]}" opacity="${texOpacity}" />

      <!-- Layer 4: Outer glow accent -->
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 1.15).toFixed(1)}"
              fill="url(#glow-${seed})" />
    </svg>`
  },
}
