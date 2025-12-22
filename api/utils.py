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

# --- Chat History Management ---
def add_message_to_history(user_id: int, role: str, content: str):
    """Adds a message to the user's chat history in Firestore."""
    db = get_firestore_db()
    # Subcollection 'history' under the user document
    db.collection("users").document(str(user_id)).collection("history").add({
        "role": role,
        "parts": [content],
        "timestamp": firestore.SERVER_TIMESTAMP
    })

def get_chat_history(user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    """Retrieves the last N messages from the user's chat history."""
    db = get_firestore_db()
    history_ref = db.collection("users").document(str(user_id)).collection("history")
    
    # Get last N messages ordered by timestamp
    docs = history_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream()
    
    history = []
    for doc in docs:
        data = doc.to_dict()
        # Convert to Gemini format
        history.append({
            "role": data["role"],
            "parts": data["parts"]
        })
    
    return history[::-1] # Reverse to get chronological order

# --- User Tracking ---
def log_user(user: Any):
    """Logs or updates user information in Firestore."""
    db = get_firestore_db()
    user_ref = db.collection("users").document(str(user.id))
    
    user_data = {
        "id": user.id,
        "first_name": user.first_name,
        "username": user.username,
        "last_seen": firestore.SERVER_TIMESTAMP
    }
    
    # Set with merge=True to update existing fields or create new doc
    user_ref.set(user_data, merge=True)

def get_all_users() -> List[Dict[str, Any]]:
    """Retrieves all registered users."""
    db = get_firestore_db()
    users = db.collection("users").stream()
    return [u.to_dict() for u in users]

def get_bot_stats() -> Dict[str, Any]:
    """Returns basic stats about the bot."""
    db = get_firestore_db()
    # Count users (this can be expensive for large collections, but fine for now)
    users_coll = db.collection("users")
    user_count = len(list(users_coll.list_documents())) # list_documents is lighter than getting all data
    
    return {
        "user_count": user_count
    }
