import { create } from 'zustand'

export const useDocumentStore = create((set) => ({
    documents: [],
    total: 0,
    loading: false,
    uploading: false,
    setDocuments: (documents, total) => set({ documents, total }),
    setLoading: (loading) => set({ loading }),
    setUploading: (uploading) => set({ uploading }),
    addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents], total: s.total + 1 })),
    removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id), total: s.total - 1 })),
}))

export const useChatStore = create((set) => ({
    messages: [],
    loading: false,
    sessionId: `session_${Date.now()}`,
    sources: [],
    addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
    setMessages: (messages) => set({ messages }),
    setLoading: (loading) => set({ loading }),
    setSources: (sources) => set({ sources }),
    resetSession: () => set({ messages: [], sources: [], sessionId: `session_${Date.now()}` }),
}))

export const useMindMapStore = create((set) => ({
    mindmaps: [],
    currentMindMap: null,
    generating: false,
    setMindMaps: (mindmaps) => set({ mindmaps }),
    setCurrentMindMap: (mm) => set({ currentMindMap: mm }),
    setGenerating: (generating) => set({ generating }),
    updateCurrentGraph: (graphJson) =>
        set((s) => ({
            currentMindMap: s.currentMindMap ? { ...s.currentMindMap, graph_json: graphJson } : null,
        })),
}))
