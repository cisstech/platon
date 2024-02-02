import * as fs from 'fs'
import * as Path from 'path'
import { v4 as uuidv4 } from 'uuid'

/**
 * Options for reading a file.
 */
interface ReadFileOptions {
  flag?: string
  encoding?: BufferEncoding
}

/**
 * Creates the sandbox API object passed to node sandbox.
 *
 * Each method in the API object is a function that can be called from the sandbox.
 *
 * @param baseDir - The base directory for file operations.
 * @returns The sandbox API object.
 */
export const createNodeSandboxAPI = (baseDir: string) => {
  return {
    /**
     * Reads a file from the sandbox environment.
     * @param path - The path to the file.
     * @param options - The file reading options.
     * @returns The contents of the file.
     * @throws {Error} If the path is not accessible within the sandbox environment.
     */
    readFile: (path: string, options?: ReadFileOptions) => {
      path = Path.join(baseDir, path)
      if (!path.startsWith(baseDir)) {
        throw new Error(`You cannot access this path.`)
      }
      return fs.readFileSync(path, options).toString()
    },

    /**
     * Creates a component object with a unique identifier and selector.
     * @param selector - The component selector.
     * @returns The component object with a CID and selector.
     */
    component: (selector: string) => {
      return { cid: uuidv4(), selector }
    },
  }
}
