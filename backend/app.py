"""REST API for the Job Application Tracker (Flask + SQLite)."""
import os
import sqlite3
from datetime import date

from flask import Flask, g, jsonify, request

STATUSES = {"Applied", "Shortlisted", "Interview", "Offer", "Rejected"}
SOURCES = {"Naukri", "LinkedIn", "Company Website", "Referral", "Indeed", "Other"}

SCHEMA = """
CREATE TABLE IF NOT EXISTS applications (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    company      TEXT NOT NULL,
    role         TEXT NOT NULL,
    location     TEXT NOT NULL DEFAULT '',
    job_link     TEXT NOT NULL DEFAULT '',
    source       TEXT NOT NULL DEFAULT 'Other',
    status       TEXT NOT NULL DEFAULT 'Applied',
    applied_date TEXT NOT NULL,
    notes        TEXT NOT NULL DEFAULT '',
    created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""

# Maps API field names (camelCase, used by the React app) to database columns.
FIELD_TO_COLUMN = {
    "company": "company",
    "role": "role",
    "location": "location",
    "jobLink": "job_link",
    "source": "source",
    "status": "status",
    "appliedDate": "applied_date",
    "notes": "notes",
}


def row_to_dict(row):
    return {"id": row["id"], **{field: row[column] for field, column in FIELD_TO_COLUMN.items()}}


def validate(payload):
    """Return (clean_data, errors) for an application payload."""
    if not isinstance(payload, dict):
        return None, {"body": "Request body must be a JSON object."}

    def text(name, limit):
        value = payload.get(name, "")
        return value.strip()[:limit] if isinstance(value, str) else ""

    data = {
        "company": text("company", 120),
        "role": text("role", 120),
        "location": text("location", 120),
        "jobLink": text("jobLink", 500),
        "source": payload.get("source") or "Other",
        "status": payload.get("status") or "Applied",
        "appliedDate": text("appliedDate", 10),
        "notes": text("notes", 1000),
    }

    errors = {}
    if not data["company"]:
        errors["company"] = "Company name is required."
    if not data["role"]:
        errors["role"] = "Job role is required."
    if data["status"] not in STATUSES:
        errors["status"] = f"Status must be one of: {', '.join(sorted(STATUSES))}."
    if data["source"] not in SOURCES:
        errors["source"] = f"Source must be one of: {', '.join(sorted(SOURCES))}."
    if data["jobLink"] and not data["jobLink"].lower().startswith(("http://", "https://")):
        errors["jobLink"] = "Job link must start with http:// or https://."

    try:
        applied = date.fromisoformat(data["appliedDate"])
        if applied > date.today():
            errors["appliedDate"] = "Applied date cannot be in the future."
    except ValueError:
        errors["appliedDate"] = "Applied date must be in YYYY-MM-DD format."

    return data, errors


def create_app(db_path=None):
    app = Flask(__name__)
    app.config["DB_PATH"] = db_path or os.environ.get("DATABASE_PATH", "applications.db")
    allowed_origin = os.environ.get("ALLOWED_ORIGIN", "*")

    def get_db():
        if "db" not in g:
            g.db = sqlite3.connect(app.config["DB_PATH"])
            g.db.row_factory = sqlite3.Row
        return g.db

    @app.teardown_appcontext
    def close_db(_exception):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    with app.app_context():
        get_db().executescript(SCHEMA)

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = allowed_origin
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    def find(application_id):
        return get_db().execute("SELECT * FROM applications WHERE id = ?", (application_id,)).fetchone()

    def not_found():
        return jsonify(error="Application not found."), 404

    def validation_error(errors):
        return jsonify(error="Validation failed.", details=errors), 400

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    @app.get("/api/applications")
    def list_applications():
        rows = get_db().execute("SELECT * FROM applications ORDER BY applied_date DESC, id DESC").fetchall()
        return jsonify([row_to_dict(row) for row in rows])

    @app.get("/api/applications/<int:application_id>")
    def get_application(application_id):
        row = find(application_id)
        return jsonify(row_to_dict(row)) if row else not_found()

    @app.post("/api/applications")
    def create_application():
        data, errors = validate(request.get_json(silent=True))
        if errors:
            return validation_error(errors)

        columns = ", ".join(FIELD_TO_COLUMN.values())
        placeholders = ", ".join("?" for _ in FIELD_TO_COLUMN)
        db = get_db()
        cursor = db.execute(
            f"INSERT INTO applications ({columns}) VALUES ({placeholders})",
            [data[field] for field in FIELD_TO_COLUMN],
        )
        db.commit()
        return jsonify(row_to_dict(find(cursor.lastrowid))), 201

    @app.put("/api/applications/<int:application_id>")
    def update_application(application_id):
        if not find(application_id):
            return not_found()
        data, errors = validate(request.get_json(silent=True))
        if errors:
            return validation_error(errors)

        assignments = ", ".join(f"{column} = ?" for column in FIELD_TO_COLUMN.values())
        db = get_db()
        db.execute(
            f"UPDATE applications SET {assignments} WHERE id = ?",
            [data[field] for field in FIELD_TO_COLUMN] + [application_id],
        )
        db.commit()
        return jsonify(row_to_dict(find(application_id)))

    @app.delete("/api/applications/<int:application_id>")
    def delete_application(application_id):
        if not find(application_id):
            return not_found()
        db = get_db()
        db.execute("DELETE FROM applications WHERE id = ?", (application_id,))
        db.commit()
        return "", 204

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))
