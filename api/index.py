import os
import logging
import random
import asyncio
from fastapi import FastAPI, Request, BackgroundTasks
from telegram import Update, Bot
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import google.generativeai as genai
from api.utils import get_bot_config, update_bot_config, get_current_api_key, rotate_api_key

# --- Configuration ---
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")
if not TELEGRAM_TOKEN:
    # Fallback for local testing or if env var is missing (should be set in Vercel)
    TELEGRAM_TOKEN = "8562761946:AAH0yaZq82IZgEewsDVmsijOyf2WJanUuPY"

app = FastAPI()

# --- Gemini Helper ---
async def generate_content(prompt: str, config: dict) -> str:
    """Generates content using Gemini, handling key rotation."""
    api_key = get_current_api_key()
    if not api_key:
        return "🚨 Error: No API Keys configured!"

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash') # Or gemini-1.5-flash if 2.0 not available

    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Gemini Error: {e}")
        # Simple rotation logic: try next key
        new_key = rotate_api_key()
        if new_key:
             logger.info("Rotated API Key due to error. Retrying...")
             genai.configure(api_key=new_key)
             try:
                 response = await model.generate_content_async(prompt)
                 return response.text
             except Exception as e2:
                 return f"🚨 Error after rotation: {e2}"
        return f"🚨 Error: {e}"

# --- Telegram Handlers ---

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Entropy 72 Online. Waiting for chaos.")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = """
    **Entropy 72 Commands:**
    /addkey [KEY] - Add Gemini API Key
    /switchkey - Rotate API Key
    /setprompt [PROMPT] - Set System Persona
    /getprompt - View System Persona
    /mode [default/custom] - Switch Mode
    /settopics [Topic1, Topic2] - Set Custom Topics
    """
    await update.message.reply_text(help_text, parse_mode='Markdown')

async def add_key(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']:
        return

    if not context.args:
        await update.message.reply_text("Usage: /addkey [API_KEY]")
        return

    new_key = context.args[0]
    keys = config.get('api_keys', [])
    if new_key not in keys:
        keys.append(new_key)
        update_bot_config({'api_keys': keys})
        await update.message.reply_text(f"✅ Key added. Total keys: {len(keys)}")
    else:
        await update.message.reply_text("⚠️ Key already exists.")

async def switch_key(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']:
        return

    new_key = rotate_api_key()
    if new_key:
        await update.message.reply_text(f"🔄 Rotated to key index: {config.get('current_key_index', 0) + 1}")
    else:
        await update.message.reply_text("❌ No keys available to rotate.")

async def set_prompt(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']:
        return

    if not context.args:
        await update.message.reply_text("Usage: /setprompt [New Persona]")
        return

    new_prompt = " ".join(context.args)
    update_bot_config({'system_prompt': new_prompt})
    await update.message.reply_text("🧠 System Prompt Updated.")

async def get_prompt(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']:
        return
    await update.message.reply_text(f"🧠 Current Prompt:\n`{config.get('system_prompt')}`", parse_mode='Markdown')

async def set_mode(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']:
        return

    if not context.args or context.args[0] not in ['default', 'custom']:
        await update.message.reply_text("Usage: /mode [default/custom]")
        return

    mode = context.args[0]
    update_bot_config({'mode': mode})
    await update.message.reply_text(f"⚙️ Mode set to: {mode}")

async def set_topics(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']:
        return

    if not context.args:
        await update.message.reply_text("Usage: /settopics [Topic1] [Topic2] ...")
        return

    topics = list(context.args)
    update_bot_config({'custom_topics': topics})
    await update.message.reply_text(f"📝 Custom Topics: {', '.join(topics)}")

async def chat_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']:
        return

    user_message = update.message.text
    system_prompt = config.get('system_prompt', '')
    
    full_prompt = f"{system_prompt}\n\nUser: {user_message}\nEntropy 72:"
    
    response = await generate_content(full_prompt, config)
    await update.message.reply_text(response)

# --- Application Builder ---
# We build the application globally to reuse it if possible, but for Vercel it's per request usually.
application = Application.builder().token(TELEGRAM_TOKEN).build()

# Register Handlers
application.add_handler(CommandHandler("start", start))
application.add_handler(CommandHandler("help", help_command))
application.add_handler(CommandHandler("addkey", add_key))
application.add_handler(CommandHandler("switchkey", switch_key))
application.add_handler(CommandHandler("setprompt", set_prompt))
application.add_handler(CommandHandler("getprompt", get_prompt))
application.add_handler(CommandHandler("mode", set_mode))
application.add_handler(CommandHandler("settopics", set_topics))
application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, chat_handler))


# --- Routes ---

@app.post("/api/index.py")
async def telegram_webhook(request: Request):
    """Handle incoming Telegram updates."""
    try:
        data = await request.json()
        update = Update.de_json(data, application.bot)
        
        # Initialize application (needed for async handlers)
        await application.initialize()
        await application.process_update(update)
        await application.shutdown()
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/api/cron-post")
async def cron_post(background_tasks: BackgroundTasks):
    """Triggered by Vercel Cron to post content."""
    config = get_bot_config()
    channel_id = config.get('channel_id')
    
    if not channel_id:
        return {"status": "error", "message": "No channel_id configured"}

    mode = config.get('mode', 'default')
    system_prompt = config.get('system_prompt', '')
    
    prompt = ""
    if mode == 'custom':
        topics = config.get('custom_topics', [])
        if topics:
            topic = random.choice(topics)
            prompt = f"{system_prompt}\n\nTask: Write a short, engaging post about '{topic}'."
        else:
             prompt = f"{system_prompt}\n\nTask: Write a short, engaging post about something random."
    else:
        prompt = f"{system_prompt}\n\nTask: Generate a sarcastic, chaotic philosophical thought."

    # Generate content
    content = await generate_content(prompt, config)
    
    # Send to Channel
    bot = Bot(token=TELEGRAM_TOKEN)
    try:
        await bot.send_message(chat_id=channel_id, text=content)
        return {"status": "success", "mode": mode, "content": content}
    except Exception as e:
        logger.error(f"Cron Post Error: {e}")
        return {"status": "error", "message": str(e)}
