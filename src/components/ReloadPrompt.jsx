import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { DownloadCloud, X } from 'lucide-react'

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '20px',
      right: '20px',
      zIndex: 1000,
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--accent-primary)',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      color: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <DownloadCloud color="var(--accent-primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {offlineReady ? 'App ready to work offline' : 'New update available!'}
          </span>
        </div>
        <button onClick={close} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>
      
      {needRefresh && (
        <button 
          onClick={() => updateServiceWorker(true)}
          style={{
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Reload & Update
        </button>
      )}
    </div>
  )
}

export default ReloadPrompt
