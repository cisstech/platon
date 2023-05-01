import { Injectable } from '@nestjs/common';
import { PLSourceFile } from '@platon/feature/compiler';
import { basename } from 'path';
import { Sandbox, SandboxInput, SandboxOutput } from '.';

@Injectable()
export class SandboxService {
  private readonly sandboxes: Sandbox[] = [];

  register(sandbox: Sandbox) {
    this.sandboxes.push(sandbox);
  }

  async build(source: PLSourceFile): Promise<SandboxOutput> {
    let envid: string | undefined;
    let variables = source.variables;

    const sandbox = this.sandboxes.find(sandbox => sandbox.supports(source));
    if (!sandbox) {
      throw new Error(`No sandbox found for the given source file`);
    }

    if (variables.builder || source.dependencies.length) {
      const response = await sandbox.run({
        files: source.dependencies.map(file => ({
          path: file.alias || basename(file.abspath),
          content: file.content
        })),
        variables
      }, variables.builder as string, 10_0000);

      envid = response.envid;
      variables = response.variables;
    }

    return {
      envid,
      variables
    }
  }

  async run(input: SandboxInput, script: string): Promise<SandboxOutput> {
    const sandbox = this.sandboxes.find(sandbox => sandbox.supports(input));
    if (!sandbox) {
      throw new Error(`No sandbox found for the given source file`);
    }
    return sandbox.run(input, script, 10_0000);
  }
}


