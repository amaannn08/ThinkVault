import client from './client'

export const authAPI = {
    signup: (data) => client.post('/auth/signup', data),
    login: (data) => client.post('/auth/login', data),
    me: () => client.get('/auth/me'),
}

export const documentsAPI = {
    upload: (formData) => client.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    list: (page = 1, pageSize = 20) => client.get(`/documents?page=${page}&page_size=${pageSize}`),
    get: (id) => client.get(`/documents/${id}`),
    delete: (id) => client.delete(`/documents/${id}`),
}

export const searchAPI = {
    semantic: (query, topK = 5) => client.post('/search', { query, top_k: topK }),
    suggestions: (q) => client.get(`/search/suggestions?q=${encodeURIComponent(q)}`),
}

export const chatAPI = {
    send: (query, sessionId, documentId = null) =>
        client.post('/chat', { query, session_id: sessionId, document_id: documentId }),
    history: (sessionId) => client.get(`/chat/history?session_id=${sessionId}`),
}

export const mindmapsAPI = {
    generate: (documentId) => client.post(`/mindmaps/generate/${documentId}`),
    list: () => client.get('/mindmaps'),
    get: (id) => client.get(`/mindmaps/${id}`),
    update: (id, data) => client.put(`/mindmaps/${id}`, data),
}
