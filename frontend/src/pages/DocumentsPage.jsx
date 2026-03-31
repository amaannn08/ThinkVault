import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { documentsAPI } from '../api'
import { useDocumentStore } from '../stores/index'
import { FileText, Upload, Globe, AlignLeft, Trash2, GitBranch, RefreshCw } from 'lucide-react'
import { SkeletonCard } from '../components/SkeletonLoader'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function UploadPanel({ onUploaded }) {
    const [mode, setMode] = useState('text') // text | pdf | url
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [url, setUrl] = useState('')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] },
        onDrop: (files) => { setFile(files[0]); setMode('pdf'); if (!title) setTitle(files[0].name.replace('.pdf', '')) },
        maxFiles: 1,
    })

    const handleUpload = async () => {
        if (!title.trim()) return toast.error('Title is required')
        setLoading(true)
        try {
            const fd = new FormData()
            fd.append('source_type', mode)
            fd.append('title', title)
            if (mode === 'text') fd.append('content', content)
            if (mode === 'url') fd.append('source_url', url)
            if (mode === 'pdf' && file) fd.append('file', file)

            const { data } = await documentsAPI.upload(fd)
            toast.success('Document processed and indexed! 🎉')
            onUploaded(data)
            setTitle(''); setContent(''); setUrl(''); setFile(null)
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Upload failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                Add to Knowledge Base
            </h2>

            {/* Source Type Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[{ id: 'text', icon: AlignLeft, label: 'Text' }, { id: 'pdf', icon: FileText, label: 'PDF' }, { id: 'url', icon: Globe, label: 'URL' }].map(({ id, icon: Icon, label }) => (
                    <button key={id} onClick={() => setMode(id)} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px solid',
                        borderColor: mode === id ? 'var(--accent-primary)' : 'var(--border-default)',
                        background: mode === id ? 'rgba(124,58,237,0.1)' : 'transparent',
                        color: mode === id ? 'var(--accent-text)' : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    }}>
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            <input className="input-base" placeholder="Document title" value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: 12 }} />

            {mode === 'text' && (
                <textarea className="input-base" placeholder="Paste your text content here..." value={content}
                    onChange={e => setContent(e.target.value)} rows={6} style={{ resize: 'vertical', marginBottom: 12 }} />
            )}

            {mode === 'url' && (
                <input className="input-base" placeholder="https://..." type="url" value={url}
                    onChange={e => setUrl(e.target.value)} style={{ marginBottom: 12 }} />
            )}

            {mode === 'pdf' && (
                <div {...getRootProps()} style={{
                    border: `2px dashed ${isDragActive ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', marginBottom: 12,
                    background: isDragActive ? 'rgba(124,58,237,0.05)' : 'transparent', transition: 'all 0.2s',
                }}>
                    <input {...getInputProps()} />
                    <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        {file ? file.name : isDragActive ? 'Drop here!' : 'Drag & drop PDF or click to browse'}
                    </p>
                </div>
            )}

            <button className="btn-primary" onClick={handleUpload} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? (
                    <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} /> Processing & Indexing...</>
                ) : (
                    <><Upload size={16} /> Add to Knowledge Base</>
                )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

export default function DocumentsPage() {
    const navigate = useNavigate()
    const { documents, total, loading, setDocuments, setLoading, addDocument, removeDocument } = useDocumentStore()
    const [page, setPage] = useState(1)
    const [generating, setGenerating] = useState({})

    const fetchDocs = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await documentsAPI.list(page, 20)
            setDocuments(data.items, data.total)
        } catch { toast.error('Failed to load documents') }
        finally { setLoading(false) }
    }, [page])

    useEffect(() => { fetchDocs() }, [fetchDocs])

    const handleDelete = async (id) => {
        await documentsAPI.delete(id)
        removeDocument(id)
        toast.success('Document deleted')
    }

    const handleGenerateMindMap = async (docId) => {
        setGenerating(g => ({ ...g, [docId]: true }))
        try {
            const { data } = await import('../api').then(m => m.mindmapsAPI.generate(docId))
            toast.success('Mind map generated!')
            navigate(`/mindmap?id=${data.id}`)
        } catch { toast.error('Mind map generation failed') }
        finally { setGenerating(g => ({ ...g, [docId]: false })) }
    }

    const sourceTypeColor = { text: '#7c3aed', pdf: '#ef4444', url: '#3b82f6' }

    return (
        <div className="fade-in" style={{ maxWidth: 860 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>Knowledge Base</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
                        {total} document{total !== 1 ? 's' : ''} indexed
                    </p>
                </div>
                <button onClick={fetchDocs} className="btn-ghost"><RefreshCw size={14} /> Refresh</button>
            </div>

            <UploadPanel onUploaded={(doc) => { addDocument(doc); }} />

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[1, 2, 3].map(i => <SkeletonCard key={i} height={72} />)}
                </div>
            ) : documents.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48, fontSize: 14 }}>
                    Your knowledge base is empty. Upload your first document above!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {documents.map(doc => (
                        <div key={doc.id} className="glass-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `${sourceTypeColor[doc.source_type] || '#7c3aed'}20`,
                            }}>
                                <FileText size={16} color={sourceTypeColor[doc.source_type] || '#7c3aed'} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {doc.title}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                    {doc.source_type.toUpperCase()} · {doc.chunk_count} chunks · {new Date(doc.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <span className={`badge badge-${doc.status === 'ready' ? 'success' : doc.status === 'failed' ? 'danger' : 'warning'}`}>
                                {doc.status}
                            </span>
                            {doc.status === 'ready' && (
                                <button onClick={() => handleGenerateMindMap(doc.id)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} disabled={generating[doc.id]}>
                                    <GitBranch size={13} /> {generating[doc.id] ? '...' : 'Mind Map'}
                                </button>
                            )}
                            <button onClick={() => handleDelete(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
