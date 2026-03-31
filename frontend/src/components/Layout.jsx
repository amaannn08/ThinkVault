import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
    LayoutDashboard, FileText, MessageSquare, GitBranch,
    Search, LogOut, Brain, User, ChevronRight
} from 'lucide-react'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/search', icon: Search, label: 'Semantic Search' },
    { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { to: '/mindmap', icon: GitBranch, label: 'Mind Maps' },
]

export default function Layout({ children }) {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
            {/* Sidebar */}
            <aside style={{
                width: 240, flexShrink: 0, background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border-subtle)', display: 'flex',
                flexDirection: 'column', position: 'fixed', top: 0, left: 0,
                height: '100vh', zIndex: 50, padding: '24px 12px',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 28px', marginBottom: 4 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-button)',
                    }}>
                        <Brain size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>ThinkVault</div>
                        <div style={{ fontSize: 10, color: 'var(--accent-text)', fontWeight: 600, letterSpacing: 1 }}>AI</div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to} style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                            borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500,
                            transition: 'all 0.15s',
                            background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                            color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                            borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                        })}>
                            <Icon size={17} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div style={{
                    borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginTop: 8,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <User size={15} color="white" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', truncate: 'true' }}>
                                {user?.full_name || 'User'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.email}
                            </div>
                        </div>
                        <button onClick={() => logout()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: 240, flex: 1, padding: '28px 32px', maxWidth: 'calc(100vw - 240px)', overflowX: 'hidden' }}>
                {children}
            </main>
        </div>
    )
}
