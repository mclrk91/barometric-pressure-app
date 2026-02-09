import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { useGeolocation } from '../../hooks/useGeolocation'
import { generateSyncCode } from '../../utils/id'
import { isFirebaseAvailable } from '../../services/firebaseSync'

export default function Settings() {
  const {
    settings,
    syncStatus,
    updateSettings,
    connectSync,
    disconnectSync,
    exportData,
    importData,
  } = useApp()

  const geo = useGeolocation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [syncCodeInput, setSyncCodeInput] = useState('')
  const [importMsg, setImportMsg] = useState('')

  function handleDetectLocation() {
    geo.requestLocation()
  }

  // Apply geolocation when it arrives
  if (geo.latitude && geo.longitude && geo.latitude !== settings.latitude) {
    updateSettings({
      latitude: geo.latitude,
      longitude: geo.longitude,
      locationName: `${geo.latitude.toFixed(2)}, ${geo.longitude.toFixed(2)}`,
    })
  }

  function handleGenerateSync() {
    const code = generateSyncCode()
    setSyncCodeInput(code)
  }

  async function handleConnectSync() {
    if (syncCodeInput.trim()) {
      await connectSync(syncCodeInput.trim().toUpperCase())
      setSyncCodeInput('')
    }
  }

  function handleExport() {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `headache-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const ok = importData(reader.result as string)
      setImportMsg(ok ? 'Data imported successfully!' : 'Invalid file format')
      setTimeout(() => setImportMsg(''), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const firebaseReady = isFirebaseAvailable()

  return (
    <>
      {/* Location */}
      <div className="card">
        <div className="card-title">Location</div>
        <p style={{ fontSize: 14, marginBottom: 12 }}>
          Needed for barometric pressure data.
        </p>
        {settings.latitude ? (
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 14 }}>
              Current: {settings.locationName || `${settings.latitude}, ${settings.longitude}`}
            </span>
          </div>
        ) : null}
        <button
          className="btn btn-outline btn-block"
          onClick={handleDetectLocation}
          disabled={geo.loading}
        >
          {geo.loading ? 'Detecting...' : 'Detect My Location'}
        </button>
        {geo.error && (
          <p style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 8 }}>{geo.error}</p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Latitude</label>
            <input
              type="number"
              step="0.01"
              value={settings.latitude ?? ''}
              onChange={(e) => updateSettings({ latitude: Number(e.target.value) || null })}
              className="form-input"
              placeholder="e.g., 40.71"
            />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Longitude</label>
            <input
              type="number"
              step="0.01"
              value={settings.longitude ?? ''}
              onChange={(e) => updateSettings({ longitude: Number(e.target.value) || null })}
              className="form-input"
              placeholder="e.g., -74.01"
            />
          </div>
        </div>
      </div>

      {/* Cycle Settings */}
      <div className="card">
        <div className="card-title">Cycle Settings</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Average Cycle Length (days)</label>
            <input
              type="number"
              min={20}
              max={45}
              value={settings.averageCycleLength}
              onChange={(e) => updateSettings({ averageCycleLength: Number(e.target.value) })}
              className="form-input"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Average Period Length (days)</label>
            <input
              type="number"
              min={2}
              max={10}
              value={settings.averagePeriodLength}
              onChange={(e) => updateSettings({ averagePeriodLength: Number(e.target.value) })}
              className="form-input"
            />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Pressure Sensitivity Threshold (hPa)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={settings.pressureThreshold}
            onChange={(e) => updateSettings({ pressureThreshold: Number(e.target.value) })}
            className="form-input"
          />
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Alert when pressure drops more than this in 24 hours
          </p>
        </div>
      </div>

      {/* Sync */}
      <div className="card">
        <div className="card-title">Cross-Device Sync</div>

        {!firebaseReady && (
          <div className="alert alert-medium" style={{ marginBottom: 12 }}>
            Firebase not configured. Set up environment variables to enable sync.
            Data is still saved locally on this device.
          </div>
        )}

        {settings.syncCode ? (
          <div>
            <p style={{ fontSize: 14, marginBottom: 8 }}>
              Sync Code: <strong>{settings.syncCode}</strong>
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
              Status: {syncStatus}
            </p>
            <button className="btn btn-outline btn-block" onClick={disconnectSync}>
              Disconnect Sync
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 14, marginBottom: 12 }}>
              Generate a sync code and enter it on your other device to keep data in sync.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={syncCodeInput}
                onChange={(e) => setSyncCodeInput(e.target.value.toUpperCase())}
                className="form-input"
                placeholder="Enter or generate code"
                style={{ flex: 1 }}
              />
              <button className="btn btn-outline" onClick={handleGenerateSync}>
                Generate
              </button>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={handleConnectSync}
              disabled={!syncCodeInput.trim() || !firebaseReady}
            >
              Connect
            </button>
          </div>
        )}
      </div>

      {/* Export / Import */}
      <div className="card">
        <div className="card-title">Data Backup</div>
        <p style={{ fontSize: 14, marginBottom: 12 }}>
          Export your data as JSON for backup, or import from another device.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleExport}>
            Export Data
          </button>
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={() => fileInputRef.current?.click()}
          >
            Import Data
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        {importMsg && (
          <p style={{ fontSize: 13, marginTop: 8, color: importMsg.includes('success') ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {importMsg}
          </p>
        )}
      </div>
    </>
  )
}
