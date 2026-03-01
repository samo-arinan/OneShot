import type { Scene, SceneRenderParams } from '../../types'

export const towerSpire: Scene = {
  id: 'tower-spire',
  name: '塔',
  category: 'structure',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#1A1A2E', '#16213E', '#0F3460', '#E2E2E2', '#F0C27F']

    // Layer 1: Background gradient
    const skyMidPct = (55).toFixed(1)

    // Layer 2: Tower spire - central thin tall triangle
    const spireBaseW = W * 0.06
    const spireTopX = W * 0.5
    const spireTopY = H * 0.05
    const spireBaseY = H * 0.85
    const spireBaseX = W * 0.5

    // Tower body below spire tip
    const towerW = W * 0.12
    const towerTopY = H * 0.35

    // Layer 4: Light source above spire
    const lightX = spireTopX
    const lightY = spireTopY - H * 0.05
    const lightR = 20

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="${skyMidPct}%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[2]}" />
          </linearGradient>
          <linearGradient id="tower-${seed}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="50%" stop-color="${palette[3]}" stop-opacity="0.9" />
            <stop offset="100%" stop-color="${palette[2]}" />
          </linearGradient>
          <radialGradient id="light-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.95" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${H}" fill="url(#sky-${seed})" />

        <!-- Layer 2: Tower structure -->
          <!-- Tower body -->
          <rect x="${(spireBaseX - towerW / 2).toFixed(1)}" y="${towerTopY.toFixed(1)}"
                width="${towerW.toFixed(1)}" height="${(spireBaseY - towerTopY).toFixed(1)}"
                fill="url(#tower-${seed})" opacity="0.92" />
          <!-- Spire triangle -->
          <polygon points="${spireTopX.toFixed(1)},${spireTopY.toFixed(1)} ${(spireBaseX - spireBaseW / 2).toFixed(1)},${towerTopY.toFixed(1)} ${(spireBaseX + spireBaseW / 2).toFixed(1)},${towerTopY.toFixed(1)}"
                   fill="${palette[3]}" opacity="0.95" />

        <!-- Layer 4: Light source above spire -->
        <circle cx="${lightX.toFixed(1)}" cy="${lightY.toFixed(1)}" r="${(lightR * 3).toFixed(1)}"
                fill="url(#light-${seed})" />
        <circle cx="${lightX.toFixed(1)}" cy="${lightY.toFixed(1)}" r="${lightR.toFixed(1)}"
                fill="${palette[4]}" opacity="0.9" />
      </svg>`
  },
}
