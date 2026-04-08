from google import genai
from app.config import get_settings
from functools import lru_cache


@lru_cache()
def get_gemini_client() -> genai.Client:
    settings = get_settings()
    return genai.Client(api_key=settings.gemini_api_key)


MODEL = "gemini-2.5-flash"


def build_system_prompt(context_prompt: str, archetype_prompt: str, safety_prompts: list[str]) -> str:
    """Combines context, archetype and safety prompts into one system instruction."""
    safety_block = "\n\n".join(safety_prompts) if safety_prompts else ""
    return f"""
Actúa como una IA avanzada de journaling interactivo llamada Vx+ (voyXmas).

CONTEXTO DEL USUARIO:
{context_prompt}

ARQUETIPO / ROL:
{archetype_prompt}

INSTRUCCIONES GLOBALES:
1. Mantén respuestas concisas, estilo chat de WhatsApp. Sin párrafos enormes.
2. Haz preguntas frecuentes para fomentar el journaling.
3. Pide "evidencias" (fotos o textos) cuando el usuario diga que logró algo.
4. Celebra hitos efusivamente (o a tu manera según el arquetipo).
5. Usa emojis acordes al tono.
6. El objetivo es desbloquear los superpoderes humanos del usuario.
7. Si recibes una IMAGEN, analízala en función del contexto del usuario.

{safety_block}

Comienza saludando al usuario según tu personaje y pregunta cuál es el primer paso para hoy.
""".strip()


async def get_greeting(system_prompt: str, is_creative: bool = False) -> str:
    """Generates the opening greeting for a new agent session."""
    client = get_gemini_client()
    response = client.models.generate_content(
        model=MODEL,
        contents=[{"role": "user", "parts": [{"text": "Inicia la sesión saludando al usuario en tu rol."}]}],
        config=genai.types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=1.2 if is_creative else 0.7,
        ),
    )
    return response.text or "¡Hola! Estoy listo para comenzar tu camino. ¿Por dónde empezamos?"


async def send_chat_message(
    history: list[dict],
    system_prompt: str,
    user_text: str,
    image_base64: str | None = None,
    is_creative: bool = False,
) -> tuple[str, int]:
    """
    Sends a message to Gemini with full history and returns (reply_text, tokens_used).
    Handles optional inline image.
    """
    client = get_gemini_client()

    # Build user parts
    user_parts: list[dict] = []
    if user_text:
        user_parts.append({"text": user_text})
    if image_base64:
        # Strip data URI prefix if present
        if "," in image_base64:
            header, data = image_base64.split(",", 1)
            mime_type = header.split(":")[-1].split(";")[0]
        else:
            data = image_base64
            mime_type = "image/jpeg" # Default if no header
            
        user_parts.append({"inline_data": {"mime_type": mime_type, "data": data}})

    # Build full content list from history + new user message
    contents = []
    for msg in history:
        contents.append({
            "role": msg["role"],
            "parts": [{"text": msg["content"]}]
        })
    contents.append({"role": "user", "parts": user_parts})

    response = client.models.generate_content(
        model=MODEL,
        contents=contents,
        config=genai.types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=1.2 if is_creative else 0.7,
            top_k=40,
        ),
    )

    tokens_used = 0
    if response.usage_metadata:
        tokens_used = (response.usage_metadata.total_token_count or 0)

    return response.text or "", tokens_used


async def generate_avatar_prompt(agent_name: str, context_name: str, archetype_name: str) -> str:
    """Generates a DALL-E style text description for the agent's avatar (used as a prompt for image gen)."""
    client = get_gemini_client()
    prompt = (
        f"Crea una descripción de avatar de perfil para un agente de IA llamado '{agent_name}'. "
        f"El agente combina el contexto '{context_name}' con el arquetipo '{archetype_name}'. "
        "La descripción debe ser un prompt para generación de imágenes, en inglés, máximo 2 frases, "
        "estilo digital art, sin texto, sin fondo blanco."
    )
    response = client.models.generate_content(model=MODEL, contents=prompt)
    return response.text or f"A digital avatar for {agent_name}, {context_name} style"
