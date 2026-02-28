import { describe, it, expect } from 'vitest'
import { generateRoomCode, parseRoomFromUrl } from '../src/lib/room-code'

describe('generateRoomCode', () => {
  it('produces a 6-character code', () => {
    const code = generateRoomCode()
    expect(code).toHaveLength(6)
  })

  it('only uses unambiguous characters (no 0/O/1/I/l)', () => {
    const ambiguous = /[01IlO]/
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode()
      expect(code).not.toMatch(ambiguous)
    }
  })

  it('only uses uppercase letters and digits', () => {
    const valid = /^[A-Z0-9]+$/
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode()
      expect(code).toMatch(valid)
    }
  })

  it('produces different codes on successive calls', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateRoomCode()))
    expect(codes.size).toBeGreaterThan(40)
  })
})

describe('parseRoomFromUrl', () => {
  it('extracts room code from /room/ABC123', () => {
    expect(parseRoomFromUrl('/room/ABC123')).toBe('ABC123')
  })

  it('converts to uppercase', () => {
    expect(parseRoomFromUrl('/room/abc123')).toBe('ABC123')
  })

  it('returns null for root path', () => {
    expect(parseRoomFromUrl('/')).toBeNull()
  })

  it('returns null for /room/ without code', () => {
    expect(parseRoomFromUrl('/room/')).toBeNull()
  })

  it('returns null for too-short code', () => {
    expect(parseRoomFromUrl('/room/AB')).toBeNull()
  })

  it('returns null for too-long code', () => {
    expect(parseRoomFromUrl('/room/ABCDEFGHIJ')).toBeNull()
  })

  it('accepts 4-8 character codes', () => {
    expect(parseRoomFromUrl('/room/ABCD')).toBe('ABCD')
    expect(parseRoomFromUrl('/room/ABCDEFGH')).toBe('ABCDEFGH')
  })

  it('returns null for codes with special characters', () => {
    expect(parseRoomFromUrl('/room/ABC-23')).toBeNull()
  })
})
