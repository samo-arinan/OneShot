import type { Scene, SceneRenderParams } from '../../types'
import { jitter, distortPath, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const canyon: Scene = {
  id: 'canyon',
  name: '渓谷',
  category: 'landscape',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#8B3A1A', '#C0622A', '#D4884A', '#F5D4A0', '#5A2A0A'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background - warm sky in the gap
    const skyGapColor = '#F5E8C0'

    // Layer 2: Left cliff silhouette
    const leftCliffEdge = jitter(W * 0.38, coherence, rng, W * 0.08)
    const leftCliffPoints = distortPath([
      { x: 0, y: 0 },
      { x: leftCliffEdge + W * 0.05, y: jitter(H * 0.1, coherence, rng, H * 0.05) },
      { x: leftCliffEdge + W * 0.02, y: jitter(H * 0.3, coherence, rng, H * 0.06) },
      { x: leftCliffEdge - W * 0.03, y: jitter(H * 0.5, coherence, rng, H * 0.05) },
      { x: leftCliffEdge, y: jitter(H * 0.7, coherence, rng, H * 0.06) },
      { x: leftCliffEdge - W * 0.02, y: H },
    ], coherence, rng)

    // Layer 2: Right cliff silhouette
    const rightCliffEdge = jitter(W * 0.62, coherence, rng, W * 0.08)
    const rightCliffPoints = distortPath([
      { x: W, y: 0 },
      { x: rightCliffEdge - W * 0.04, y: jitter(H * 0.12, coherence, rng, H * 0.05) },
      { x: rightCliffEdge + W * 0.02, y: jitter(H * 0.28, coherence, rng, H * 0.06) },
      { x: rightCliffEdge - W * 0.01, y: jitter(H * 0.48, coherence, rng, H * 0.05) },
      { x: rightCliffEdge + W * 0.03, y: jitter(H * 0.68, coherence, rng, H * 0.06) },
      { x: rightCliffEdge, y: H },
    ], coherence, rng)

    // Layer 3: Texture overlay
    const texOpacity = ((1.0 - coherence) * 0.28).toFixed(2)

    // Layer 4: Light beam accent in the canyon gap
    const beamCenterX = (leftCliffEdge + rightCliffEdge) / 2
    const beamOpacity = (coherence * 0.4 + 0.1).toFixed(2)

    const leftPath = (() => {
      const pts = leftCliffPoints
      let d = `M 0 0 L ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
      for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`
      }
      d += ` L 0 ${H} Z`
      return d
    })()

    const rightPath = (() => {
      const pts = rightCliffPoints
      let d = `M ${W} 0 L ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
      for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`
      }
      d += ` L ${W} ${H} Z`
      return d
    })()

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${skyGapColor}" />
            <stop offset="60%" stop-color="#E8C880" />
            <stop offset="100%" stop-color="#C0844A" />
          </linearGradient>
          <linearGradient id="left-cliff-${seed}" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[4]}" />
          </linearGradient>
          <linearGradient id="right-cliff-${seed}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[4]}" />
          </linearGradient>
          <linearGradient id="beam-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[3]}" stop-opacity="0.7" />
            <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Background (sky / gap light) -->
        <rect width="${W}" height="${H}" fill="url(#sky-${seed})" />

        <!-- Layer 2: Left cliff -->
        <g filter="url(#${filterId})">
          <path d="${leftPath}"
                fill="url(#left-cliff-${seed})" opacity="0.96" />
        </g>

        <!-- Layer 2: Right cliff -->
        <g filter="url(#${filterId})">
          <path d="${rightPath}"
                fill="url(#right-cliff-${seed})" opacity="0.96" />
        </g>

        <!-- Layer 3: Texture overlay -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[1]}" opacity="${texOpacity}" />

        <!-- Layer 4: Light beam accent -->
        <rect x="${(beamCenterX - W * 0.06).toFixed(1)}" y="0" width="${(W * 0.12).toFixed(1)}" height="${H}"
              fill="url(#beam-${seed})" opacity="${beamOpacity}" />
      </svg>`
  },
}
