import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def mock_user():
    return {"id": "test-user-id", "email": "test@vxm.com", "role": "authenticated"}


def mock_agent():
    return {
        "id": "agent-123",
        "user_id": "test-user-id",
        "context_id": "ctx-1",
        "archetype_id": "arch-1",
        "custom_name": "Jedi Samurai · Coach Ontológico",
        "avatar_url": None,
        "is_active": True,
    }


from app.auth import get_current_user

# ─── Auth Override ────────────────────────────────────────────────────────────

def mock_get_current_user():
    return {"id": "test-user-id", "email": "test@vxm.com", "role": "authenticated"}

app.dependency_overrides[get_current_user] = mock_get_current_user


# ─── Tests: Agent Creation ────────────────────────────────────────────────────

@patch("app.routers.agents.get_supabase")
@patch("app.services.gemini.get_gemini_client")
def test_create_new_agent(mock_gemini, mock_db):
    """Creating a new agent returns a greeting and session_id."""
    db = MagicMock()
    mock_db.return_value = db

    # No existing agent
    db.table.return_value.select.return_value.eq.return_value.eq.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data = []

    # Context and archetype exist
    db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "id": "ctx-1", "name": "Jedi Samurai", "system_prompt": "Eres un maestro...", "tone": ""
    }

    # Safety prompts empty
    db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

    # Agent insert
    db.table.return_value.insert.return_value.execute.return_value.data = [mock_agent()]

    # Session insert
    db.table.return_value.insert.return_value.execute.return_value.data = [{"id": "session-abc"}]

    # Gemini greeting
    gemini_client = MagicMock()
    mock_gemini.return_value = gemini_client
    gemini_client.models.generate_content.return_value.text = "¡Bienvenido, guerrero!"

    response = client.post("/agents", json={
        "context_id": "ctx-1",
        "archetype_id": "arch-1",
        "platform": "whatsapp"
    }, headers={"Authorization": "Bearer fake-token"})

    assert response.status_code == 201
    data = response.json()
    assert data["is_new"] is True
    assert "greeting" in data


@patch("app.routers.agents.get_supabase")
def test_get_existing_agent(mock_db):
    """Creating an agent for existing context+archetype returns the existing one."""
    db = MagicMock()
    mock_db.return_value = db

    # Existing agent found
    db.table.return_value.select.return_value.eq.return_value.eq.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data = [mock_agent()]

    # Latest session
    db.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = [{"id": "session-existing"}]

    response = client.post("/agents", json={
        "context_id": "ctx-1",
        "archetype_id": "arch-1",
        "platform": "whatsapp"
    }, headers={"Authorization": "Bearer fake-token"})

    assert response.status_code == 201
    data = response.json()
    assert data["is_new"] is False
    assert data["greeting"] is None
    assert data["session_id"] == "session-existing"


# ─── Tests: DataLab ────────────────────────────────────────────────────────────

@patch("app.routers.datalab.get_supabase")
def test_ingest_event_no_user_id(mock_db):
    """Analytics events are stored without any user_id."""
    db = MagicMock()
    mock_db.return_value = db
    db.table.return_value.insert.return_value.execute.return_value.data = [{"id": "evt-1"}]

    response = client.post("/events", json={
        "event_name": "session_start",
        "context_id": "ctx-1",
        "archetype_id": "arch-1",
        "platform": "whatsapp",
        "properties": {"session_duration": 120}
    })

    assert response.status_code == 201

    # Verify user_id is NOT in the insert payload
    insert_call_args = db.table.return_value.insert.call_args[0][0]
    assert "user_id" not in insert_call_args


@patch("app.routers.datalab.get_supabase")
def test_ingest_event_anonymous_properties(mock_db):
    """Properties dict can carry custom metadata."""
    db = MagicMock()
    mock_db.return_value = db
    db.table.return_value.insert.return_value.execute.return_value.data = [{}]

    response = client.post("/events", json={
        "event_name": "message_sent",
        "properties": {"message_length": 45, "has_image": False}
    })
    assert response.status_code == 201


# ─── Tests: Library (public) ─────────────────────────────────────────────────

@patch("app.routers.library.get_supabase")
def test_list_contexts_public(mock_db):
    """'/library/contexts' is accessible without auth."""
    db = MagicMock()
    mock_db.return_value = db
    db.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = [
        {"id": "ctx-1", "name": "Jedi Samurai", "description": "Disciplina"}
    ]

    response = client.get("/library/contexts")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Jedi Samurai"
