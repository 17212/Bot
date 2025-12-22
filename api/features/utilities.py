from api.core import generate_content

async def summarize_text(text: str, config: dict) -> str:
    prompt = f"Summarize the following text concisely:\n\n{text}"
    return await generate_content(prompt, config)

async def translate_text(text: str, target_lang: str, config: dict) -> str:
    prompt = f"Translate the following text to {target_lang}:\n\n{text}"
    return await generate_content(prompt, config)

async def roast_user(user_name: str, config: dict) -> str:
    prompt = f"Give a short, savage roast for a user named {user_name}. Be funny but mean."
    return await generate_content(prompt, config)
