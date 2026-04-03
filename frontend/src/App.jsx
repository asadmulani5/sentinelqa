import { useState } from "react"
import axios from "axios"

const severityColor = {
  critical: "bg-red-100 text-red-700 border border-red-300",
  high: "bg-orange-100 text-orange-700 border border-orange-300",
  medium: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  low: "bg-blue-100 text-blue-700 border border-blue-300",
}

const typeIcon = {
  bug: "🐛",
  accessibility: "♿",
  ux: "🎯",
  performance: "⚡",
  seo: "🔍",
}

export default function App() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [loadingMsg, setLoadingMsg] = useState("")

  const messages = [
    "Launching browser agent...",
    "Crawling your website...",
    "Analysing links, images and buttons...",
    "Asking Claude to review like a senior QA engineer...",
    "Generating your report...",
  ]

  const scan = async () => {
    if (!url) return
    setLoading(true)
    setResult(null)
    setError("")
    let i = 0
    setLoadingMsg(messages[0])
    const interval = setInterval(() => {
      i = (i + 1) % messages.length
      setLoadingMsg(messages[i])
    }, 3000)
    try {
      const res = await axios.post("https://sentinelqa-production.up.railway.app/scan", { url })
      setResult(res.data)
    } catch (e) {
      setError("Something went wrong. Make sure the URL is valid and try again.")
    }
    clearInterval(interval)
    setLoading(false)
  }

  const scoreColor = (s) => s >= 80 ? "text-green-500" : s >= 60 ? "text-yellow-500" : "text-red-500"

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <span className="text-xl font-bold text-white">SentinelQA</span>
          <span className="ml-2 text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">AI Powered</span>
        </div>
        <span className="text-sm text-gray-400">Autonomous Web QA Agent</span>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Find bugs before<br />your users do.
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          Drop in any URL. SentinelQA crawls your site, analyses it like a senior QA engineer, and gives you a full report in seconds.
        </p>

        {/* Input */}
        <div className="flex gap-3 max-w-2xl mx-auto">
          <input
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            placeholder="https://yourwebsite.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && scan()}
          />
          <button
            onClick={scan}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            {loading ? "Scanning..." : "Scan →"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm animate-pulse">{loadingMsg}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="max-w-4xl mx-auto px-6 pb-20 space-y-6">

          {/* Score Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Site scanned</p>
              <p className="text-white font-semibold text-lg">{result.title || result.url}</p>
              <p className="text-gray-500 text-sm">{result.url}</p>
              <p className="text-gray-300 text-sm mt-3 max-w-lg">{result.summary}</p>
            </div>
            <div className="text-center ml-6">
              <p className={`text-6xl font-bold ${scoreColor(result.score)}`}>{result.score}</p>
              <p className="text-gray-400 text-xs mt-1">Quality Score</p>
            </div>
          </div>

          {/* Business Impact */}
          <div className="bg-blue-950/40 border border-blue-800 rounded-2xl p-5">
            <p className="text-blue-300 font-semibold mb-1">💼 Business Impact</p>
            <p className="text-gray-300 text-sm">{result.business_impact}</p>
          </div>

          {/* Issues */}
          <div>
            <h2 className="text-white font-bold text-xl mb-4">
              🚨 Issues Found ({result.issues?.length || 0})
            </h2>
            <div className="space-y-3">
              {result.issues?.map((issue, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span>{typeIcon[issue.type] || "⚠️"}</span>
                      <span className="text-white font-semibold">{issue.title}</span>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${severityColor[issue.severity]}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{issue.description}</p>
                  <div className="bg-gray-800 rounded-xl px-4 py-2 text-sm text-green-400">
                    Fix: {issue.fix}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Positives */}
          {result.positives?.length > 0 && (
            <div>
              <h2 className="text-white font-bold text-xl mb-4">✅ What's Working Well</h2>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-2">
                {result.positives.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-green-400">✓</span> {p}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}