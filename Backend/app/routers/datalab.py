from fastapi import APIRouter
from pydantic import BaseModel
from app.database import get_supabase
from datetime import datetime, timezone

router = APIRouter(prefix="/events", tags=["datalab"])


class AnalyticsEvent(BaseModel):
    event_name: str
    context_id: str | None = None
    archetype_id: str | None = None
    platform: str | None = None
    properties: dict = {}


@router.post("", status_code=201)
async def ingest_event(event: AnalyticsEvent):
    """
    Ingests an anonymous analytics event. No user_id stored.
    Called by the frontend on: session_start, message_sent, image_uploaded, etc.
    """
    db = get_supabase()
    db.table("analytics_events").insert({
        "event_name": event.event_name,
        "context_id": event.context_id,
        "archetype_id": event.archetype_id,
        "platform": event.platform,
        "properties": event.properties,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return {"status": "ok"}
