import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function SyncBar() {
  const { syncStatus, settings } = useApp()
  const navigate = useNavigate()

  const statusText = syncStatus === 'connected'
    ? `Synced: ${settings.syncCode}`
    : syncStatus === 'error'
    ? '\u26A0 Sync error'
    : syncStatus === 'syncing'
    ? 'Syncing...'
    : 'Not synced'

  return (
    <div className="sync-bar">
      <div className="sync-bar-left">
        <span className={`sync-dot ${syncStatus}`} />
        <span>{statusText}</span>
      </div>
      <div className="sync-bar-right">
        <button className="sync-btn" onClick={() => navigate('/settings')}>
          {'\uD83D\uDD17'} Link
        </button>
        <button className="sync-btn" onClick={() => navigate('/settings')}>
          {'\u21BB'} Sync
        </button>
      </div>
    </div>
  )
}
