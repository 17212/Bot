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

# --- Feature Handlers ---

async def persona_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("Usage: /persona [name]")
        return
    name = context.args[0]
    if set_persona(name):
        await update.message.reply_text(f"🎭 Persona switched to: **{name.capitalize()}**", parse_mode='Markdown')
    else:
        await update.message.reply_text("❌ Persona not found. Use /personas to list.")

async def personas_list_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    personas = get_available_personas()
    await update.message.reply_text(f"🎭 **Available Personas:**\n" + "\n".join([f"- {p}" for p in personas]), parse_mode='Markdown')

async def rank_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📊 XP System Active. Keep chatting to level up! Check /top")

async def top_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    leaders = get_leaderboard()
    text = "🏆 **Leaderboard**\n\n"
    for i, user in enumerate(leaders):
        name = user.get('first_name', 'Unknown')
        level = user.get('level', 1)
        xp = user.get('xp', 0)
        text += f"{i+1}. {name} - Lvl {level} ({xp} XP)\n"
    await update.message.reply_text(text, parse_mode='Markdown')

async def roast_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    target = " ".join(context.args) if context.args else update.effective_user.first_name
    roast = await roast_user(target, config)
    await update.message.reply_text(roast)

async def summarize_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if not context.args:
        await update.message.reply_text("Usage: /summarize [text]")
        return
    text = " ".join(context.args)
    summary = await summarize_text(text, config)
    await update.message.reply_text(f"📝 **Summary:**\n{summary}", parse_mode='Markdown')

async def translate_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if len(context.args) < 2:
        await update.message.reply_text("Usage: /tr [lang] [text]")
        return
    lang = context.args[0]
    text = " ".join(context.args[1:])
    translation = await translate_text(text, lang, config)
    await update.message.reply_text(f"🌐 **Translation ({lang}):**\n{translation}", parse_mode='Markdown')

# --- Existing Handlers ---

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Entropy 72 Online. Waiting for chaos.\nType /help for commands.")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = """
    **Entropy 72 Mega Commands:**
    
    **🤖 Core**
    /panel - Admin Panel (UI)
    /mode [default/custom] - Switch Mode
    
    **🎭 Personas**
    /persona [name] - Switch Personality
    /personas - List available personas
    
    **🎮 Fun & XP**
    /rank - Check your Level
    /top - Leaderboard
    /roast [name] - Roast someone
    
    **🛠 Utilities**
    /summarize [text] - Summarize text
    /tr [lang] [text] - Translate text
    
    **⚙️ Admin**
    /addkey, /switchkey, /setprompt, /broadcast
    """
    await update.message.reply_text(help_text, parse_mode='Markdown')

async def add_key(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']: return
    if not context.args: return
    new_key = context.args[0]
    keys = config.get('api_keys', [])
    if new_key not in keys:
        keys.append(new_key)
        update_bot_config({'api_keys': keys})
        await update.message.reply_text("✅ Key added.")

async def switch_key(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']: return
    rotate_api_key()
    await update.message.reply_text("🔄 Key Rotated.")

async def set_prompt(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']: return
    if not context.args: return
    update_bot_config({'system_prompt': " ".join(context.args)})
    await update.message.reply_text("🧠 Prompt Updated.")

async def get_prompt(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']: return
    await update.message.reply_text(f"`{config.get('system_prompt')}`", parse_mode='Markdown')

async def set_mode(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']: return
    if not context.args: return
    update_bot_config({'mode': context.args[0]})
    await update.message.reply_text(f"⚙️ Mode: {context.args[0]}")

async def set_topics(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']: return
    update_bot_config({'custom_topics': list(context.args)})
    await update.message.reply_text("📝 Topics Updated.")

async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']: return
    stats = get_bot_stats()
    await update.message.reply_text(f"📊 Users: {stats.get('user_count', 0)}")

async def broadcast_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']: return
    if not context.args: return
    message = " ".join(context.args)
    users = get_all_users()
    for user in users:
        try: await context.bot.send_message(chat_id=user['id'], text=f"📢 {message}")
        except: pass
    await update.message.reply_text("✅ Broadcast sent.")

async def panel_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    config = get_bot_config()
    if update.effective_user.id != config['admin_id']: return
    await update.message.reply_text("🎛 **Admin Panel**", reply_markup=get_main_menu_keyboard(), parse_mode='Markdown')

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data
    if data == 'main_menu': await query.edit_message_text("🎛 **Admin Panel**", reply_markup=get_main_menu_keyboard(), parse_mode='Markdown')
    elif data == 'menu_stats': await query.edit_message_text(f"📊 Users: {get_bot_stats().get('user_count', 0)}", reply_markup=get_main_menu_keyboard())
    elif data == 'menu_settings': await query.edit_message_text("⚙️ **Settings**", reply_markup=get_settings_keyboard(), parse_mode='Markdown')
    elif data == 'menu_keys': await query.edit_message_text("🔑 **Keys**", reply_markup=get_keys_keyboard(), parse_mode='Markdown')
    elif data == 'close_panel': await query.delete_message()

async def chat_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    log_user(user)
    
    # XP System
    leveled_up, new_level = add_xp(user.id)
    if leveled_up:
        await update.message.reply_text(f"🎉 **LEVEL UP!**\nYou are now Level {new_level}!", parse_mode='Markdown')

    config = get_bot_config()
    user_message = update.message.text or update.message.caption or ""
    image_data = None

    if update.message.photo:
        photo_file = await update.message.photo[-1].get_file()
        image_bytes = await photo_file.download_as_bytearray()
        image_data = bytes(image_bytes)
    
    if not user_message and not image_data: return

    history = get_chat_history(user.id, limit=10)
    response_text = await generate_content(user_message, config, history, image_data)
    
    add_message_to_history(user.id, "user", user_message or "[Image]")
    add_message_to_history(user.id, "model", response_text)
    
    await update.message.reply_text(response_text)

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
