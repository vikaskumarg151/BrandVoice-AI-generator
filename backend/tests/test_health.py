from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Test 1: Health endpoint returns healthy status and metadata."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "environment" in data
    assert "openai_configured" in data

def test_missing_api_credentials_health(monkeypatch):
    """Test 12: Handling of missing API credentials indicates unconfigured OpenAI."""
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["openai_configured"] is False
