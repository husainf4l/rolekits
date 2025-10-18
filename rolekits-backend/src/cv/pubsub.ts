import { PubSub } from 'graphql-subscriptions';

// Shared PubSub instance for the entire application
export const pubSub = new PubSub();
