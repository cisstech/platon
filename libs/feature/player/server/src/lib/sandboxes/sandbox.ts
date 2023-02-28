/* eslint-disable @typescript-eslint/no-explicit-any */
import { Variables } from "@platon/feature/player/common";

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
  run(input: SandboxInput, script: string): Promise<SandboxOutput>;
}

export class SandboxError extends Error {
  constructor(error: any) {
    super(`Execution of the sandbox script failed due to an unkwown error. Please contact your teacher : ${error.message}`);
  }
}
