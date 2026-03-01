import type { Scene, SceneRenderParams } from '../../types'
import { jitter, distortPath, buildDistortionFilter, distortPalette, ridgePointsToPath } from '../../lib/coherence-utils'

export const volcanicIsland: Scene = {
  id: 'volcanic-island',
  name: '火山島',
  category: 'landscape',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#6B1A1A', '#3D3D3D', '#8B4A1A', '#A0A0A0', '#1A2A4A'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background sky and sea
    const waterlineY = jitter(H * 0.62, coherence, rng, H * 0.08)
    const waterlinePct = (waterlineY / H * 100).toFixed(1)

    // Layer 2: Volcanic peak silhouette
    const peakX = jitter(W * 0.5, coherence, rng, W * 0.08)
    const peakY = jitter(H * 0.1, coherence, rng, H * 0.08)
    const islandLeftX = jitter(W * 0.15, coherence, rng, W * 0.08)
    const islandRightX = jitter(W * 0.85, coherence, rng, W * 0.08)

    const islandPoints = distortPath([
      { x: islandLeftX, y: waterlineY },
      { x: W * 0.25, y: waterlineY - H * 0.12 },
      { x: W * 0.35, y: peakY + H * 0.2 },
      { x: peakX, y: peakY },
      { x: W * 0.62, y: peakY + H * 0.18 },
      { x: W * 0.75, y: waterlineY - H * 0.1 },
      { x: islandRightX, y: waterlineY },
    ], coherence, rng)

    // Layer 2: Waterline/sea strip
    const wavePoints = distortPath([
      { x: 0, y: waterlineY },
      { x: W * 0.2, y: waterlineY + H * 0.02 },
      { x: W * 0.4, y: waterlineY - H * 0.01 },
      { x: W * 0.6, y: waterlineY + H * 0.015 },
      { x: W * 0.8, y: waterlineY - H * 0.01 },
      { x: W, y: waterlineY },
    ], coherence, rng)

    // Layer 3: Texture overlay
    const texOpacity = ((1.0 - coherence) * 0.3).toFixed(2)

    // Layer 4: Smoke/eruption accent
    const smokeX = jitter(peakX, coherence, rng, W * 0.05)
    const smokeY = jitter(peakY - H * 0.06, coherence, rng, H * 0.04)
    const smokeR = jitter(15, coherence, rng, 8)
    const showSmoke = coherence < 0.7 || rng() > 0.4

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[4]}" />
            <stop offset="${waterlinePct}%" stop-color="#2A3A5A" />
          </linearGradient>
          <linearGradient id="sea-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1A2A4A" />
            <stop offset="100%" stop-color="#0A1020" />
          </linearGradient>
          <linearGradient id="island-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="60%" stop-color="${palette[1]}" />
            <stop offset="100%" stop-color="${palette[2]}" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Background sky -->
        <rect width="${W}" height="${waterlineY.toFixed(1)}" fill="url(#sky-${seed})" />

        <!-- Layer 1: Sea -->
        <rect y="${waterlineY.toFixed(1)}" width="${W}" height="${(H - waterlineY).toFixed(1)}" fill="url(#sea-${seed})" />

        <!-- Layer 2: Volcanic island silhouette -->
        <g filter="url(#${filterId})">
          <path d="${ridgePointsToPath(islandPoints, W, H)}"
                fill="url(#island-${seed})" opacity="0.95" />
        </g>

        <!-- Layer 2: Waterline waves -->
        <g filter="url(#${filterId})">
          <path d="M ${wavePoints[0].x.toFixed(1)} ${wavePoints[0].y.toFixed(1)} ${wavePoints.slice(1).map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')} L ${W} ${(waterlineY + H * 0.04).toFixed(1)} L 0 ${(waterlineY + H * 0.04).toFixed(1)} Z"
                fill="#1E3A5A" opacity="0.6" />
        </g>

        <!-- Layer 3: Texture overlay -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${texOpacity}" />

        <!-- Layer 4: Smoke accent -->
        ${showSmoke ? `
          <ellipse cx="${smokeX.toFixed(1)}" cy="${smokeY.toFixed(1)}" rx="${(smokeR * 2).toFixed(1)}" ry="${(smokeR * 1.2).toFixed(1)}"
                   fill="${palette[3]}" opacity="0.35" />
          <ellipse cx="${(smokeX + smokeR * 0.5).toFixed(1)}" cy="${(smokeY - smokeR * 1.5).toFixed(1)}" rx="${(smokeR * 1.5).toFixed(1)}" ry="${(smokeR * 0.9).toFixed(1)}"
                   fill="${palette[3]}" opacity="0.25" />
        ` : ''}
      </svg>`
  },
}
