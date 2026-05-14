# CareerDNA API

FastAPI backend for resume uploads, PDF text extraction, heuristic scoring, and a simple dashboard backed by an in-memory store (swap for a database in production).

## Layout

| Path | Role |
|------|------|
| `main.py` | Run the server with Uvicorn |
| `app/main.py` | FastAPI app, CORS, router wiring |
| `app/config.py` | Environment-driven settings |
| `routes/` | HTTP endpoints |
| `services/` | PDF parsing, scoring, in-memory resume store |
| `models/` | Pydantic request/response schemas |
| `utils/` | File helpers |

## Setup

```bash
cd /path/to/CareerDNA
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

## Run

```bash
python main.py
```

Or:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open interactive docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Endpoints

- `POST /api/resume/upload` — multipart file field `file` (PDF only). Parses text, scores, stores metadata in memory, saves file under `UPLOAD_DIR`.
- `GET /api/dashboard` — aggregate stats and recent uploads from the in-memory store.
- `GET /health` — liveness probe.

## Configuration

See `.env.example` for `CORS_ORIGINS`, upload directory, and max upload size.

## Notes

- Scoring is a transparent heuristic (keywords, length, section/contact signals), not ML.
- Uploaded files persist on disk; parsed records live in process memory only until restart.
