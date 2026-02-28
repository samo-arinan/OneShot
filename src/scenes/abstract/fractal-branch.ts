import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const fractalBranch: Scene = {
  id: 'fractal-branch',
  name: 'フラクタル枝',
  category: 'abstract',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#0C1A0C', '#1A3A1A', '#3A6B3A', '#7DBF7D', '#C8F0C8'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Recursive branch generator
    const branches: string[] = []

    function drawBranch(
      x1: number, y1: number,
      length: number, angle: number,
      depth: number, strokeW: number
    ) {
      if (depth === 0 || length < 4) return
      const x2 = x1 + length * Math.cos(angle)
      const y2 = y1 + length * Math.sin(angle)

      const jx1 = jitter(x1, coherence, rng, length * 0.05)
      const jy1 = jitter(y1, coherence, rng, length * 0.05)
      const jx2 = jitter(x2, coherence, rng, length * 0.08)
      const jy2 = jitter(y2, coherence, rng, length * 0.08)

      const colorIdx = Math.min(depth, palette.length - 1)
      const opacity = (0.5 + depth * 0.12).toFixed(2)
      branches.push(
        `<line x1="${jx1.toFixed(2)}" y1="${jy1.toFixed(2)}"
               x2="${jx2.toFixed(2)}" y2="${jy2.toFixed(2)}"
               stroke="${palette[colorIdx]}" stroke-width="${strokeW.toFixed(1)}"
               stroke-linecap="round" opacity="${opacity}" />`
      )

      const spreadAngle = jitter(Math.PI / 5, coherence, rng, 0.2)
      const scale = jitter(0.68, coherence, rng, 0.08)

      drawBranch(jx2, jy2, length * scale, angle - spreadAngle, depth - 1, strokeW * 0.65)
      drawBranch(jx2, jy2, length * scale, angle + spreadAngle, depth - 1, strokeW * 0.65)
    }

    const rootX = jitter(W * 0.5, coherence, rng, W * 0.1)
    const rootY = H * 0.88
    const trunkLen = Math.min(W, H) * 0.32
    const levels = 3

    drawBranch(rootX, rootY, trunkLen, -Math.PI / 2, levels, 6)

    const texOpacity = ((1.0 - coherence) * 0.2).toFixed(2)
    const glowR = jitter(trunkLen * 0.15, coherence, rng, 10)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <radialGradient id="bg-${seed}" cx="50%" cy="80%" r="70%">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[3]}" stop-opacity="0.5" />
          <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Fractal branches -->
      <g filter="url(#${filterId})">
        ${branches.join('\n        ')}
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[0]}" opacity="${texOpacity}" />

      <!-- Layer 4: Root glow accent -->
      <circle cx="${rootX.toFixed(1)}" cy="${rootY.toFixed(1)}" r="${(glowR * 3).toFixed(1)}"
              fill="url(#glow-${seed})" />
      <circle cx="${rootX.toFixed(1)}" cy="${rootY.toFixed(1)}" r="${glowR.toFixed(1)}"
              fill="${palette[2]}" opacity="0.8" />
    </svg>`
  },
}
