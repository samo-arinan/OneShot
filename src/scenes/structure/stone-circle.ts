import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const stoneCircle: Scene = {
  id: 'stone-circle',
  name: 'ストーンサークル',
  category: 'structure',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#4A4035', '#2A2018', '#7A6E5A', '#C8BEA8', '#E8DFC0'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background
    const horizonY = jitter(H * 0.58, coherence, rng, H * 0.06)
    const horizonPct = (horizonY / H * 100).toFixed(1)

    // Layer 2: Stone pillars arranged in arc
    const cx = jitter(W * 0.5, coherence, rng, W * 0.04)
    const circleR = jitter(W * 0.36, coherence, rng, W * 0.05)
    const stoneCount = 9
    // Arc: stones arranged from about -140 degrees to -40 degrees (bottom half arc facing viewer)
    const arcStart = jitter(-2.4, coherence, rng, 0.2)  // radians
    const arcEnd = jitter(-0.7, coherence, rng, 0.2)

    const stones: string[] = []
    for (let i = 0; i < stoneCount; i++) {
      const t = i / (stoneCount - 1)
      const angle = arcStart + t * (arcEnd - arcStart)
      const stoneX = cx + Math.cos(angle) * circleR
      const stoneBaseY = horizonY + jitter(H * 0.02, coherence, rng, H * 0.015)
      const stoneH = jitter(H * 0.22, coherence, rng, H * 0.06)
      const stoneW = jitter(W * 0.045, coherence, rng, W * 0.01)
      // Perspective: stones nearer the edges appear slightly smaller
      const perspScale = 0.75 + 0.25 * (1 - Math.abs(t - 0.5) * 2)
      const scaledW = stoneW * perspScale
      const scaledH = stoneH * perspScale
      const scaledTopY = stoneBaseY - scaledH
      const opacity = (0.8 + perspScale * 0.15).toFixed(2)
      stones.push(`<rect x="${(stoneX - scaledW / 2).toFixed(1)}" y="${scaledTopY.toFixed(1)}"
                         width="${scaledW.toFixed(1)}" height="${scaledH.toFixed(1)}"
                         fill="${palette[2]}" opacity="${opacity}" rx="2" />`)
      // Subtle shadow
      stones.push(`<rect x="${(stoneX - scaledW / 2 + scaledW * 0.6).toFixed(1)}" y="${scaledTopY.toFixed(1)}"
                         width="${(scaledW * 0.4).toFixed(1)}" height="${scaledH.toFixed(1)}"
                         fill="${palette[1]}" opacity="0.4" rx="2" />`)
    }

    // Layer 3: Texture
    const texOpacity = ((1.0 - coherence) * 0.25).toFixed(2)

    // Layer 4: Central open sky glow
    const glowX = jitter(cx, coherence, rng, W * 0.04)
    const glowY = jitter(horizonY - H * 0.1, coherence, rng, H * 0.04)
    const glowR = jitter(W * 0.15, coherence, rng, W * 0.04)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="${horizonPct}%" stop-color="${palette[0]}" />
          </linearGradient>
          <linearGradient id="ground-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.5" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background sky and ground -->
        <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
        <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#ground-${seed})" />

        <!-- Layer 4 accent: Central space glow (behind stones) -->
        <ellipse cx="${glowX.toFixed(1)}" cy="${glowY.toFixed(1)}"
                 rx="${glowR.toFixed(1)}" ry="${(glowR * 0.6).toFixed(1)}"
                 fill="url(#glow-${seed})" />

        <!-- Layer 2: Stone pillars -->
        <g filter="url(#${filterId})">
          ${stones.join('\n          ')}
        </g>

        <!-- Layer 3: Texture overlay -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${texOpacity}" />
      </svg>`
  },
}
