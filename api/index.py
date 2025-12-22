import os
import logging
import random
import asyncio
from fastapi import FastAPI, Request, BackgroundTasks
from telegram import Update, Bot, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes, CallbackQueryHandler
import google.generativeai as genai
from api.utils import (
    get_bot_config, update_bot_config, get_current_api_key, rotate_api_key,
    add_message_to_history, get_chat_history, log_user, get_bot_stats, get_all_users
)
from api.keyboards import get_main_menu_keyboard, get_settings_keyboard, get_keys_keyboard
from api.core import generate_content
from api.features.xp import add_xp, get_leaderboard
from api.features.personas import get_available_personas, set_persona, get_persona
from api.features.fun import (
    coin_command, dice_command, ball8_command, choose_command, rate_command, ship_command, yesno_command,
    joke_command, fact_command, quote_command, riddle_command, advice_command, insult_command, compliment_command,
    hug_command, slap_command, pat_command, kill_command, kiss_command, highfive_command, dance_command, cry_command
)
from api.features.tools import (
    reverse_command, upper_command, lower_command, title_command, length_command, mock_command, emojify_command,
    base64enc_command, base64dec_command, hexenc_command, hexdec_command, bin_command, uuid_command, password_command,
    calc_command, time_command, date_command, ascii_command
)
from api.features.utilities import summarize_text, translate_text, roast_user

# --- Configuration ---
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")
if not TELEGRAM_TOKEN:
    TELEGRAM_TOKEN = "8562761946:AAH0yaZq82IZgEewsDVmsijOyf2WJanUuPY"

app = FastAPI()

# --- AI Feature Handlers ---
async def define_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    term = " ".join(context.args)
    res = await generate_content(f"Define: {term}", config)
    await update.message.reply_text(res)

async def synonym_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    term = " ".join(context.args)
    res = await generate_content(f"Synonyms for: {term}", config)
    await update.message.reply_text(res)

async def antonym_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    term = " ".join(context.args)
    res = await generate_content(f"Antonyms for: {term}", config)
    await update.message.reply_text(res)

async def rhyme_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    term = " ".join(context.args)
    res = await generate_content(f"Rhymes for: {term}", config)
    await update.message.reply_text(res)

async def idea_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    res = await generate_content("Give me a random creative idea.", config)
    await update.message.reply_text(res)

async def story_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    topic = " ".join(context.args) or "something random"
    res = await generate_content(f"Write a very short story about {topic}.", config)
    await update.message.reply_text(res)

# ... (Existing Handlers)

# --- App Builder ---
application = Application.builder().token(TELEGRAM_TOKEN).build()

# Register Handlers
application.add_handler(CommandHandler("start", start))
application.add_handler(CommandHandler("help", help_command))

# Fun
application.add_handler(CommandHandler("coin", coin_command))
application.add_handler(CommandHandler("dice", dice_command))
application.add_handler(CommandHandler("8ball", ball8_command))
application.add_handler(CommandHandler("choose", choose_command))
application.add_handler(CommandHandler("rate", rate_command))
application.add_handler(CommandHandler("ship", ship_command))
application.add_handler(CommandHandler("yesno", yesno_command))
application.add_handler(CommandHandler("joke", joke_command))
application.add_handler(CommandHandler("fact", fact_command))
application.add_handler(CommandHandler("quote", quote_command))
application.add_handler(CommandHandler("riddle", riddle_command))
application.add_handler(CommandHandler("advice", advice_command))
application.add_handler(CommandHandler("insult", insult_command))
application.add_handler(CommandHandler("compliment", compliment_command))
application.add_handler(CommandHandler("hug", hug_command))
application.add_handler(CommandHandler("slap", slap_command))
application.add_handler(CommandHandler("pat", pat_command))
application.add_handler(CommandHandler("kill", kill_command))
application.add_handler(CommandHandler("kiss", kiss_command))
application.add_handler(CommandHandler("highfive", highfive_command))
application.add_handler(CommandHandler("dance", dance_command))
application.add_handler(CommandHandler("cry", cry_command))

# Tools
application.add_handler(CommandHandler("reverse", reverse_command))
application.add_handler(CommandHandler("upper", upper_command))
application.add_handler(CommandHandler("lower", lower_command))
application.add_handler(CommandHandler("title", title_command))
application.add_handler(CommandHandler("length", length_command))
application.add_handler(CommandHandler("mock", mock_command))
application.add_handler(CommandHandler("emojify", emojify_command))
application.add_handler(CommandHandler("base64enc", base64enc_command))
application.add_handler(CommandHandler("base64dec", base64dec_command))
application.add_handler(CommandHandler("hexenc", hexenc_command))
application.add_handler(CommandHandler("hexdec", hexdec_command))
application.add_handler(CommandHandler("bin", bin_command))
application.add_handler(CommandHandler("uuid", uuid_command))
application.add_handler(CommandHandler("password", password_command))
application.add_handler(CommandHandler("calc", calc_command))
application.add_handler(CommandHandler("time", time_command))
application.add_handler(CommandHandler("date", date_command))
application.add_handler(CommandHandler("ascii", ascii_command))

# AI
application.add_handler(CommandHandler("define", define_command))
application.add_handler(CommandHandler("synonym", synonym_command))
application.add_handler(CommandHandler("antonym", antonym_command))
application.add_handler(CommandHandler("rhyme", rhyme_command))
application.add_handler(CommandHandler("idea", idea_command))
application.add_handler(CommandHandler("story", story_command))

# Admin
application.add_handler(CommandHandler("addkey", add_key))
application.add_handler(CommandHandler("switchkey", switch_key))
application.add_handler(CommandHandler("setprompt", set_prompt))
application.add_handler(CommandHandler("getprompt", get_prompt))
application.add_handler(CommandHandler("mode", set_mode))
application.add_handler(CommandHandler("settopics", set_topics))
application.add_handler(CommandHandler("stats", stats_command))
application.add_handler(CommandHandler("broadcast", broadcast_command))
application.add_handler(CommandHandler("panel", panel_command))
# Features
application.add_handler(CommandHandler("persona", persona_command))
application.add_handler(CommandHandler("personas", personas_list_command))
application.add_handler(CommandHandler("rank", rank_command))
application.add_handler(CommandHandler("top", top_command))
application.add_handler(CommandHandler("roast", roast_command))
application.add_handler(CommandHandler("summarize", summarize_command))
application.add_handler(CommandHandler("tr", translate_command))

application.add_handler(CallbackQueryHandler(button_handler))
application.add_handler(MessageHandler(filters.TEXT | filters.PHOTO & ~filters.COMMAND, chat_handler))

# --- Routes ---
@app.post("/api/index.py")
async def telegram_webhook(request: Request):
    try:
        data = await request.json()
        update = Update.de_json(data, application.bot)
        await application.initialize()
        await application.process_update(update)
        await application.shutdown()
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/api/cron-post")
async def cron_post(background_tasks: BackgroundTasks):
    config = get_bot_config()
    channel_id = config.get('channel_id')
    if not channel_id: return {"status": "error"}
    
    # Simple cron logic (can be expanded)
    prompt = f"{config.get('system_prompt')}\n\nTask: Write a short, engaging post."
    content = await generate_content(prompt, config)
    
    bot = Bot(token=TELEGRAM_TOKEN)
    try:
        await bot.send_message(chat_id=channel_id, text=content)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
