import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const waterfall: Scene = {
  id: 'waterfall',
  name: '滝',
  category: 'water',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#2a3020', '#3a4030', '#c8dce8', '#e8f4fc', '#ffffff'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background - dark rock / forest
    const fallCenterX = jitter(W * 0.5, coherence, rng, W * 0.05)
    const fallWidth = jitter(W * 0.22, coherence, rng, W * 0.05)

    // Layer 2: Central waterfall band - vertical white streaks
    const streamLines: string[] = []
    const streamCount = Math.floor(jitter(12, coherence, rng, 5))
    for (let i = 0; i < streamCount; i++) {
      const sx = fallCenterX - fallWidth / 2 + rng() * fallWidth
      const sWiggle = jitter(4, coherence, rng, 6)
      let d = `M ${sx.toFixed(1)} 0`
      for (let y = 0; y <= H; y += 15) {
        const x = sx + Math.sin(y * 0.03 + rng() * Math.PI) * sWiggle
        d += ` L ${x.toFixed(1)} ${y}`
      }
      const opacity = (0.3 + rng() * 0.5).toFixed(2)
      const strokeW = (0.5 + rng() * 2).toFixed(1)
      streamLines.push(`<path d="${d}" stroke="${palette[4]}" stroke-width="${strokeW}" fill="none" opacity="${opacity}" />`)
    }

    // Rock silhouettes left and right
    const leftRockW = jitter(fallCenterX - fallWidth / 2, coherence, rng, W * 0.05)
    const rightRockX = jitter(fallCenterX + fallWidth / 2, coherence, rng, W * 0.05)

    // Jagged rock edges
    let leftEdge = `M 0 0 L 0 ${H} L ${leftRockW.toFixed(1)} ${H}`
    for (let y = H; y >= 0; y -= 20) {
      const ex = leftRockW + jitter(0, coherence, rng, 15)
      leftEdge += ` L ${ex.toFixed(1)} ${y}`
    }
    leftEdge += ' Z'

    let rightEdge = `M ${W} 0 L ${W} ${H} L ${rightRockX.toFixed(1)} ${H}`
    for (let y = H; y >= 0; y -= 20) {
      const ex = rightRockX + jitter(0, coherence, rng, 15)
      rightEdge += ` L ${ex.toFixed(1)} ${y}`
    }
    rightEdge += ' Z'

    const texOpacity = ((1.0 - coherence) * 0.2).toFixed(2)

    // Layer 4: Mist / splash at bottom
    const mistY = jitter(H * 0.85, coherence, rng, H * 0.05)
    const mistR = jitter(fallWidth * 0.8, coherence, rng, fallWidth * 0.2)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="rock-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="100%" stop-color="${palette[0]}" />
          </linearGradient>
          <linearGradient id="fall-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="100%" stop-color="${palette[4]}" />
          </linearGradient>
          <radialGradient id="mist-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.5" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${H}" fill="url(#rock-${seed})" />
        <rect x="${(fallCenterX - fallWidth / 2).toFixed(1)}" width="${fallWidth.toFixed(1)}" height="${H}"
              fill="url(#fall-${seed})" opacity="0.8" />

        <!-- Layer 2: Waterfall streams -->
        <g filter="url(#${filterId})">
          ${streamLines.join('\n          ')}
        </g>

        <!-- Layer 3: Rock silhouettes -->
        <path d="${leftEdge}" fill="url(#rock-${seed})" />
        <path d="${rightEdge}" fill="url(#rock-${seed})" />
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${texOpacity}" />

        <!-- Layer 4: Mist at base -->
        <ellipse cx="${fallCenterX.toFixed(1)}" cy="${mistY.toFixed(1)}"
                 rx="${mistR.toFixed(1)}" ry="${(mistR * 0.3).toFixed(1)}"
                 fill="url(#mist-${seed})" />
      </svg>`
  },
}
