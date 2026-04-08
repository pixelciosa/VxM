from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import get_settings
from app.database import get_supabase

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """
    Validates a Supabase JWT using the Supabase API.
    This is algorithm-agnostic and avoids issues with HS256/ES256 secrets.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid",
        )
    
    token = credentials.credentials
    db = get_supabase()

    try:
        # Verify the user via Supabase API
        # This works regardless of whether the project uses HS256 or ES256
        response = db.auth.get_user(token)
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
            
        user = response.user
        return {
            "id": str(user.id),
            "email": user.email,
            "role": user.role if hasattr(user, 'role') else "authenticated"
        }
    except Exception as e:
        print(f"DEBUG: Supabase Auth Error: {e}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {e}",
        )


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Admin-only guard. Checks the admin_users table for the user's role."""
    db = get_supabase()
    result = (
        db.table("admin_users")
        .select("role")
        .eq("profile_id", current_user["id"])
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    current_user["admin_role"] = result.data["role"]
    return current_user
