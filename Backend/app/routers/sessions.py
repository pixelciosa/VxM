from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.auth import get_current_user
from app.database import get_supabase

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("")
async def list_sessions(current_user: dict = Depends(get_current_user)):
    """Returns all chat sessions for the current user, ordered by most recent."""
    db = get_supabase()
    result = (
        db.table("chat_sessions")
        .select("""
            id, agent_id, platform, started_at, ended_at, is_pinned, is_archived,
            agents(id, custom_name, avatar_url,
                contexts(id, name),
                archetypes(id, name)
            )
        """)
        .eq("user_id", current_user["id"])
        .order("started_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{session_id}/messages")
async def get_session_messages(session_id: str, current_user: dict = Depends(get_current_user)):
    """Returns all messages for a given session (user must own the session)."""
    db = get_supabase()

    # Ownership check
    session = (
        db.table("chat_sessions")
        .select("id")
        .eq("id", session_id)
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )
    if not session.data:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Session not found.")

    messages = (
        db.table("messages")
        .select("id, role, content, image_url, tokens_used, created_at")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    return messages.data

class SessionUpdate(BaseModel):
    is_pinned: bool | None = None
    is_archived: bool | None = None

@router.patch("/{session_id}")
async def update_session(session_id: str, update: SessionUpdate, current_user: dict = Depends(get_current_user)):
    """Updates session flags like is_pinned or is_archived."""
    db = get_supabase()
    
    updates = {}
    if update.is_pinned is not None:
        updates["is_pinned"] = update.is_pinned
    if update.is_archived is not None:
        updates["is_archived"] = update.is_archived
        
    if not updates:
        return {"status": "no_changes"}
        
    res = db.table("chat_sessions").update(updates).eq("id", session_id).eq("user_id", current_user["id"]).execute()
    return res.data


@router.delete("/{session_id}")
async def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Deletes a session from the DB permanently."""
    db = get_supabase()
    db.table("chat_sessions").delete().eq("id", session_id).eq("user_id", current_user["id"]).execute()
    return {"status": "deleted"}
