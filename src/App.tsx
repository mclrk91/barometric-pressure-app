import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import PressureCard from './components/dashboard/PressureCard'
import WeatherForecast from './components/dashboard/WeatherForecast'
import CyclePhaseCard from './components/dashboard/CyclePhaseCard'
import PressureGauge from './components/dashboard/PressureGauge'
import PressureMeaning from './components/dashboard/PressureMeaning'
import QuickLogButton from './components/dashboard/QuickLogButton'
import RecentHeadaches from './components/dashboard/RecentHeadaches'
import SyncBar from './components/dashboard/SyncBar'
import Settings from './components/settings/Settings'
import Insights from './components/insights/Insights'

function HomePage() {
  const { headaches } = useApp()
  const [bottomTab, setBottomTab] = useState<'history' | 'insights'>('history')

  return (
    <>
      <SyncBar />
      <PressureCard />
      <WeatherForecast />
      <CyclePhaseCard />
      <PressureGauge />
      <PressureMeaning />
      <QuickLogButton />

      <div className="section-tabs">
        <button
          className={`section-tab ${bottomTab === 'history' ? 'active' : ''}`}
          onClick={() => setBottomTab('history')}
        >
          History
        </button>
        <button
          className={`section-tab ${bottomTab === 'insights' ? 'active' : ''}`}
          onClick={() => setBottomTab('insights')}
        >
          Insights
        </button>
      </div>

      {bottomTab === 'history' ? (
        <RecentHeadaches headaches={headaches} />
      ) : (
        <Insights />
      )}
    </>
  )
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/settings') {
    return (
      <div className="app-layout">
        <header className="app-header">
          <h1>
            <button onClick={() => navigate('/')} style={{ color: 'var(--cyan)', marginRight: 8, fontSize: 16 }}>
              &larr; Back
            </button>
            Settings
          </h1>
        </header>
        <main className="app-content">
          <Settings />
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Headache Tracker</h1>
      </header>
      <main className="app-content">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
