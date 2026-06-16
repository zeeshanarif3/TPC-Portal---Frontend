import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LandingPage from './pages/login/LabdingPage.jsx'
import Dashboard from './pages/admin/Dash.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LandingPage/>
    <Dashboard/>
  </StrictMode>,
)
