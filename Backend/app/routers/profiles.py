from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.auth import get_current_user
from app.database import get_supabase
from datetime import date

router = APIRouter(prefix="/profiles", tags=["profiles"])

class ProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    gender: str | None = None # Mujer, Hombre, Otro
    birth_date: date | None = None
    nationality: str | None = None
    residence_city: str | None = None
    residence_country: str | None = None
    occupation: str | None = Field(None, max_length=100)
    has_children: bool | None = None
    marital_status: str | None = None
    has_pets: bool | None = None

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    user_id = current_user["id"]
    
    # Get personal data
    result = db.table("user_personal_data").select("*").eq("id", user_id).execute()
    
    # Get role from admin_users (if exists)
    role_result = db.table("admin_users").select("role").eq("profile_id", user_id).execute()
    role = role_result.data[0]["role"] if role_result.data else "user"
    
    profile_data = result.data[0] if result.data else {}
    profile_data["role"] = role
        
    return profile_data

@router.put("/me")
async def update_my_profile(profile: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    user_id = current_user["id"]
    
    # Use upsert to handle first-time creation or subsequent updates
    # We filter by ID and provide the data
    data = profile.model_dump(exclude_unset=True)
    # Convert dates to strings for JSON serialization
    for key, value in data.items():
        if isinstance(value, date):
            data[key] = value.isoformat()
    data["id"] = user_id
    
    result = db.table("user_personal_data").upsert(data).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update profile")
        
    return result.data[0]
