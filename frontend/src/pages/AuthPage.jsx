import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { authAPI } from '../api'
import toast from 'react-hot-toast'
import { Brain, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'

export default function AuthPage() {
    const [mode, setMode] = useState('login') // login | signup
    const [form, setForm] = useState({ email: '', password: '', full_name: '' })
    const [loading, setLoading] = useState(false)
    const { setAuth } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const apiCall = mode === 'login' ? authAPI.login : authAPI.signup
            const { data } = await apiCall(form)
            // Fetch user details
            const meResp = await import('../api/client').then(m => m.default.get('/auth/me', {
                headers: { Authorization: `Bearer ${data.access_token}` }
            }))
            setAuth(meResp.data, data.access_token)
            toast.success(`Welcome${mode === 'signup' ? ' to ThinkVault AI' : ' back'}! 🧠`)
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-base)', padding: 24, position: 'relative', overflow: 'hidden',
        }}>
            {/* Background orbs */}
            <div className="glow-orb" style={{ width: 500, height: 500, background: 'var(--accent-primary)', top: -150, left: -100 }} />
            <div className="glow-orb" style={{ width: 400, height: 400, background: '#4f46e5', bottom: -100, right: -80 }} />

            <div className="fade-in" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 40px rgba(124,58,237,0.4)',
                    }}>
                        <Brain size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                        ThinkVault <span style={{ color: 'var(--accent-text)' }}>AI</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        {mode === 'login' ? 'Sign in to your knowledge base' : 'Create your AI-powered workspace'}
                    </p>
                </div>

                {/* Card */}
                <div className="glass-card" style={{ padding: 32 }}>
                    {/* Toggle */}
                    <div style={{
                        display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, marginBottom: 28,
                    }}>
                        {['login', 'signup'].map(m => (
                            <button key={m} onClick={() => setMode(m)} style={{
                                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: mode === m ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'transparent',
                                color: mode === m ? 'white' : 'var(--text-secondary)',
                                fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                            }}>{m === 'login' ? 'Sign In' : 'Sign Up'}</button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {mode === 'signup' && (
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    className="input-base"
                                    style={{ paddingLeft: 42 }}
                                    placeholder="Full name"
                                    value={form.full_name}
                                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                />
                            </div>
                        )}
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-base"
                                style={{ paddingLeft: 42 }}
                                type="email"
                                placeholder="Email address"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                required
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-base"
                                style={{ paddingLeft: 42 }}
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                required
                                minLength={8}
                            />
                        </div>

                        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4, justifyContent: 'center' }}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                                </span>
                            ) : (
                                <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--accent-text)', cursor: 'pointer', fontWeight: 600 }}>
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    )
}
