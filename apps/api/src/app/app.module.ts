import { Module } from '@nestjs/common';
import { CoreServerModule } from '@platon/core/server';


@Module({
  imports: [
    CoreServerModule,
  ],
})
export class AppModule {}
