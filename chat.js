// api/chat.js
// -----------------------------------------------------------------------
// OPTIONAL serverless proxy for Vercel.
//
// Why this file exists:
// A static index.html can never truly hide a URL it calls — anyone can
// open DevTools > Network and see it. The only real fix is to call the
// real API from a server instead of the browser. This tiny function does
// that: the browser calls "/api/chat?q=...", this function (running on
// Vercel's servers) forwards the request to the real endpoint, and the
// real URL never appears in the browser.
//
// To use it:
//   1. Deploy this whole folder to Vercel (this file is auto-detected as
//      a serverless function because it lives in /api).
//   2. In index.html, set CONFIG.USE_PROXY = true.
// That's it — everything else keeps working exactly the same.
// -----------------------------------------------------------------------

const REAL_API_BASE = "https://wormgpt.freeapihub.workers.dev/chat?q=";

export default async function handler(req, res) {
  const q = (req.query && req.query.q) || "";

  if (!q) {
    res.status(400).json({ error: "Missing 'q' query parameter." });
    return;
  }

  try {
    const upstream = await fetch(REAL_API_BASE + encodeURIComponent(q), {
      method: "GET",
    });

    const contentType = upstream.headers.get("content-type") || "";
    const raw = await upstream.text();

    res.setHeader("Cache-Control", "no-store");

    if (contentType.includes("application/json")) {
      res.status(upstream.status).setHeader("Content-Type", "application/json").send(raw);
    } else {
      // Wrap plain-text upstream responses so the client always gets JSON.
      res.status(upstream.status).json({ reply: raw });
    }
  } catch (err) {
    res.status(502).json({ error: "Upstream API request failed.", detail: String(err) });
  }
}
