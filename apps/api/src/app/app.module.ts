import { Module } from '@nestjs/common';
import { CoreServerModule, UserModule } from '@platon/core/server';


@Module({
  imports: [
    CoreServerModule,
    UserModule
  ],
})
export class AppModule {}
