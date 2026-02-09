import { Outlet, NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Layout() {
  const { syncStatus } = useApp()

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>
          Headache Tracker
          <span className={`sync-indicator ${syncStatus}`} title={`Sync: ${syncStatus}`} />
        </h1>
      </header>

      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">&#9678;</span>
          Home
        </NavLink>
        <NavLink to="/log" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">&#10010;</span>
          Log
        </NavLink>
        <NavLink to="/cycle" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">&#9790;</span>
          Cycle
        </NavLink>
        <NavLink to="/insights" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">&#9733;</span>
          Insights
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">&#9881;</span>
          Settings
        </NavLink>
      </nav>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
