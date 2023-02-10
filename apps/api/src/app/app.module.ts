import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CoreServerModule } from '@platon/core/server';
import { FeatureLtiServerModule, LTIMiddleware } from '@platon/feature/lti/server';
import { FeatureResourceServerModule } from '@platon/feature/resource/server';


@Module({
  imports: [
    CoreServerModule,
    FeatureLtiServerModule,
    FeatureResourceServerModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LTIMiddleware)
      .forRoutes('*');
  }
}
