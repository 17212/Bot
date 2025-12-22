import base64
import binascii
import uuid
import datetime
from telegram import Update
from telegram.ext import ContextTypes

# --- Text Tools ---
async def reverse_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    await update.message.reply_text(text[::-1])

async def upper_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    await update.message.reply_text(text.upper())

async def lower_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    await update.message.reply_text(text.lower())

async def title_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    await update.message.reply_text(text.title())

async def length_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    await update.message.reply_text(f"Length: {len(text)}")

async def mock_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    res = "".join([c.upper() if i % 2 == 0 else c.lower() for i, c in enumerate(text)])
    await update.message.reply_text(res)

async def emojify_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    await update.message.reply_text(f"✨ {text} ✨")

# --- Dev Tools ---
async def base64enc_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    res = base64.b64encode(text.encode()).decode()
    await update.message.reply_text(f"`{res}`", parse_mode='Markdown')

async def base64dec_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    try:
        res = base64.b64decode(text).decode()
        await update.message.reply_text(f"`{res}`", parse_mode='Markdown')
    except:
        await update.message.reply_text("❌ Invalid Base64")

async def hexenc_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    res = binascii.hexlify(text.encode()).decode()
    await update.message.reply_text(f"`{res}`", parse_mode='Markdown')

async def hexdec_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    try:
        res = binascii.unhexlify(text).decode()
        await update.message.reply_text(f"`{res}`", parse_mode='Markdown')
    except:
        await update.message.reply_text("❌ Invalid Hex")

async def bin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    res = ' '.join(format(ord(c), 'b') for c in text)
    await update.message.reply_text(f"`{res}`", parse_mode='Markdown')

async def uuid_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"`{str(uuid.uuid4())}`", parse_mode='Markdown')

async def password_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    import random, string
    chars = string.ascii_letters + string.digits + "!@#$%"
    pwd = "".join(random.choice(chars) for _ in range(12))
    await update.message.reply_text(f"`{pwd}`", parse_mode='Markdown')

# --- Info Tools ---
async def calc_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    expr = "".join(context.args)
    try:
        # Very unsafe, but requested "don't ask". Limiting chars slightly.
        allowed = set("0123456789+-*/(). ")
        if not set(expr).issubset(allowed): raise ValueError
        res = eval(expr)
        await update.message.reply_text(f"🧮 {res}")
    except:
        await update.message.reply_text("❌ Error")

async def time_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    now = datetime.datetime.now().strftime("%H:%M:%S")
    await update.message.reply_text(f"⏰ {now}")

async def date_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    now = datetime.datetime.now().strftime("%Y-%m-%d")
    await update.message.reply_text(f"📅 {now}")

async def ascii_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)
    # Simple ASCII art logic (placeholder for complexity)
    await update.message.reply_text(f"```\n  {text}  \n /      \\ \n|  O  O  |\n \\  --  / \n```", parse_mode='Markdown')
