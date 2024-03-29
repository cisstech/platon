import { basename } from '@platon/core/common'
import { ExerciseVariables, PLSourceFile, withExerciseMeta } from '@platon/feature/compiler'
import { Sandbox, SandboxEnvironment, SandboxInput, SandboxOutput } from './sandbox.model'

export class SandboxManager {
  private readonly sandboxes: Sandbox[] = []

  register(sandbox: Sandbox): void {
    this.sandboxes.push(sandbox)
  }

  async build(source: PLSourceFile<ExerciseVariables>): Promise<SandboxOutput> {
    let envid: string | undefined

    let variables = withExerciseMeta(source.variables)
    const sandbox = this.sandboxes.find((sandbox) => sandbox.supports(source))
    if (!sandbox) {
      throw new Error(`No sandbox found for the given source file`)
    }

    if (variables.builder || source.dependencies.length) {
      variables.meta = { ...variables['.meta'] }

      const response = await sandbox.run(
        {
          files: source.dependencies.map((file) => ({
            path: file.alias || basename(file.abspath),
            content: file.content,
          })),
          variables,
        },
        variables.builder as string,
        10_0000
      )

      delete response.variables.meta
      response.variables['.meta'] = variables['.meta']

      envid = response.envid
      variables = response.variables
    }

    return {
      envid,
      variables,
    }
  }

  async run(input: SandboxInput, script: string): Promise<SandboxOutput> {
    const sandbox = this.sandboxes.find((sandbox) => sandbox.supports(input))
    if (!sandbox) {
      throw new Error(`No sandbox found for the given source file`)
    }

    input.variables.meta = { ...input.variables['.meta'] }

    const output = await sandbox.run(input, script, 10_0000)

    delete output.variables.meta
    output.variables['.meta'] = input.variables['.meta']

    return output
  }

  async downloadEnvironment(input: PLSourceFile<ExerciseVariables>, envid: string): Promise<SandboxEnvironment> {
    const sandbox = this.sandboxes.find((sandbox) => sandbox.supports(input))
    if (!sandbox) {
      throw new Error(`No sandbox found for the given source file`)
    }

    return sandbox.downloadEnvironment(envid)
  }
}
