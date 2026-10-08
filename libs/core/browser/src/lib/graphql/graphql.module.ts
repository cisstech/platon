import { NgModule } from '@angular/core'
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular'
import { HttpLink } from 'apollo-angular/http'
import { TokenService } from '../auth/api/token.service'
import { createDefaultApollo } from './graphql.config'

@NgModule({
  imports: [ApolloModule],
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createDefaultApollo,
      deps: [HttpLink, TokenService],
    },
  ],
})
export class GraphQLModule {}
