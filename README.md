# Ask Divyansh — Virtual Twin Chatbot

A creative AI chatbot built by Divyansh to represent himself in salary negotiations with founders. Founders chat with the virtual twin to learn about Divyansh's work, skills, salary expectations, and career goals.

## What it does

- **Answers** questions about Divyansh's career, skills, salary, and goals (in first person)
- **Deflects** off-topic questions politely
- **Forwards** related-but-unknown questions to the real Divyansh, storing them for follow-up
- **Logs** every conversation for daily review in a password-protected admin dashboard

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 — bold gradient UI
- Groq SDK (model: `llama-3.3-70b-versatile`) — streaming responses
- Storage: JSON file locally, Upstash Redis on Vercel
- Deployment: Vercel free tier

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — add your GROQ_API_KEY (get free at console.groq.com)

# 3. Add your photos (optional)
# Drop 2-3 photos in public/avatars/ named:
#   divyansh-1.jpg, divyansh-2.jpg, divyansh-3.jpg

# 4. Fill in your knowledge base
# Edit src/lib/system-prompt.ts → KNOWLEDGE_BASE object
# Replace placeholders with your real role, skills, salary expectations, etc.

# 5. Run dev server
npm run dev
# Open http://localhost:3000
```

## Admin dashboard

- URL: `http://localhost:3000/admin`
- Default password: `divyansh` (change in `.env.local` via `ADMIN_PASSWORD`)
- Shows: stats, today's count, unanswered questions (highlighted amber), all conversations

## Storage

- **Local dev**: `USE_LOCAL_STORAGE=true` writes to `data/store.json`
- **Production**: Use Upstash Redis (free tier) — see deployment below

## Deploy to Vercel

```bash
# 1. Push to a GitHub repo, then import to Vercel
# 2. Add Upstash Redis integration: Vercel Dashboard > Storage > Marketplace > Upstash
#    This auto-injects UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
# 3. Add other env vars in Vercel:
#    - GROQ_API_KEY
#    - ADMIN_PASSWORD
#    - USE_LOCAL_STORAGE = false
# 4. Deploy
```

## Testing the three modes

After running `npm run dev`, try these to verify all three behaviors:

1. **Answered** — "What are your skills?" → AI responds normally
2. **Off-topic** — "What's the weather?" → "I'm only here to talk about Divyansh's professional journey..."
3. **Forwarded** — "What's your favorite movie?" (or any career-adjacent question not in knowledge base) → Logged as unanswered, visible on /admin
