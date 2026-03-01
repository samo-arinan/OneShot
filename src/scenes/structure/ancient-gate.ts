import type { Scene, SceneRenderParams } from '../../types'

export const ancientGate: Scene = {
  id: 'ancient-gate',
  name: '古代の門',
  category: 'structure',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#3D2B1F', '#1A0E08', '#7A5C3A', '#D4B896', '#F5E6C8']

    // Layer 1: Background - distant sky through the gate opening
    const bgMidPct = (50).toFixed(1)

    // Layer 2: Gate opening - central trapezoid space
    // The opening is trapezoidal: wider at bottom, narrower at top
    const openingTopW = W * 0.22
    const openingBotW = W * 0.3
    const openingTopY = H * 0.15
    const openingBotY = H * 0.82
    const cx = W * 0.5

    const openingTopLeft = cx - openingTopW / 2
    const openingTopRight = cx + openingTopW / 2
    const openingBotLeft = cx - openingBotW / 2
    const openingBotRight = cx + openingBotW / 2

    // Left wall covers left of scene to gate opening
    const wallTop = H * 0.05

    // Lintel (top horizontal slab)
    const lintelH = H * 0.07
    const lintelTop = openingTopY - lintelH
    const lintelOverhang = W * 0.05

    // Layer 4: Light through gate
    const lightR = W * 0.18

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="distant-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.9" />
            <stop offset="${bgMidPct}%" stop-color="${palette[3]}" stop-opacity="0.7" />
            <stop offset="100%" stop-color="${palette[2]}" stop-opacity="0.5" />
          </linearGradient>
          <linearGradient id="wall-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="100%" stop-color="${palette[0]}" />
          </linearGradient>
          <radialGradient id="gatelight-${seed}" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.85" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background (visible through gate) -->
        <rect width="${W}" height="${H}" fill="url(#distant-${seed})" />

        <!-- Gate light glow -->
        <ellipse cx="${cx.toFixed(1)}" cy="${((openingTopY + openingBotY) / 2).toFixed(1)}"
                 rx="${lightR.toFixed(1)}" ry="${(lightR * 1.4).toFixed(1)}"
                 fill="url(#gatelight-${seed})" />

        <!-- Layer 2: Dark walls blocking the sides -->
          <!-- Left wall -->
          <polygon points="0,${wallTop.toFixed(1)} ${openingTopLeft.toFixed(1)},${openingTopY.toFixed(1)} ${openingBotLeft.toFixed(1)},${openingBotY.toFixed(1)} 0,${H}"
                   fill="url(#wall-${seed})" opacity="0.97" />
          <!-- Right wall -->
          <polygon points="${W},${wallTop.toFixed(1)} ${openingTopRight.toFixed(1)},${openingTopY.toFixed(1)} ${openingBotRight.toFixed(1)},${openingBotY.toFixed(1)} ${W},${H}"
                   fill="url(#wall-${seed})" opacity="0.97" />
          <!-- Lintel slab at top -->
          <rect x="${(openingTopLeft - lintelOverhang).toFixed(1)}" y="${lintelTop.toFixed(1)}"
                width="${(openingTopW + lintelOverhang * 2).toFixed(1)}" height="${lintelH.toFixed(1)}"
                fill="${palette[0]}" opacity="0.95" />
          <!-- Top wall above lintel -->
          <rect x="0" y="0" width="${W}" height="${lintelTop.toFixed(1)}"
                fill="${palette[1]}" opacity="0.9" />
          <!-- Ground below gate -->
          <rect x="${openingBotLeft.toFixed(1)}" y="${openingBotY.toFixed(1)}"
                width="${openingBotW.toFixed(1)}" height="${(H - openingBotY).toFixed(1)}"
                fill="${palette[0]}" opacity="0.4" />
      </svg>`
  },
}
