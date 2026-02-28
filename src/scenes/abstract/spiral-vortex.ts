import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const spiralVortex: Scene = {
  id: 'spiral-vortex',
  name: '渦巻き',
  category: 'abstract',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#0D0D1A', '#1B2A4A', '#2E5EAA', '#7B9ED9', '#E8F0FF'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    const cx = jitter(W * 0.5, coherence, rng, W * 0.1)
    const cy = jitter(H * 0.5, coherence, rng, H * 0.1)

    // Layer 2: Archimedean spiral path
    const turns = 5
    const maxR = Math.min(W, H) * 0.42
    const steps = 200
    const spiralPoints: string[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const angle = t * turns * Math.PI * 2
      const r = jitter(maxR * t, coherence, rng, maxR * 0.04)
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      spiralPoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    }
    const spiralPath = spiralPoints.join(' ')

    // Additional arm spirals for visual richness
    const arm2Points: string[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const angle = t * turns * Math.PI * 2 + Math.PI
      const r = jitter(maxR * t, coherence, rng, maxR * 0.04)
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      arm2Points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    }
    const arm2Path = arm2Points.join(' ')

    // Layer 3: texture opacity
    const texOpacity = ((1.0 - coherence) * 0.25).toFixed(2)

    // Layer 4: accent center dot
    const dotR = jitter(maxR * 0.06, coherence, rng, maxR * 0.02)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${palette[2]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.7" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Spiral arms -->
      <g filter="url(#${filterId})">
        <path d="${spiralPath}" fill="none" stroke="${palette[3]}" stroke-width="2.5" opacity="0.85" />
        <path d="${arm2Path}" fill="none" stroke="${palette[2]}" stroke-width="1.5" opacity="0.55" />
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[0]}" opacity="${texOpacity}" />

      <!-- Layer 4: Center glow + accent dot -->
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(dotR * 4).toFixed(1)}"
              fill="url(#glow-${seed})" />
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${dotR.toFixed(1)}"
              fill="${palette[4]}" opacity="0.9" />
    </svg>`
  },
}
