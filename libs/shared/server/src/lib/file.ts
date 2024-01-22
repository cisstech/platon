import * as fs from 'fs'
import * as os from 'os'
import * as Path from 'path'
import { v4 as uuid } from 'uuid'

// This is a hack to make Multer available in the Express namespace
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export { Multer } from 'multer'

export class FileExistsError extends Error {
  constructor(filename: string) {
    super(`${filename}: File already exists`)
  }
}

export class FileNotFoundError extends Error {
  constructor(filename: string) {
    super(`${filename}: No such file or directory`)
  }
}

export class IsADirectoryError extends Error {
  constructor(filename: string) {
    super(`${filename}: Is a directory`)
  }
}

export class NotADirectoryError extends Error {
  constructor(filename: string) {
    super(`${filename}: Is not a directory`)
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export async function isFile(path: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(path)
    return stat.isFile()
  } catch (error) {
    // If an error occurs, the path probably does not exist or is not accessible
    return false
  }
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(path)
    return stat.isDirectory()
  } catch (error) {
    // If an error occurs, the path probably does not exist or is not accessible
    return false
  }
}

export function uniquifyFileName(directory: string, filename: string): string {
  const { name, ext } = Path.parse(filename)
  filename = `${name}${ext}`
  let abspath = Path.join(directory, filename)
  let counter = 1
  while (fs.existsSync(abspath)) {
    filename = `${name}(${counter})${ext}`
    abspath = Path.join(directory, filename)
    counter++
  }
  return abspath
}

export async function withTempDir<T = unknown>(
  consumer: (path: string) => T,
  options?: {
    cleanup?: boolean
  }
): Promise<T> {
  const tmp = await fs.promises.realpath(os.tmpdir())
  const dir = await fs.promises.mkdtemp(Path.join(tmp, Path.sep))
  try {
    return await consumer(dir)
  } finally {
    if (options?.cleanup) {
      fs.promises.rm(dir, { recursive: true, force: true })
    }
  }
}

export async function withTempFile<T = unknown>(
  consumer: (path: string) => T,
  options?: {
    prefix?: string
    suffix?: string
    cleanup?: boolean
  }
): Promise<T> {
  const tmp = await fs.promises.realpath(os.tmpdir())

  const parts = [tmp]
  if (options?.prefix) {
    parts.push(options.prefix)
    try {
      await fs.promises.mkdir(Path.join(...parts), { recursive: false })
    } catch {
      // do nothing if directory already exists
    }
  }

  parts.push(uuid() + options?.suffix || '.tmp')

  const path = Path.join(...parts)

  await fs.promises.writeFile(path, '')

  try {
    return await consumer(path)
  } finally {
    if (options?.cleanup) {
      fs.promises.rm(path, { recursive: true, force: true })
    }
  }
}
