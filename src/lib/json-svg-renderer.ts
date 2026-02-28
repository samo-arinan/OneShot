export interface JsonSvgGradient {
  id: string
  type: 'linear' | 'radial'
  stops: Array<{ offset: string; color: string }>
  attrs?: Record<string, string>
}

export interface JsonSvgElement {
  tag: 'circle' | 'rect' | 'ellipse' | 'path' | 'polygon' | 'polyline' | 'line' | 'g'
  attrs: Record<string, string | number>
}

export interface JsonSvgScene {
  width?: number
  height?: number
  background: string
  gradients?: JsonSvgGradient[]
  elements: JsonSvgElement[]
}

const ALLOWED_TAGS = new Set(['circle', 'rect', 'ellipse', 'path', 'polygon', 'polyline', 'line', 'g'])

function escapeAttr(value: string | number): string {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function isEventHandler(name: string): boolean {
  return /^on/i.test(name)
}

function renderAttrs(attrs: Record<string, string | number>): string {
  return Object.entries(attrs)
    .filter(([key]) => !isEventHandler(key))
    .map(([key, value]) => `${escapeAttr(key)}="${escapeAttr(value)}"`)
    .join(' ')
}

function renderGradients(gradients: JsonSvgGradient[]): string {
  const items = gradients.map((g) => {
    const tag = g.type === 'radial' ? 'radialGradient' : 'linearGradient'
    const extraAttrs = g.attrs ? ' ' + renderAttrs(g.attrs) : ''
    const stops = g.stops
      .map((s) => `<stop offset="${escapeAttr(s.offset)}" stop-color="${escapeAttr(s.color)}"/>`)
      .join('')
    return `<${tag} id="${escapeAttr(g.id)}"${extraAttrs}>${stops}</${tag}>`
  })
  return `<defs>${items.join('')}</defs>`
}

export function renderJsonToSvg(scene: JsonSvgScene): string {
  const w = scene.width ?? 360
  const h = scene.height ?? 360

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`)

  if (scene.gradients && scene.gradients.length > 0) {
    parts.push(renderGradients(scene.gradients))
  }

  parts.push(`<rect x="0" y="0" width="${w}" height="${h}" fill="${escapeAttr(scene.background)}"/>`)

  for (const el of scene.elements) {
    if (!ALLOWED_TAGS.has(el.tag)) continue
    const attrs = renderAttrs(el.attrs)
    parts.push(`<${el.tag} ${attrs}/>`)
  }

  parts.push('</svg>')
  return parts.join('')
}
