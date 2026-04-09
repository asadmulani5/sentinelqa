import os
import json
import requests
from bs4 import BeautifulSoup
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def crawl_site(url: str) -> dict:
    data = {"url": url, "title": "", "links": [], "images": [], "buttons": [], "forms": [], "console_errors": []}
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; SentinelQA/1.0)"}
        r = requests.get(url, timeout=10, headers=headers)
        soup = BeautifulSoup(r.text, "html.parser")
        data["title"] = soup.title.string if soup.title else ""
        data["links"] = [{"text": a.get_text(strip=True)[:50], "href": a.get("href", "")} for a in soup.find_all("a", limit=20)]
        data["images"] = [{"src": img.get("src", ""), "alt": img.get("alt", "")} for img in soup.find_all("img", limit=20)]
        data["buttons"] = [btn.get_text(strip=True)[:30] for btn in soup.find_all(["button", "input"], limit=10)]
        data["forms"] = [f.get("id", f.get("class", "unnamed")) for f in soup.find_all("form", limit=5)]
        data["status_code"] = r.status_code
    except Exception as e:
        data["error"] = str(e)
    return data

def analyze_with_claude(site_data: dict) -> dict:
    prompt = f"""You are SentinelQA, an expert AI QA engineer. Analyze this website data and find real issues.

Website: {site_data['url']}
Title: {site_data['title']}
Links found: {json.dumps(site_data['links'][:20])}
Images found: {json.dumps(site_data['images'][:20])}
Buttons found: {json.dumps(site_data['buttons'][:10])}
Forms found: {json.dumps(site_data['forms'])}
Console errors: {json.dumps(site_data['console_errors'])}

Analyze this data and return ONLY a valid JSON object with this exact structure:
{{
  "summary": "2-3 sentence overall assessment of the site quality",
  "score": <number 0-100 representing overall quality>,
  "issues": [
    {{
      "type": "bug|accessibility|ux|performance|seo",
      "severity": "critical|high|medium|low",
      "title": "short title",
      "description": "what the issue is",
      "fix": "how to fix it"
    }}
  ],
  "positives": ["thing done well 1", "thing done well 2"],
  "business_impact": "1-2 sentences on how these issues affect the business"
}}

Be specific and actionable. Find real issues based on the actual data provided."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())

async def run_agent(url: str) -> dict:
    if not url.startswith("http"):
        url = "https://" + url
    site_data = crawl_site(url)
    if "error" in site_data:
        return {"error": site_data["error"]}
    analysis = analyze_with_claude(site_data)
    analysis["url"] = url
    analysis["title"] = site_data["title"]
    return analysis