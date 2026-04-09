# Codemaya Assignment RAG Backend

## Project overview

This project is a Node.js, Express, and MongoDB backend for a simple retrieval-augmented generation workflow. Documents are stored in MongoDB, retrieved with a lightweight keyword match, and used as context for the `/api/ask` endpoint. The backend also includes JWT-based authentication, request logging, rate limiting, centralized error handling, and per-user ask history.

## Tech stack

- Node.js
- Express
- MongoDB with Mongoose
- OpenAI API
- Zod
- JWT authentication
- Nodemon for development

## Folder structure

```text
server/
  server.js
  seed.js
  .env.example
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
```

## Setup instructions

1. Install dependencies:

```bash
cd server
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Fill in the values in `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rag-db
JWT_SECRET=abc

## How to run the project

Development:

```bash
cd server
npm run dev
```

Production:

```bash
cd server
npm start
```

## How to seed data

```bash
cd server
npm run seed
```

## How to run tests

```bash
cd server
npm test
```

## API endpoints

### Auth

Register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Demo User\",\"email\":\"demo@example.com\",\"password\":\"secret123\"}"
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@example.com\",\"password\":\"secret123\"}"
```

### Documents

Get all documents:

```bash
curl http://localhost:5000/api/docs
```

### Ask

Ask a question with auth:

```bash
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "{\"question\":\"What payment methods are accepted?\"}"
```

Get the last 10 asks for the authenticated user:

```bash
curl http://localhost:5000/api/ask/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Example `/api/ask` response:

```json
{
  "answer": "Refunds are processed within 5-7 business days.",
  "sources": ["6614f24d7d9d1c3f8cb1b234"],
  "confidence": "medium",
  "latency": 342
}
```

## Auth flow

1. Register a user with `/api/auth/register`
2. Log in with `/api/auth/login`
3. Copy the returned JWT token
4. Send the token in the `Authorization: Bearer <token>` header for `/api/ask`
5. Use the same token for `/api/ask/history`
6. `/api/ask` is protected by JWT and is rate-limited to 10 requests per minute per user

## Notes on the RAG implementation

- Documents are stored in MongoDB in the `Doc` collection
- Retrieval scores documents using question overlap against `title`, `content`, and `tags`
- The top matching documents are merged into a grounded context block and sent to OpenAI
- The LLM response is validated with Zod to enforce `{ answer, sources, confidence }`
- If no relevant document is found, the API returns `Not available in documents`
- Sources are returned as matching MongoDB document IDs

## Production readiness notes

- `/api/ask` is protected by JWT and rate-limited per user
- Structured console logs are emitted for ask requests and request failures
- Errors are handled by centralized middleware with clean JSON responses
- Stack traces are hidden automatically when `NODE_ENV=production`
