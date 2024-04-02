import { emptyResourcePermissions, noResourcePermissions } from './permissions.model'

describe('emptyResourcePermissions', () => {
  it('should return an object with read set to true', () => {
    const result = emptyResourcePermissions()
    expect(result.read).toBe(true)
  })

  it('should return an object with write set to false', () => {
    const result = emptyResourcePermissions()
    expect(result.write).toBe(false)
  })

  it('should return an object with member set to false', () => {
    const result = emptyResourcePermissions()
    expect(result.member).toBe(false)
  })

  it('should return an object with watcher set to false', () => {
    const result = emptyResourcePermissions()
    expect(result.watcher).toBe(false)
  })

  it('should return an object with waiting set to false', () => {
    const result = emptyResourcePermissions()
    expect(result.waiting).toBe(false)
  })
})

describe('emptyResourcePermissions', () => {
  it('should return an object with read set to true', () => {
    const result = emptyResourcePermissions()
    expect(result.read).toBe(true)
  })

  it('should return an object with write set to false', () => {
    const result = emptyResourcePermissions()
    expect(result.write).toBe(false)
  })

  it('should return an object with member set to false', () => {
    const result = emptyResourcePermissions()
    expect(result.member).toBe(false)
  })

  it('should return an object with watcher set to false', () => {
    const result = emptyResourcePermissions()
    expect(result.watcher).toBe(false)
  })

  it('should return an object with waiting set to false', () => {
    const result = emptyResourcePermissions()
    expect(result.waiting).toBe(false)
  })
})

describe('noResourcePermissions', () => {
  it('should return an object with read set to false', () => {
    const result = noResourcePermissions()
    expect(result.read).toBe(false)
  })

  it('should return an object with write set to false', () => {
    const result = noResourcePermissions()
    expect(result.write).toBe(false)
  })

  it('should return an object with member set to false', () => {
    const result = noResourcePermissions()
    expect(result.member).toBe(false)
  })

  it('should return an object with watcher set to false', () => {
    const result = noResourcePermissions()
    expect(result.watcher).toBe(false)
  })

  it('should return an object with waiting set to false', () => {
    const result = noResourcePermissions()
    expect(result.waiting).toBe(false)
  })
})
