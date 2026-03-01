import type { Scene, SceneRenderParams } from '../../types'

export const toriiGate: Scene = {
  id: 'torii-gate',
  name: '鳥居',
  category: 'structure',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#8B1A1A', '#1A0A00', '#C0392B', '#F5CBA7', '#FF6B35']

    // Layer 1: Background
    const bgMidPct = (50).toFixed(1)

    // Layer 2: Torii gate geometry
    const gateW = W * 0.45
    const gateCx = W * 0.5
    const pillarH = H * 0.55
    const pillarW = W * 0.045
    const pillarTop = H * 0.25

    // Crossbar (kasagi - top bar)
    const kasagiH = H * 0.045
    const kasagiY = pillarTop - kasagiH * 0.5
    const kasagiOverhang = W * 0.06

    // Second crossbar (nuki - lower bar)
    const nukiY = pillarTop + H * 0.12
    const nukiH = H * 0.025

    const leftPillarX = gateCx - gateW / 2
    const rightPillarX = gateCx + gateW / 2 - pillarW

    // Layer 4: Light behind gate
    const lightR = W * 0.25

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="bg-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="${bgMidPct}%" stop-color="#2A1500" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <radialGradient id="backlight-${seed}" cx="50%" cy="${bgMidPct}%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.8" />
            <stop offset="60%" stop-color="${palette[2]}" stop-opacity="0.3" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="pillar-${seed}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="40%" stop-color="${palette[2]}" />
            <stop offset="100%" stop-color="${palette[0]}" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

        <!-- Layer 4: Back light (rendered early so gate is in front) -->
        <ellipse cx="${gateCx.toFixed(1)}" cy="${(kasagiY + kasagiH / 2).toFixed(1)}"
                 rx="${lightR.toFixed(1)}" ry="${(lightR * 0.7).toFixed(1)}"
                 fill="url(#backlight-${seed})" />

        <!-- Layer 2: Torii gate -->
          <!-- Kasagi (top crossbar) -->
          <rect x="${(leftPillarX - kasagiOverhang).toFixed(1)}" y="${kasagiY.toFixed(1)}"
                width="${(gateW + kasagiOverhang * 2).toFixed(1)}" height="${kasagiH.toFixed(1)}"
                fill="url(#pillar-${seed})" opacity="0.95" />
          <!-- Nuki (second crossbar) -->
          <rect x="${leftPillarX.toFixed(1)}" y="${nukiY.toFixed(1)}"
                width="${gateW.toFixed(1)}" height="${nukiH.toFixed(1)}"
                fill="url(#pillar-${seed})" opacity="0.9" />
          <!-- Left pillar -->
          <rect x="${leftPillarX.toFixed(1)}" y="${pillarTop.toFixed(1)}"
                width="${pillarW.toFixed(1)}" height="${pillarH.toFixed(1)}"
                fill="url(#pillar-${seed})" opacity="0.95" />
          <!-- Right pillar -->
          <rect x="${rightPillarX.toFixed(1)}" y="${pillarTop.toFixed(1)}"
                width="${pillarW.toFixed(1)}" height="${pillarH.toFixed(1)}"
                fill="url(#pillar-${seed})" opacity="0.95" />
      </svg>`
  },
}
