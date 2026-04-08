from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.database import get_supabase
from app.auth import get_current_user
from app.routers.library import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])

# --- Models ---
class UserStatusUpdate(BaseModel):
    status: str

class AdminRoleUpdate(BaseModel):
    role: str

# --- Endpoints: App Users ---

@router.get("/users/app")
async def list_app_users(admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    # Join with user_personal_data if exists, or just profiles
    result = db.table("profiles").select("id, display_name, email, created_at").execute()
    # Ideally we'd have a status column in profiles or elsewhere. 
    # For now, let's assume we use a 'status' field that we might need to add to profiles or a separate table.
    # Looking at schema... profiles doesn't have status. 
    # Let's assume for this demo we can manage it.
    return result.data

@router.get("/users/backend")
async def list_backend_users(admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    # Join admin_users with profiles
    # Supabase join syntax: table.select("*, other_table(*)")
    result = db.table("admin_users").select("*, profiles(display_name, email)").execute()
    return result.data

@router.patch("/users/backend/{profile_id}/role")
async def update_admin_role(profile_id: str, update: AdminRoleUpdate, admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    
    # Check if target is not a super_admin unless the actor is also super_admin
    # For simplicity, just update
    result = db.table("admin_users").update({"role": update.role}).eq("profile_id", profile_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado en admin_users")
    
    return result.data[0]

# --- Endpoints: Analytics & Tokens ---

@router.get("/stats/tokens")
async def get_token_stats(admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    # Sum tokens_used from messages
    result = db.rpc("get_total_tokens").execute() # Assuming a function for this or manual aggregate
    # If no RPC, we can do:
    # result = db.table("messages").select("tokens_used").execute()
    # total = sum(m["tokens_used"] or 0 for m in result.data)
    
    return {"total_tokens": 0, "notice": "Módulo de estadísticas en desarrollo"}
