# Testing GraphQL API with Postman

## Method 1: Using Postman's GraphQL Feature

1. **Create New Request** → Select "GraphQL" as request type
2. **URL**: `http://127.0.0.1:8003/graphql`
3. **Click "Schema" button** - Postman will fetch the schema
4. **Use Query builder** or write queries manually

---

## Method 2: Using POST with JSON Body

If GraphQL option doesn't work, use this method:

### Setup:
- **Method**: `POST`
- **URL**: `http://127.0.0.1:8003/graphql`
- **Headers**:
  ```
  Content-Type: application/json
  ```

### Request Body Examples:

#### 1. Signup (No Auth Required)
```json
{
  "query": "mutation Signup($username: String!, $password: String!) { signup(input: { username: $username, password: $password }) { id username } }",
  "variables": {
    "username": "testuser",
    "password": "testpass123"
  }
}
```

Or without variables:
```json
{
  "query": "mutation { signup(input: { username: \"testuser\", password: \"testpass123\" }) { id username } }"
}
```

#### 2. Login (No Auth Required)
```json
{
  "query": "mutation { login(input: { username: \"testuser\", password: \"testpass123\" }) { accessToken tokenType } }"
}
```

**Response will contain:**
```json
{
  "data": {
    "login": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "bearer"
    }
  }
}
```

#### 3. Get Current User (Auth Required)

**Add to Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Request Body:**
```json
{
  "query": "query { me { id username } }"
}
```

#### 4. Get All My CVs (Auth Required)
```json
{
  "query": "query { myCvs { id fullName email summary skills } }"
}
```

#### 5. Create CV (Auth Required)
```json
{
  "query": "mutation CreateCV($input: CVInput!) { createCv(input: $input) { id fullName email createdAt } }",
  "variables": {
    "input": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "summary": "Experienced developer",
      "skills": ["Python", "FastAPI", "GraphQL"]
    }
  }
}
```

#### 6. Get Schema (Introspection Query)
```json
{
  "query": "query IntrospectionQuery { __schema { queryType { name fields { name } } mutationType { name fields { name } } } }"
}
```

---

## Quick Test Collection

### Step 1: Signup
POST `http://127.0.0.1:8003/graphql`
```json
{
  "query": "mutation { signup(input: { username: \"john\", password: \"pass123\" }) { id username } }"
}
```

### Step 2: Login
POST `http://127.0.0.1:8003/graphql`
```json
{
  "query": "mutation { login(input: { username: \"john\", password: \"pass123\" }) { accessToken tokenType } }"
}
```

### Step 3: Get User Info (add token to headers)
POST `http://127.0.0.1:8003/graphql`
Headers: `Authorization: Bearer <token_from_step_2>`
```json
{
  "query": "query { me { id username } }"
}
```

---

## Testing Schema Introspection

To check if schema introspection is working:

```json
{
  "query": "{ __schema { types { name } } }"
}
```

This should return all GraphQL types in the schema.

---

## Common Issues

1. **"Syntax Error: Unexpected EOF"** - Make sure you're sending a query in the body
2. **"Field required"** - Make sure Content-Type is `application/json`
3. **401/403 errors** - Add Authorization header with Bearer token
4. **Schema not loading** - Try the introspection query manually

---

## Alternative: Use Thunder Client (VS Code Extension)

If Postman doesn't work well, try Thunder Client:
1. Install "Thunder Client" extension in VS Code
2. Create new request
3. Select GraphQL
4. It works better with Strawberry GraphQL
