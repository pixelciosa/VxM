from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth import get_current_user
from app.database import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])


class ProfileUpdate(BaseModel):
    display_name: str | None = None


@router.get("/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Returns the profile of the currently authenticated user."""
    db = get_supabase()
    result = db.table("profiles").select("*").eq("id", current_user["id"]).single().execute()
    if not result.data:
        # Auto-create profile if it doesn't exist (e.g. first Google login)
        db.table("profiles").insert({"id": current_user["id"], "display_name": current_user.get("email", "")}).execute()
        return {"id": current_user["id"], "display_name": current_user.get("email"), "status": "active"}
    return result.data


@router.put("/me")
async def update_profile(body: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Updates the display name of the current user."""
    db = get_supabase()
    result = db.table("profiles").update({"display_name": body.display_name}).eq("id", current_user["id"]).execute()
    return result.data
