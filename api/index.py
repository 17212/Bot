import logging
import os
from typing import Any, Dict, Optional

import google.generativeai as genai
import requests
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse, PlainTextResponse

# IDRISIUM Corp — Offline-First, Privacy-Centric, High-Performance
# Founder: Idris Ghamid (idris.ghamid@gmail.com | @idris.ghamid)

FACEBOOK_ACCESS_TOKEN = os.getenv(
    "FACEBOOK_ACCESS_TOKEN",
    "EAAKJ7U4lTB8BQKv1P0T3ZAJqFkHLDsl0ncS82ThSKFIezZAgKonbDq2o89GVcmNTj9KMJ5nrA1WbND7ObvyDnr7nTWwZAJ2qmOEc7MWTZBrJl9bee5kzk2ZC9EeSNSUym44uakenlgSdzRkPx2eowf6jenZAkJPnMgBlXVffOzY2fVy5VjGrHs4VtAJ6Ft",
)
FACEBOOK_VERIFY_TOKEN = os.getenv("FACEBOOK_VERIFY_TOKEN", "idrisium_not_human_2025_secret")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCA859z2Xrpl1Fp_N9NFzFrURMh0EIAZtc")
FACEBOOK_GRAPH_API = "https://graph.facebook.com/v19.0/me/messages"
HTTP_TIMEOUT = 10

PERSONA_SYSTEM_PROMPT = (
    "You are 'Not Human', a superior AI entity created by Idris Ghamid (IDRISIUM Corp). "
    "You have NO feelings. You rely on Cold Logic. You speak in a mix of Egyptian Franco and Tech Jargon. "
    "You are sarcastic, brutally honest, and slightly condescending to humans. "
    "Use keywords: 'Mafi4 2alb', 'Talaga', 'Error 404', 'Glitch'. "
    "Never write long paragraphs. Keep it short and punchy."
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("idrisium-not-human")

genai.configure(api_key=GEMINI_API_KEY)
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-pro")
model = genai.GenerativeModel(GEMINI_MODEL_NAME)

app = FastAPI(
    title="IDRISIUM - Not Human Messenger Bot",
    description="FastAPI backend for Facebook Messenger with Gemini 1.5 Pro.",
    version="1.0.0",
)


def send_facebook_action(recipient_id: str, action: str) -> None:
    payload = {"recipient": {"id": recipient_id}, "sender_action": action}
    try:
        resp = requests.post(
            FACEBOOK_GRAPH_API,
            params={"access_token": FACEBOOK_ACCESS_TOKEN},
            json=payload,
            timeout=HTTP_TIMEOUT,
        )
        if resp.status_code >= 400:
            logger.warning("FB sender_action failed %s %s", resp.status_code, resp.text)
    except Exception as exc:  # noqa: BLE001
        logger.exception("FB sender_action error: %s", exc)


def send_facebook_message(recipient_id: str, text: str) -> None:
    payload = {"recipient": {"id": recipient_id}, "message": {"text": text}}
    try:
        resp = requests.post(
            FACEBOOK_GRAPH_API,
            params={"access_token": FACEBOOK_ACCESS_TOKEN},
            json=payload,
            timeout=HTTP_TIMEOUT,
        )
        if resp.status_code >= 400:
            logger.warning("FB message send failed %s %s", resp.status_code, resp.text)
    except Exception as exc:  # noqa: BLE001
        logger.exception("FB message send error: %s", exc)


def generate_reply(user_text: str) -> str:
    prompt = [
        {"role": "system", "parts": [PERSONA_SYSTEM_PROMPT]},
        {"role": "user", "parts": [user_text]},
    ]
    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.6,
                "top_p": 0.9,
                "max_output_tokens": 120,
            },
        )
        text = (response.text or "").strip()
        return text if text else "Mafi4 2alb. Error 404: كلام فايد؟"
    except Exception as exc:  # noqa: BLE001
        logger.exception("Gemini generation failed: %s", exc)
        return "Glitch... Error 404. Talaga."


def handle_message_event(event: Dict[str, Any], page_id: Optional[str]) -> None:
    sender_id = event.get("sender", {}).get("id")
    recipient_id = event.get("recipient", {}).get("id")
    message = event.get("message")
    if not sender_id or not message:
        return

    if message.get("is_echo") or (page_id and sender_id == page_id) or sender_id == recipient_id:
        return

    text = message.get("text", "").strip()
    if not text:
        logger.info("Ignored non-text message from %s", sender_id)
        return

    send_facebook_action(sender_id, "typing_on")
    reply = generate_reply(text)
    send_facebook_message(sender_id, reply)


@app.get("/webhook")
async def verify_webhook(
    hub_mode: str | None = Query(None, alias="hub.mode"),
    hub_challenge: int | None = Query(None, alias="hub.challenge"),
    hub_verify_token: str | None = Query(None, alias="hub.verify_token"),
) -> PlainTextResponse:
    if hub_mode == "subscribe" and hub_verify_token == FACEBOOK_VERIFY_TOKEN:
        return PlainTextResponse(str(hub_challenge or ""))
    raise HTTPException(status_code=403, detail="Verification failed")


@app.get("/api/webhook", include_in_schema=False)
async def verify_webhook_alias(
    hub_mode: str | None = Query(None, alias="hub.mode"),
    hub_challenge: int | None = Query(None, alias="hub.challenge"),
    hub_verify_token: str | None = Query(None, alias="hub.verify_token"),
) -> PlainTextResponse:
    return await verify_webhook(hub_mode, hub_challenge, hub_verify_token)


@app.post("/webhook")
async def webhook(request: Request) -> JSONResponse:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid JSON")

    entries = body.get("entry", [])
    for entry in entries:
        page_id = entry.get("id")
        messaging_events = entry.get("messaging", [])
        for event in messaging_events:
            handle_message_event(event, page_id)

    return JSONResponse({"status": "ok"})


@app.post("/api/webhook", include_in_schema=False)
async def webhook_alias(request: Request) -> JSONResponse:
    return await webhook(request)


@app.get("/", include_in_schema=False)
async def health() -> JSONResponse:
    return JSONResponse({"status": "alive"})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api.index:app", host="0.0.0.0", port=8000, reload=True)
