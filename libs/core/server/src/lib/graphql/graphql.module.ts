
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

@Module({
  imports: [
    // https://docs.nestjs.com/graphql/quick-start
    // https://wanago.io/2021/02/15/api-nestjs-real-time-graphql-subscriptions/
    NestGraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: Boolean(process.env.GRAPHQL_PLAYGROUND),
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      // https://docs.nestjs.com/graphql/subscriptions#enable-subscriptions-with-apollo-driver
      installSubscriptionHandlers: true,
      //subscriptions: {
       // 'graphql-ws': true,
      //},
      useGlobalPrefix: true,
      formatError: (error) => {
          console.log('ERRRO', error)
        return error
      }
    }),
  ],
  providers: [ConfigService],
  exports: [
    NestGraphQLModule,
  ],
})
export class GraphQLModule { }
