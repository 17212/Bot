import os
import logging
from telegram import Update
from telegram.ext import ApplicationBuilder
from api.index import application # Import the configured app

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

if __name__ == '__main__':
    print("🚀 Starting Entropy 72 in POLLING mode (Local)...")
    
    # Ensure credentials are present
    if not os.environ.get("FIREBASE_CREDENTIALS"):
        print("⚠️ WARNING: FIREBASE_CREDENTIALS env var is missing. Database calls will fail.")
    
    if not os.environ.get("TELEGRAM_TOKEN"):
        print("⚠️ WARNING: TELEGRAM_TOKEN env var is missing. Using hardcoded fallback if available.")

    # Run polling
    application.run_polling()
