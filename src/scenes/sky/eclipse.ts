import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const eclipse: Scene = {
  id: 'eclipse',
  name: '日食',
  category: 'sky',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#0A0A0A', '#1A0A00', '#2D1A00', '#FFA500', '#FFD700'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    const cx = jitter(W * 0.5, coherence, rng, W * 0.1)
    const cy = jitter(H * 0.42, coherence, rng, H * 0.1)
    const moonR = jitter(55, coherence, rng, 15)
    const coronaR = moonR * (2.0 + coherence * 0.5)

    const texOpacity = ((1.0 - coherence) * 0.2).toFixed(2)
    const coronaOpacity = (0.7 + coherence * 0.25).toFixed(2)

    // Corona ray count scales with coherence
    const rayCount = Math.floor(8 + coherence * 8)
    const rays: string[] = []
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2
      const rayLen = jitter(moonR * 1.2, coherence, rng, moonR * 0.4)
      const rx1 = (cx + Math.cos(angle) * moonR * 1.05).toFixed(1)
      const ry1 = (cy + Math.sin(angle) * moonR * 1.05).toFixed(1)
      const rx2 = (cx + Math.cos(angle) * (moonR + rayLen)).toFixed(1)
      const ry2 = (cy + Math.sin(angle) * (moonR + rayLen)).toFixed(1)
      rays.push(`<line x1="${rx1}" y1="${ry1}" x2="${rx2}" y2="${ry2}" stroke="${palette[4]}" stroke-width="${(1 + rng() * 2).toFixed(1)}" opacity="${(0.4 + rng() * 0.5).toFixed(2)}" />`)
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <linearGradient id="bg-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="50%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[2]}" />
        </linearGradient>
        <radialGradient id="corona-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[3]}" stop-opacity="0" />
          <stop offset="40%" stop-color="${palette[3]}" stop-opacity="${coronaOpacity}" />
          <stop offset="70%" stop-color="${palette[4]}" stop-opacity="0.3" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Dark background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Eclipse with corona -->
      <g filter="url(#${filterId})">
        <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${coronaR.toFixed(1)}"
                fill="url(#corona-${seed})" />
        ${rays.join('\n        ')}
        <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${moonR.toFixed(1)}"
                fill="${palette[0]}" />
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[1]}" opacity="${texOpacity}" />

      <!-- Layer 4: Inner corona ring accent -->
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(moonR * 1.08).toFixed(1)}"
              fill="none" stroke="${palette[3]}" stroke-width="${(2 + coherence * 3).toFixed(1)}"
              opacity="0.85" />
    </svg>`
  },
}
