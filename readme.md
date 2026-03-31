# ThinkVault AI 🧠

> **A production-grade AI knowledge intelligence platform** with semantic search, RAG, and AI-powered mind mapping.

![Stack](https://img.shields.io/badge/FastAPI-0.115-green) ![Stack](https://img.shields.io/badge/React-19-blue) ![Stack](https://img.shields.io/badge/pgvector-0.3-purple) ![Stack](https://img.shields.io/badge/DeepSeek-Chat-orange)

---

## ✨ Features

| Feature | Tech | CV Point |
|---|---|---|
| **AI Mind Maps** | DeepSeek + React Flow | Drag-drop editable mind maps from any document |
| **Semantic Search** | Gemini embeddings + pgvector | Cosine similarity, ivfflat index |
| **RAG Chat** | DeepSeek + pgvector | Context-aware answers with source citations |
| **Real-time Suggestions** | Debounced vector lookup | 300ms debounce, instant semantic suggestions |
| **Document Ingestion** | PDF/URL/Text | pdfplumber, BeautifulSoup, chunking+embedding |

---

## 🏗️ Architecture

```
User Query → Gemini text-embedding-004 → pgvector (cosine similarity)
     ↓                                          ↓
  Result         ←    DeepSeek Chat API    ← Top-K chunks
```

**RAG Flow:**
1. User uploads document → parsed → chunked (500–1000 tokens)
2. Each chunk → Gemini `text-embedding-004` → 768-dim vector → stored in pgvector
3. Query → Gemini embed → pgvector `<=>` cosine search → top-K chunks as context
4. Context + query → DeepSeek `deepseek-chat` → contextual answer + sources

---

## 🚀 Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- NeonDB account (PostgreSQL + pgvector)
- Gemini API key
- DeepSeek API key

### Backend

```bash
cd backend

# Copy and fill env
cp .env.example .env
# Edit DATABASE_URL, GEMINI_API_KEY, DEEPSEEK_API_KEY, SECRET_KEY

# Install dependencies
python3 -m venv .venv && source .venv/bin/activate  # or .venv/bin/python3
pip install -r requirements.txt

# Run Alembic migrations (NeonDB)
# First install psycopg2: pip install psycopg2-binary
alembic upgrade head

# (Optional) Seed demo data
python seed.py

# Start server
uvicorn app:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 📁 Backend Structure

```
backend/
├── app/
│   ├── api/v1/          # FastAPI routers (auth, documents, search, chat, mindmaps)
│   ├── core/            # Config (pydantic-settings), security (JWT+bcrypt), logging
│   ├── db/              # SQLAlchemy async engine + session
│   ├── models/          # SQLAlchemy models (User, Document, Chunk, Embedding, MindMap)
│   ├── schemas/         # Pydantic request/response models
│   └── services/        # Business logic
│       ├── auth_service.py       # signup, login, JWT dependency
│       ├── ingestion_service.py  # PDF/URL/text parsing + chunking
│       ├── embedding_service.py  # Gemini text-embedding-004
│       ├── vector_search_service.py  # pgvector cosine similarity
│       ├── rag_service.py        # Full RAG pipeline
│       ├── mindmap_service.py    # DeepSeek mind map generation
│       └── suggestion_service.py # Real-time search suggestions
├── alembic/             # DB migrations (ivfflat index, all tables)
├── seed.py              # Demo data
├── requirements.txt
└── .env.example
```

---

## 🗄️ Database Schema

```sql
users           → id, email, hashed_password, full_name
documents       → id, user_id, title, source_type, raw_text, status, chunk_count
content_chunks  → id, document_id, chunk_index, content, token_count
embeddings      → id, chunk_id, vector(768)  ← ivfflat index
mindmaps        → id, document_id, title, graph_json (JSONB)
chat_messages   → id, user_id, session_id, role, content
```

The `embeddings.vector` column uses **ivfflat** index with `vector_cosine_ops`:
```sql
CREATE INDEX ON embeddings USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Register new user |
| POST | `/api/v1/auth/login` | Login → JWT |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/documents/upload` | Upload text/PDF/URL |
| GET | `/api/v1/documents` | List documents (paginated) |
| POST | `/api/v1/search` | Semantic vector search |
| GET | `/api/v1/search/suggestions` | Real-time query suggestions |
| POST | `/api/v1/chat` | RAG chat answer |
| GET | `/api/v1/chat/history` | Session chat history |
| POST | `/api/v1/mindmaps/generate/{id}` | Generate mind map |
| GET | `/api/v1/mindmaps/{id}` | Get mind map |
| PUT | `/api/v1/mindmaps/{id}` | Save edited mind map |

Interactive docs: `http://localhost:8000/docs`

---

## 🌍 Deployment

| Service | Platform |
|---|---|
| Backend | Render / Railway (add `PORT` env var, `uvicorn app:app --host 0.0.0.0 --port $PORT`) |
| Frontend | Vercel (set `VITE_API_URL` if not proxying) |
| Database | NeonDB (free tier supports pgvector) |