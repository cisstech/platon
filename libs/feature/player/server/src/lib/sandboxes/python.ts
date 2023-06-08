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

import uuid
import sys
import json
import jsonpickle
import types
from easydict import EasyDict as Object


class StopExec(Exception):
    """
    Exception class used to stop the execution of the script.
    """
    pass


def with_try_clause(code, excpt):
    """
    Wraps the given code with a try-except clause to catch a specific exception.

    Args:
        code (str): The code to be wrapped.
        excpt (Exception): The exception class to catch.

    Returns:
        str: The modified code with the try-except clause.
    """
    code = code.replace('\\t', '    ')
    return (
        "try:\\n    ...\\n"
        + '\\n'.join(["    " + line for line in code.split('\\n')])
        + "\\nexcept " + excpt.__name__ + ":\\n    pass"
    )

def component(selector):
    """
    Helper function exposed to builder/grader to creates a component object with a selector and a unique identifier.

    Args:
        selector (str): The selector for the component.

    Returns:
        Object: The component object with selector and cid attributes.
    """
    return Object({'selector': selector, 'cid': str(uuid.uuid4())})


def jsonify(d, keep_classes=True):
    """
    Serializes a dictionary object to JSON, excluding certain types.

    Args:
        d (dict): The dictionary object to be serialized.
        keep_classes (bool, optional): Specifies whether to include custom class objects in the serialization.
            Defaults to True.

    Returns:
        str: The JSON representation of the dictionary object.

    Notes:
        - The function recursively transforms the dictionary object, converting EasyDict objects to dictionaries
          and handling nested lists, tuples, and sets.
        - Certain types, such as None and specific custom classes, are excluded from the serialization process.
          Custom classes that are subclasses of types.ModuleType or types.FunctionType are excluded by default.
          The purpose of this exclusion is to avoid potential serialization issues or undesired side effects.
          If 'keep_classes' is set to False, the excluded custom class objects will be removed from the input
          dictionary before serialization.
        - The resulting JSON string is generated using the jsonpickle library, which supports serializing complex
          Python objects, including custom classes and instances.

    Example:
        d = {
            'form': '{{input}}',
            'a': 10,
            'b': 20,
            'array': ['abc', 'def'],
            'object': {
                'a': 'AAA',
                'b': 'BBB'
            }
        }
        json_string = jsonify(d)
        # json_string contains the JSON representation of the dictionary object.

    """

    def transform(obj):
        if isinstance(obj, list) or isinstance(obj, tuple) or isinstance(obj, set):
            result = []
            for value in obj:
                result.append(transform(value))
            return result
        if isinstance(obj, Object):
            result = {}
            for key, value in dict(obj).items():
                result[key] = transform(value)
            return result
        return obj

    exclude_types = [types.ModuleType, types.FunctionType]
    for k, v in list(d.items()):
        # exclude none and custom classes if needed
        if v is None or (not keep_classes and v.__class__ == type):
            del d[k]
            continue

        for t in exclude_types:
            if isinstance(v, t):
                del d[k]
                continue

    return jsonpickle.encode(transform(d), unpicklable=False)

if __name__ == "__main__":
    """
    Main function to execute the script.

    Reads the script code from a file, executes it with provided variables, and serializes the resulting variables
    to a JSON file.

    The script code is read from the file "script.py", and the variables to be passed to the script are read from
    the file "variables.json". The script is executed within a modified namespace, where additional objects and
    classes (Object, component, StopExec) are available.

    The resulting variables after executing the script are serialized using the 'jsonify' function and written to
    an output file named "output.json".

    The function uses the jsonpickle library to handle the serialization of complex Python objects, ensuring
    compatibility with custom classes and instances.

    Note:
        - It is assumed that the script file ("script.py") and the variables file ("variables.json") exist in
          the same directory as this script.

    Example:
        Assuming the following files exist:
        - script.py: Contains the code to be executed.
        - variables.json: Contains the variables to be passed to the script.

        The script can be executed by running:
        $ python3 runner.py

        This will execute the script code, serialize the resulting variables, and save them in "output.json".
    """

    with open("script.py", "r") as f:
        script = f.read()

    with open("variables.json", "r") as f:
        variables = Object(json.load(f))

    glob = {}

    variables['component'] = component
    variables['StopExec'] = StopExec

    exec(with_try_clause(script, StopExec), variables)
    exec("", glob)

    for key in glob:
        if key in variables and variables[key] == glob[key]:
            del variables[key]

    with open('output.json', 'w') as output:
      print(jsonify(variables, False), file=output)

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
  result: string;
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

  /**
   * Executes the Python sandbox with the provided input and script.
   * @param input The SandboxInput object.
   * @param script The Python script to execute.
   * @param timeout The timeout value for the execution.
   * @returns A Promise that resolves to a SandboxOutput object.
   * @throws {SandboxError} If an error occurs during execution.
   */
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
              result_path: 'output.json',
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
        variables: JSON.parse(response.result),
      });
    } catch (error) {
      if (error instanceof SandboxError) {
        throw error;
      }
      throw SandboxError.unknownError(error);
    }
  }

  /**
   * Packs the environment files into a tarball with gzip compression.
   * @param script The Python script.
   * @param input The SandboxInput object.
   * @param path The path of the temporary file to create.
   */
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
