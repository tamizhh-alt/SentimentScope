# SentimentScope

End-to-end sentiment and emotion analysis app with single text analysis, file upload batching, and analytics dashboard.

## Quick Start

### Prerequisites
- Node.js 18+

### Environment
Create two env files:

Backend `.env` (in `server/` root or project root since dotenv is loaded in server):

```
PORT=3001
NODE_ENV=development
MONGODB_URI=
HUGGINGFACE_API_KEY=
HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models
OPENAI_API_KEY=
GOOGLE_TRANSLATE_API_KEY=
GOOGLE_TRANSLATE_API_URL=https://translation.googleapis.com/language/translate/v2
CORS_ALLOWED_ORIGINS=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
JWT_SECRET=dev-secret
```

Frontend `.env` (project root):

```
VITE_API_URL=http://localhost:3001
```

If API keys are not provided, mock fallbacks are used (HF/OpenAI/Google). See Notes below.

### Install & Run

```
npm install
npm run dev
```

Client: `http://localhost:5173`

Server health: `http://localhost:3001/api/health`

## API Smoke Tests

```
curl http://localhost:3001/api/health | jq

curl -X POST "http://localhost:3001/api/sentiment/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text":"I love this! Amazing experience.","language":"auto","includeEmotions":true,"detectLanguage":true}' | jq

curl -X POST "http://localhost:3001/api/analytics/dashboard" -s || echo "GET only"

curl "http://localhost:3001/api/analytics/dashboard?timeRange=7d&sentimentFilter=all" | jq

curl -X POST "http://localhost:3001/api/files/upload" \
  -F file=@samples/test.csv \
  -F includeEmotions=true \
  -F batchSize=100 \
  -F textColumn=text | jq
```

## Language Handling
- All analyses are normalized to English for parity:
  - Single: auto-detects and translates to English when needed.
  - Batch/File: detects/translate each text similarly.

## Configuration
- Frontend uses `VITE_API_URL` for all requests.
- Backend CORS allows origins from `CORS_ALLOWED_ORIGINS` (comma-separated) in production; dev is permissive.

## Mock vs Real Mode
- If `HUGGINGFACE_API_KEY` or `OPENAI_API_KEY` or `GOOGLE_TRANSLATE_API_KEY` are missing or dummy, backend uses mock logic.
- Provide real keys to enable production-grade inference.

## Development Notes
- Pure ESM backend with a single `connectDB()` path.
- Centralized request validation via `server/utils/validation.js`.

## Testing Checklist
See `TESTING.md` for a full smoke-test checklist.


