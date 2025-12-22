import logging
import google.generativeai as genai
import PIL.Image
import io
from api.utils import get_current_api_key, rotate_api_key

logger = logging.getLogger(__name__)

async def generate_content(prompt: str, config: dict, history: list = [], image_data: bytes = None) -> str:
    """Generates content using Gemini, handling key rotation, history, and images."""
    api_key = get_current_api_key()
    if not api_key:
        return "🚨 Error: No API Keys configured!"

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')

    try:
        # Reconstruct chat for context
        chat = model.start_chat(history=history)
        
        message_parts = [prompt]
        if image_data:
            image = PIL.Image.open(io.BytesIO(image_data))
            message_parts.append(image)

        response = await chat.send_message_async(message_parts)
        return response.text
    except Exception as e:
        logger.error(f"Gemini Error: {e}")
        # Simple rotation logic: try next key
        new_key = rotate_api_key()
        if new_key:
             logger.info("Rotated API Key due to error. Retrying...")
             genai.configure(api_key=new_key)
             model = genai.GenerativeModel('gemini-2.5-flash')
             try:
                 # Retry logic needs to duplicate the setup
                 chat = model.start_chat(history=history)
                 message_parts = [prompt]
                 if image_data:
                    image = PIL.Image.open(io.BytesIO(image_data))
                    message_parts.append(image)
                 response = await chat.send_message_async(message_parts)
                 return response.text
             except Exception as e2:
                 return f"🚨 Error after rotation: {e2}"
        return f"🚨 Error: {e}"
