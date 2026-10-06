"""
Ensures the dev auth bypass is opt-in and can never be active in production.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)


@pytest.fixture
def auth_settings(monkeypatch):
    def apply(bypass: bool, environment: str):
        monkeypatch.setattr(settings, "ALLOW_DEV_AUTH_BYPASS", bypass)
        monkeypatch.setattr(settings, "ENVIRONMENT", environment)
    return apply


@pytest.mark.parametrize("headers", [{}, {"Authorization": "Bearer admin"}])
def test_records_require_auth_when_bypass_disabled(auth_settings, headers):
    auth_settings(bypass=False, environment="development")
    response = client.get("/api/records", headers=headers)
    assert response.status_code == 401


@pytest.mark.parametrize("headers", [{}, {"Authorization": "Bearer admin"}])
def test_bypass_ignored_in_production(auth_settings, headers):
    auth_settings(bypass=True, environment="production")
    response = client.get("/api/records", headers=headers)
    assert response.status_code == 401


def test_bypass_defaults_off():
    assert type(settings).model_fields["ALLOW_DEV_AUTH_BYPASS"].default is False
    assert type(settings).model_fields["DEBUG"].default is False
