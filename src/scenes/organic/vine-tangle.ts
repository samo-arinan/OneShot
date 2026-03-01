import type { Scene, SceneRenderParams } from '../../types'

export const vineTangle: Scene = {
  id: 'vine-tangle',
  name: '蔓の絡まり',
  category: 'organic',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#0A1A0A', '#1A2E10', '#2E5A1A', '#4A7A2A', '#8B6914']

    // Layer 1: Dark background
    // Layer 2: Intertwining vine curves
    const vineCount = Math.floor(7) + 4
    const vines: string[] = []
    for (let i = 0; i < vineCount; i++) {
      const startX = rng() * W
      const startY = rng() * H

      // Generate a winding path with multiple control points
      let d = `M ${startX.toFixed(1)} ${startY.toFixed(1)}`
      let px = startX
      let py = startY
      const segments = Math.floor(5) + 3
      for (let s = 0; s < segments; s++) {
        const cp1x = px + (rng() - 0.5) * W * 0.5
        const cp1y = py + (rng() - 0.5) * H * 0.4
        const cp2x = cp1x + (rng() - 0.5) * W * 0.3
        const cp2y = cp1y + (rng() - 0.5) * H * 0.3
        const nextX = rng() * W
        const nextY = rng() * H
        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${nextX.toFixed(1)} ${nextY.toFixed(1)}`
        px = nextX
        py = nextY
      }

      const strokeW = 2.5
      const colorIdx = i % (palette.length - 1) + 1
      const opacity = (0.55 + (i % 3) * 0.12).toFixed(2)
      vines.push(`<path d="${d}" stroke="${palette[colorIdx]}" stroke-width="${strokeW.toFixed(1)}" fill="none" stroke-linecap="round" opacity="${opacity}" />`)
    }

    // Small leaf nodes along vines
    const leafCount = Math.floor(8) + 4
    const leaves: string[] = []
    for (let i = 0; i < leafCount; i++) {
      const lx = rng() * W
      const ly = rng() * H
      const lr = 5
      leaves.push(`<ellipse cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="${(lr * 2).toFixed(1)}" ry="${lr.toFixed(1)}" fill="${palette[2]}" opacity="0.6" />`)
    }

    // Layer 4: Warm highlight accent
    const accentX = W * 0.6
    const accentY = H * 0.4

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="accent-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.35" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Vine curves and leaves -->
      ${vines.join('\n        ')}
      ${leaves.join('\n        ')}

      <!-- Layer 4: Warm light accent -->
      <ellipse cx="${accentX.toFixed(1)}" cy="${accentY.toFixed(1)}"
               rx="${(W * 0.22).toFixed(1)}" ry="${(H * 0.18).toFixed(1)}"
               fill="url(#accent-${seed})" />
    </svg>`
  },
}
