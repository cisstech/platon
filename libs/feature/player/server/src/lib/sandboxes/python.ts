import FormData from 'form-data';
import * as fs from 'fs';
import * as tar from 'tar-stream';
import * as zlib from 'zlib';

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '@nestjs/config';
import { Configuration } from '@platon/core/server';
import { withTempFile } from '@platon/shared/server';
import {
  RegisterSandbox,
  Sandbox,
  SandboxError,
  SandboxInput,
  SandboxOutput,
} from './sandbox';

const runner = `
#!/usr/bin/env python3
# coding: utf-8

import uuid, sys, json, jsonpickle, types

class StopExec(Exception):
    pass

def with_try_clause(code, excpt):
    code = code.replace('\\t', '    ')
    return (
        "try:\\n    ...\\n"
        + '\\n'.join(["    " + line for line in code.split('\\n')])
        + "\\nexcept " + excpt.__name__ + ":\\n    pass"
    )

def component(selector):
    return { 'selector': selector, 'cid': str(uuid.uuid4()) }

def jsonify(d):
    keys = ['Object', 'component', 'StopExec']
    for k, v in list(d.items()):
        if v is None or isinstance(v, types.ModuleType) or k in keys:
            del d[k]
    return d

if __name__ == "__main__":
    with open("script.py", "r") as f:
      script = f.read()

    with open("variables.json", "r") as f:
      variables = json.load(f)

    glob = {}

    variables['component'] = component
    variables['StopExec'] = StopExec

    exec(with_try_clause(script, StopExec), variables)
    exec("", glob)

    for key in glob:
        if key in variables and variables[key] == glob[key]:
            del variables[key]

    print(jsonpickle.encode(jsonify(variables), unpicklable=False))

    sys.exit(0)
`;

interface ExecutionResult {
  status: number;
  execution: {
    exit_code: number;
    stdout: string;
    stderr: string;
    time: number;
  }[];
  total_time: number;
  result: number;
  environment: string;
  expire: string;
}

@Injectable()
@RegisterSandbox()
export class PythonSandbox implements Sandbox {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService<Configuration>
  ) {}

  supports(input: SandboxInput): boolean {
    const { sandbox } = input.variables;
    return sandbox === 'python';
  }

  async run(
    input: SandboxInput,
    script: string,
    timeout: number
  ): Promise<SandboxOutput> {
    try {
      const response = await withTempFile(
        async (path) => {
          await this.withEnvFiles(script, input, path);

          const data = new FormData();

          data.append(
            'config',
            JSON.stringify({
              save: true,
              commands: ['python3 runner.py'],
              ...(input.envid ? { environment: input.envid } : {}),
            })
          );

          data.append('environment', await fs.promises.readFile(path), {
            filename: 'environment',
          });

          let url = this.config.get('sandbox.url', { infer: true }) as string;
          if (!url.endsWith('/')) {
            url += '/';
          }

          const result = await firstValueFrom(
            this.http.post<ExecutionResult>(`${url}execute/`, data, {
              headers: { 'Content-Type': 'multipart/form-data' },
              timeout,
            })
          );
          return result.data;
        },
        { prefix: 'envs', suffix: '.tgz', cleanup: false }
      );

      if (response.status === -2) {
        throw SandboxError.timeoutError(timeout);
      }

      if (response.status !== 0) {
        throw SandboxError.unknownError(response.execution[0].stderr);
      }

      return Promise.resolve({
        envid: response.environment,
        variables: JSON.parse(response.execution[0].stdout),
      });
    } catch (error) {
      if (error instanceof SandboxError) {
        throw error;
      }
      throw SandboxError.unknownError(error);
    }
  }

  private async withEnvFiles(
    script: string,
    input: SandboxInput,
    path: string
  ) {
    const pack = tar.pack();

    pack.entry({ name: 'script.py' }, script);
    pack.entry({ name: 'variables.json' }, JSON.stringify(input.variables));

    if (!input.envid) {
      pack.entry({ name: 'runner.py' }, runner);
      input.files?.forEach((file) =>
        pack.entry({ name: file.path }, file.content)
      );
    }

    pack.finalize();

    const gzip = zlib.createGzip();
    const stream = fs.createWriteStream(path);
    pack.pipe(gzip).pipe(stream);

    await new Promise<void>((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', resolve);
    });
  }
}
