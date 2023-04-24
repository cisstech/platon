/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApolloClientOptions, ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { HttpLink } from 'apollo-angular/http';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { TokenService } from '../auth';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  // React only on graphql errors
  if (graphQLErrors && graphQLErrors.length > 0) {
    const error = graphQLErrors[0] as any;
    const statusCode = error?.statusCode;
    if (statusCode >= 400 && statusCode < 500) {
      // handle client side error
      console.error(`[Client side error]: ${graphQLErrors[0].message}`);
    } else {
      // handle server side error
      console.error(`[Server side error]: ${graphQLErrors[0].message}`);
    }
  }
  if (networkError) {
    // handle network error
    console.error(`[Network error]: ${networkError.message}`);
  }
});

const basicContext = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  };
});

export function createDefaultApollo(
  httpLink: HttpLink,
  tokenService: TokenService,
): ApolloClientOptions<any> {
  const cache = new InMemoryCache({});

  const http = httpLink.create({
    uri: '/api/graphql',
  });

  const ws = new WebSocketLink({
    uri: 'wss://localhost/api/graphql',
    options: {
      reconnect: true,
      connectionParams: {
        Authorization: `Bearer ${tokenService.tokenSync()?.accessToken}`,
      }
    },
  });


  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    ws,
    http,
  );

  return {
    connectToDevTools: false,
    assumeImmutableResults: true,
    cache,
    link: ApolloLink.from([basicContext, errorLink, link]),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
    },
  };
}
