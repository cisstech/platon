/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ResourceFileService } from '@platon/feature/resource/server';
import { basename } from 'path';
import { NodeSandbox, SandboxInput, SandboxOutput } from './sandboxes';

@Injectable()
export class SandboxService {
  private node = new NodeSandbox();

  constructor(
    private readonly fileService: ResourceFileService
  ) { }

  async build(
    resourceId: string,
    resourceVersion: string,
    variableOverrides?: Record<string, any>
  ) {
    const [source, resource] = await this.fileService.compile(
      resourceId,
      resourceVersion,
    );

    let envid: string | undefined;
    let variables: Record<string, any> = {
      ...source.variables,
      ...(variableOverrides || {})
    };

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
      resource,
      variables
    }
  }

  async run(input: SandboxInput, script: string): Promise<SandboxOutput> {
    return this.node.run(input, script);
  }
}


