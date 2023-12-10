import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { CoreServerModule } from '@platon/core/server'
import { FeatureCourseServerModule } from '@platon/feature/course/server'
import { FeatureLtiServerModule, LTIMiddleware } from '@platon/feature/lti/server'
import { FeatureNotificationServerModule } from '@platon/feature/notification/server'
import { FeaturePlayerServerModule } from '@platon/feature/player/server'
import { FeatureResourceServerModule } from '@platon/feature/resource/server'
import { FeatureResultServerModule } from '@platon/feature/result/server'
import { CommandsModule } from './commands/commands.module'

@Module({
  imports: [
    CoreServerModule,
    FeatureLtiServerModule,
    FeatureCourseServerModule,
    FeaturePlayerServerModule,
    FeatureResultServerModule,
    FeatureResourceServerModule,
    FeatureNotificationServerModule,

    CommandsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LTIMiddleware).forRoutes('*')
  }
}
