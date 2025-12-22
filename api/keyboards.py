from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from api.utils import get_bot_config

def get_main_menu_keyboard():
    keyboard = [
        [
            InlineKeyboardButton("📊 Stats", callback_data='menu_stats'),
            InlineKeyboardButton("📢 Broadcast", callback_data='menu_broadcast'),
        ],
        [
            InlineKeyboardButton("⚙️ Settings", callback_data='menu_settings'),
            InlineKeyboardButton("🔑 API Keys", callback_data='menu_keys'),
        ],
        [
            InlineKeyboardButton("❌ Close", callback_data='close_panel')
        ]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_settings_keyboard():
    config = get_bot_config()
    current_mode = config.get('mode', 'default')
    
    keyboard = [
        [
            InlineKeyboardButton(f"Mode: {current_mode.upper()}", callback_data='toggle_mode'),
        ],
        [
            InlineKeyboardButton("✏️ Edit Prompt", callback_data='edit_prompt'),
            InlineKeyboardButton("📝 Edit Topics", callback_data='edit_topics'),
        ],
        [
            InlineKeyboardButton("🔙 Back", callback_data='main_menu')
        ]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_keys_keyboard():
    config = get_bot_config()
    keys = config.get('api_keys', [])
    current_idx = config.get('current_key_index', 0)
    
    keyboard = []
    
    # Show current key info (masked)
    if keys:
        current_key = keys[current_idx]
        masked_key = f"{current_key[:4]}...{current_key[-4:]}"
        keyboard.append([InlineKeyboardButton(f"Active: {masked_key}", callback_data='noop')])
    else:
        keyboard.append([InlineKeyboardButton("⚠️ No Keys Found", callback_data='noop')])

    keyboard.append([
        InlineKeyboardButton("🔄 Rotate Key", callback_data='rotate_key'),
        InlineKeyboardButton("➕ Add Key", callback_data='add_key_prompt')
    ])
    
    keyboard.append([InlineKeyboardButton("🔙 Back", callback_data='main_menu')])
    
    return InlineKeyboardMarkup(keyboard)
