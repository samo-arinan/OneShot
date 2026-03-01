import type { Scene, SceneRenderParams } from '../../types'

export const deepSea: Scene = {
  id: 'deep-sea',
  name: '深海',
  category: 'water',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#000008', '#000820', '#001030', '#002050', '#40a0c0']

    // Layer 1: Dark blue to black gradient (abyss)
    // Layer 2: Scattered bioluminescent light points
    const glowPoints: string[] = []
    const pointCount = Math.floor(40)
    for (let i = 0; i < pointCount; i++) {
      const px = rng() * W
      const py = rng() * H
      const pr = 2.5
      const brightness = 0.3 + rng() * 0.7
      // Outer glow
      const outerR = pr * 4
      const glowColor = rng() > 0.6 ? palette[4] : `hsl(${180 + Math.floor(rng() * 60)}, 80%, 70%)`
      glowPoints.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${outerR.toFixed(1)}" fill="${glowColor}" opacity="${(brightness * 0.15).toFixed(2)}" />`)
      glowPoints.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${pr.toFixed(1)}" fill="${glowColor}" opacity="${brightness.toFixed(2)}" />`)
    }

    // Layer 3: Subtle current textures (faint horizontal bands)
    const currentLines: string[] = []
    const currentCount = Math.floor(6)
    for (let i = 0; i < currentCount; i++) {
      const cy = rng() * H
      const cAmp = 10
      const cFreq = 0.008
      const cPhase = rng() * Math.PI * 2
      let d = `M 0 ${cy.toFixed(1)}`
      for (let x = 0; x <= W; x += 12) {
        const y = cy + Math.sin(x * cFreq + cPhase) * cAmp
        d += ` L ${x} ${y.toFixed(1)}`
      }
      const opacity = (0.12 + 0.03).toFixed(2)
      currentLines.push(`<path d="${d}" stroke="${palette[3]}" stroke-width="1.5" fill="none" opacity="${opacity}" />`)
    }

    // Layer 4: Large dim creature silhouette
    const showCreature = true
    const creatureX = W * 0.5
    const creatureY = H * 0.6
    const creatureOpacity = (0.08 + 0.02).toFixed(2)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="abyss-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="60%" stop-color="${palette[1]}" />
            <stop offset="100%" stop-color="${palette[0]}" />
          </linearGradient>
          <radialGradient id="glow-bg-${seed}" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stop-color="${palette[3]}" stop-opacity="0.15" />
            <stop offset="100%" stop-color="${palette[0]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Abyss gradient -->
        <rect width="${W}" height="${H}" fill="url(#abyss-${seed})" />
        <rect width="${W}" height="${H}" fill="url(#glow-bg-${seed})" />

        <!-- Layer 2: Bioluminescent points -->
        ${glowPoints.join('\n        ')}

        <!-- Layer 3: Current textures -->
        ${currentLines.join('\n          ')}

        <!-- Layer 4: Deep creature silhouette -->
        ${showCreature ? `
          <ellipse cx="${creatureX.toFixed(1)}" cy="${creatureY.toFixed(1)}"
                   rx="${(W * 0.25).toFixed(1)}" ry="${(H * 0.08).toFixed(1)}"
                   fill="${palette[3]}" opacity="${creatureOpacity}" />
        ` : ''}
      </svg>`
  },
}
