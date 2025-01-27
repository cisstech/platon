import FormData from 'form-data'
import * as fs from 'fs'
import * as tar from 'tar-stream'
import * as zlib from 'node:zlib'
import * as path from 'path'

import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'

import { ConfigService } from '@nestjs/config'
import { Configuration } from '@platon/core/server'
import { Sandbox, SandboxEnvironment, SandboxInput, SandboxOutput } from '@platon/feature/player/common'
import { withTempFile } from '@platon/shared/server'
import { RegisterSandbox } from '../sandbox'
import { pythonNextScript, pythonRunnerScript } from './python-scripts'
import { AxiosError } from 'axios'
import { NotFoundResponse } from '@platon/core/common'
import { timeout as rxjsTimeout } from 'rxjs'

interface ExecutionResult {
  status: number
  execution: {
    exit_code: number
    stdout: string
    stderr: string
    time: number
  }[]
  total_time: number
  result: string
  environment: string
  expire: string
}

@Injectable()
@RegisterSandbox()
export class PythonSandbox implements Sandbox {
  constructor(private readonly http: HttpService, private readonly config: ConfigService<Configuration>) {}

  supports(input: SandboxInput): boolean {
    const { sandbox } = input.variables
    return sandbox === 'python'
  }

  /**
   * Executes the Python sandbox with the provided input and script.
   * @param input The SandboxInput object.
   * @param script The Python script to execute.
   * @param timeout The timeout value for the execution.
   * @returns A Promise that resolves to a SandboxOutput object.
   * @throws {SandboxError} If an error occurs during execution.
   */
  async run(input: SandboxInput, script: string, timeout: number): Promise<SandboxOutput> {
    try {
      const response = await withTempFile(
        async (path) => {
          const isEnvSaved: boolean = await firstValueFrom(
            this.http
              .head(`${this.config.get('sandbox.url', { infer: true })}/environments/${input.envid}/`)
              .pipe(rxjsTimeout(timeout)) // 10s timeout
          )
            .then((response) => (response.status === 200 ? true : false))
            .catch(() => false)
          await this.withEnvFiles(script, input, path, isEnvSaved)

          const data = new FormData()

          data.append(
            'config',
            JSON.stringify({
              save: true,
              commands: ['python3 runner.py'],
              result_path: 'output.json',
              ...(input.envid && isEnvSaved ? { environment: input.envid } : {}),
            })
          )

          data.append('environment', await fs.promises.readFile(path), { filename: 'environment' })

          let url = this.config.get('sandbox.url', { infer: true }) as string
          if (!url.endsWith('/')) {
            url += '/'
          }
          const result = await firstValueFrom(
            this.http
              .post<ExecutionResult>(`${url}execute/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout,
              })
              .pipe(rxjsTimeout(timeout)) // 10s timeout
          )
          return result.data
        },
        { prefix: 'envs', suffix: '.tgz', cleanup: false }
      )

      if (response.status === -2) {
        throw new HttpException(`Evaluation failed due to timeout of ${timeout}. Please contact your teacher`, 504)
      }

      if (response.status !== 0) {
        throw new HttpException(
          `The sandbox is currently unavailable. Please try again later.\n\n${response.execution[0].stderr}`,
          512
        )
      }

      return {
        envid: response.environment,
        variables: JSON.parse(response.result),
      }
    } catch (error) {
      throw new HttpException(
        `The sandbox is currently unavailable. Please try again later.\n\n${(error as any)?.message}`,
        512
      )
    }
  }

  /**
   * Executes the next script in the Python sandbox.
   * @param input The SandboxInput object.
   * @param timeout The execution timeout in milliseconds.
   * @returns A Promise that resolves to the SandboxOutput object.
   */
  async runNext(input: SandboxInput, timeout: number): Promise<SandboxOutput> {
    return this.run(input, pythonNextScript, timeout)
  }

  /**
   * Downloads the environment files from the Python sandbox.
   * @param envid The environment ID.
   * @returns A Promise that resolves to a string containing the environment files.
   */
  async downloadEnvironment(envid: string): Promise<SandboxEnvironment> {
    const response = await firstValueFrom(
      this.http.get(`${this.config.get('sandbox.url', { infer: true })}/environments/${envid}/`, {
        responseType: 'arraybuffer',
      })
    ).catch((_error: AxiosError) => {
      throw new NotFoundResponse(`Environment ${envid} not found `)
    })
    //      .then((response) => {if (response.status == 404) throw new NotFoundException(`Environment ${envid} not found `) } )
    if (response.status == 404) throw new NotFoundResponse(`Environment ${envid} not found `)

    return { envid: envid, content: response.data }
  }

  /**
   * Packs the environment files into a tarball with gzip compression.
   * @param script The Python script.
   * @param input The SandboxInput object.
   * @param tempFilePath The path of the temporary file to create.
   * @param isEnvSaved A boolean indicating whether the environment is already saved.
   */
  private async withEnvFiles(script: string, input: SandboxInput, tempFilePath: string, isEnvSaved: boolean) {
    const pack = tar.pack()

    pack.entry({ name: 'script.py' }, script || '')
    pack.entry({ name: 'variables.json' }, JSON.stringify(input.variables))

    if (!isEnvSaved) {
      pack.entry({ name: 'runner.py' }, pythonRunnerScript)

      if (input.files) {
        for (const file of input.files) {
          if (!file.hash) {
            pack.entry({ name: file.path }, file.content || '')
          } else {
            const filePath = path.join('resources/media', file.hash[0], file.hash)
            try {
              const fileContent = await fs.promises.readFile(filePath)
              pack.entry({ name: file.path }, fileContent)
            } catch (error) {
              console.error(`Error reading file ${filePath}:`, error)
            }
          }
        }
      }
    }

    pack.finalize()

    const gzip = zlib.createGzip()

    const stream = fs.createWriteStream(tempFilePath)
    pack.pipe(gzip as any).pipe(stream)

    await new Promise<void>((resolve, reject) => {
      stream.on('error', reject)
      stream.on('finish', resolve)
    })
  }
}
