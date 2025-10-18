# System API Key Generation

## Overview
A system user has been created with full access to all operations. You can generate API keys for this system user using the GraphQL mutation.

## System User Details
- **Username**: `system`
- **User ID**: `e88b5d04-5274-47ef-aa05-4ae8596f17ed`
- **Purpose**: Administrative operations, background jobs, system integrations

## Generate New System API Key

### Using GraphQL Playground

1. Open: http://localhost:4003/graphql

2. Run this mutation:

```graphql
mutation {
  generateSystemApiKey(secretCode: "changeme123")
}
```

3. The response will be:
```json
{
  "data": {
    "generateSystemApiKey": "rk_system_1234567890abcdef..."
  }
}
```

4. **SAVE THIS KEY IMMEDIATELY** - it cannot be retrieved again!

### Using Postman

**Request:**
```
POST http://localhost:4003/graphql
Content-Type: application/json
```

**Body:**
```json
{
  "query": "mutation { generateSystemApiKey(secretCode: \"changeme123\") }"
}
```

**Response:**
```json
{
  "data": {
    "generateSystemApiKey": "rk_system_abcd1234..."
  }
}
```

### Using cURL

```bash
curl -X POST http://localhost:4003/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { generateSystemApiKey(secretCode: \"changeme123\") }"}'
```

## Using the System API Key

Once you have your system API key, use it in the `Authorization` header:

### GraphQL Playground
```
Headers:
{
  "Authorization": "Bearer rk_system_your_key_here"
}
```

### Postman
```
Authorization Tab:
Type: Bearer Token
Token: rk_system_your_key_here
```

### cURL
```bash
curl -X POST http://localhost:4003/graphql \
  -H "Authorization: Bearer rk_system_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { myCvs { id fullName } }"}'
```

## Security Configuration

### Change the Secret Code

For production, change the secret code by setting the `SYSTEM_SECRET` environment variable:

**.env**
```bash
SYSTEM_SECRET=your_super_secure_secret_here_use_random_string
```

Then use your custom secret in the mutation:
```graphql
mutation {
  generateSystemApiKey(secretCode: "your_super_secure_secret_here_use_random_string")
}
```

### Best Practices

1. **Store Securely**: Save the system API key in a password manager or secrets vault
2. **Environment Variables**: Use environment variables to inject the key in production
3. **Rotate Regularly**: Generate new keys periodically and revoke old ones
4. **Monitor Usage**: Track API key usage via the `lastUsedAt` field
5. **Limit Exposure**: Don't commit API keys to version control

## Example Usage

### Create CV as System User
```graphql
mutation {
  createCV(input: {
    fullName: "John Doe"
    email: "john@example.com"
    address: "123 Main St"
  }) {
    id
    fullName
    email
  }
}
```

Headers:
```json
{
  "Authorization": "Bearer rk_system_your_key_here"
}
```

### Query All CVs (System Access)
```graphql
query {
  myCvs {
    id
    fullName
    email
    userId
  }
}
```

## Manage API Keys

### List All Keys for System User
First, login as system user or use existing system API key:

```graphql
query {
  myApiKeys {
    id
    name
    active
    createdAt
    lastUsedAt
    expiresAt
  }
}
```

### Revoke a Key
```graphql
mutation {
  revokeApiKey(id: "key-id-here")
}
```

### Delete a Key
```graphql
mutation {
  deleteApiKey(id: "key-id-here")
}
```

## Troubleshooting

### "Invalid secret code" Error
Make sure you're using the correct secret:
- Default: `changeme123`
- Custom: Value from `SYSTEM_SECRET` environment variable

### "Unauthorized" Error
Check that:
1. Your API key starts with `rk_system_`
2. The key is included in the `Authorization` header as `Bearer <key>`
3. The key hasn't been revoked or deleted
4. The key hasn't expired

### Generate Multiple Keys
You can generate multiple system API keys for different purposes:
- Development environment
- Production environment
- CI/CD pipeline
- Background jobs
- Emergency access

Each call to `generateSystemApiKey` creates a new key.
