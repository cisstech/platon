/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PLSourceFile } from '@platon/feature/compiler';
import { basename } from 'path';
import { NodeSandbox, SandboxInput, SandboxOutput } from '.';

@Injectable()
export class SandboxService {
  private node = new NodeSandbox();

  async build(source: PLSourceFile): Promise<SandboxOutput> {
    let envid: string | undefined;
    let variables = source.variables;

    if (variables.builder || source.dependencies.length) {
      const response = await this.node.run({
        files: source.dependencies.map(file => ({
          path: file.alias || basename(file.abspath),
          content: file.content
        })),
        variables
      }, variables.builder as string);

      envid = response.envid;
      variables = response.variables;
    }


    return {
      envid,
      variables
    }
  }

  async run(input: SandboxInput, script: string): Promise<SandboxOutput> {
    return this.node.run(input, script);
  }
}


