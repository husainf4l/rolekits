'use client';

import React from 'react';
import { ApolloClient, InMemoryCache, ApolloLink, createHttpLink } from '@apollo/client/core';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import apolloClient from '@/lib/apollo-client';

export function ApolloProviderWrapper({ children }: { children: React.ReactNode }) {
  return <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>;
}
