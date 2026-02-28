import { describe, it, expect } from 'vitest'
import { buildShareText, buildTwitterUrl } from '../src/lib/share'

describe('buildShareText', () => {
  it('includes score', () => {
    const text = buildShareText(3)
    expect(text).toContain('3')
  })

  it('includes hashtag', () => {
    const text = buildShareText(5)
    expect(text).toContain('#OneShot')
  })

  it('works with score 0', () => {
    const text = buildShareText(0)
    expect(text).toContain('0')
  })
})

describe('buildTwitterUrl', () => {
  it('returns a valid twitter intent URL', () => {
    const url = buildTwitterUrl('test message')
    expect(url).toContain('https://twitter.com/intent/tweet')
    expect(url).toContain(encodeURIComponent('test message'))
  })

  it('encodes special characters', () => {
    const url = buildTwitterUrl('hello & goodbye')
    expect(url).toContain(encodeURIComponent('hello & goodbye'))
  })
})
