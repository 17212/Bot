import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from typing import List, Optional, Dict, Any

# --- Firebase Initialization ---
def get_firestore_db():
    """Initializes Firebase Admin and returns Firestore client."""
    if not firebase_admin._apps:
        # Load credentials from Environment Variable
        cred_json = os.environ.get("FIREBASE_CREDENTIALS")
        if not cred_json:
            raise ValueError("FIREBASE_CREDENTIALS environment variable not set.")
        
        try:
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        except json.JSONDecodeError:
             raise ValueError("FIREBASE_CREDENTIALS is not valid JSON.")
        except Exception as e:
            raise ValueError(f"Failed to initialize Firebase: {e}")

    return firestore.client()

# --- Config Management ---
COLLECTION_NAME = "bot_config"
DOC_NAME = "main"

DEFAULT_CONFIG = {
    "api_keys": [],
    "current_key_index": 0,
    "system_prompt": "You are Entropy 72, a chaotic AI...",
    "mode": "default",
    "custom_topics": ["Tech", "Philosophy", "Memes"],
    "posts_per_day": 3,
    "admin_id": 8206402839,
    "channel_id": "-1003436083553"
}

def get_bot_config() -> Dict[str, Any]:
    """Fetches bot configuration from Firestore. Creates default if missing."""
    db = get_firestore_db()
    doc_ref = db.collection(COLLECTION_NAME).document(DOC_NAME)
    doc = doc_ref.get()

    if doc.exists:
        return doc.to_dict()
    else:
        # Create default config
        doc_ref.set(DEFAULT_CONFIG)
        return DEFAULT_CONFIG

def update_bot_config(updates: Dict[str, Any]) -> Dict[str, Any]:
    """Updates specific fields in the bot configuration."""
    db = get_firestore_db()
    doc_ref = db.collection(COLLECTION_NAME).document(DOC_NAME)
    doc_ref.update(updates)
    return get_bot_config()

def get_current_api_key() -> Optional[str]:
    """Returns the currently active Gemini API Key."""
    config = get_bot_config()
    keys = config.get("api_keys", [])
    idx = config.get("current_key_index", 0)
    
    if not keys:
        return None
    
    if 0 <= idx < len(keys):
        return keys[idx]
    return keys[0] # Fallback

def rotate_api_key() -> Optional[str]:
    """Rotates to the next available API key. Returns new key or None if all exhausted."""
    config = get_bot_config()
    keys = config.get("api_keys", [])
    current_idx = config.get("current_key_index", 0)
    
    if not keys:
        return None

    next_idx = (current_idx + 1) % len(keys)
    update_bot_config({"current_key_index": next_idx})
    
    return keys[next_idx]
