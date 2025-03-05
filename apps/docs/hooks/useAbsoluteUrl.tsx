import { useBaseUrl } from './useBaseUrl'

/**
 * The documentation can be deployed to different servers (e.g. GitHub Pages, Self-hosted, etc.)
 * This hook is used to generate the absolute URL of a given path.
 * @param path
 * @returns
 */
export const useAbsoluteUrl = (path: string) => {
  const baseUrl = useBaseUrl()
  return buildAbsoluteUrl(baseUrl, path)
}

export const buildAbsoluteUrl = (baseUrl: string, path: string) => {
  if (path.startsWith('/')) {
    path = path.slice(1)
  }
  return baseUrl === '/' ? `/${path}` : `${baseUrl}/${path}`
}
