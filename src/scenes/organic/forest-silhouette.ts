import type { Scene, SceneRenderParams } from '../../types'

export const forestSilhouette: Scene = {
  id: 'forest-silhouette',
  name: '森のシルエット',
  category: 'organic',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#1A2E1A', '#2D4A2D', '#0A1A2E', '#1B3A5C', '#C9A959']

    // Layer 1: Sky background
    const horizonY = H * 0.65

    // Layer 2: Tree silhouettes
    const treeCount = Math.floor(8) + 5
    const trees: string[] = []
    for (let i = 0; i < treeCount; i++) {
      const tx = (W / treeCount) * i + W / treeCount / 2
      const treeH = H * 0.35
      const treeW = W * 0.06
      const baseY = H * 0.98
      const tipY = baseY - treeH
      const d = `M ${(tx - treeW / 2).toFixed(1)} ${baseY.toFixed(1)} Q ${tx.toFixed(1)} ${(tipY + treeH * 0.1).toFixed(1)} ${(tx + treeW * 0.15).toFixed(1)} ${tipY.toFixed(1)} Q ${(tx + treeW / 2).toFixed(1)} ${(tipY + treeH * 0.15).toFixed(1)} ${(tx + treeW / 2).toFixed(1)} ${baseY.toFixed(1)} Z`
      trees.push(`<path d="${d}" fill="${palette[0]}" opacity="0.95" />`)
    }

    // Layer 4: Accent - a distant glowing light behind trees
    const glowX = W * 0.5
    const glowY = horizonY * 0.8

    const horizonPct = (horizonY / H * 100).toFixed(1)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[2]}" />
          <stop offset="${horizonPct}%" stop-color="${palette[3]}" />
        </linearGradient>
        <linearGradient id="ground-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </linearGradient>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.4" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background sky and ground -->
      <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
      <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#ground-${seed})" />

      <!-- Layer 2: Tree silhouettes -->
      ${trees.join('\n        ')}

      <!-- Layer 4: Accent glow -->
      <ellipse cx="${glowX.toFixed(1)}" cy="${glowY.toFixed(1)}"
               rx="${(W * 0.2).toFixed(1)}" ry="${(H * 0.12).toFixed(1)}"
               fill="url(#glow-${seed})" />
    </svg>`
  },
}
