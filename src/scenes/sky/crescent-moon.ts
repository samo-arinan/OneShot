import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const crescentMoon: Scene = {
  id: 'crescent-moon',
  name: '三日月',
  category: 'sky',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#060818', '#0E1428', '#1C2444', '#F0E68C', '#FFFACD'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    const moonCx = jitter(W * 0.6, coherence, rng, W * 0.15)
    const moonCy = jitter(H * 0.28, coherence, rng, H * 0.1)
    const moonR = jitter(40, coherence, rng, 12)
    const offsetX = jitter(moonR * 0.55, coherence, rng, moonR * 0.1)
    const offsetY = jitter(moonR * -0.1, coherence, rng, moonR * 0.1)

    // Crescent arc path: outer circle minus inner circle offset
    const outerR = moonR
    const innerR = outerR * 0.88
    const cutCx = moonCx + offsetX
    const cutCy = moonCy + offsetY

    const texOpacity = ((1.0 - coherence) * 0.22).toFixed(2)
    const haloOpacity = (0.15 + coherence * 0.1).toFixed(2)

    // Small stars
    const starCount = Math.floor(8 + coherence * 6)
    const starEls: string[] = []
    for (let i = 0; i < starCount; i++) {
      const sx = rng() * W
      const sy = rng() * H * 0.85
      const sr = 0.5 + rng() * 1.5
      starEls.push(`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr.toFixed(1)}" fill="${palette[4]}" opacity="${(0.3 + rng() * 0.5).toFixed(2)}" />`)
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="100%" stop-color="${palette[2]}" />
        </linearGradient>
        <radialGradient id="halo-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[3]}" stop-opacity="${haloOpacity}" />
          <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0" />
        </radialGradient>
        <mask id="crescent-mask-${seed}">
          <circle cx="${moonCx.toFixed(1)}" cy="${moonCy.toFixed(1)}" r="${outerR.toFixed(1)}" fill="white" />
          <circle cx="${cutCx.toFixed(1)}" cy="${cutCy.toFixed(1)}" r="${innerR.toFixed(1)}" fill="black" />
        </mask>
      </defs>

      <!-- Layer 1: Dark sky background -->
      <rect width="${W}" height="${H}" fill="url(#sky-${seed})" />

      <!-- Layer 2: Crescent moon shape -->
      <g filter="url(#${filterId})">
        <circle cx="${moonCx.toFixed(1)}" cy="${moonCy.toFixed(1)}" r="${(outerR * 3).toFixed(1)}"
                fill="url(#halo-${seed})" />
        <circle cx="${moonCx.toFixed(1)}" cy="${moonCy.toFixed(1)}" r="${outerR.toFixed(1)}"
                fill="${palette[4]}" mask="url(#crescent-mask-${seed})" />
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[1]}" opacity="${texOpacity}" />

      <!-- Layer 4: Stars accent -->
      <g>
        ${starEls.join('\n        ')}
      </g>
    </svg>`
  },
}
