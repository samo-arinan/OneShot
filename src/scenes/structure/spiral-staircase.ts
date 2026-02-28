import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const spiralStaircase: Scene = {
  id: 'spiral-staircase',
  name: '螺旋階段',
  category: 'structure',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#2C2C3E', '#1A1A2E', '#4A4A6A', '#C8C8D8', '#F0E8D0'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background
    const bgMidPct = jitter(40, coherence, rng, 10).toFixed(1)

    // Layer 2: Spiral curves - elliptical arcs descending
    const cx = jitter(W * 0.5, coherence, rng, W * 0.05)
    const spiralLevels = 6
    const spiralTopY = jitter(H * 0.1, coherence, rng, H * 0.04)
    const levelSpacing = (H * 0.75) / spiralLevels
    const maxRx = jitter(W * 0.32, coherence, rng, W * 0.05)
    const minRx = jitter(W * 0.05, coherence, rng, W * 0.02)
    const arcRy = jitter(H * 0.04, coherence, rng, H * 0.01)
    const strokeW = jitter(3.5, coherence, rng, 1.5)

    // Build spiral arcs
    const arcs: string[] = []
    for (let i = 0; i < spiralLevels; i++) {
      const t = i / (spiralLevels - 1)
      const y = spiralTopY + i * levelSpacing
      const rx = maxRx - (maxRx - minRx) * t
      const opacity = (0.4 + (1 - t) * 0.5).toFixed(2)
      // Upper arc
      arcs.push(`<ellipse cx="${cx.toFixed(1)}" cy="${y.toFixed(1)}"
                           rx="${rx.toFixed(1)}" ry="${arcRy.toFixed(1)}"
                           fill="none" stroke="${palette[3]}"
                           stroke-width="${strokeW.toFixed(1)}" opacity="${opacity}" />`)
      // Step lines connecting adjacent arcs
      if (i < spiralLevels - 1) {
        const nextY = spiralTopY + (i + 1) * levelSpacing
        const nextRx = maxRx - (maxRx - minRx) * ((i + 1) / (spiralLevels - 1))
        const rightX = cx + rx
        const nextRightX = cx + nextRx
        arcs.push(`<line x1="${rightX.toFixed(1)}" y1="${y.toFixed(1)}"
                         x2="${nextRightX.toFixed(1)}" y2="${nextY.toFixed(1)}"
                         stroke="${palette[2]}" stroke-width="${(strokeW * 0.6).toFixed(1)}"
                         opacity="${opacity}" />`)
      }
    }

    // Layer 3: Texture
    const texOpacity = ((1.0 - coherence) * 0.28).toFixed(2)

    // Layer 4: Light source above center
    const lightX = jitter(cx, coherence, rng, W * 0.04)
    const lightY = jitter(spiralTopY - H * 0.06, coherence, rng, H * 0.03)
    const lightR = jitter(22, coherence, rng, 8)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="bg-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.5" />
            <stop offset="${bgMidPct}%" stop-color="${palette[1]}" />
            <stop offset="100%" stop-color="${palette[0]}" />
          </linearGradient>
          <radialGradient id="light-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.9" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

        <!-- Layer 2: Spiral staircase curves -->
        <g filter="url(#${filterId})">
          ${arcs.join('\n          ')}
          <!-- Center column -->
          <line x1="${cx.toFixed(1)}" y1="${spiralTopY.toFixed(1)}"
                x2="${cx.toFixed(1)}" y2="${(spiralTopY + spiralLevels * levelSpacing).toFixed(1)}"
                stroke="${palette[2]}" stroke-width="${(strokeW * 1.5).toFixed(1)}" opacity="0.7" />
        </g>

        <!-- Layer 3: Texture overlay -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[1]}" opacity="${texOpacity}" />

        <!-- Layer 4: Light source above -->
        <circle cx="${lightX.toFixed(1)}" cy="${lightY.toFixed(1)}" r="${(lightR * 3).toFixed(1)}"
                fill="url(#light-${seed})" />
        <circle cx="${lightX.toFixed(1)}" cy="${lightY.toFixed(1)}" r="${lightR.toFixed(1)}"
                fill="${palette[4]}" opacity="0.88" />
      </svg>`
  },
}
