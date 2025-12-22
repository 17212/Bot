import os
import logging
import random
import asyncio
from fastapi import FastAPI, Request, BackgroundTasks
from telegram import Update, Bot
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes, CallbackQueryHandler
import google.generativeai as genai
from api.utils import (
    get_bot_config, update_bot_config, get_current_api_key, rotate_api_key,
    add_message_to_history, get_chat_history, log_user, get_bot_stats, get_all_users
)
from api.keyboards import get_main_menu_keyboard, get_settings_keyboard, get_keys_keyboard
from telegram import CallbackQuery
import PIL.Image
import io
import aiohttp

# --- Configuration ---
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")
if not TELEGRAM_TOKEN:
    # Fallback for local testing or if env var is missing (should be set in Vercel)
    TELEGRAM_TOKEN = "8562761946:AAH0yaZq82IZgEewsDVmsijOyf2WJanUuPY"

app = FastAPI()

# --- Gemini Helper ---
# --- Gemini Helper ---
async def generate_content(prompt: str, config: dict, history: list = [], image_data: bytes = None) -> str:
    """Generates content using Gemini, handling key rotation, history, and images."""
    api_key = get_current_api_key()
    if not api_key:
        return "🚨 Error: No API Keys configured!"

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp') # Updated to latest experimental

    try:
        inputs = []
        # Add system prompt if history is empty or just as context (Gemini handles system instructions differently now, but prepending is fine)
        if not history:
             inputs.append(config.get('system_prompt', ''))
        
        # Add History
        for msg in history:
            inputs.append(msg) # msg is already {"role": ..., "parts": ...} but Gemini client wants Content objects or list of parts. 
                               # Actually, model.generate_content accepts a list of contents.
                               # But here we are doing single turn with context manually or using chat session.
                               # Let's stick to simple generation with context for now to avoid session state issues in serverless.
                               # Wait, passing history as list of dicts to generate_content might not work directly as 'contents'.
                               # Better to format history into the prompt or use start_chat.
                               # For Vercel (stateless), we reconstruct the chat.
        
        # Reconstruct chat for context
        chat = model.start_chat(history=history)
        
        message_parts = [prompt]
        if image_data:
            image = PIL.Image.open(io.BytesIO(image_data))
            message_parts.append(image)

        response = await chat.send_message_async(message_parts)
        return response.text
    except Exception as e:
        logger.error(f"Gemini Error: {e}")
        # Simple rotation logic: try next key
        new_key = rotate_api_key()
        if new_key:
             logger.info("Rotated API Key due to error. Retrying...")
             genai.configure(api_key=new_key)
             model = genai.GenerativeModel('gemini-2.0-flash-exp')
             try:
                 # Retry logic needs to duplicate the setup
                 chat = model.start_chat(history=history)
                 message_parts = [prompt]
                 if image_data:
                    image = PIL.Image.open(io.BytesIO(image_data))
                    message_parts.append(image)
                 response = await chat.send_message_async(message_parts)
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

async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']:
        return
    
    stats = get_bot_stats()
    await update.message.reply_text(f"📊 **Bot Stats**\nUsers: {stats.get('user_count', 0)}", parse_mode='Markdown')

async def broadcast_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']:
        return

    if not context.args:
        await update.message.reply_text("Usage: /broadcast [Message]")
        return

    message = " ".join(context.args)
    users = get_all_users()
    count = 0
    for user in users:
        try:
            await context.bot.send_message(chat_id=user['id'], text=f"📢 **Broadcast**\n\n{message}", parse_mode='Markdown')
            count += 1
        except Exception:
            pass # Ignore blocked users
    
    await update.message.reply_text(f"✅ Broadcast sent to {count} users.")

async def panel_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']:
        return
    
    await update.message.reply_text("🎛 **Admin Panel**", reply_markup=get_main_menu_keyboard(), parse_mode='Markdown')

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer() # Acknowledge click
    
    data = query.data
    config = get_bot_config()
    
    if data == 'main_menu':
        await query.edit_message_text("🎛 **Admin Panel**", reply_markup=get_main_menu_keyboard(), parse_mode='Markdown')
        
    elif data == 'menu_stats':
        stats = get_bot_stats()
        text = f"📊 **Bot Stats**\nUsers: {stats.get('user_count', 0)}"
        # Add back button
        await query.edit_message_text(text, reply_markup=get_main_menu_keyboard(), parse_mode='Markdown') # Or separate back button
        
    elif data == 'menu_settings':
        await query.edit_message_text("⚙️ **Settings**", reply_markup=get_settings_keyboard(), parse_mode='Markdown')
        
    elif data == 'menu_keys':
        await query.edit_message_text("🔑 **API Keys Management**", reply_markup=get_keys_keyboard(), parse_mode='Markdown')
        
    elif data == 'toggle_mode':
        current_mode = config.get('mode', 'default')
        new_mode = 'custom' if current_mode == 'default' else 'default'
        update_bot_config({'mode': new_mode})
        await query.edit_message_text("⚙️ **Settings**", reply_markup=get_settings_keyboard(), parse_mode='Markdown')
        
    elif data == 'rotate_key':
        new_key = rotate_api_key()
        text = "🔄 Key Rotated!" if new_key else "❌ No keys to rotate."
        await query.answer(text, show_alert=True)
        await query.edit_message_text("🔑 **API Keys Management**", reply_markup=get_keys_keyboard(), parse_mode='Markdown')

    elif data == 'close_panel':
        await query.delete_message()
        
    elif data in ['menu_broadcast', 'edit_prompt', 'edit_topics', 'add_key_prompt']:
        await query.answer("⚠️ Use the command for this feature (e.g. /broadcast)", show_alert=True)

async def chat_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    log_user(user) # Track user
    
    config = get_bot_config()
    
    user_message = ""
    image_data = None
    
    if update.message.text:
        user_message = update.message.text
    elif update.message.caption:
        user_message = update.message.caption

    if update.message.photo:
        # Get largest photo
        photo_file = await update.message.photo[-1].get_file()
        image_bytes = await photo_file.download_as_bytearray()
        image_data = bytes(image_bytes)
    
    if not user_message and not image_data:
        return # Ignore non-text/non-image messages for now

    # Get History
    history = get_chat_history(user.id, limit=10)
    
    # Generate
    response_text = await generate_content(user_message, config, history, image_data)
    
    # Save to History
    add_message_to_history(user.id, "user", user_message or "[Image]")
    add_message_to_history(user.id, "model", response_text)
    
    await update.message.reply_text(response_text)

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
application.add_handler(CommandHandler("stats", stats_command))
application.add_handler(CommandHandler("broadcast", broadcast_command))
application.add_handler(CommandHandler("panel", panel_command))
application.add_handler(CallbackQueryHandler(button_handler))
application.add_handler(MessageHandler(filters.TEXT | filters.PHOTO & ~filters.COMMAND, chat_handler))


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
