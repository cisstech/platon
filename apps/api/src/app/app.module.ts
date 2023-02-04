import { Module } from '@nestjs/common';
import { CoreServerModule } from '@platon/core/server';
import { FeatureLtiServerModule } from '@platon/feature/lti/server';


@Module({
  imports: [
    CoreServerModule,
    FeatureLtiServerModule
  ],
})
export class AppModule {}
