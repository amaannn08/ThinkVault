import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { documentsAPI, mindmapsAPI } from '../api'
import { useAuthStore } from '../stores/authStore'
import { FileText, GitBranch, MessageSquare, Upload, Plus, TrendingUp } from 'lucide-react'
import { SkeletonCard } from '../components/SkeletonLoader'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color, onClick }) {
    return (
        <div className="glass-card" onClick={onClick} style={{ padding: 24, cursor: onClick ? 'pointer' : 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${color}20`,
                }}>
                    <Icon size={22} color={color} />
                </div>
                <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
                </div>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [docs, setDocs] = useState([])
    const [mindmaps, setMindmaps] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([documentsAPI.list(1, 5), mindmapsAPI.list()])
            .then(([docRes, mmRes]) => {
                setDocs(docRes.data.items || [])
                setMindmaps(mmRes.data || [])
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const statusColor = { ready: '#10b981', processing: '#f59e0b', pending: '#f59e0b', failed: '#ef4444' }

    return (
        <div className="fade-in" style={{ maxWidth: 900 }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
                    Good morning, {user?.full_name?.split(' ')[0] || 'there'} 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
                    Your AI knowledge base is ready. What would you like to explore?
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
                {loading ? (
                    [1, 2, 3].map(i => <SkeletonCard key={i} height={96} />)
                ) : (
                    <>
                        <StatCard icon={FileText} label="Documents" value={docs.length} color="#7c3aed" onClick={() => navigate('/documents')} />
                        <StatCard icon={GitBranch} label="Mind Maps" value={mindmaps.length} color="#4f46e5" onClick={() => navigate('/mindmap')} />
                        <StatCard icon={MessageSquare} label="AI Ready" value="✓" color="#10b981" onClick={() => navigate('/chat')} />
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                <button onClick={() => navigate('/documents')} className="glass-card btn-ghost"
                    style={{ padding: 20, border: '1px dashed var(--border-accent)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, height: 100 }}>
                    <Upload size={22} color="var(--accent-text)" />
                    <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>Upload Document</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Text, PDF, or URL</span>
                </button>
                <button onClick={() => navigate('/mindmap')} className="glass-card btn-ghost"
                    style={{ padding: 20, border: '1px dashed rgba(79,70,229,0.4)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, height: 100 }}>
                    <GitBranch size={22} color="#818cf8" />
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>Generate Mind Map</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Visualize your knowledge</span>
                </button>
            </div>

            {/* Recent Documents */}
            <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Documents</h2>
                    <button onClick={() => navigate('/documents')} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>View all</button>
                </div>
                {loading ? (
                    [1, 2, 3].map(i => <SkeletonCard key={i} height={52} />)
                ) : docs.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>
                        No documents yet. Upload your first one!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {docs.map(doc => (
                            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                                <FileText size={16} color="var(--accent-text)" />
                                <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {doc.title}
                                </span>
                                <span className={`badge badge-${doc.status === 'ready' ? 'success' : doc.status === 'failed' ? 'danger' : 'warning'}`}>
                                    {doc.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
