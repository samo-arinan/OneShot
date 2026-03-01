import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const toriiGate: Scene = {
  id: 'torii-gate',
  name: '鳥居',
  category: 'structure',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#8B1A1A', '#1A0A00', '#C0392B', '#F5CBA7', '#FF6B35'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background
    const bgMidPct = jitter(50, coherence, rng, 10).toFixed(1)

    // Layer 2: Torii gate geometry
    const gateW = jitter(W * 0.45, coherence, rng, W * 0.06)
    const gateCx = jitter(W * 0.5, coherence, rng, W * 0.04)
    const pillarH = jitter(H * 0.55, coherence, rng, H * 0.05)
    const pillarW = jitter(W * 0.045, coherence, rng, W * 0.01)
    const pillarTop = jitter(H * 0.25, coherence, rng, H * 0.04)

    // Crossbar (kasagi - top bar)
    const kasagiH = jitter(H * 0.045, coherence, rng, H * 0.01)
    const kasagiY = jitter(pillarTop - kasagiH * 0.5, coherence, rng, H * 0.02)
    const kasagiOverhang = jitter(W * 0.06, coherence, rng, W * 0.02)

    // Second crossbar (nuki - lower bar)
    const nukiY = jitter(pillarTop + H * 0.12, coherence, rng, H * 0.03)
    const nukiH = jitter(H * 0.025, coherence, rng, H * 0.008)

    const leftPillarX = gateCx - gateW / 2
    const rightPillarX = gateCx + gateW / 2 - pillarW

    // Layer 3: Texture
    const texOpacity = ((1.0 - coherence) * 0.22).toFixed(2)

    // Layer 4: Light behind gate
    const lightR = jitter(W * 0.25, coherence, rng, W * 0.06)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
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
        <g filter="url(#${filterId})">
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
        </g>

        <!-- Layer 3: Texture overlay -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[1]}" opacity="${texOpacity}" />
      </svg>`
  },
}
