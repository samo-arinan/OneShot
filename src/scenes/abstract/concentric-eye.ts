import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const concentricEye: Scene = {
  id: 'concentric-eye',
  name: '同心円（目）',
  category: 'abstract',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#0A0A2E', '#1A1A4E', '#3D5A80', '#98C1D9', '#E0FBFC'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Dark background
    const cx = jitter(W * 0.5, coherence, rng, W * 0.15)
    const cy = jitter(H * 0.5, coherence, rng, H * 0.15)

    // Layer 2: Concentric rings
    const ringCount = 6
    const maxRadius = Math.min(W, H) * 0.4
    const rings: string[] = []
    for (let i = ringCount; i >= 1; i--) {
      const baseR = maxRadius * (i / ringCount)
      const r = jitter(baseR, coherence, rng, baseR * 0.15)
      const colorIdx = Math.min(i % palette.length, palette.length - 1)
      const opacity = (0.4 + (ringCount - i) * 0.1).toFixed(2)
      rings.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"
                fill="${palette[colorIdx]}" opacity="${opacity}" />`)
    }

    // Layer 4: Pupil (innermost)
    const pupilR = jitter(maxRadius * 0.12, coherence, rng, maxRadius * 0.05)
    const showPupil = coherence > 0.3 || rng() > 0.5

    const texOpacity = ((1.0 - coherence) * 0.3).toFixed(2)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="100%" stop-color="${palette[0]}" />
          </radialGradient>
          <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.6" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

        <!-- Layer 2: Concentric rings -->
        <g filter="url(#${filterId})">
          ${rings.join('\n          ')}
        </g>

        <!-- Layer 3: Texture -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${texOpacity}" />

        <!-- Layer 4: Pupil + glow -->
        ${showPupil ? `
          <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(pupilR * 3).toFixed(1)}"
                  fill="url(#glow-${seed})" />
          <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${pupilR.toFixed(1)}"
                  fill="${palette[0]}" opacity="0.9" />
        ` : ''}
      </svg>`
  },
}
