# Entropy 72 - Telegram Bot

This is a Vercel-hosted Telegram bot with an AI persona powered by Google Gemini and persistent storage via Firebase Firestore.

## 🚀 Setup & Deployment

### 1. Prerequisites
- **GitHub Account**: To host the code.
- **Vercel Account**: To deploy the bot.
- **Firebase Project**: You already have this (`entropy-72`).
- **Telegram Bot Token**: You have this.

### 2. Firebase Service Account (CRITICAL)
The bot needs **Admin** access to Firestore. The public config is not enough.
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Open your project `entropy-72`.
3. Go to **Project Settings** (Gear icon) -> **Service accounts**.
4. Click **Generate new private key**.
5. Open the downloaded JSON file and copy its entire content.

### 3. Deploy to Vercel
1. Push this code to a GitHub repository.
2. Go to Vercel and "Add New Project".
3. Import your GitHub repository.
4. **Environment Variables**: Add the following in Vercel settings:
   - `TELEGRAM_TOKEN`: Your bot token.
   - `FIREBASE_CREDENTIALS`: Paste the JSON content from Step 2.
5. Deploy!

### 4. Connect Webhook
Once deployed, Vercel gives you a URL (e.g., `https://entropy-72.vercel.app`).
Run this command in your browser to connect Telegram to your bot:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_VERCEL_URL>/api/index.py
```

## 🛠 Local Testing
To run the bot locally without Vercel (using Polling):
1. Set the environment variables in your terminal.
2. Run:
   ```bash
   python run_polling.py
   ```

## 🤖 Commands
- `/start`: Wake up the bot.
- `/addkey <KEY>`: Add a Gemini API Key (Required first step).
- `/mode <default/custom>`: Switch posting modes.
- `/setprompt <text>`: Change the AI's personality.
