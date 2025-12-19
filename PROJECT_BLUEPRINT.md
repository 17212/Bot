# IDRISIUM Corp — "IDRISIUM - Not Human" Messenger Bot (FastAPI on Vercel)

## Company & Founder
- **Company:** IDRISIUM Corp. — Offline-First, Privacy-Centric, High-Performance software. Motto: "**Mafish 2alb.. Fi bas Talaga**".
- **Founder:** Idris Ghamid — Founder & Lead Developer (18-year-old visionary; @idris.ghamid).

## Goal
Deploy a production-ready Facebook Messenger webhook on Vercel (Serverless Python + FastAPI) that routes inbound messages to Google Gemini 2.5 Pro, replies in the "Not Human" anti-human persona, and conforms to Facebook verification/retry expectations.

## Stack
- **Runtime:** Python 3.11 (Vercel Serverless Function)
- **Framework:** FastAPI + uvicorn
- **AI:** Google Generative AI (Gemini 1.5 Pro)
- **HTTP:** requests (Facebook Graph API calls)
- **Infra:** Vercel routing via `vercel.json`

## Key Requirements
- **Endpoints:** `GET /webhook` (verification), `POST /webhook` (message handling).
- **FB Verification:** Validate `hub.mode == subscribe` and `hub.verify_token`, return `hub.challenge`.
- **Messaging Flow:** Ignore echoes/self; immediately send `sender_action=typing_on`; generate Gemini reply; send text back via Graph API; respond `{ "status": "ok" }`.
- **Persona:** "Not Human" — cold logic, sarcastic, Egyptian Franco + tech jargon; short, punchy replies; keywords: `Mafi4 2alb`, `Talaga`, `Error 404`, `Glitch`.
- **Config Defaults (hardcoded for now):** `FACEBOOK_ACCESS_TOKEN`, `FACEBOOK_VERIFY_TOKEN`, `GEMINI_API_KEY`.
- **Error Handling:** Defensive parsing, log-safe errors, never expose secrets.

## File Tree (planned)
```
.
├─ PROJECT_BLUEPRINT.md          # This plan
├─ requirements.txt              # FastAPI, uvicorn, requests, google-generativeai
├─ vercel.json                   # Vercel rewrite to Python entry
└─ api/
   └─ index.py                   # FastAPI app with webhook handlers
```

## API Behavior Notes
- Always return 200 with `{"status": "ok"}` from POST to prevent FB retries when handled.
- Skip messages where `is_echo` is true or sender matches page ID.
- Keep responses concise (<~2 lines) per persona.
- Add minimal structured logging for observability in serverless context.

## Next Steps
1) Implement FastAPI app in `api/index.py` with Gemini + FB calls.  
2) Add `requirements.txt` and `vercel.json` for Vercel deployment.  
3) Smoke-test locally via `uvicorn api.index:app --reload` (env vars optional since defaults are hardcoded for now).
