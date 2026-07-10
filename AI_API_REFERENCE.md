# AI Assistant API Reference

## Base URL
```
http://localhost:5000/api/ai
```

---

## Endpoints

### 1. Chat with AI Assistant

**Endpoint**: `POST /api/ai/chat`

**Public** ✅ (No authentication required)

**Description**: Send a message and get a response from the AI assistant

**Request Body**:
```json
{
  "message": "What projects have you built?",
  "history": [
    {
      "role": "user",
      "text": "Hi there"
    },
    {
      "role": "model",
      "text": "Hello! I'm Abinash's AI Portfolio Assistant..."
    }
  ]
}
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `message` | string | Yes | The user's question or message |
| `history` | array | No | Previous conversation turns for context |

**Response Success** (200):
```json
{
  "reply": "Abinash has built several projects including..."
}
```

**Response Error** (400):
```json
{
  "error": "Invalid input",
  "message": "Message is required and must be a non-empty string"
}
```

**Response Error** (403):
```json
{
  "error": "Service unavailable",
  "message": "AI Portfolio Assistant is currently disabled"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about Abinash",
    "history": []
  }'
```

**Example JavaScript**:
```javascript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What is your experience?',
    history: conversationHistory
  })
});
const data = await response.json();
console.log(data.reply);
```

---

### 2. Get AI Settings

**Endpoint**: `GET /api/ai/settings`

**Public** ✅ (No authentication required)

**Description**: Retrieve AI assistant configuration

**Response Success** (200):
```json
{
  "enabled": true,
  "welcome_message": "Hi, I'm Abinash's AI Assistant. How can I help?",
  "suggested_questions": [
    "What projects has Abinash built?",
    "What are his skills?",
    "How can I contact him?"
  ],
  "availability_status": "Available for freelance work"
}
```

**Example JavaScript**:
```javascript
const settings = await fetch('/api/ai/settings').then(r => r.json());
console.log(settings.welcome_message);
```

---

### 3. Update AI Settings

**Endpoint**: `PUT /api/ai/settings`

**Protected** 🔒 (Admin authentication required)

**Description**: Update AI assistant configuration

**Request Body**:
```json
{
  "enabled": true,
  "welcome_message": "Welcome to my portfolio!",
  "suggested_questions": [
    "What projects have you built?",
    "Tell me about your skills"
  ],
  "availability_status": "Open to opportunities"
}
```

**Response Success** (200):
```json
{
  "message": "AI settings updated successfully",
  "settings": {
    "enabled": true,
    "welcome_message": "Welcome to my portfolio!",
    "suggested_questions": [
      "What projects have you built?",
      "Tell me about your skills"
    ],
    "availability_status": "Open to opportunities"
  }
}
```

---

### 4. Get All FAQs

**Endpoint**: `GET /api/ai/faqs`

**Public** ✅ (No authentication required)

**Description**: Retrieve custom FAQ pairs

**Response Success** (200):
```json
[
  {
    "id": "faq-1",
    "question": "What is your hourly rate?",
    "answer": "Contact me for custom quotes",
    "created_at": "2024-07-10T10:00:00Z"
  },
  {
    "id": "faq-2",
    "question": "Do you offer remote work?",
    "answer": "Yes, I work with clients worldwide",
    "created_at": "2024-07-10T10:05:00Z"
  }
]
```

**Example JavaScript**:
```javascript
const faqs = await fetch('/api/ai/faqs').then(r => r.json());
faqs.forEach(faq => console.log(`Q: ${faq.question}`));
```

---

### 5. Create FAQ

**Endpoint**: `POST /api/ai/faqs`

**Protected** 🔒 (Admin authentication required)

**Description**: Add a new FAQ pair

**Request Body**:
```json
{
  "question": "What technologies do you use?",
  "answer": "I primarily work with React, Node.js, and MongoDB"
}
```

**Response Success** (201):
```json
{
  "message": "FAQ created successfully",
  "faq": {
    "id": "faq-123",
    "question": "What technologies do you use?",
    "answer": "I primarily work with React, Node.js, and MongoDB",
    "created_at": "2024-07-10T11:00:00Z"
  }
}
```

**Response Error** (400):
```json
{
  "message": "Question and answer are both required"
}
```

---

### 6. Delete FAQ

**Endpoint**: `DELETE /api/ai/faqs/:id`

**Protected** 🔒 (Admin authentication required)

**Description**: Remove an FAQ

**URL Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `id` | string | FAQ unique identifier |

**Response Success** (200):
```json
{
  "message": "FAQ deleted successfully"
}
```

**Response Error** (404):
```json
{
  "message": "FAQ not found"
}
```

**Example cURL**:
```bash
curl -X DELETE http://localhost:5000/api/ai/faqs/faq-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Response Formats

### Success Response Structure
```json
{
  "reply": "The AI's response text here",
  // OR
  "message": "Success message",
  "faq": { /* FAQ object */ },
  // OR
  "settings": { /* Settings object */ }
}
```

### Error Response Structure
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|--------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input, missing required fields |
| 401 | Unauthorized | Missing authentication |
| 403 | Forbidden | Insufficient permissions, service disabled |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limited (API) |
| 500 | Internal Error | Server error |

---

## Authentication

### For Protected Endpoints

Include JWT token in Authorization header:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${adminToken}`
};
```

Get token from admin login:
```
POST /api/auth/login
```

---

## Conversation History Format

**History Array Object**:
```json
{
  "role": "user",        // or "model"
  "text": "Your message"
}
```

**Example**:
```json
{
  "history": [
    {
      "role": "user",
      "text": "What projects have you built?"
    },
    {
      "role": "model",
      "text": "I've built several projects including..."
    },
    {
      "role": "user",
      "text": "Tell me more about the first one"
    }
  ]
}
```

---

## Rate Limiting

- **Public endpoints** (chat, settings, faqs GET): 10,000 requests/15 min
- **Admin endpoints**: 100 requests/15 min

When rate limited, you'll receive:
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded, please try again later"
}
```

The API includes automatic retry logic with exponential backoff.

---

## Error Examples

### Invalid Message
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{ "message": "" }'
```

Response:
```json
{
  "error": "Invalid input",
  "message": "Message is required and must be a non-empty string"
}
```

### Service Disabled
```json
{
  "error": "Service unavailable",
  "message": "AI Portfolio Assistant is currently disabled"
}
```

### Missing FAQ Fields
```bash
curl -X POST http://localhost:5000/api/ai/faqs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{ "question": "Test?" }'
```

Response:
```json
{
  "message": "Question and answer are both required"
}
```

---

## Timeout Information

- **Default Timeout**: 15 seconds
- **AI Response Timeout**: 10 seconds
- If exceeded, receives: `Request timed out`

---

## Testing with Postman

1. **Create Request**:
   - Method: `POST`
   - URL: `http://localhost:5000/api/ai/chat`

2. **Headers**:
   ```
   Content-Type: application/json
   ```

3. **Body** (raw JSON):
   ```json
   {
     "message": "What projects have you built?",
     "history": []
   }
   ```

4. **Send** and view response

---

## Common Integration Patterns

### Pattern 1: Simple Chat
```javascript
async function chat(message) {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: [] })
  });
  return (await res.json()).reply;
}
```

### Pattern 2: Conversation Memory
```javascript
let history = [];

async function sendMessage(message) {
  history.push({ role: 'user', text: message });
  
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });
  
  const data = await res.json();
  history.push({ role: 'model', text: data.reply });
  return data.reply;
}
```

### Pattern 3: Error Handling
```javascript
async function sendMessage(message, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });
      
      if (res.ok) return (await res.json()).reply;
      if (res.status === 429) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      else throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
}
```

---

## Environment Variables

Set in `.env`:
```
GEMINI_API_KEY=your_api_key_here
API_BASE_URL=http://localhost:5000/api
```

---

## Support & Documentation

- **Quick Start**: See `QUICK_START_AI.md`
- **Improvements**: See `AI_ASSISTANT_IMPROVEMENTS.md`
- **Summary**: See `TRANSFORMATION_SUMMARY.md`
- **Routes**: See `server/routes/aiRoutes.js`
- **Controller**: See `server/controllers/aiController.js`

---

**Last Updated**: July 10, 2024
**API Version**: 2.0 (Enhanced)
**Status**: Production Ready ✅
