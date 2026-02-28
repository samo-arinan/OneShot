import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const lotusPond: Scene = {
  id: 'lotus-pond',
  name: '蓮池',
  category: 'water',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#0a1a0a', '#1a3020', '#2a4a30', '#e87090', '#f0a0b0'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Dark water surface
    // Subtle ripple rings
    const ripples: string[] = []
    const rippleCount = Math.floor(jitter(4, coherence, rng, 3))
    for (let i = 0; i < rippleCount; i++) {
      const rx = rng() * W
      const ry = rng() * H
      const rr = jitter(30, coherence, rng, 20)
      const opacity = ((1.0 - coherence) * 0.2 + 0.05).toFixed(2)
      for (let ring = 1; ring <= 3; ring++) {
        ripples.push(`<ellipse cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" rx="${(rr * ring).toFixed(1)}" ry="${(rr * ring * 0.35).toFixed(1)}" fill="none" stroke="${palette[2]}" stroke-width="0.8" opacity="${opacity}" />`)
      }
    }

    // Layer 2: Lotus leaves (round shapes) scattered on water
    const leafCount = Math.floor(jitter(8, coherence, rng, 5))
    const leaves: string[] = []
    for (let i = 0; i < leafCount; i++) {
      const lx = rng() * W
      const ly = rng() * H
      const lr = jitter(25, coherence, rng, 15)
      const lrY = lr * jitter(0.5, coherence, rng, 0.15)
      const rotation = rng() * 360
      // Leaf notch: a circle with a small wedge cut
      const notchAngle = rng() * Math.PI * 2
      const nx1 = lx + Math.cos(notchAngle) * lr * 0.9
      const ny1 = ly + Math.sin(notchAngle) * lrY * 0.9
      const nx2 = lx + Math.cos(notchAngle + 0.3) * lr * 0.9
      const ny2 = ly + Math.sin(notchAngle + 0.3) * lrY * 0.9
      const leafPath = `M ${lx.toFixed(1)} ${ly.toFixed(1)} L ${nx1.toFixed(1)} ${ny1.toFixed(1)} A ${lr.toFixed(1)} ${lrY.toFixed(1)} ${rotation.toFixed(0)} 1 1 ${nx2.toFixed(1)} ${ny2.toFixed(1)} Z`
      const leafOpacity = (0.5 + coherence * 0.3).toFixed(2)
      leaves.push(`<path d="${leafPath}" fill="${palette[2]}" opacity="${leafOpacity}" />`)
    }

    // Layer 3: Texture
    const texOpacity = ((1.0 - coherence) * 0.18).toFixed(2)

    // Layer 4: Lotus flower accents (pink circles)
    const flowers: string[] = []
    const flowerCount = Math.floor(jitter(4, coherence, rng, 3))
    for (let i = 0; i < flowerCount; i++) {
      const fx = rng() * W
      const fy = rng() * H
      const fr = jitter(8, coherence, rng, 5)
      const petalCount = 5
      // Petals
      for (let p = 0; p < petalCount; p++) {
        const angle = (p / petalCount) * Math.PI * 2
        const px = fx + Math.cos(angle) * fr * 1.8
        const py = fy + Math.sin(angle) * fr * 1.8
        flowers.push(`<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${fr.toFixed(1)}" ry="${(fr * 1.4).toFixed(1)}" fill="${palette[3]}" opacity="0.7" transform="rotate(${((angle * 180 / Math.PI) + 90).toFixed(0)},${px.toFixed(1)},${py.toFixed(1)})" />`)
      }
      // Center
      flowers.push(`<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${(fr * 0.6).toFixed(1)}" fill="${palette[4]}" opacity="0.9" />`)
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="water-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Dark water background -->
        <rect width="${W}" height="${H}" fill="url(#water-${seed})" />
        ${ripples.join('\n        ')}

        <!-- Layer 2: Lotus leaves -->
        <g filter="url(#${filterId})">
          ${leaves.join('\n          ')}
        </g>

        <!-- Layer 3: Texture -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[1]}" opacity="${texOpacity}" />

        <!-- Layer 4: Lotus flowers (pink) -->
        ${flowers.join('\n        ')}
      </svg>`
  },
}
