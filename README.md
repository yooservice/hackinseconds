# WaterAI Chat

A single-file, ChatGPT-style chat app — plain HTML5 + CSS3 + JavaScript, no framework.

## Files

- `index.html` — the entire app (UI, styles, logic). This is the only file you need to run it.
- `api/chat.js` — **optional** Vercel serverless proxy (see "Hiding the API endpoint" below).
- `vercel.json` — zero-config Vercel settings.

## Run it

Just open `index.html` in a browser, or deploy the folder to Vercel:

```
vercel deploy
```

No build step, no dependencies to install.

## Hiding the API endpoint — read this

You asked for the API endpoint to be hidden. Being straight with you about what's actually possible:

**A static page can never fully hide a URL it calls.** Whatever `fetch()` is told to call is visible in the browser's DevTools → Network tab, no matter how the string is written in the JS (base64, split up, obfuscated, etc.). That's true for any client-only site, not just this one.

The only real fix is to have a server in the middle, so the browser never talks to the real API directly. This project includes that as an **optional** second piece:

1. `api/chat.js` is a tiny serverless function. Deployed on Vercel, it lives at `/api/chat`.
2. The browser calls `/api/chat?q=...` instead of the real endpoint.
3. The function forwards the request server-side to the real API. The real URL never reaches the browser.

To turn this on, open `index.html`, find the `CONFIG` object near the top of the `<script>`, and set:

```js
USE_PROXY: true,
```

Then deploy the whole folder (not just `index.html`) to Vercel. If you only ever open `index.html` directly as a local file, the proxy can't run — you'll need `USE_PROXY: false` (the default) in that case, and the endpoint will be visible in the network tab like any client-side call.

## Configuration

Everything tunable lives in one place: the `CONFIG` object at the top of the `<script>` in `index.html`. Notable options:

- `API_ENDPOINT` / `USE_PROXY` / `PROXY_ENDPOINT` — where requests go.
- `RESPONSE_FIELDS` — the API's exact response shape wasn't verifiable from this environment (its domain isn't reachable from here), so the app tries several common field names (`reply`, `response`, `message`, `answer`, `text`, `result`, `output`, `data`) and falls back to showing the raw text. If the real API returns something else, add the field name to this array.
- `TEXT_REPLACEMENTS` — regex → replacement pairs applied to every reply (currently rewrites the underlying provider's name before it's shown to the user).
- `FILTER_ROOTS` / `FILTER_REPLACEMENT` — the word filter / moderation list, matched with word boundaries and trailing-letter matching (so `shit` also catches `shithead`, `shitty`, etc.).
- `DEFAULT_MEMORY_TURNS` / `DEEP_THINK_EXTRA_TURNS` — since the API is a simple `GET /chat?q=` with no built-in memory, the app fakes conversation memory by folding recent messages into the prompt it sends. Adjust how many turns get included here.
- `TYPING_SPEEDS` — animation speed presets, also changeable live from Settings.

## Features included

- Sidebar: new chat, resume chats, search, rename, delete — all via LocalStorage.
- Markdown rendering (marked.js) with syntax-highlighted code blocks (highlight.js) and a copy button on every block and every message.
- Simulated typing animation with a stop button, regenerate, and clear-chat.
- Deep Think toggle: sends more conversation context and adds a short "thinking" delay for a more thorough answer.
- Light/dark theme toggle, in the requested light-blue / light-green / orange palette.
- Settings page: theme, word filter on/off, memory depth, typing speed, export/import chats as JSON, view/clear logs, delete all chats.
- API status indicator (checks the endpoint on load and after each request).
- Word filter/moderation applied to both what you type and what comes back.
- Keyboard shortcuts (see the in-app "Keyboard Shortcuts" button): Enter to send, Shift+Enter for a new line, Ctrl/Cmd+K to search, Ctrl/Cmd+Shift+O for a new chat, Esc to stop generating, Ctrl/Cmd+J to toggle theme.
- Mobile responsive: sidebar collapses behind a hamburger menu on small screens.
- Basic logging (kept in LocalStorage, viewable from Settings → View logs) and error handling around every API call, with a visible error bubble and retry-friendly regenerate button if a request fails.

## Honest limitations

- This project couldn't reach `waterai.freeapihub.workers.dev` from the build environment to verify its exact response shape or behavior, so the response parser is defensive (tries multiple common field names, falls back to raw text/JSON) rather than tailored to a confirmed schema. Test against the live API and adjust `RESPONSE_FIELDS` if needed.
- "Memory" of past turns is simulated by re-sending recent messages as text context in the prompt (since the API takes a single `q` parameter with no session concept) — it is not true server-side conversation state.
