# SentinelQA 🛡️
**Autonomous Web QA Agent**

Drop in any URL. SentinelQA crawls your site, analyses it with AI, and gives you a full bug report in seconds — no manual testing needed.

🔗 **Live:** https://sentinelqa.vercel.app

---

## What it does

You give it a URL. It:
1. Crawls the page — links, images, buttons, forms
2. Sends everything to an AI model
3. Returns a structured report with issues, severity ratings, fix suggestions, and a quality score

No setup. No config. Just paste a URL and go.

---

## Why I built this

QA is the most skipped step in small teams. Developers ship, bugs reach users, reputation takes a hit. Hiring a QA engineer costs money. Manual testing takes time.

SentinelQA is the QA engineer that never sleeps — available 24/7, consistent every time, and free to use.

---

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI
- **AI:** Groq API (llama-3.3-70b-versatile)
- **Scraping:** requests + BeautifulSoup
- **Deployed:** Vercel (frontend) + Railway (backend)

---

## Run locally

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Add your Groq API key to `backend/.env`:
```
GROQ_API_KEY=your_key_here
```

---

## Business Model

SaaS — teams pay per month for automated QA on their sites. Target customers: startups, dev agencies, e-commerce stores. No QA engineer needed.

---

Built for AI Agents Hackathon #31 by Asad Akbar Mulani