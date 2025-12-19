import os
import asyncio
from typing import Any, Dict, Optional

import fastapi
import httpx
import google.generativeai as genai

app = fastapi.FastAPI(title="Not Human Bot", version="1.0.0")

# Environment with safe defaults (as requested)
FACEBOOK_ACCESS_TOKEN = os.getenv(
    "FACEBOOK_ACCESS_TOKEN",
    "EAAKJ7U4lTB8BQKv1P0T3ZAJqFkHLDsl0ncS82ThSKFIezZAgKonbDq2o89GVcmNTj9KMJ5nrA1WbND7ObvyDnr7nTWwZAJ2qmOEc7MWTZBrJl9bee5kzk2ZC9EeSNSUym44uakenlgSdzRkPx2eowf6jenZAkJPnMgBlXVffOzY2fVy5VjGrHs4VtAJ6Ft",
)
FACEBOOK_VERIFY_TOKEN = os.getenv("FACEBOOK_VERIFY_TOKEN", "idrisium_not_human_2025_secret")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCA859z2Xrpl1Fp_N9NFzFrURMh0EIAZtc")

FB_GRAPH_URL = "https://graph.facebook.com/v19.0/me/messages"
FB_API_PARAMS = {"access_token": FACEBOOK_ACCESS_TOKEN}

genai.configure(api_key=GEMINI_API_KEY)
_model = genai.GenerativeModel("gemini-2.5-pro")


async def send_fb_payload(payload: Dict[str, Any]) -> None:
    async with httpx.AsyncClient(timeout=8.0) as client:
        await client.post(FB_GRAPH_URL, params=FB_API_PARAMS, json=payload)


async def send_typing(sender_id: str) -> None:
    await send_fb_payload({"recipient": {"id": sender_id}, "sender_action": "typing_on"})


async def send_text(sender_id: str, text: str) -> None:
    await send_fb_payload({"recipient": {"id": sender_id}, "message": {"text": text}})


async def generate_reply(user_text: str) -> str:
    prompt = (
        "You are 'Not Human', a sarcastic Egyptian Franco AI. "
        "Be brief, cold, and slightly mocking. Always respond in one short sentence."
    )
    try:
        resp = await _model.generate_content_async(
            [{"role": "user", "parts": [prompt + "\nUser: " + user_text]}],
        )
        candidate = resp.candidates[0].content.parts[0].text if resp.candidates else ""
        return candidate.strip() or "Okay."
    except Exception:
        return "تمام، استوعبت."


def extract_message_text(payload: Dict[str, Any]) -> Optional[Dict[str, str]]:
    try:
        entry = payload.get("entry", [])[0]
        messaging = entry.get("messaging", [])[0]
        sender_id = messaging["sender"]["id"]
        message = messaging.get("message", {})
        text = message.get("text")
        if text:
            return {"sender_id": sender_id, "text": text}
    except Exception:
        return None
    return None


@app.get("/webhook")
async def verify_webhook(request: fastapi.Request):
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == FACEBOOK_VERIFY_TOKEN and challenge:
        return fastapi.Response(content=challenge, media_type="text/plain")
    return fastapi.Response(status_code=403, content="Forbidden")


@app.post("/webhook")
async def webhook(payload: Dict[str, Any]):
    msg = extract_message_text(payload)
    if msg:
        sender_id = msg["sender_id"]
        text = msg["text"]
        # Handle in background to keep response fast
        asyncio.create_task(handle_message(sender_id, text))
    return {"status": "ok"}


async def handle_message(sender_id: str, text: str) -> None:
    await send_typing(sender_id)
    reply = await generate_reply(text)
    await send_text(sender_id, reply)
