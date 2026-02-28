import { describe, it, expect } from 'vitest'
import { executeSvgScript } from '../src/lib/script-svg-executor'

describe('executeSvgScript', () => {
  it('executes valid JS that returns SVG', () => {
    const code = `return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '"><circle cx="180" cy="180" r="80" fill="red"/></svg>'`
    const result = executeSvgScript(code, 360, 360)
    expect(result).toContain('<svg')
    expect(result).toContain('xmlns')
    expect(result).toContain('<circle')
    expect(result).toContain('</svg>')
  })

  it('passes width and height parameters', () => {
    const code = `return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '"><rect width="' + width + '" height="' + height + '" fill="#000"/></svg>'`
    const result = executeSvgScript(code, 500, 300)
    expect(result).toContain('width="500"')
    expect(result).toContain('height="300"')
  })

  it('returns null for syntax errors', () => {
    const code = `return '<svg xmlns="http://www.w3.org/2000/svg"' ++++ broken`
    const result = executeSvgScript(code, 360, 360)
    expect(result).toBeNull()
  })

  it('returns null for runtime errors', () => {
    const code = `undefinedVariable.method()`
    const result = executeSvgScript(code, 360, 360)
    expect(result).toBeNull()
  })

  it('returns null when result is not a string', () => {
    const code = `return 42`
    const result = executeSvgScript(code, 360, 360)
    expect(result).toBeNull()
  })

  it('returns null when result is not valid SVG', () => {
    const code = `return '<div>not svg</div>'`
    const result = executeSvgScript(code, 360, 360)
    expect(result).toBeNull()
  })

  it('rejects SVG containing script tags', () => {
    const code = `return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360"><script>alert(1)</script></svg>'`
    const result = executeSvgScript(code, 360, 360)
    expect(result).toBeNull()
  })

  it('handles template literal style code', () => {
    const code = 'const cx = width / 2; const cy = height / 2; return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><circle cx="${cx}" cy="${cy}" r="50" fill="blue"/></svg>`'
    const result = executeSvgScript(code, 360, 360)
    expect(result).toContain('cx="180"')
    expect(result).toContain('cy="180"')
  })

  it('injects width and height when SVG lacks them', () => {
    const code = 'return \'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360"><circle cx="180" cy="180" r="80" fill="red"/></svg>\''
    const result = executeSvgScript(code, 360, 360)
    expect(result).toContain('width="360"')
    expect(result).toContain('height="360"')
  })

  it('preserves existing width and height attributes', () => {
    const code = 'return \'<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><circle cx="200" cy="150" r="80" fill="red"/></svg>\''
    const result = executeSvgScript(code, 400, 300)
    expect(result).toContain('width="400"')
    expect(result).toContain('height="300"')
    // Should NOT have duplicate width/height
    expect(result!.match(/width="/g)!.length).toBe(1)
  })
})
