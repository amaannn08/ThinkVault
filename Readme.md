# ThinkVault

ThinkVault is a modern “second brain” application built with the **MERN stack**, **TypeScript**, and **vector database embeddings**.  
The goal is simple: help users store, search, and understand their knowledge effortlessly using AI-powered semantic search and automated insights.

## 🚀 Features

### 🔍 Semantic Vector Search  
- Uses **OpenAI embeddings** with **Pinecone/Chroma**  
- Enables high-dimensional similarity matching for smarter content retrieval  
- Returns meaning-based results instead of keyword matches  

### 🤖 AI-Powered Analysis  
- Integrated **Google Gemini API**  
- Automatically generates explanations, summaries, and insights  
- Secure endpoints with **JWT authentication** and protected routes  

### 📤 Shareable Knowledge  
- Share notes easily using **hashed URLs**  
- Clean modal-based **CRUD operations** for creating, editing, and deleting content  
- Organized dashboard built with **TailwindCSS**

### ⚡ Smooth User Experience  
- Real-time search suggestions as you type  
- Drag-and-drop content management  
- Fully responsive layout across devices  

## 🛠️ Tech Stack

**Frontend**  
- React + TypeScript  
- TailwindCSS  
- Drag-and-drop utilities  
- JWT-based client auth  

**Backend**  
- Node.js + Express  
- MongoDB + Mongoose  
- OpenAI Embeddings  
- Pinecone / ChromaDB  
- Google Gemini API  
- Secure JWT auth & middleware  

## 📁 Project Structure

ThinkVault/
├── backend/
├── frontend/
├── README.md
├── package.json
└── ...

## 🚦 Getting Started

### 1. Clone the repository  
```bash
git clone https://github.com/amaannn08/ThinkVault.git
````

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```
PORT=3000
MONGODB_URL=your_mongodb_uri
OPENAI_API_KEY=your_key
GEMINI_API_KEY=your_key
JWT_SECRET=your_secret
```

### 4. Run the development server

```bash
npm run dev
```

---

## 📌 Roadmap

* Notebook tags & categories
* Multi-user workspace sharing
* AI-generated mind maps
* Offline local sync
* Chrome extension for instant capture

---

## 🤝 Contributing

Open to issues, feature requests, and pull requests.
If you want to collaborate, just reach out!