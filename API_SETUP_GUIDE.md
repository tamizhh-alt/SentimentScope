# API Setup Guide for Sentiment Analysis Application

This guide will help you configure the necessary API keys and services to make your sentiment analysis application fully functional.

## 🔧 Required API Keys

### 1. HuggingFace API Key (Required for Sentiment Analysis)
**Purpose**: Powers the core sentiment analysis and emotion detection features.

**Steps to get your API key**:
1. Visit [HuggingFace](https://huggingface.co/)
2. Create a free account or sign in
3. Go to your [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token"
5. Give it a name (e.g., "Sentiment Analysis App")
6. Select "Read" permissions
7. Copy the generated token (starts with `hf_`)

**Free Tier**: 1,000 requests per month
**Paid Tier**: Starting at $9/month for 10,000 requests

### 2. Google Cloud Translation API Key (Optional - for multi-language support)
**Purpose**: Enables automatic language detection and translation.

**Steps to get your API key**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Cloud Translation API"
4. Go to "Credentials" > "Create Credentials" > "API Key"
5. Copy the generated API key (starts with `AIzaSy`)
6. (Optional) Restrict the key to Translation API only for security

**Free Tier**: $10 credit per month (≈500,000 characters)
**Pricing**: $20 per 1M characters after free tier

### 3. OpenAI API Key (Optional - for advanced features)
**Purpose**: Enhanced text analysis and summarization features.

**Steps to get your API key**:
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the generated key (starts with `sk-`)

**Pricing**: Pay-per-use, starting at $0.002 per 1K tokens

## 🔐 Environment Configuration

### Step 1: Copy the Environment Template
```bash
cp .env.example .env
```

### Step 2: Edit the .env File
Open the `.env` file and replace the dummy values with your actual API keys:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017/sentiment-analysis
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# API Keys - Replace these with your actual API keys
HUGGINGFACE_API_KEY=hf_your_actual_huggingface_key_here
GOOGLE_TRANSLATE_API_KEY=AIzaSy_your_actual_google_translate_key_here
OPENAI_API_KEY=sk-your_actual_openai_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

### Step 3: Secure Your Environment File
Make sure your `.env` file is not committed to version control:
```bash
echo ".env" >> .gitignore
```

## 🚀 Starting the Application

### Development Mode
```bash
npm run dev
```
This starts both the frontend (port 5173) and backend (port 3001) simultaneously.

### Production Mode
```bash
npm run build
npm start
```

## 🧪 Testing API Keys

### Check API Health
Visit `http://localhost:3001/api/health` to see which services are configured:

```json
{
  "status": "OK",
  "services": {
    "huggingface": "configured",
    "googleTranslate": "configured",
    "openai": "configured"
  }
}
```

### Test Sentiment Analysis
```bash
curl -X POST http://localhost:3001/api/sentiment/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this product!", "includeEmotions": true}'
```

## 🔒 Security Best Practices

### 1. API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Restrict API key permissions when possible

### 2. Rate Limiting
The application includes built-in rate limiting:
- 100 requests per 15 minutes per IP address
- Configurable via environment variables

### 3. Input Validation
All inputs are validated and sanitized:
- Text length limits (10,000 characters max)
- File size limits (10MB max)
- File type restrictions

## 🛠️ Troubleshooting

### Common Issues

**1. "API key not configured" errors**
- Check that your `.env` file exists and contains the correct keys
- Restart the server after updating environment variables
- Verify API keys don't contain extra spaces or quotes

**2. HuggingFace API errors**
- Ensure your API key has "Read" permissions
- Check if you've exceeded your monthly quota
- Some models may take time to "warm up" on first use

**3. Google Translate API errors**
- Verify the Translation API is enabled in Google Cloud Console
- Check your billing account is set up (required even for free tier)
- Ensure API key restrictions allow your server's IP

**4. File upload issues**
- Check file size (max 10MB)
- Verify file format (CSV, JSON, Excel, TXT only)
- Ensure upload directory has write permissions

### Debug Mode
Set `NODE_ENV=development` in your `.env` file to see detailed error messages and stack traces.

## 📊 Monitoring Usage

### API Usage Tracking
Monitor your API usage through the respective dashboards:
- **HuggingFace**: [Usage Dashboard](https://huggingface.co/settings/billing)
- **Google Cloud**: [Cloud Console Billing](https://console.cloud.google.com/billing)
- **OpenAI**: [Usage Dashboard](https://platform.openai.com/usage)

### Application Metrics
The application provides built-in metrics at `/api/health`:
- Cache hit rates
- Processing times
- Error rates

## 🔄 Fallback Behavior

The application is designed to work even without API keys:
- **Without HuggingFace**: Uses intelligent mock sentiment analysis
- **Without Google Translate**: Uses heuristic language detection
- **Without OpenAI**: Disables advanced summarization features

This allows you to:
1. Test the application immediately
2. Gradually add API keys as needed
3. Maintain functionality during API outages

## 📞 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your API keys are correctly formatted
3. Test individual API endpoints using the provided curl commands
4. Check the respective API service status pages

## 🎯 Next Steps

Once your APIs are configured:
1. Test all features with sample data
2. Configure database connections for persistence
3. Set up monitoring and alerting
4. Deploy to your production environment
5. Configure domain-specific rate limits

---

**Note**: The application will work with mock data even without API keys, allowing you to test the interface and functionality before setting up external services.