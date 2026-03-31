import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    ReactFlow, Background, Controls, MiniMap, Panel,
    addEdge, useNodesState, useEdgesState, BackgroundVariant
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { mindmapsAPI, documentsAPI } from '../api'
import { useMindMapStore } from '../stores/index'
import { GitBranch, Save, Download, ChevronDown, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const nodeStyle = {
    root: { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 18px', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 20px rgba(124,58,237,0.4)' },
    topic: { background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600 },
    detail: { background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', fontSize: 12 },
    default: { background: 'rgba(79,70,229,0.12)', color: '#818cf8', border: '1px solid rgba(79,70,229,0.25)', borderRadius: 10, padding: '8px 14px', fontSize: 13 },
}

function transformNodes(rawNodes = []) {
    return rawNodes.map(n => ({
        id: n.id,
        position: n.position || { x: 0, y: 0 },
        data: { label: n.label, ...n.data },
        style: nodeStyle[n.type] || nodeStyle.default,
        type: 'default',
    }))
}

function transformEdges(rawEdges = []) {
    return rawEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        style: { stroke: 'rgba(124,58,237,0.5)', strokeWidth: 1.5 },
        labelStyle: { fill: '#64748b', fontSize: 10 },
        animated: false,
    }))
}

export default function MindMapPage() {
    const [searchParams] = useSearchParams()
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [documents, setDocuments] = useState([])
    const [mindmaps, setMindmaps] = useState([])
    const [selectedDocId, setSelectedDocId] = useState('')
    const [selectedMmId, setSelectedMmId] = useState(searchParams.get('id') || '')
    const [generating, setGenerating] = useState(false)
    const [saving, setSaving] = useState(false)
    const [currentTitle, setCurrentTitle] = useState('Untitled Mind Map')
    const { setCurrentMindMap } = useMindMapStore()

    const onConnect = useCallback((params) => setEdges(eds => addEdge({
        ...params,
        style: { stroke: 'rgba(124,58,237,0.5)', strokeWidth: 1.5 },
    }, eds)), [])

    // Load documents and mind maps list
    useEffect(() => {
        documentsAPI.list(1, 50).then(r => {
            setDocuments((r.data.items || []).filter(d => d.status === 'ready'))
        }).catch(() => { })
        mindmapsAPI.list().then(r => setMindmaps(r.data || [])).catch(() => { })
    }, [])

    // Load mind map if id provided
    useEffect(() => {
        if (selectedMmId) {
            mindmapsAPI.get(selectedMmId).then(r => {
                loadMindMap(r.data)
            }).catch(() => { })
        }
    }, [selectedMmId])

    const loadMindMap = (mm) => {
        const g = mm.graph_json || {}
        setNodes(transformNodes(g.nodes || []))
        setEdges(transformEdges(g.edges || []))
        setCurrentTitle(mm.title)
        setCurrentMindMap(mm)
        setSelectedMmId(mm.id)
    }

    const handleGenerate = async () => {
        if (!selectedDocId) return toast.error('Select a document first')
        setGenerating(true)
        try {
            const { data } = await mindmapsAPI.generate(selectedDocId)
            loadMindMap(data)
            setMindmaps(prev => {
                const filtered = prev.filter(m => m.id !== data.id)
                return [data, ...filtered]
            })
            toast.success('Mind map generated! 🗺️')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Generation failed. Check API keys.')
        } finally {
            setGenerating(false)
        }
    }

    const handleSave = async () => {
        if (!selectedMmId) return
        setSaving(true)
        try {
            const rawNodes = nodes.map(n => ({
                id: n.id, label: n.data?.label || '', type: n.type,
                position: n.position, data: n.data,
            }))
            const rawEdges = edges.map(e => ({
                id: e.id, source: e.source, target: e.target, label: e.label || '',
            }))
            await mindmapsAPI.update(selectedMmId, { graph_json: { nodes: rawNodes, edges: rawEdges, title: currentTitle }, title: currentTitle })
            toast.success('Mind map saved!')
        } catch { toast.error('Save failed') }
        finally { setSaving(false) }
    }

    return (
        <div className="fade-in" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>Mind Map Editor</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        AI-generated from your documents · Drag, connect, and edit freely
                    </p>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Load existing */}
                    {mindmaps.length > 0 && (
                        <select value={selectedMmId} onChange={e => setSelectedMmId(e.target.value)} className="input-base" style={{ width: 200 }}>
                            <option value="">Load existing...</option>
                            {mindmaps.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                        </select>
                    )}

                    {/* Generate */}
                    <select value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)} className="input-base" style={{ width: 200 }}>
                        <option value="">Select document...</option>
                        {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                    </select>
                    <button className="btn-primary" onClick={handleGenerate} disabled={generating || !selectedDocId}>
                        {generating ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <GitBranch size={15} />}
                        {generating ? 'Generating...' : 'Generate'}
                    </button>

                    {/* Save */}
                    {selectedMmId && (
                        <button className="btn-ghost" onClick={handleSave} disabled={saving}>
                            <Save size={15} /> {saving ? 'Saving...' : 'Save'}
                        </button>
                    )}
                </div>
            </div>

            {/* React Flow Canvas */}
            <div className="glass-card" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
                {nodes.length === 0 ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)' }}>
                        <GitBranch size={48} style={{ opacity: 0.3 }} />
                        <p style={{ fontSize: 15, fontWeight: 600 }}>No mind map loaded</p>
                        <p style={{ fontSize: 13 }}>Select a document above and click Generate, or load an existing mind map</p>
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        colorMode="dark"
                    >
                        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
                        <Controls style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }} />
                        <MiniMap
                            nodeColor={() => '#7c3aed'}
                            maskColor="rgba(0,0,0,0.4)"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}
                        />
                        <Panel position="top-left">
                            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '6px 14px', fontSize: 13, color: 'var(--accent-text)', fontWeight: 600 }}>
                                {currentTitle}
                            </div>
                        </Panel>
                    </ReactFlow>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
