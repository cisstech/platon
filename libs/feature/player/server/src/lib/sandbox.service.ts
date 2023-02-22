import { Injectable } from '@nestjs/common';
import { NodeSandbox, Sandbox, SandboxResponse, SandboxBuildArgs, SandboxEvaluateArgs } from './sandboxes';

@Injectable()
export class SandboxService implements Sandbox {
  private sandbox = new NodeSandbox();
  build(input: SandboxBuildArgs): Promise<SandboxResponse> {
    return this.sandbox.build(input);
  }
  evaluate(input: SandboxEvaluateArgs): Promise<SandboxResponse> {
    return this.sandbox.evaluate(input);
  }
}
