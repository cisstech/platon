export const resolveFileReference = (path: string, relativeTo: { resource: string; version?: string }) => {
  const parts = path.split('/').filter((e) => !!e.trim())
  let [resource, version] = parts[0].split(':')
  path = parts.slice(1).join('/')

  resource = resource === 'relative' ? relativeTo.resource : resource
  version = (resource === 'relative' ? relativeTo.version : version) || 'latest'

  return {
    resource,
    version,
    relpath: path,
    abspath: `${resource}:${version}/${path}`,
  }
}
