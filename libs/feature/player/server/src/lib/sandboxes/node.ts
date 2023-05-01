/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NodeVM } from 'vm2';
import { RegisterSandbox, Sandbox, SandboxError, SandboxInput, SandboxOutput } from './sandbox';

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

@Injectable()
@RegisterSandbox()
export class NodeSandbox implements Sandbox {
  supports(input: SandboxInput): boolean {
    const { sandbox } = input.variables;
    return !sandbox || sandbox === 'node';
  }


  async run(input: SandboxInput, script: string, timeout: number): Promise<SandboxOutput> {
    const { vm, envid } = await this.withVm(input, timeout);

    try {
      if (script.length) {
        vm.run(script);
      }
    } catch (error) {
      throw SandboxError.unknownError(error);
    }

    return {
      envid,
      variables: {
        ...input.variables,
        ...this.jsonify(vm.getGlobal('global'))
      }
    };
  }

  private async withVm(input: SandboxInput, timeout: number) {
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
      component: (selector: string) => {
        return {
          cid: uuidv4(),
          selector,
        }
      }
    });

    const vm = new NodeVM({ sandbox, timeout });
    return { vm, envid };
  }

  private jsonify(globals: any) {
    return Object.keys(globals).filter(key => !builtinGlobales.includes(key)).reduce((acc, curr) => {
      if (typeof globals[curr] !== 'function') {
        acc[curr] = globals[curr];
      }
      return acc;
    }, {} as any);
  }
}
