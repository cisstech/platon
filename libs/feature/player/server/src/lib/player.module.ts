import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery'
import { HttpModule } from '@nestjs/axios'
import { Module, OnModuleInit } from '@nestjs/common'
import { FeatureCourseServerModule } from '@platon/feature/course/server'
import { FeatureResourceServerModule } from '@platon/feature/resource/server'
import { FeatureResultServerModule } from '@platon/feature/result/server'
import { PlayerController } from './player.controller'
import { PlayerService } from './player.service'
import { NodeSandbox, SANDBOX, Sandbox } from './sandboxes'
import { PythonSandbox } from './sandboxes/python/python-sandbox'
import { SandboxService } from './sandboxes/sandbox.service'

@Module({
  controllers: [PlayerController],
  imports: [
    HttpModule,
    DiscoveryModule,
    FeatureCourseServerModule,
    FeatureResultServerModule,
    FeatureResourceServerModule,
  ],
  providers: [PlayerService, NodeSandbox, PythonSandbox, SandboxService],
  exports: [PlayerService, SandboxService],
})
export class FeaturePlayerServerModule implements OnModuleInit {
  constructor(private readonly discovery: DiscoveryService, private readonly sandboxService: SandboxService) {}

  async onModuleInit(): Promise<void> {
    const providers = await this.discovery.providersWithMetaAtKey(SANDBOX)
    providers.forEach((provider) => {
      this.sandboxService.register(provider.discoveredClass.instance as Sandbox)
    })
  }
}
