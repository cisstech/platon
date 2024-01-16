import { basename, resolveFileReference } from './file'

describe('resolveFileReference', () => {
  const relativeTo = {
    resource: 'uuid',
    version: 'v1',
  }

  it('should resolve file reference with absolute path', () => {
    const path = '/absolute/path/file.txt'
    const expectedResult = {
      alias: undefined,
      resource: 'absolute',
      version: 'latest',
      relpath: 'path/file.txt',
      abspath: 'absolute:latest/path/file.txt',
    }

    const result = resolveFileReference(path, relativeTo)
    expect(result).toEqual(expectedResult)
  })

  it('should resolve file reference with relative path', () => {
    const path = 'relative/path/file.txt'
    const expectedResult = {
      alias: undefined,
      resource: 'uuid',
      version: 'v1',
      relpath: 'relative/path/file.txt',
      abspath: 'uuid:v1/relative/path/file.txt',
    }

    const result = resolveFileReference(path, relativeTo)
    expect(result).toEqual(expectedResult)
  })

  it('should resolve file reference with alias', () => {
    const path = '/absolute/path/file.txt as alias'
    const expectedResult = {
      alias: 'alias',
      resource: 'absolute',
      version: 'latest',
      relpath: 'path/file.txt',
      abspath: 'absolute:latest/path/file.txt',
    }

    const result = resolveFileReference(path, relativeTo)
    expect(result).toEqual(expectedResult)
  })

  it('should resolve file reference with relative resource and version', () => {
    const path = 'relative:dev/path/file.txt'
    const expectedResult = {
      alias: undefined,
      resource: 'uuid',
      version: 'v1',
      relpath: 'relative:dev/path/file.txt',
      abspath: 'uuid:v1/relative:dev/path/file.txt',
    }

    const result = resolveFileReference(path, relativeTo)
    expect(result).toEqual(expectedResult)
  })
})

describe('basename', () => {
  it('should return the base name of a file path', () => {
    const path = '/absolute/path/file.txt'
    const expectedBasename = 'file.txt'

    const result = basename(path)
    expect(result).toEqual(expectedBasename)
  })

  it('should return the base name of a file path with multiple directories', () => {
    const path = 'relative/path/to/file.txt'
    const expectedBasename = 'file.txt'

    const result = basename(path)
    expect(result).toEqual(expectedBasename)
  })

  it('should return the base name of a file path with no directories', () => {
    const path = 'file.txt'
    const expectedBasename = 'file.txt'

    const result = basename(path)
    expect(result).toEqual(expectedBasename)
  })

  it('should return an empty string for an empty path', () => {
    const path = ''
    const expectedBasename = ''

    const result = basename(path)
    expect(result).toEqual(expectedBasename)
  })
})
