import { COURSE_HUES, courseHue } from './course-hue'

describe('courseHue', () => {
  it('gives a course the same hue on every screen and every load', () => {
    expect(courseHue('7f0c8a3e-2b1d-4c5e-9a6f-0123456789ab')).toBe('coral')
    expect(courseHue('c1')).toBe('amber')
  })

  it('spreads courses over every hue', () => {
    const ids = Array.from({ length: 400 }, (_, i) => `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`)
    expect(new Set(ids.map(courseHue)).size).toBe(COURSE_HUES.length)
  })
})
