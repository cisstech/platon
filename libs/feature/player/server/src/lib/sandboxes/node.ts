/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NodeVM } from 'vm2';
import { Sandbox, SandboxBuildArgs, SandboxError, SandboxEvaluateArgs, SandboxResponse } from './sandbox';

const ENVS_DIR = '/src/envs';

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


export class NodeSandbox implements Sandbox {
  async build(input: SandboxBuildArgs): Promise<SandboxResponse> {
    const { vm, envid } = await this.withVm(input);

    try {
      if (input.variables.builder) {
        vm.run(input.variables.builder as string);
      }
    } catch (error) {
      throw new SandboxError(error);
    }

    return {
      envid,
      variables: {
        ...input.variables,
        ...this.purgeGlobals(vm.getGlobal('global'))
      }
    };
  }

  async evaluate(input: SandboxEvaluateArgs): Promise<SandboxResponse> {
    const { vm } = await this.withVm(input);
    const { grader } = input.variables;
    try {
      if (!grader) {
        throw new Error('Missing "grader" variable.')
      }
      vm.run(grader as string);
    } catch (error) {
      throw new SandboxError(error);
    }

    return {
      envid: input.envid,
      variables: {
        ...input.variables,
        ...this.purgeGlobals(vm.getGlobal('global'))
      }
    };
  }

  private async withVm(input: SandboxBuildArgs | SandboxEvaluateArgs) {
    const sandbox = {};
    let envid = '';

    if (!('envid' in input)) {
      envid = uuidv4();
      const dir = path.join(ENVS_DIR, envid);
      await fs.promises.mkdir(dir);
      await Promise.all(
        input.files.map(file => (
          fs.promises.writeFile(path.join(dir, file.path), file.content)
        ))
      );
    }

    Object.assign(sandbox, input.variables);
    const vm = new NodeVM({ sandbox, timeout: 5000 });
    return { vm, envid };
  }

  private purgeGlobals(globals: any) {
    return Object.keys(globals).filter(key => !builtinGlobales.includes(key)).reduce((acc, curr) => {
      acc[curr] = globals[curr];
      return acc;
    }, {} as any);
  }
}
