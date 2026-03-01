import type { Scene, SceneRenderParams } from '../../types'

export const bonfire: Scene = {
  id: 'bonfire',
  name: '焚火',
  category: 'organic',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#0A0A0A', '#1A0A00', '#CC4400', '#FF6B00', '#FFD700']

    // Layer 1: Dark ground background
    const groundY = H * 0.78

    // Layer 2: Flame shape - upward irregular tapering
    const flameBaseX = W * 0.5
    const flameBaseY = H * 0.9
    const flameBaseW = W * 0.18
    const flameTipY = H * 0.3

    // Multiple flame tongues
    const tongueCount = 3
    const tongues: string[] = []
    for (let i = 0; i < tongueCount; i++) {
      const offsetX = flameBaseX + (i - 1) * W * 0.04
      const tipY = flameTipY + i * H * 0.05
      const w = flameBaseW * (0.6 - i * 0.1)
      const cp1x = offsetX - w * 0.5
      const cp2x = offsetX + w * 0.6
      const midY = (flameBaseY + tipY) * 0.5
      const d = `M ${(flameBaseX - flameBaseW / 2).toFixed(1)} ${flameBaseY.toFixed(1)} C ${cp1x.toFixed(1)} ${midY.toFixed(1)} ${offsetX.toFixed(1)} ${(tipY + H * 0.06).toFixed(1)} ${offsetX.toFixed(1)} ${tipY.toFixed(1)} C ${offsetX.toFixed(1)} ${(tipY + H * 0.06).toFixed(1)} ${cp2x.toFixed(1)} ${midY.toFixed(1)} ${(flameBaseX + flameBaseW / 2).toFixed(1)} ${flameBaseY.toFixed(1)} Z`
      const opacity = (0.7 + i * 0.1).toFixed(2)
      tongues.push(`<path d="${d}" fill="${palette[2 + (tongueCount - 1 - i)]}" opacity="${opacity}" />`)
    }

    // Layer 4: Glow accent around flame base
    const glowR = W * 0.15

    const groundPct = (groundY / H * 100).toFixed(1)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="${groundPct}%" stop-color="${palette[1]}" />
        </linearGradient>
        <linearGradient id="ground-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </linearGradient>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[3]}" stop-opacity="0.6" />
          <stop offset="100%" stop-color="${palette[2]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Dark background -->
      <rect width="${W}" height="${groundY.toFixed(1)}" fill="url(#sky-${seed})" />
      <rect y="${groundY.toFixed(1)}" width="${W}" height="${(H - groundY).toFixed(1)}" fill="url(#ground-${seed})" />

      <!-- Layer 2: Flame shapes -->
      ${tongues.join('\n        ')}

      <!-- Layer 4: Glow at base -->
      <ellipse cx="${flameBaseX.toFixed(1)}" cy="${flameBaseY.toFixed(1)}"
               rx="${glowR.toFixed(1)}" ry="${(glowR * 0.4).toFixed(1)}"
               fill="url(#glow-${seed})" />
    </svg>`
  },
}
