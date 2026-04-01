import os
import json
from playwright.async_api import async_playwright
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def crawl_site(url: str) -> dict:
    data = {"url": url, "title": "", "links": [], "images": [], "buttons": [], "forms": [], "console_errors": [], "screenshot": ""}
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        try:
            await page.goto(url, timeout=15000, wait_until="domcontentloaded")
            await page.wait_for_timeout(2000)
            data["title"] = await page.title()
            data["links"] = await page.eval_on_selector_all("a", "els => els.map(e => ({text: e.innerText.trim(), href: e.href}))")
            data["images"] = await page.eval_on_selector_all("img", "els => els.map(e => ({src: e.src, alt: e.alt}))")
            data["buttons"] = await page.eval_on_selector_all("button, input[type='submit']", "els => els.map(e => e.innerText || e.value)")
            data["forms"] = await page.eval_on_selector_all("form", "els => els.map(e => e.id || e.className || 'unnamed form')")
            data["console_errors"] = errors
            screenshot = await page.screenshot(full_page=True)
            import base64
            data["screenshot"] = base64.b64encode(screenshot).decode()
        except Exception as e:
            data["error"] = str(e)
        await browser.close()
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
    site_data = await crawl_site(url)
    if "error" in site_data:
        return {"error": site_data["error"]}
    analysis = analyze_with_claude(site_data)
    analysis["url"] = url
    analysis["title"] = site_data["title"]
    return analysis