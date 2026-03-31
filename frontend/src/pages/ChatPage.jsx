import { useState, useRef, useEffect } from 'react'
import { chatAPI } from '../api'
import { useChatStore } from '../stores/index'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Bot, User, RotateCcw, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

function MessageBubble({ msg }) {
    const isUser = msg.role === 'user'
    return (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isUser ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'rgba(255,255,255,0.07)',
                border: isUser ? 'none' : '1px solid var(--border-subtle)',
            }}>
                {isUser ? <User size={15} color="white" /> : <Bot size={15} color="var(--accent-text)" />}
            </div>
            <div style={{
                maxWidth: '72%', padding: '12px 16px', borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                background: isUser ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--bg-card)',
                border: isUser ? 'none' : '1px solid var(--border-subtle)',
                color: isUser ? 'white' : 'var(--text-primary)', fontSize: 14, lineHeight: 1.7,
            }}>
                {isUser ? msg.content : <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>}
            </div>
        </div>
    )
}

export default function ChatPage() {
    const { messages, loading, sessionId, sources, addMessage, setLoading, setSources, resetSession } = useChatStore()
    const [input, setInput] = useState('')
    const bottomRef = useRef(null)

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    const sendMessage = async () => {
        if (!input.trim() || loading) return
        const userMsg = { role: 'user', content: input }
        addMessage(userMsg)
        setInput('')
        setLoading(true)
        try {
            const { data } = await chatAPI.send(input, sessionId)
            addMessage({ role: 'assistant', content: data.answer })
            setSources(data.sources || [])
        } catch (err) {
            toast.error('Failed to get response. Check your API keys.')
            addMessage({ role: 'assistant', content: '⚠️ Sorry, I encountered an error. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fade-in" style={{ maxWidth: 860, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>AI Chat</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        Ask questions across your entire knowledge base using RAG + DeepSeek
                    </p>
                </div>
                <button onClick={resetSession} className="btn-ghost"><RotateCcw size={14} /> New Session</button>
            </div>

            {/* Messages */}
            <div className="glass-card" style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <Bot size={48} color="var(--accent-primary)" style={{ marginBottom: 16, opacity: 0.6 }} />
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                            Ask anything about your documents
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 400 }}>
                            ThinkVault searches your knowledge base semantically and uses DeepSeek to craft precise, contextual answers.
                        </p>
                    </div>
                )}
                {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                {loading && (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border-subtle)' }}>
                            <Bot size={15} color="var(--accent-text)" />
                        </div>
                        <div style={{ padding: '14px 18px', borderRadius: '4px 16px 16px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', gap: 4, alignItems: 'center' }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Sources */}
            {sources.length > 0 && (
                <div style={{ padding: '12px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {sources.map((s, i) => (
                        <span key={i} className="badge badge-purple" style={{ fontSize: 11 }}>
                            <ExternalLink size={10} /> {s.document_title} ({(s.similarity * 100).toFixed(0)}%)
                        </span>
                    ))}
                </div>
            )}

            {/* Input */}
            <div style={{ paddingTop: 12, display: 'flex', gap: 12 }}>
                <input
                    className="input-base"
                    placeholder="Ask a question about your knowledge base..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={sendMessage} disabled={loading || !input.trim()}>
                    <Send size={16} />
                </button>
            </div>
            <style>{`@keyframes bounce { 0%,80%,100% { transform: scale(0.6); } 40% { transform: scale(1); } }`}</style>
        </div>
    )
}
