import type { Scene, SceneRenderParams } from '../../types'

export const prismLight: Scene = {
  id: 'prism-light',
  name: 'プリズム',
  category: 'abstract',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#050510', '#0A0A20', '#1A1A3A', '#FFFFFF', '#F0F0FF']

    // Prism triangle position
    const triCx = W * 0.5
    const triCy = H * 0.38
    const triSize = Math.min(W, H) * 0.18

    // Triangle vertices
    const tx1 = triCx
    const ty1 = triCy - triSize
    const tx2 = triCx - triSize * 0.866
    const ty2 = triCy + triSize * 0.5
    const tx3 = triCx + triSize * 0.866
    const ty3 = triCy + triSize * 0.5

    // Light enters from top, exits bottom as rainbow bands
    // Bands spread from bottom edge of prism
    const bandColors = [
      '#FF0000', '#FF7700', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF',
    ]
    const bandCount = bandColors.length
    const spreadW = W * 0.7
    const startY = ty3
    const endY = H + 20

    const bands: string[] = []
    for (let i = 0; i < bandCount; i++) {
      const t1 = i / bandCount
      const t2 = (i + 1) / bandCount
      const leftBase = triCx - triSize * 0.3
      const rightBase = triCx + triSize * 0.3

      const x1 = leftBase + (t1 - 0.5) * spreadW * 0.1
      const x2 = rightBase + (t2 - 0.5) * spreadW * 0.1
      const ex1 = triCx - spreadW * 0.5 + t1 * spreadW
      const ex2 = triCx - spreadW * 0.5 + t2 * spreadW

      const opacity = (0.35 + 0.25).toFixed(2)
      bands.push(
        `<polygon points="${x1.toFixed(2)},${startY.toFixed(2)} ${x2.toFixed(2)},${startY.toFixed(2)} ${ex2.toFixed(2)},${endY.toFixed(2)} ${ex1.toFixed(2)},${endY.toFixed(2)}"
                  fill="${bandColors[i]}" opacity="${opacity}" />`
      )
    }

    // Incident light beam (from above)
    const beamX = triCx + triSize * 0.2
    const beamOpacity = (0.4 + 0.2).toFixed(2)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <radialGradient id="bg-${seed}" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="${palette[2]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.4" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Dark background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Color bands + prism triangle -->
        <!-- Incident beam -->
        <line x1="${beamX.toFixed(2)}" y1="0"
              x2="${tx1.toFixed(2)}" y2="${ty1.toFixed(2)}"
              stroke="${palette[4]}" stroke-width="3" opacity="${beamOpacity}" />

        <!-- Color bands spreading out -->
        ${bands.join('\n        ')}

        <!-- Prism triangle (on top) -->
        <polygon points="${tx1.toFixed(2)},${ty1.toFixed(2)} ${tx2.toFixed(2)},${ty2.toFixed(2)} ${tx3.toFixed(2)},${ty3.toFixed(2)}"
                 fill="${palette[2]}" stroke="${palette[4]}" stroke-width="1.5" opacity="0.88" />

      <!-- Layer 4: Prism glow accent -->
      <circle cx="${triCx.toFixed(1)}" cy="${triCy.toFixed(1)}" r="${(triSize * 0.9).toFixed(1)}"
              fill="url(#glow-${seed})" />
    </svg>`
  },
}
