/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SandboxBuildArgs {
  files: {
    path: string;
    content: string;
  }[],
  variables: Record<string, unknown>;
}

export interface SandboxEvaluateArgs {
  envid: string;
  variables: Record<string, unknown>;
}

export interface SandboxResponse {
  envid: string;
  variables: Record<string, unknown>;
}

export interface Sandbox {
  build(input: SandboxBuildArgs): Promise<SandboxResponse>;
  evaluate(input: SandboxEvaluateArgs): Promise<SandboxResponse>;
}


export class SandboxError extends Error {
  constructor(error: any) {
    super(`Execution of the builder script failed due to an unkwown error. Please contact your teacher : ${error.message}`);
  }
}
