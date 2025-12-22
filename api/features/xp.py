from api.utils import get_firestore_db
from firebase_admin import firestore
import math

XP_PER_MESSAGE = 10

def add_xp(user_id: int, amount: int = XP_PER_MESSAGE):
    """Adds XP to a user and checks for level up."""
    db = get_firestore_db()
    user_ref = db.collection("users").document(str(user_id))
    
    # Transaction to safely update XP
    @firestore.transactional
    def update_xp_in_transaction(transaction, ref):
        snapshot = ref.get(transaction=transaction)
        current_xp = 0
        current_level = 1
        
        if snapshot.exists:
            data = snapshot.to_dict()
            current_xp = data.get("xp", 0)
            current_level = data.get("level", 1)
        
        new_xp = current_xp + amount
        # Level Formula: Level = sqrt(XP) * 0.1 (Simplified) -> XP = (Level / 0.1)^2
        # Let's use a simpler one: Level = 1 + floor(XP / 100)
        new_level = 1 + math.floor(new_xp / 100)
        
        transaction.set(ref, {"xp": new_xp, "level": new_level}, merge=True)
        
        return new_level > current_level, new_level

    transaction = db.transaction()
    leveled_up, new_level = update_xp_in_transaction(transaction, user_ref)
    
    return leveled_up, new_level

def get_leaderboard(limit: int = 10):
    """Returns top users by XP."""
    db = get_firestore_db()
    users = db.collection("users").order_by("xp", direction=firestore.Query.DESCENDING).limit(limit).stream()
    return [u.to_dict() for u in users]
