import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = createHttpLink({
  uri: 'http://localhost:4003/graphql',
});

// WebSocket link for subscriptions
const wsLink = typeof window !== 'undefined' 
  ? new GraphQLWsLink(
      createClient({
        url: 'ws://localhost:4003/graphql',
        connectionParams: async () => {
          const token = localStorage.getItem('accessToken');
          console.log('🔑 Setting up WebSocket with token:', token ? 'Token present' : 'No token');
          
          // Return in the format NestJS GraphQL expects
          return {
            token: token,
            authorization: token ? `Bearer ${token}` : '',
            Authorization: token ? `Bearer ${token}` : '',
            authToken: token,
          };
        },
        // Keep connection alive
        keepAlive: 10000,
        // Lazy connection - only connect when subscription is active
        lazy: false,
        // Reconnection configuration
        retryAttempts: 5,
        shouldRetry: () => true,
        on: {
          connected: (socket) => {
            console.log('🔗 WebSocket connected', socket);
          },
          ping: (received) => {
            console.log('🏓 Ping', received ? 'received' : 'sent');
          },
          pong: (received) => {
            console.log('🏓 Pong', received ? 'received' : 'sent');
          },
          message: (message) => {
            console.log('📨 WebSocket message:', message);
            // Log full message including errors
            const msg = message as any;
            if (msg?.payload?.errors) {
              console.error('❌ GraphQL errors in message:', msg.payload.errors);
            }
          },
          error: (error) => {
            console.error('❌ WebSocket error:', error);
          },
          closed: (event) => {
            console.log('🔌 WebSocket closed', event);
            const closeEvent = event as CloseEvent;
            if (closeEvent.code === 4500) {
              console.error('❌ Backend error: Check if backend expects different connectionParams format');
              console.log('💡 Try testing subscription in Postman or check backend logs');
            }
          },
        },
      })
    )
  : null;

const authLink = new ApolloLink((operation, forward) => {
  // Get the authentication token from local storage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    }
  });
  
  return forward(operation);
});

// Split based on operation type: subscriptions go through WebSocket, queries/mutations through HTTP
const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink),
    )
  : authLink.concat(httpLink);

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      CV: {
        keyFields: ['id'],
      },
    },
  }),
  // Enable subscriptions
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default apolloClient;
