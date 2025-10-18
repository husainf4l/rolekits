# GraphQL API Examples

## How to Use

1. **Open GraphiQL Interface**: Navigate to `http://127.0.0.1:8003/graphql` in your browser
2. **Enter your query/mutation** in the left panel
3. **Click the Play button** to execute
4. **For authenticated requests**: Add token in HTTP Headers (bottom left):
   ```json
   {
     "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
   }
   ```

---

## Authentication

### Signup (No token required)
```graphql
mutation {
  signup(input: {
    username: "johndoe"
    password: "securepassword123"
  }) {
    id
    username
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "signup": {
      "id": 1,
      "username": "johndoe"
    }
  }
}
```

### Login (No token required)
```graphql
mutation {
  login(input: {
    username: "johndoe"
    password: "securepassword123"
  }) {
    accessToken
    tokenType
  }
}
```

**Expected Response:**
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

**⚠️ Copy the `accessToken` and add it to HTTP Headers for the following queries:**

---

## CV Operations (Requires Authentication)

### Get Current User
```graphql
query {
  me {
    id
    username
  }
}
```

### Get All My CVs
```graphql
query {
  myCvs {
    id
    fullName
    email
    summary
    createdAt
    skills
    experience {
      company
      position
      startDate
      endDate
    }
    education {
      institution
      degree
      fieldOfStudy
    }
  }
}
```

### Get Single CV
```graphql
query {
  cv(cvId: 1) {
    id
    fullName
    email
    phone
    summary
    experience {
      company
      position
      startDate
      endDate
      description
    }
    education {
      institution
      degree
      fieldOfStudy
      startDate
      endDate
    }
    skills
  }
}
```

### Create CV
```graphql
mutation {
  createCv(input: {
    fullName: "John Doe"
    email: "john@example.com"
    phone: "+1234567890"
    summary: "Experienced software developer with 5+ years"
    experience: [
      {
        company: "Tech Corp"
        position: "Senior Developer"
        startDate: "2020-01"
        endDate: "2023-12"
        description: "Led development team"
        location: "New York"
      }
    ]
    education: [
      {
        institution: "University"
        degree: "Bachelor's"
        fieldOfStudy: "Computer Science"
        startDate: "2016-09"
        endDate: "2020-06"
        grade: "3.8 GPA"
      }
    ]
    skills: ["Python", "FastAPI", "GraphQL", "PostgreSQL"]
    languages: [
      {
        language: "English"
        proficiency: "Native"
      }
    ]
  }) {
    id
    fullName
    email
    createdAt
  }
}
```

### Update CV
```graphql
mutation {
  updateCv(cvId: 1, input: {
    summary: "Updated professional summary"
    skills: ["Python", "FastAPI", "GraphQL", "PostgreSQL", "Docker"]
  }) {
    id
    fullName
    summary
    skills
    updatedAt
  }
}
```

### Delete CV
```graphql
mutation {
  deleteCv(cvId: 1)
}
```

---

## Testing Flow

1. **Signup**: Create a new user account
2. **Login**: Get your JWT token
3. **Add Token**: In GraphiQL, click "HTTP Headers" at the bottom and add:
   ```json
   {
     "Authorization": "Bearer YOUR_TOKEN_FROM_LOGIN"
   }
   ```
4. **Create CV**: Use the createCv mutation
5. **Query CVs**: Use myCvs query to see your CVs
6. **Update/Delete**: Use the CV ID from your queries

---

## GraphQL Playground

Access the interactive GraphQL playground at:
```
http://127.0.0.1:8003/graphql
```

Features:
- 🔍 Auto-completion (Ctrl+Space)
- 📖 Schema documentation (click "Docs" on the right)
- 🎨 Syntax highlighting
- 📝 Query history
- 🔐 HTTP Headers panel for authentication
