import { describe, it, expect, afterEach } from 'vitest'
import { buildShareText, buildTwitterUrl } from '../src/lib/share'
import { setLocale } from '../src/lib/i18n'

afterEach(() => {
  setLocale('en')
})

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

  it('returns Japanese text when locale is ja', () => {
    setLocale('ja')
    expect(buildShareText(3)).toContain('3ラウンド連続一致')
  })

  it('returns English text when locale is en', () => {
    setLocale('en')
    expect(buildShareText(3)).toContain('3 rounds in a row')
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
