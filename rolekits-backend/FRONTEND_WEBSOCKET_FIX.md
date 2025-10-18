# Frontend WebSocket Fix

Your backend is working correctly, but the frontend subscription is not reaching the server.

## Problem
The WebSocket connects (`🔌 WebSocket connecting with token: Present`) but the subscription query never executes on the backend.

## Solution

Update your `lib/apollo-client.ts` file:

```typescript
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
  uri: 'http://localhost:4003/graphql',
  credentials: 'include',
});

// Create WebSocket link
const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4003/graphql',
    connectionParams: () => {
      const token = localStorage.getItem('token');
      console.log('🔑 Setting up WebSocket with token:', token ? 'Token present' : 'No token');
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
    on: {
      connected: () => console.log('🔗 WebSocket connected'),
      closed: (event) => console.log('🔌 WebSocket closed', event),
      error: (error) => console.error('❌ WebSocket error:', error),
    },
  })
) : null;

// Use split to route queries/mutations to HTTP and subscriptions to WebSocket
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
      httpLink
    )
  : httpLink;

// Add auth token to HTTP requests
const authLink = typeof window !== 'undefined' 
  ? new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'network-only',
        },
      },
    }).setLink(
      splitLink.concat((operation, forward) => {
        const token = localStorage.getItem('token');
        operation.setContext({
          headers: {
            authorization: token ? `Bearer ${token}` : '',
          },
        });
        return forward(operation);
      })
    )
  : new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
    });

const apolloClient = authLink;

export default apolloClient;
```

## Key Changes

1. **Proper split configuration** - Routes subscriptions to WebSocket, queries/mutations to HTTP
2. **GraphQLWsLink** - Uses the correct link for subscriptions
3. **Connection params** - Passes auth token to WebSocket connection
4. **Event handlers** - Logs connection status for debugging

## Test After Update

1. Refresh the CV page
2. **Backend should now show**:
   ```
   🔌 WebSocket connecting with token: Present
   ========================================
   Client subscribed to CV updates for: 4d464ba2-9766-4acd-967e-b75d3ffddef8
   User: { userId: '...', username: '...' }
   ========================================
   Sending initial CV data: Your Name
   Filter check: 4d464ba2-... === 4d464ba2-... = true
   ```

3. **Frontend should show**:
   ```
   ✅ Received CV update: {fullName: "Your Name", ...}
   ```

4. Update from Postman → Instant update! 🚀
