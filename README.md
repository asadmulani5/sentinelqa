# SentinelQA 🛡️
### Autonomous Web QA Agent

Find bugs before your users do.

SentinelQA crawls any URL, analyses it like a senior QA engineer, and returns a full report in seconds.

## Features
- 🔍 Crawls any public URL
- 🤖 AI-powered analysis using LLaMA 3.3 70B
- 📊 Structured report with issues, severity ratings, and fix suggestions
- 💼 Business impact assessment
- ⚡ Results in seconds

## Live Demo
🌐 [sentinelqa.vercel.app](https://sentinelqa.vercel.app)

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python FastAPI
- **AI:** Groq API (LLaMA 3.3 70B)
- **Crawler:** BeautifulSoup + Requests
- **Deployment:** Railway (backend) + Vercel (frontend)

## Run Locally
\`\`\`bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
\`\`\`
