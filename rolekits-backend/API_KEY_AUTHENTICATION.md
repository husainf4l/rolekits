# API Key Authentication

Your backend now supports **both JWT tokens and API keys** for authentication!

## ✅ What Was Implemented

1. **API Key Entity** - Stores hashed API keys with expiration, last used timestamp
2. **API Key Service** - Create, validate, list, revoke, and delete API keys
3. **API Key Resolver** - GraphQL mutations/queries for managing API keys
4. **Combined Auth Guard** - Accepts both JWT tokens and API keys

## 🔑 How to Use

### Creating an API Key

```graphql
mutation CreateApiKey {
  createApiKey(input: {
    name: "My API Key"
    expiresInDays: 90  # Optional, defaults to no expiration
  }) {
    key  # ⚠️ Save this! Only shown once!
    apiKey {
      id
      name
      active
      expiresAt
      createdAt
    }
  }
}
```

**Important:** The `key` field is only returned once! Save it securely.

### Using an API Key

In any HTTP request or WebSocket connection, use the API key instead of JWT:

```bash
# HTTP Request
curl -H "Authorization: Bearer rk_abc123..." \
  http://localhost:4003/graphql

# Or with "ApiKey" prefix
curl -H "Authorization: ApiKey rk_abc123..." \
  http://localhost:4003/graphql
```

### Listing Your API Keys

```graphql
query MyApiKeys {
  myApiKeys {
    id
    name
    active
    lastUsedAt
    expiresAt
    createdAt
  }
}
```

### Revoking an API Key

```graphql
mutation RevokeApiKey {
  revokeApiKey(id: "key-id-here")
}
```

### Deleting an API Key

```graphql
mutation DeleteApiKey {
  deleteApiKey(id: "key-id-here")
}
```

## 🔒 Security Features

- **Hashed Storage** - Keys are hashed with SHA-256 (like passwords)
- **Prefix** - All keys start with `rk_` for identification
- **Expiration** - Optional expiration dates
- **Last Used** - Tracks when each key was last used
- **Revocation** - Can be deactivated without deletion
- **User Scoped** - Each key is tied to a specific user

## 🚀 Usage Examples

### For Frontend (React/Next.js)

```typescript
// Store API key in localStorage or environment variable
const API_KEY = 'rk_abc123...';

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4003/graphql',
    headers: {
      authorization: `Bearer ${API_KEY}`,
    },
  }),
  cache: new InMemoryCache(),
});
```

### For Backend Services

```javascript
const response = await fetch('http://localhost:4003/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer rk_abc123...',
  },
  body: JSON.stringify({
    query: '{ myCvs { id fullName } }',
  }),
});
```

### For Postman

1. Go to **Headers** tab
2. Add header: `Authorization: Bearer rk_abc123...`
3. Works for both queries/mutations and subscriptions!

## 📝 API Key Format

```
rk_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd
└┬┘└────────────────────────────┬────────────────────────────────┘
 │                               │
prefix                      64 hex characters
```

## 🎯 Use Cases

- **Mobile Apps** - Long-lived authentication without refresh tokens
- **Backend Services** - Service-to-service communication
- **CI/CD Pipelines** - Automated deployments
- **Third-Party Integrations** - Give limited access to external services
- **Development** - Easier than managing JWT tokens during development

## ⚙️ Configuration

API keys work with the existing JWT configuration. No additional environment variables needed!

## 🔄 Migration Note

**Your current JWT authentication still works!** This is additive - clients can choose to use either JWT tokens or API keys.

---

🎉 **You can now use API keys for authentication alongside JWT tokens!**
