import pytest

from app import create_app

VALID = {
    "company": "Infosys",
    "role": "Frontend Developer",
    "location": "Bengaluru",
    "jobLink": "https://careers.example.com/job/1",
    "source": "Naukri",
    "status": "Applied",
    "appliedDate": "2026-10-20",
    "notes": "",
}


@pytest.fixture()
def client(tmp_path):
    app = create_app(str(tmp_path / "test.db"))
    app.config["TESTING"] = True
    return app.test_client()


def test_health(client):
    assert client.get("/api/health").get_json() == {"status": "ok"}


def test_create_and_list(client):
    response = client.post("/api/applications", json=VALID)
    assert response.status_code == 201
    created = response.get_json()
    assert created["id"] == 1
    assert created["company"] == "Infosys"

    items = client.get("/api/applications").get_json()
    assert len(items) == 1
    assert items[0]["jobLink"] == VALID["jobLink"]


def test_validation_errors(client):
    response = client.post(
        "/api/applications",
        json={**VALID, "company": " ", "status": "Unknown", "jobLink": "careers page", "appliedDate": "2999-01-01"},
    )
    assert response.status_code == 400
    assert set(response.get_json()["details"]) == {"company", "status", "jobLink", "appliedDate"}


def test_rejects_non_json_body(client):
    response = client.post("/api/applications", data="hello")
    assert response.status_code == 400


def test_update(client):
    client.post("/api/applications", json=VALID)
    response = client.put("/api/applications/1", json={**VALID, "status": "Interview"})
    assert response.status_code == 200
    assert response.get_json()["status"] == "Interview"


def test_delete(client):
    client.post("/api/applications", json=VALID)
    assert client.delete("/api/applications/1").status_code == 204
    assert client.get("/api/applications/1").status_code == 404


def test_missing_application_returns_404(client):
    assert client.put("/api/applications/99", json=VALID).status_code == 404
    assert client.delete("/api/applications/99").status_code == 404


def test_cors_headers(client):
    response = client.get("/api/applications")
    assert response.headers["Access-Control-Allow-Origin"] == "*"
