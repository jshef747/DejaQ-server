from fastapi.testclient import TestClient


def test_admin_whoami_requires_auth():
    from app.main import app

    client = TestClient(app)
    missing = client.get("/admin/v1/whoami")
    assert missing.status_code == 401


def test_admin_whoami_returns_user_info(authed_admin_client):
    client, headers = authed_admin_client
    resp = client.get("/admin/v1/whoami", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["authorized"] is True
    assert data["actor_type"] == "system"


def test_admin_org_create_list_delete_round_trip(isolated_org_db, authed_admin_client):
    client, headers = authed_admin_client

    created = client.post("/admin/v1/orgs", json={"name": "Acme"}, headers=headers)
    listed = client.get("/admin/v1/orgs", headers=headers)
    deleted = client.delete("/admin/v1/orgs/acme", headers=headers)

    assert created.status_code == 201
    assert created.json()["slug"] == "acme"
    assert listed.status_code == 200
    assert [item["slug"] for item in listed.json()] == ["acme"]
    assert deleted.status_code == 200
    assert deleted.json() == {"deleted": True, "departments_removed": 0}
