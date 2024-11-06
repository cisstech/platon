/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActivityVariables, ExerciseVariables } from '@platon/feature/compiler'

export interface SandboxInput {
  envid?: string | null
  files?:
    | {
        path: string
        content: string
        hash: string
      }[]
    | null
  variables: ExerciseVariables | ActivityVariables
}

export interface SandboxOutput {
  envid?: string
  variables: ExerciseVariables | ActivityVariables
}

export interface SandboxEnvironment {
  envid: string // Environment ID
  content: string // Content of the environment (gzip tarball)
}

export interface Sandbox {
  downloadEnvironment(envid: string): Promise<SandboxEnvironment>
  supports(input: SandboxInput): boolean
  run(input: SandboxInput, script: string, timeout: number): Promise<SandboxOutput>
  runNext(input: SandboxInput, timeout: number): Promise<SandboxOutput>
}

export class SandboxError extends Error {
  private constructor(message: string) {
    super(message)
  }

  static unknownError(error?: any): SandboxError {
    const message = typeof error === 'object' ? error?.message || error : error
    return new SandboxError(
      'Execution of the evaluating script failed due to an an unknown error. Please contact your teacher :\n\n' +
        message
    )
  }

  static timeoutError(timeout: number): SandboxError {
    return new SandboxError(
      `Execution of the evaluating script failed due to a timeout (${timeout}). Please contact your teacher.`
    )
  }
}
