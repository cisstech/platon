/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { TokenService } from '../auth';
import { GRAPHQL_ENV, createDefaultApollo } from './graphql.config';

@NgModule({
  imports: [ApolloModule],
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createDefaultApollo,
      deps: [HttpLink, TokenService, GRAPHQL_ENV],
    },
  ],
})
export class GraphQLModule { }
