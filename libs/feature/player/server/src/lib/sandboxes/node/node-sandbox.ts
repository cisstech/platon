/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs'
import * as tar from 'tar-stream'
import * as Path from 'path'
import * as zlib from 'zlib'
import { v4 as uuidv4 } from 'uuid'
import { NodeVM } from 'vm2'

import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Configuration } from '@platon/core/server'
import { Sandbox, SandboxEnvironment, SandboxError, SandboxInput, SandboxOutput } from '@platon/feature/player/common'
import { constants } from 'fs'
import { RegisterSandbox } from '../sandbox'
import { createNodeSandboxAPI } from './node-sandbox-api'
import { NotFoundResponse } from '@platon/core/common'
/**
 * Directory where environment files are stored.
 */
const ENVS_DIR = Path.join(process.cwd(), 'envs')

/**
 * List of built-in global variables.
 */
const builtinGlobales = [
  'global',
  'Function',
  'eval',
  'setTimeout',
  'setInterval',
  'setImmediate',
  'clearTimeout',
  'clearInterval',
  'clearImmediate',
  'process',
  'console',
]

@Injectable()
@RegisterSandbox()
export class NodeSandbox implements OnModuleInit, Sandbox {
  private readonly logger = new Logger(NodeSandbox.name)

  constructor(private readonly config: ConfigService<Configuration>) {}

  async onModuleInit(): Promise<void> {
    await this.cleanup()
  }

  supports(input: SandboxInput): boolean {
    const { sandbox } = input.variables
    return !sandbox || sandbox === 'node'
  }

  /**
   * Executes the provided script in the NodeVM sandbox.
   * @param input - The SandboxInput object.
   * @param script - The script to be executed.
   * @param timeout - The execution timeout in milliseconds.
   * @returns A Promise that resolves to the SandboxOutput object.
   * @throws {SandboxError} If an error occurs during script execution.
   */
  async run(input: SandboxInput, script: string, timeout: number): Promise<SandboxOutput> {
    const { vm, envid } = await this.withVm(input, timeout)
    try {
      if (script.length) {
        vm.run(script)
      }
    } catch (error) {
      throw SandboxError.unknownError(error)
    }

    return {
      envid,
      variables: {
        ...input.variables,
        ...this.jsonify(vm.getGlobal('global')),
      },
    }
  }

  /**
   * Executes the next script in the NodeVM sandbox.
   * @param input - The SandboxInput object.
   * @param timeout - The execution timeout in milliseconds.
   * @returns A Promise that resolves to the SandboxOutput object.
   * @throws {SandboxError} If an error occurs during script execution.
   */
  async runNext(input: SandboxInput, timeout: number): Promise<SandboxOutput> {
    return this.run(input, input.variables.next, timeout)
  }

  /**
   * Creates a zipfile containing the environment files.
   * @param envid - The environment ID.
   */
  async downloadEnvironment(envid: string): Promise<SandboxEnvironment> {
    const path = Path.join(ENVS_DIR, envid)
    const exists = await fs.promises
      .access(path, constants.F_OK)
      .then(() => true)
      .catch(() => false)

    if (!exists) {
      throw new NotFoundResponse(`Environment ${envid} not found`)
    }
    const pack: tar.Pack = tar.pack()
    const gzip: zlib.Gzip = zlib.createGzip()

    await fs.promises
      .readdir(path)
      .then(async (files) => {
        files.forEach((file: string) => {
          const fileStat: fs.Stats = fs.statSync(Path.join(path, file))
          const stream: fs.ReadStream = fs.createReadStream(Path.join(path, file))
          stream.pipe(pack.entry({ name: file, size: fileStat.size }) as any)
        })
      })
      .catch((error) => {
        throw new Error(`Error reading environment files: ${error}`)
      })

    pack.finalize()
    const tgz = pack.pipe(gzip as any)

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      tgz.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })
      tgz.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      tgz.on('error', (error: any) => {
        reject(error)
      })
    })
    return { envid: envid, content: buffer.toString('binary') }
  }

  /**
   * Creates a NodeVM with the provided sandbox and sets up the environment.
   * @param input - The SandboxInput object.
   * @param timeout - The execution timeout in milliseconds.
   * @returns An object containing the NodeVM and environment details.
   */
  private async withVm(input: SandboxInput, timeout: number) {
    const exists = async (path: string) => {
      try {
        await fs.promises.access(path, constants.F_OK)
        return true
      } catch {
        return false
      }
    }

    const envid = input.envid || uuidv4()
    const baseDir = Path.join(ENVS_DIR, envid)

    if (input.files?.length && !(await exists(baseDir))) {
      await fs.promises.mkdir(baseDir)
      await Promise.all([
        ...input.files.map(async (file) => {
          if (!file.hash) {
            return fs.promises.writeFile(Path.join(baseDir, file.path), file.content)
          } else {
            const filePath = Path.join('resources/media', file.hash[0], file.hash)
            try {
              return fs.promises.copyFile(filePath, Path.join(baseDir, file.path))
            } catch (error) {
              console.error(`Error while linking file ${filePath}:`, error)
            }
          }
        }),
      ])
    }

    const sandbox = createNodeSandboxAPI(baseDir)

    Object.assign(sandbox, input.variables)

    return {
      envid,
      timeout,
      sandbox,
      vm: new NodeVM({ sandbox }),
    }
  }

  /**
   * Converts the provided global variables object to JSON format.
   * @param globals - The global variables object.
   * @returns The JSON representation of the global variables.
   */
  private jsonify(globals: any) {
    return Object.keys(globals)
      .filter((key) => !builtinGlobales.includes(key))
      .reduce((acc, curr) => {
        if (typeof globals[curr] !== 'function') {
          acc[curr] = globals[curr]
        }
        return acc
      }, {} as any)
  }

  /**
   * Cleans up the environment files.
   * @remarks
   * - The lifespan of the environment files is determined by the `sandbox.envLifespan` {@link Configuration}.
   */
  @Cron(CronExpression.EVERY_WEEK)
  protected async cleanup() {
    this.logger.log('Cleaning up environments')

    const now = Date.now()
    const contents = await fs.promises.readdir(ENVS_DIR, { withFileTypes: true })
    let lifespan = this.config.get<number>('sandbox.envLifespan', { infer: true })
    if (!lifespan) return

    lifespan = lifespan * 1000
    await Promise.all(
      contents.map(async (content) => {
        if (!content.isDirectory()) return
        const path = Path.join(ENVS_DIR, content.name)
        const stat = await fs.promises.stat(path)

        if (now - stat.mtimeMs > lifespan) {
          this.logger.log(`Cleaning up environment: ${content.name}`)
          await fs.promises.rm(path, { recursive: true })
        }
      })
    ).catch((error) => {
      this.logger.error('Error cleaning up environments:', error)
    })
  }
}
