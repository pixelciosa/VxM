import random
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.auth import get_current_user
from app.database import get_supabase
from app.services import gemini as gemini_service

router = APIRouter(prefix="/agents", tags=["agents"])


class CreateAgentRequest(BaseModel):
    context_id: str
    archetype_id: str
    platform: str = "whatsapp"  # "whatsapp" | "telegram"
    gender: str = "Any"  # "M" | "F" | "Any"


class SendMessageRequest(BaseModel):
    text: str
    image_base64: str | None = None


def _build_prompt_for_agent(context: dict, archetype: dict, safety_prompts: list[dict], agent_name: str | None = None) -> tuple[str, bool]:
    """Builds the system prompt and determines if the agent is 'creative'."""
    safety_texts = [p["content"] for p in safety_prompts if p.get("is_active")]
    prompt = gemini_service.build_system_prompt(
        context_prompt=context["system_prompt"],
        archetype_prompt=archetype["system_prompt"],
        safety_prompts=safety_texts,
    )
    if agent_name:
        prompt = f"Tu nombre es {agent_name}.\n\n{prompt}"
        
    is_creative = archetype.get("tone", "").lower() in ["místico", "narrativo", "poético"]
    return prompt, is_creative


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_or_get_agent(body: CreateAgentRequest, current_user: dict = Depends(get_current_user)):
    """
    Creates a new agent for the given context + archetype combination.
    If one already exists for this user, returns the existing agent and its latest session.
    Includes the opening greeting from Gemini for new agents.
    """
    db = get_supabase()
    user_id = current_user["id"]

    # 1. Check if agent already exists for this user+context+archetype
    existing = (
        db.table("agents")
        .select("*, chat_sessions(id, platform)")
        .eq("user_id", user_id)
        .eq("context_id", body.context_id)
        .eq("archetype_id", body.archetype_id)
        .eq("is_active", True)
        .limit(1)
        .execute()
    )

    if existing.data:
        agent = existing.data[0]
        # Return existing agent — frontend will redirect to existing session
        latest_session = (
            db.table("chat_sessions")
            .select("id")
            .eq("agent_id", agent["id"])
            .order("started_at", desc=True)
            .limit(1)
            .execute()
        )
        return {
            "agent": agent,
            "session_id": latest_session.data[0]["id"] if latest_session.data else None,
            "greeting": None,  # No greeting — resume existing session
            "is_new": False,
        }

    # 2. Fetch context, archetype, and active safety prompts
    ctx = db.table("contexts").select("*").eq("id", body.context_id).single().execute()
    arch = db.table("archetypes").select("*").eq("id", body.archetype_id).single().execute()
    safety = db.table("safety_prompts").select("*").eq("is_active", True).execute()

    if not ctx.data or not arch.data:
        raise HTTPException(status_code=404, detail="Context or Archetype not found.")

    # 3. Determine Agent Name from Database
    # Query pool of names for this context + archetype + gender
    query = (
        db.table("agent_name_proposals")
        .select("name, gender")
        .eq("context_id", body.context_id)
        .eq("archetype_id", body.archetype_id)
    )
    
    if body.gender != "Any":
        query = query.eq("gender", body.gender)
    
    name_pool = query.execute().data or []
    
    if name_pool:
        picked = random.choice(name_pool)
        agent_name = picked["name"]
        gender_to_pick = picked["gender"] if picked["gender"] != "Any" else body.gender
        if gender_to_pick == "Any": gender_to_pick = "F" # Fallback for avatar
    else:
        # Fallback if no names in DB
        agent_name = f"{ctx.data['name']} · {arch.data['name']}"
        gender_to_pick = body.gender if body.gender != "Any" else "F"

    # 4. Generate Avatar URL based on chosen name + Dicebear (Neutral Expression)
    # If female, explicitly remove facial hair
    facial_hair_param = "&facialHairProbability=0" if gender_to_pick == "F" else ""
    avatar_url = f"https://api.dicebear.com/9.x/avataaars/svg?seed={agent_name}&eyes=default&eyebrow=default&mouth=smile{facial_hair_param}"

    system_prompt, is_creative = _build_prompt_for_agent(ctx.data, arch.data, safety.data or [], agent_name)

    # 5. Generate greeting from Gemini
    greeting = await gemini_service.get_greeting(system_prompt, is_creative)

    # 6. Create agent record
    agent_result = db.table("agents").insert({
        "user_id": user_id,
        "context_id": body.context_id,
        "archetype_id": body.archetype_id,
        "custom_name": agent_name,
        "avatar_url": avatar_url,
    }).execute()
    agent = agent_result.data[0]

    # 7. Create initial session
    session_result = db.table("chat_sessions").insert({
        "agent_id": agent["id"],
        "user_id": user_id,
        "platform": body.platform,
    }).execute()
    session = session_result.data[0]

    # 8. Store greeting as first message
    db.table("messages").insert({
        "session_id": session["id"],
        "role": "model",
        "content": greeting,
    }).execute()

    return {
        "agent": agent,
        "session_id": session["id"],
        "greeting": greeting,
        "is_new": True,
    }


@router.patch("/{agent_id}/name")
async def rename_agent(agent_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    """Renames an agent (user-editable name)."""
    db = get_supabase()
    result = (
        db.table("agents")
        .update({"custom_name": body.get("name")})
        .eq("id", agent_id)
        .eq("user_id", current_user["id"])
        .execute()
    )
    return result.data


@router.post("/{agent_id}/messages")
async def send_message(agent_id: str, body: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    """
    Sends a user message to the agent, calls Gemini with full session history,
    stores both messages, and returns the AI reply.
    """
    db = get_supabase()
    user_id = current_user["id"]

    # Verify agent ownership
    agent_result = (
        db.table("agents")
        .select("*, contexts(*), archetypes(*)")
        .eq("id", agent_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not agent_result.data:
        raise HTTPException(status_code=404, detail="Agent not found.")

    agent = agent_result.data

    # Get or create the active session
    session_result = (
        db.table("chat_sessions")
        .select("id")
        .eq("agent_id", agent_id)
        .is_("ended_at", "null")
        .order("started_at", desc=True)
        .limit(1)
        .execute()
    )
    if not session_result.data:
        # Start a new session if none is active
        session_result = db.table("chat_sessions").insert({
            "agent_id": agent_id,
            "user_id": user_id,
            "platform": "whatsapp",
        }).execute()
    session_id = session_result.data[0]["id"]

    # Fetch message history for this session
    history_result = (
        db.table("messages")
        .select("role, content")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    history = history_result.data or []

    # Build system prompt
    safety = db.table("safety_prompts").select("*").eq("is_active", True).execute()
    system_prompt, is_creative = _build_prompt_for_agent(
        agent["contexts"], agent["archetypes"], safety.data or []
    )

    # 1. Handle File Upload if provided
    file_url = None
    if body.image_base64:
        from app.services.storage import upload_evidence
        try:
            file_url = upload_evidence(body.image_base64)
        except Exception as e:
            print(f"File upload failed, but proceeding with text/base64: {e}")

    # 2. Call Gemini
    reply, tokens_used = await gemini_service.send_chat_message(
        history=history,
        system_prompt=system_prompt,
        user_text=body.text,
        image_base64=body.image_base64,
        is_creative=is_creative,
    )

    # 3. Store user message
    db.table("messages").insert({
        "session_id": session_id,
        "role": "user",
        "content": body.text,
        "image_url": file_url,
    }).execute()

    # Store model reply
    db.table("messages").insert({
        "session_id": session_id,
        "role": "model",
        "content": reply,
        "tokens_used": tokens_used,
    }).execute()

    return {"reply": reply, "session_id": session_id, "tokens_used": tokens_used}
