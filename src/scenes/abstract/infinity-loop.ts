import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const infinityLoop: Scene = {
  id: 'infinity-loop',
  name: '∞',
  category: 'abstract',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#070714', '#0F0F3A', '#3A1078', '#8B5CF6', '#E9D5FF'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    const cx = jitter(W * 0.5, coherence, rng, W * 0.06)
    const cy = jitter(H * 0.5, coherence, rng, H * 0.06)

    // Figure-8 / lemniscate of Bernoulli drawn as a bezier path
    const loopW = jitter(W * 0.38, coherence, rng, W * 0.06)
    const loopH = jitter(H * 0.22, coherence, rng, H * 0.04)
    const cp = loopW * 0.55

    // Right loop
    const r1x = cx + loopW
    const r1y = cy
    // Left loop
    const l1x = cx - loopW
    const l1y = cy
    // Control point spread
    const cpHy = jitter(loopH * 1.4, coherence, rng, loopH * 0.3)

    const figureEight = [
      `M ${cx.toFixed(2)} ${cy.toFixed(2)}`,
      // upper-right arc
      `C ${(cx + cp).toFixed(2)} ${(cy - cpHy).toFixed(2)} ${(r1x + cp * 0.4).toFixed(2)} ${(cy - cpHy * 0.6).toFixed(2)} ${r1x.toFixed(2)} ${r1y.toFixed(2)}`,
      // lower-right arc back to center
      `C ${(r1x + cp * 0.4).toFixed(2)} ${(cy + cpHy * 0.6).toFixed(2)} ${(cx + cp).toFixed(2)} ${(cy + cpHy).toFixed(2)} ${cx.toFixed(2)} ${cy.toFixed(2)}`,
      // upper-left arc
      `C ${(cx - cp).toFixed(2)} ${(cy - cpHy).toFixed(2)} ${(l1x - cp * 0.4).toFixed(2)} ${(cy - cpHy * 0.6).toFixed(2)} ${l1x.toFixed(2)} ${l1y.toFixed(2)}`,
      // lower-left arc back to center
      `C ${(l1x - cp * 0.4).toFixed(2)} ${(cy + cpHy * 0.6).toFixed(2)} ${(cx - cp).toFixed(2)} ${(cy + cpHy).toFixed(2)} ${cx.toFixed(2)} ${cy.toFixed(2)}`,
      `Z`,
    ].join(' ')

    // Glow / background loop (thicker, more transparent)
    const glowStrokeW = jitter(loopH * 0.6, coherence, rng, 5)
    const mainStrokeW = jitter(loopH * 0.18, coherence, rng, 3)

    const texOpacity = ((1.0 - coherence) * 0.22).toFixed(2)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${palette[2]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[3]}" stop-opacity="0.5" />
          <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0" />
        </radialGradient>
        <filter id="blur-${seed}">
          <feGaussianBlur stdDeviation="${(glowStrokeW * 0.5).toFixed(1)}" />
        </filter>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Figure-8 curve + background glow -->
      <g filter="url(#${filterId})">
        <!-- Glow layer -->
        <path d="${figureEight}" fill="none"
              stroke="${palette[3]}" stroke-width="${(glowStrokeW).toFixed(1)}"
              opacity="0.25" filter="url(#blur-${seed})" />
        <!-- Main curve -->
        <path d="${figureEight}" fill="none"
              stroke="${palette[4]}" stroke-width="${mainStrokeW.toFixed(1)}"
              opacity="0.9" stroke-linejoin="round" stroke-linecap="round" />
        <!-- Inner fill -->
        <path d="${figureEight}" fill="${palette[3]}" opacity="0.18" />
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[0]}" opacity="${texOpacity}" />

      <!-- Layer 4: Center intersection glow -->
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(loopH * 0.4).toFixed(1)}"
              fill="url(#glow-${seed})" />
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(loopH * 0.1).toFixed(1)}"
              fill="${palette[4]}" opacity="0.85" />
    </svg>`
  },
}
