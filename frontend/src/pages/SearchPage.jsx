import { useState, useEffect, useRef, useCallback } from 'react'
import { searchAPI } from '../api'
import { Search, Lightbulb, ExternalLink, Sparkles } from 'lucide-react'
import { SkeletonCard } from '../components/SkeletonLoader'
import toast from 'react-hot-toast'

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [searching, setSearching] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const debouncedQuery = useDebounce(query, 300)

    // Real-time debounced suggestions
    useEffect(() => {
        if (!debouncedQuery.trim() || debouncedQuery.length < 3) { setSuggestions([]); return }
        searchAPI.suggestions(debouncedQuery)
            .then(res => { setSuggestions(res.data.suggestions || []); setShowSuggestions(true) })
            .catch(() => { })
    }, [debouncedQuery])

    const handleSearch = async (q = query) => {
        if (!q.trim()) return
        setShowSuggestions(false)
        setSearching(true)
        try {
            const { data } = await searchAPI.semantic(q, 8)
            setResults(data.results || [])
            if (data.results.length === 0) toast('No results found. Try different keywords.', { icon: '🔍' })
        } catch { toast.error('Search failed') }
        finally { setSearching(false) }
    }

    const highlight = (text, q) => {
        if (!q) return text
        const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        return text.split(re).map((part, i) =>
            re.test(part) ? <mark key={i} style={{ background: 'rgba(124,58,237,0.3)', color: 'var(--accent-text)', borderRadius: 3 }}>{part}</mark> : part
        )
    }

    return (
        <div className="fade-in" style={{ maxWidth: 860 }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>Semantic Search</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                    Search by meaning, not just keywords — powered by Gemini embeddings + pgvector
                </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            className="input-base"
                            style={{ paddingLeft: 46, fontSize: 15 }}
                            placeholder="Search your knowledge base semantically..."
                            value={query}
                            onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            onFocus={() => suggestions.length && setShowSuggestions(true)}
                        />
                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div style={{
                                position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100,
                                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 12,
                                padding: 8, boxShadow: 'var(--shadow-card)',
                            }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '4px 10px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Sparkles size={11} /> Real-time suggestions
                                </div>
                                {suggestions.map((s, i) => (
                                    <button key={i} onMouseDown={() => { setQuery(s); handleSearch(s) }} style={{
                                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                        padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-secondary)', fontSize: 13, textAlign: 'left', transition: 'background 0.15s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                    >
                                        <Lightbulb size={13} color="var(--accent-text)" />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="btn-primary" onClick={() => handleSearch()} disabled={searching || !query.trim()}>
                        {searching ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} /> : <Search size={16} />}
                        Search
                    </button>
                </div>
            </div>

            {/* Results */}
            {searching ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3].map(i => <SkeletonCard key={i} height={100} />)}
                </div>
            ) : results.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                        {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                    </p>
                    {results.map((r, i) => (
                        <div key={i} className="glass-card" style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-text)', background: 'rgba(124,58,237,0.1)', padding: '2px 10px', borderRadius: 99 }}>
                                    {(r.similarity * 100).toFixed(1)}% match
                                </span>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <ExternalLink size={12} /> {r.document_title}
                                </span>
                            </div>
                            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                                {highlight(r.content.substring(0, 280) + '...', query)}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: 14 }}>
                    <Search size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p>Enter a query to semantically search your knowledge base</p>
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
