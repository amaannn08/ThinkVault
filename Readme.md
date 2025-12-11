# **TripTales**
TripTales is a community-driven travel platform where people share real experiences, tips, itineraries, and stories.
On top of that, an AI travel guide helps users explore destinations using **vector database search**, **RAG**, and data collected from public travel sources.

The idea is simple:
**Authentic experiences from real people + an AI that actually understands travel.**

---

## 🌍 What TripTales Offers

### 📝 Community Travel Posts

* Share experiences, photos, budgets, and itineraries
* Upvote, comment, and follow destinations
* Discover hidden gems through real travellers

### 🔍 AI-Powered Travel Search (RAG)

* Uses **OpenAI embeddings** + **Pinecone/Chroma**
* Learns from scraped travel content + user posts
* Returns meaning-based answers, not shallow keyword matches

### 🤖 Personal AI Travel Guide

* Built with **Gemini/OpenAI** through a dedicated RAG pipeline
* Suggests itineraries, budgets, best seasons, food spots, and more
* Context-aware responses grounded in your vector DB

### 🧳 Smart Planning Tools

* Auto-generated trip summaries
* Suggested plans for different budgets
* Tag-based filtering: solo, budget, trek, beach, adventure, etc.

---

## 🛠️ Tech Stack

**Frontend**

* React / Next.js (or your chosen stack)
* TailwindCSS
* JWT-based client auth
* Responsive feed + chat UI

**Backend**

* Node.js + Express
* MongoDB + Mongoose
* Pinecone / ChromaDB for embeddings
* AI integration with Gemini / OpenAI
* Secure JWT auth and role-based routes

---

## 📁 Project Structure

```
TripTales/
├── backend/
├── frontend/
├── README.md
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/amaannn08/TripTales.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env` file:

```
PORT=3000
MONGODB_URL=your_mongodb_uri
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_secret
PINECONE_API_KEY=your_key
```

### 4. Run the dev server

```bash
npm run dev
```

---

## 🗺️ Roadmap

* Geo-tagged map view of all posts
* AI itinerary builder with budget sliders
* Traveler badges + reputation system
* Marketplace for curated trips
* Chrome extension for saving travel notes
* Real-time chat with verified travel guides

---

## 🤝 Contributing

Ideas, issues, and PRs are welcome.
If you want to collaborate or experiment with the RAG pipeline, just reach out.
