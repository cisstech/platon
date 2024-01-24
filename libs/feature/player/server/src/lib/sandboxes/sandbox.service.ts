import { DiscoveryService } from '@golevelup/nestjs-discovery'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Sandbox, SandboxManager } from '@platon/feature/player/common'
import { SANDBOX } from './sandbox'

@Injectable()
export class SandboxService extends SandboxManager implements OnModuleInit {
  constructor(private readonly discovery: DiscoveryService) {
    super()
  }

  async onModuleInit(): Promise<void> {
    const providers = await this.discovery.providersWithMetaAtKey(SANDBOX)
    providers.forEach((provider) => {
      this.register(provider.discoveredClass.instance as Sandbox)
    })
  }
}
