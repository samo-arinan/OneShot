import type { Scene, SceneRenderParams } from '../../types'

export const flowerBloom: Scene = {
  id: 'flower-bloom',
  name: '花',
  category: 'organic',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#1A0A1E', '#3D1A3D', '#CC3366', '#FF6699', '#FFD700']

    // Layer 1: Background
    const cx = W * 0.5
    const cy = H * 0.5

    // Layer 2: Radial petals - ellipses rotated from center
    const petalCount = Math.floor(7) + 5
    const petalLen = Math.min(W, H) * 0.32
    const petalW = Math.min(W, H) * 0.09
    const petals: string[] = []
    for (let i = 0; i < petalCount; i++) {
      const baseAngle = (i / petalCount) * 360
      const angle = baseAngle
      const len = petalLen
      const w = petalW
      const petalCX = cx + (len / 2) * Math.cos(angle * Math.PI / 180)
      const petalCY = cy + (len / 2) * Math.sin(angle * Math.PI / 180)
      const colorIdx = i % (palette.length - 1) + 1
      const opacity = (0.65 + (i % 3) * 0.1).toFixed(2)
      petals.push(`<ellipse cx="${petalCX.toFixed(1)}" cy="${petalCY.toFixed(1)}"
                   rx="${(len / 2).toFixed(1)}" ry="${w.toFixed(1)}"
                   transform="rotate(${angle.toFixed(1)}, ${petalCX.toFixed(1)}, ${petalCY.toFixed(1)})"
                   fill="${palette[colorIdx]}" opacity="${opacity}" />`)
    }

    // Layer 4: Center stamen
    const stamR = Math.min(W, H) * 0.07

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="center-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="1" />
          <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0.5" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Petals -->
      ${petals.join('\n        ')}

      <!-- Layer 4: Center stamen -->
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${stamR.toFixed(1)}"
              fill="url(#center-${seed})" />
    </svg>`
  },
}
