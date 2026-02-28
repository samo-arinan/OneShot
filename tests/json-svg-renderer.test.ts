import { describe, it, expect } from 'vitest'
import { renderJsonToSvg } from '../src/lib/json-svg-renderer'
import type { JsonSvgScene } from '../src/lib/json-svg-renderer'

describe('renderJsonToSvg', () => {
  it('renders a basic scene with background and one shape', () => {
    const scene: JsonSvgScene = {
      background: '#001122',
      elements: [
        { tag: 'circle', attrs: { cx: 180, cy: 180, r: 80, fill: '#ff0000' } },
      ],
    }
    const svg = renderJsonToSvg(scene)
    expect(svg).toContain('<svg')
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('viewBox="0 0 360 360"')
    expect(svg).toContain('<rect')
    expect(svg).toContain('fill="#001122"')
    expect(svg).toContain('<circle')
    expect(svg).toContain('cx="180"')
    expect(svg).toContain('</svg>')
  })

  it('renders multiple elements', () => {
    const scene: JsonSvgScene = {
      background: '#000',
      elements: [
        { tag: 'rect', attrs: { x: 10, y: 10, width: 100, height: 100, fill: 'red' } },
        { tag: 'ellipse', attrs: { cx: 200, cy: 200, rx: 50, ry: 30, fill: 'blue' } },
        { tag: 'path', attrs: { d: 'M 0 0 L 100 100', stroke: 'white', fill: 'none' } },
      ],
    }
    const svg = renderJsonToSvg(scene)
    expect(svg).toContain('<rect')
    expect(svg).toContain('<ellipse')
    expect(svg).toContain('<path')
  })

  it('renders gradients in defs', () => {
    const scene: JsonSvgScene = {
      background: 'url(#g1)',
      gradients: [
        {
          id: 'g1',
          type: 'linear',
          stops: [
            { offset: '0%', color: '#000' },
            { offset: '100%', color: '#fff' },
          ],
        },
      ],
      elements: [],
    }
    const svg = renderJsonToSvg(scene)
    expect(svg).toContain('<defs>')
    expect(svg).toContain('<linearGradient')
    expect(svg).toContain('id="g1"')
    expect(svg).toContain('<stop')
    expect(svg).toContain('offset="0%"')
    expect(svg).toContain('</defs>')
  })

  it('renders radial gradients', () => {
    const scene: JsonSvgScene = {
      background: '#000',
      gradients: [
        {
          id: 'rg',
          type: 'radial',
          stops: [
            { offset: '0%', color: 'yellow' },
            { offset: '100%', color: 'transparent' },
          ],
        },
      ],
      elements: [
        { tag: 'circle', attrs: { cx: 180, cy: 180, r: 100, fill: 'url(#rg)' } },
      ],
    }
    const svg = renderJsonToSvg(scene)
    expect(svg).toContain('<radialGradient')
  })

  it('escapes attribute values to prevent injection', () => {
    const scene: JsonSvgScene = {
      background: '#000',
      elements: [
        { tag: 'rect', attrs: { width: 100, height: 100, fill: '"><script>alert(1)</script>' } },
      ],
    }
    const svg = renderJsonToSvg(scene)
    expect(svg).not.toContain('<script>')
    expect(svg).toContain('&quot;')
  })

  it('filters out dangerous tags', () => {
    const scene: JsonSvgScene = {
      background: '#000',
      elements: [
        { tag: 'script', attrs: {} } as any,
        { tag: 'circle', attrs: { cx: 180, cy: 180, r: 50, fill: 'red' } },
      ],
    }
    const svg = renderJsonToSvg(scene)
    expect(svg).not.toContain('<script')
    expect(svg).toContain('<circle')
  })

  it('filters out event handler attributes', () => {
    const scene: JsonSvgScene = {
      background: '#000',
      elements: [
        { tag: 'rect', attrs: { width: 100, height: 100, onclick: 'alert(1)', fill: 'red' } },
      ],
    }
    const svg = renderJsonToSvg(scene)
    expect(svg).not.toContain('onclick')
    expect(svg).toContain('fill="red"')
  })

  it('returns valid SVG for empty elements', () => {
    const scene: JsonSvgScene = {
      background: '#123',
      elements: [],
    }
    const svg = renderJsonToSvg(scene)
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('fill="#123"')
  })

  it('uses custom width/height', () => {
    const scene: JsonSvgScene = {
      background: '#000',
      elements: [],
      width: 500,
      height: 300,
    }
    const svg = renderJsonToSvg(scene)
    expect(svg).toContain('viewBox="0 0 500 300"')
    expect(svg).toContain('width="500"')
    expect(svg).toContain('height="300"')
  })
})
