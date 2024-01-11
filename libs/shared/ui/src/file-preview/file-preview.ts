export const SUPPORTED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] as readonly string[]
export const SUPPORTED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'] as readonly string[]
export const SUPPORTED_TEXT_EXTENSIONS = ['md', 'txt'] as readonly string[]

export const SUPPORTED_EXTENSIONS = [
  ...SUPPORTED_IMAGE_EXTENSIONS,
  ...SUPPORTED_VIDEO_EXTENSIONS,
  ...SUPPORTED_TEXT_EXTENSIONS,
  'pdf',
] as readonly string[]

export const FILE_PREVIEW_REGEX = /\/api\/v[0-9]+\/files\/[^.]+.(?<extension>[^?]+)/

export const extractSupportedExtension = (url: string): string | null => {
  const regex = FILE_PREVIEW_REGEX
  const match = url.match(regex)
  if (!match) {
    return null
  }
  if (SUPPORTED_EXTENSIONS.includes(match.groups?.extension || '')) {
    return match.groups?.extension as string
  }
  return null
}
