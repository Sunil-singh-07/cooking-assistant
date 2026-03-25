import { useState } from 'react'
import { supabase } from './supabase'

export default function AuthModal({ mode, onClose }) {
  const [tab, setTab]         = useState('signin')   // 'signin' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const accent = mode?.accent || '#c4a84f'
  const bg     = mode?.bg     || '#1a1a1a'

  const handleEmail = async () => {
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (tab === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        })
        if (error) throw error
        setSuccess('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onClose()
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) setError(error.message)
  }

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 13,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(240,235,227,0.9)', outline: 'none', fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box'
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 380, background: bg, border: `1px solid ${accent}33`, borderRadius: 24, padding: 28, boxShadow: `0 32px 80px rgba(0,0,0,0.8)`, animation: 'voicePanelIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🍳</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'rgba(240,235,227,0.95)' }}>Cookr</div>
          <div style={{ fontSize: 12, color: 'rgba(240,235,227,0.35)', marginTop: 4 }}>
            {tab === 'signin' ? 'Sign in to sync your recipes across devices' : 'Create your account'}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 3, marginBottom: 20 }}>
          {['signin', 'signup'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400, background: tab === t ? `${accent}22` : 'transparent', color: tab === t ? accent : 'rgba(240,235,227,0.4)', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s ease' }}>
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Google button */}
        <button onClick={handleGoogle} style={{ width: '100%', padding: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: 'rgba(240,235,227,0.85)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16, transition: 'all 0.2s ease' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 11, color: 'rgba(240,235,227,0.25)' }}>or with email</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tab === 'signup' && (
            <input style={inp} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          )}
          <input style={inp} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={inp} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmail()} />
        </div>

        {error   && <div style={{ marginTop: 10, fontSize: 12, color: '#ff7b7b', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', borderRadius: 8, padding: '8px 12px' }}>{error}</div>}
        {success && <div style={{ marginTop: 10, fontSize: 12, color: '#7bcf8a', background: 'rgba(100,200,100,0.1)', border: '1px solid rgba(100,200,100,0.2)', borderRadius: 8, padding: '8px 12px' }}>{success}</div>}

        <button onClick={handleEmail} disabled={loading || !email || !password} style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 14, border: 'none', cursor: loading || !email || !password ? 'not-allowed' : 'pointer', background: loading || !email || !password ? 'rgba(255,255,255,0.07)' : `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: loading || !email || !password ? 'rgba(240,235,227,0.25)' : '#111', fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s ease' }}>
          {loading ? '...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        <button onClick={onClose} style={{ marginTop: 10, width: '100%', padding: '8px', borderRadius: 10, border: 'none', background: 'transparent', color: 'rgba(240,235,227,0.25)', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          Continue without account
        </button>
      </div>
    </div>
  )
}