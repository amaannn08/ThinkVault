import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import SearchPage from './pages/SearchPage'
import ChatPage from './pages/ChatPage'
import MindMapPage from './pages/MindMapPage'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 10,
            fontSize: 14,
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>
        } />
        <Route path="/documents" element={
          <PrivateRoute><Layout><DocumentsPage /></Layout></PrivateRoute>
        } />
        <Route path="/search" element={
          <PrivateRoute><Layout><SearchPage /></Layout></PrivateRoute>
        } />
        <Route path="/chat" element={
          <PrivateRoute><Layout><ChatPage /></Layout></PrivateRoute>
        } />
        <Route path="/mindmap" element={
          <PrivateRoute><Layout><MindMapPage /></Layout></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
