import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/dashboard/Dashboard'
import HeadacheLog from './components/headache/HeadacheLog'
import CycleTracker from './components/cycle/CycleTracker'
import Insights from './components/insights/Insights'
import Settings from './components/settings/Settings'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="log" element={<HeadacheLog />} />
        <Route path="cycle" element={<CycleTracker />} />
        <Route path="insights" element={<Insights />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
