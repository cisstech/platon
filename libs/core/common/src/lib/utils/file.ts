export const resolveFileReference = (path: string, relativeTo: { resource: string; version?: string }) => {
  path = path.trim()
  if (!path.startsWith('/')) {
    if (path.startsWith(':')) {
      const [version, ...rest] = path.split('/')
      path = `/relative${version}/${rest.join('/')}`
    } else {
      path = `/relative/${path}`
    }
  }
  const tokens = path.split(' as ')

  path = tokens[0].trim()
  const alias = tokens[1]?.trim()

  const parts = path.split('/').filter((e) => !!e.trim())
  let [resource, version] = parts[0].split(':')
  path = parts.slice(1).join('/')

  version = (resource === 'relative' ? version ?? relativeTo.version : version) || 'latest'
  resource = resource === 'relative' ? relativeTo.resource : resource

  return {
    alias,
    resource,
    version,
    relpath: path,
    abspath: `${resource}:${version}/${path}`,
  }
}

export const removeLeadingSlash = (path: string) => path.replace(/^[\\/.]+/g, '')

// implements the same logic as the basename function from path

export const basename = (path: string) => {
  if (!path) {
    return path
  }

  const parts = path.split('/').filter((e) => !!e.trim())
  return parts[parts.length - 1] ?? ''
}
