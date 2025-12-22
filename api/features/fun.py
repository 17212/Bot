import random
from telegram import Update
from telegram.ext import ContextTypes

# --- RNG ---
async def coin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    result = random.choice(["Heads 🪙", "Tails 🪙"])
    await update.message.reply_text(result)

async def dice_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"🎲 You rolled a {random.randint(1, 6)}")

async def ball8_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    answers = ["Yes", "No", "Maybe", "Ask again later", "Definitely", "Absolutely not"]
    await update.message.reply_text(f"🎱 {random.choice(answers)}")

async def choose_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args: return await update.message.reply_text("Usage: /choose A B C")
    await update.message.reply_text(f"👉 I choose: {random.choice(context.args)}")

async def rate_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    target = " ".join(context.args) if context.args else "You"
    await update.message.reply_text(f"⭐ I rate {target} {random.randint(0, 10)}/10")

async def ship_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"❤️ Compatibility: {random.randint(0, 100)}%")

async def yesno_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(random.choice(["✅ Yes", "❌ No"]))

# --- Content ---
JOKES = ["Why did the chicken cross the road? To get to the other side.", "I'm on a seafood diet. I see food and I eat it."]
FACTS = ["Honey never spoils.", "Bananas are berries."]
QUOTES = ["Be yourself; everyone else is already taken.", "So many books, so little time."]

async def joke_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"😂 {random.choice(JOKES)}")

async def fact_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"💡 {random.choice(FACTS)}")

async def quote_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"📜 {random.choice(QUOTES)}")

async def riddle_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🧩 What has keys but can't open locks? A piano.")

async def advice_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🤔 Drink more water.")

async def insult_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🔥 You are as useful as a screen door on a submarine.")

async def compliment_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("💖 You are amazing!")

# --- Social ---
async def hug_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🤗 *Hugs*")

async def slap_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("👋 *Slaps*")

async def pat_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🫳 *Pats head*")

async def kill_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🔪 *Wasted*")

async def kiss_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("😘 *Smooch*")

async def highfive_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🙏 *High Five*")

async def dance_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("💃🕺 *Dances*")

async def cry_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("😭 *Cries*")
