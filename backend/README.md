# Backend (FastAPI)

Python API server for the Data Science Chatbot. It loads a lesson dataset, exposes lesson/question endpoints, and provides a tutoring chat endpoint scoped to lesson or topic context.

## Quick start

From the repo root:

1. Create a virtual environment and install dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

2. Set environment variables

Create `backend/.env` and add at least:

```bash
OPENAI_API_KEY=sk-...
```

Optional settings:

```bash
OPENAI_MODEL=gpt-5-mini
LESSONS_DATA_PATH=../path/to/lessons.json
FRONTEND_URL=http://localhost:3000
```

3. Run the API

```bash
python backend/main.py
```

Server runs at `http://localhost:8000`.

## How context scoping works

The backend prefers **topic-scoped** sessions to avoid resending large lesson content on every chat request.

- Create a session with `POST /chat/session` using a topic (and optional level).
- Reuse the returned `session_id` with `POST /chat`.
- If topic context cannot be found, the backend can fall back to lesson-scoped context.

## Files and responsibilities

### `main.py`

FastAPI app and all HTTP routes. Loads the dataset once at startup, builds topic context cache, manages in-memory topic sessions, and orchestrates calls to the OpenAI client wrapper.

Key functions and behaviors:

- `chat()` (POST `/chat`): main chat handler. Builds topic or lesson context, injects the current MCQ into the user message, and sanitizes answer leaks.
- `init_topic_session()` (POST `/chat/session`): initializes a topic-scoped session via the Responses API.
- `get_context_preview()` (GET `/context/{question_id}`): returns the exact topic context used for a question.
- Debug routes: `/debug/topic-cache`, `/debug/question-scope/{question_id}`, `/debug/lesson-scope/{lesson_id}` for inspecting cache and scoping.
- Session helpers: `_prune_sessions()`, `_topic_key()` and in-memory `_TOPIC_SESSIONS` store.

### `lessons.py`

Loads and normalizes lesson data, and formats LLM-safe context strings.

Key functions:

- `load_lessons_data()`: loads the JSON dataset from `LESSONS_DATA_PATH` or fallback path.
- `get_lesson_by_id()`, `get_lesson_by_question_id()`: lookups across lessons.
- `normalize_mcq()`, `get_mcq_by_id()`: normalize MCQs into a consistent shape.
- `format_lesson_context()`: builds compact lesson context for the LLM.
- `format_mcq_for_display()`: formats a single MCQ for inclusion in chat context.
- `build_topic_context_cache()` and `get_topic_context()`: precompute and retrieve topic-scoped context.
- `get_filtered_context()`: legacy context builder used by the console test script.

### `chatbot.py`

OpenAI SDK wrapper and prompt policy.

Key functions:

- `get_openai_client()`, `get_model()`: configure API access.
- `chat_with_context()` and `chat_with_context_with_usage()`: chat completions with lesson context.
- `start_topic_session()` and `chat_with_topic_session()`: topic-scoped conversations using the Responses API.
- `_extract_assistant_text()`: normalizes assistant output to plain text.
- `estimate_tokens()`: rough token estimate (chars/4).

### `console_mcq_test.py`

Console test harness for MCQs without the frontend. It selects questions, prints options, and lets you ask the tutor questions via the same chat logic.

Run:

```bash
python backend/console_mcq_test.py --n 5 --seed 1
```

### `requirements.txt`

Pinned Python dependencies for the backend.

## API overview

- `GET /` health check and lesson count
- `GET /lessons` list lessons (no full question content)
- `GET /lessons/{lesson_id}` lesson detail
- `GET /questions/{question_id}` MCQ detail with lesson info
- `POST /chat` chat with the tutor (topic sessions preferred)
- `POST /chat/session` initialize a topic-scoped session
- `GET /context/{question_id}` preview topic context for a question
- `GET /debug/topic-cache` inspect precomputed topic cache
- `GET /debug/question-scope/{question_id}` verify question to topic mapping
- `GET /debug/lesson-scope/{lesson_id}` verify lesson to topic mapping

## Notes

- `token_estimate` is a rough heuristic for debugging, not billing accuracy.
- Topic sessions are in-memory and expire after a TTL; they reset if the server restarts.
