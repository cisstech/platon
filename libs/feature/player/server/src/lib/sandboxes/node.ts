/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NodeVM } from 'vm2';
import { Sandbox, SandboxError, SandboxInput, SandboxOutput } from './sandbox';

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
];

export class NodeSandbox implements Sandbox {
  async run(input: SandboxInput, script: string): Promise<SandboxOutput> {
    const { vm, envid } = await this.withVm(input);

    try {
      if (script.length) {
        vm.run(script);
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

  private async withVm(input: SandboxInput) {
    let envid = '';

    if (!('envid' in input) && input.files?.length) {
      envid = uuidv4();
      const dir = path.join(ENVS_DIR, envid);
      await fs.promises.mkdir(dir);
      await Promise.all([
        ...input.files.map(file => (
          fs.promises.writeFile(path.join(dir, file.path), file.content)
        )),
      ]);
    }

    const sandbox = {};
    Object.assign(sandbox, {
      ...input.variables,
      // TODO implements util functions
    });

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
