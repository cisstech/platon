import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CoreServerModule } from '@platon/core/server';
import { FeatureLtiServerModule, LTIMiddleware } from '@platon/feature/lti/server';
import { FeaturePlayerServerModule } from '@platon/feature/player/server';
import { FeatureResourceServerModule } from '@platon/feature/resource/server';
import { FeatureCourseServerModule } from '@platon/feature/course/server';
import { FeatureAnswerServerModule } from '@platon/feature/answer/server';

@Module({
  imports: [
    CoreServerModule,
    FeatureLtiServerModule,
    FeatureCourseServerModule,
    FeaturePlayerServerModule,
    FeatureAnswerServerModule,
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
