import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { AuthModule } from './auth/auth.module';
import { ConfigurationModule } from './config/configuration.module';
import { DatabaseModule } from './database/database.module';
import { ErrorsModule } from './errors/errors.module';
import { EventModule } from './events/event.module';
import { GraphQLModule } from './graphql/graphql.module';
import { LevelModule } from './levels';
import { PubSubModule } from './pubsub/pubsub.module';
import { TopicModule } from './topics';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    GraphQLModule,
    PubSubModule,
    UserModule,
    AuthModule,
    TopicModule,
    LevelModule,
    ErrorsModule,
    EventModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),

  ],
  exports: [
    ConfigurationModule,
    DatabaseModule,
    GraphQLModule,
    PubSubModule,
    UserModule,
    AuthModule,
    TopicModule,
    LevelModule,
    ErrorsModule,
    ClsModule,
  ],
})
export class CoreServerModule { }
