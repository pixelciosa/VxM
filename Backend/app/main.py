from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, agents, library, sessions, datalab, admin, profiles

settings = get_settings()

app = FastAPI(
    title="VxM API",
    description="Backend for VxM (voyXmas) — AI Agent integrator",
    version="1.0.0",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(library.router)
app.include_router(agents.router)
app.include_router(sessions.router)
app.include_router(datalab.router)
app.include_router(admin.router)
app.include_router(profiles.router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to VxM API",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health():
    return {"status": "ok", "project": "VxM API v1.0"}
