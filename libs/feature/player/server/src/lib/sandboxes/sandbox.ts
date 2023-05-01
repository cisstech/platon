/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetMetadata } from "@nestjs/common";
import { Variables } from "@platon/feature/compiler";

export interface SandboxInput {
  envid?: string;
  files?: {
    path: string;
    content: string;
  }[],
  variables: Variables;
}

export interface SandboxOutput {
  envid?: string;
  variables: Variables;
}

export interface Sandbox {
  supports(input: SandboxInput): boolean;
  run(input: SandboxInput, script: string, timeout: number): Promise<SandboxOutput>;
}

export class SandboxError extends Error {
  private constructor(message: string) {
    super(message);
  }

  static unknownError(error?: any): SandboxError {
    const message = typeof error === 'object' ? error?.message || error : error;
    return new SandboxError('Execution of the evaluating script failed due to an an unknown error. Please contact your teacher : \n\n' + message);
  }

  static timeoutError(timeout: number): SandboxError {
    return new SandboxError(`Execution of the evaluating script failed due to a timeout (${timeout}). Please contact your teacher.`);
  }

}

export const SANDBOX = Symbol('SANDBOX')

export const RegisterSandbox = () =>
  SetMetadata(SANDBOX, true)
