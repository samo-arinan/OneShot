import type { Scene, SceneRenderParams } from '../../types'

export const singleTree: Scene = {
  id: 'single-tree',
  name: '一本の木',
  category: 'organic',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#0D1B2A', '#1B3A5C', '#1A2E1A', '#2D4A2D', '#8B7355']

    // Layer 1: Sky
    const horizonY = H * 0.75

    // Layer 2: Central tree with Y-shape branching
    const trunkX = W * 0.5
    const trunkBaseY = H * 0.95
    const trunkTopY = H * 0.55
    const trunkW = W * 0.04

    // Left branch
    const lBranchEndX = trunkX - W * 0.2
    const lBranchEndY = trunkTopY - H * 0.15
    // Right branch
    const rBranchEndX = trunkX + W * 0.2
    const rBranchEndY = trunkTopY - H * 0.12

    const trunkPath = `M ${(trunkX - trunkW / 2).toFixed(1)} ${trunkBaseY.toFixed(1)} L ${(trunkX - trunkW / 2).toFixed(1)} ${trunkTopY.toFixed(1)} Q ${trunkX.toFixed(1)} ${(trunkTopY - H * 0.02).toFixed(1)} ${(trunkX + trunkW / 2).toFixed(1)} ${trunkTopY.toFixed(1)} L ${(trunkX + trunkW / 2).toFixed(1)} ${trunkBaseY.toFixed(1)} Z`
    const lBranch = `M ${trunkX.toFixed(1)} ${trunkTopY.toFixed(1)} Q ${(trunkX - W * 0.1).toFixed(1)} ${(trunkTopY - H * 0.05).toFixed(1)} ${lBranchEndX.toFixed(1)} ${lBranchEndY.toFixed(1)}`
    const rBranch = `M ${trunkX.toFixed(1)} ${trunkTopY.toFixed(1)} Q ${(trunkX + W * 0.1).toFixed(1)} ${(trunkTopY - H * 0.03).toFixed(1)} ${rBranchEndX.toFixed(1)} ${rBranchEndY.toFixed(1)}`

    // Layer 4: Distant horizon glow
    const glowX = W * 0.5

    const horizonPct = (horizonY / H * 100).toFixed(1)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="${horizonPct}%" stop-color="${palette[1]}" />
        </linearGradient>
        <linearGradient id="ground-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[3]}" />
          <stop offset="100%" stop-color="${palette[2]}" />
        </linearGradient>
        <radialGradient id="horizon-${seed}" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.35" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Sky and ground -->
      <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
      <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#ground-${seed})" />

      <!-- Layer 2: Tree silhouette -->
      <path d="${trunkPath}" fill="${palette[2]}" opacity="0.95" />
      <path d="${lBranch}" stroke="${palette[2]}" stroke-width="${(trunkW * 0.5).toFixed(1)}" fill="none" opacity="0.9" />
      <path d="${rBranch}" stroke="${palette[2]}" stroke-width="${(trunkW * 0.45).toFixed(1)}" fill="none" opacity="0.9" />

      <!-- Layer 4: Horizon accent -->
      <ellipse cx="${glowX.toFixed(1)}" cy="${horizonY.toFixed(1)}"
               rx="${(W * 0.35).toFixed(1)}" ry="${(H * 0.08).toFixed(1)}"
               fill="url(#horizon-${seed})" />
    </svg>`
  },
}
