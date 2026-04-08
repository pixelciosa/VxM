from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.database import get_supabase
from app.auth import get_current_user

router = APIRouter(prefix="/library", tags=["library"])

# --- Models ---
class ContextBase(BaseModel):
    name: str
    description: str | None = None
    system_prompt: str
    icon: str | None = None
    color: str | None = None
    is_active: bool = True
    display_order: int = 0

class ArchetypeBase(BaseModel):
    name: str
    description: str | None = None
    system_prompt: str
    tone: str | None = None
    icon: str | None = None
    color: str | None = None
    is_active: bool = True
    display_order: int = 0

class SafetyPromptBase(BaseModel):
    name: str
    content: str
    is_active: bool = True

class AgentNameProposalBase(BaseModel):
    name: str
    gender: str
    context_id: str
    archetype_id: str

# --- Middlewares ---
async def get_admin_user(current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    user_id = current_user["id"]
    result = db.table("admin_users").select("role").eq("profile_id", user_id).execute()
    if not result.data or result.data[0]["role"] not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador"
        )
    return current_user

# --- Public Endpoints ---

@router.get("/contexts")
async def list_contexts():
    """Returns all active contexts. Public endpoint."""
    db = get_supabase()
    result = db.table("contexts").select("id, name, description, icon, color").eq("is_active", True).order("display_order").execute()
    return result.data

@router.get("/archetypes")
async def list_archetypes():
    """Returns all active archetypes. Public endpoint."""
    db = get_supabase()
    result = db.table("archetypes").select("id, name, description, tone, icon, color").eq("is_active", True).order("display_order").execute()
    return result.data

# --- Admin Endpoints: Contexts ---

@router.get("/contexts/all")
async def list_all_contexts(admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    result = db.table("contexts").select("*").order("display_order").execute()
    return result.data

@router.post("/contexts")
async def create_context(context: ContextBase, admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    data = context.model_dump()
    result = db.table("contexts").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Error al crear contexto")
    
    new_ctx = result.data[0]
    # Initial history entry
    db.table("context_history").insert({
        "context_id": new_ctx["id"],
        "system_prompt": new_ctx["system_prompt"],
        "version": new_ctx["version"]
    }).execute()
    
    return new_ctx

@router.patch("/contexts/{ctx_id}")
async def update_context(ctx_id: str, context: ContextBase, admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    
    # Get current version
    current = db.table("contexts").select("version, system_prompt").eq("id", ctx_id).execute()
    if not current.data:
        raise HTTPException(status_code=404, detail="Contexto no encontrado")
    
    old_prompt = current.data[0]["system_prompt"]
    new_version = current.data[0]["version"] + 1
    
    data = context.model_dump()
    data["version"] = new_version
    
    result = db.table("contexts").update(data).eq("id", ctx_id).execute()
    
    # If system_prompt changed or just always save history
    db.table("context_history").insert({
        "context_id": ctx_id,
        "system_prompt": data["system_prompt"],
        "version": new_version
    }).execute()
    
    return result.data[0]

# --- Admin Endpoints: Archetypes ---

@router.get("/archetypes/all")
async def list_all_archetypes(admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    result = db.table("archetypes").select("*").order("display_order").execute()
    return result.data

@router.post("/archetypes")
async def create_archetype(archetype: ArchetypeBase, admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    data = archetype.model_dump()
    result = db.table("archetypes").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Error al crear arquetipo")
    
    new_arch = result.data[0]
    db.table("archetype_history").insert({
        "archetype_id": new_arch["id"],
        "system_prompt": new_arch["system_prompt"],
        "version": new_arch["version"]
    }).execute()
    
    return new_arch

@router.patch("/archetypes/{arch_id}")
async def update_archetype(arch_id: str, archetype: ArchetypeBase, admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    
    current = db.table("archetypes").select("version").eq("id", arch_id).execute()
    if not current.data:
        raise HTTPException(status_code=404, detail="Arquetipo no encontrado")
        
    new_version = current.data[0]["version"] + 1
    data = archetype.model_dump()
    data["version"] = new_version
    
    result = db.table("archetypes").update(data).eq("id", arch_id).execute()
    
    db.table("archetype_history").insert({
        "archetype_id": arch_id,
        "system_prompt": data["system_prompt"],
        "version": new_version
    }).execute()
    
    return result.data[0]

# --- Admin Endpoints: Safety Prompts ---

@router.get("/safety-prompts")
async def list_safety_prompts(admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    result = db.table("safety_prompts").select("*").order("created_at").execute()
    return result.data

@router.post("/safety-prompts")
async def create_safety_prompt(prompt: SafetyPromptBase, admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    data = prompt.model_dump()
    result = db.table("safety_prompts").insert(data).execute()
    
    new_p = result.data[0]
    db.table("safety_prompt_history").insert({
        "prompt_id": new_p["id"],
        "content": new_p["content"],
        "version": new_p["version"]
    }).execute()
    
    return new_p

@router.patch("/safety-prompts/{p_id}")
async def update_safety_prompt(p_id: str, prompt: SafetyPromptBase, admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    
    current = db.table("safety_prompts").select("version").eq("id", p_id).execute()
    new_version = current.data[0]["version"] + 1
    
    data = prompt.model_dump()
    data["version"] = new_version
    
    result = db.table("safety_prompts").update(data).eq("id", p_id).execute()
    
    db.table("safety_prompt_history").insert({
        "prompt_id": p_id,
        "content": data["content"],
        "version": new_version
    }).execute()
    
    return result.data[0]


# --- Admin Endpoints: Agent Name Proposals ---

@router.get("/name-proposals")
async def list_all_name_proposals(admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    # Join with contexts and archetypes for display
    result = db.table("agent_name_proposals").select("*, contexts(name), archetypes(name)").order("created_at", desc=True).execute()
    return result.data

@router.post("/name-proposals")
async def create_name_proposal(proposal: AgentNameProposalBase, admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    data = proposal.model_dump()
    result = db.table("agent_name_proposals").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Error al crear propuesta de nombre")
    return result.data[0]

@router.delete("/name-proposals/{p_id}")
async def delete_name_proposal(p_id: str, admin: dict = Depends(get_admin_user)):
    db = get_supabase()
    result = db.table("agent_name_proposals").delete().eq("id", p_id).execute()
    return {"status": "deleted"}

