import { DiscoveryService } from '@golevelup/nestjs-discovery'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ExerciseVariables, PLSourceFile, withExerciseMeta } from '@platon/feature/compiler'
import { basename } from 'path'
import { SANDBOX, Sandbox, SandboxInput, SandboxOutput } from './sandbox'

@Injectable()
export class SandboxService implements OnModuleInit {
  private readonly sandboxes: Sandbox[] = []

  constructor(private readonly discovery: DiscoveryService) {}

  async onModuleInit(): Promise<void> {
    const providers = await this.discovery.providersWithMetaAtKey(SANDBOX)
    providers.forEach((provider) => {
      this.sandboxes.push(provider.discoveredClass.instance as Sandbox)
    })
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
}
