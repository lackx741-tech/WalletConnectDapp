import { Dashboard } from './components/Dashboard'
import { EmbedView } from './components/EmbedView'
import './App.css'

function isEmbedMode() {
  const params = new URLSearchParams(window.location.search)
  return params.get('embed') === '1'
}

function App() {
  return isEmbedMode() ? <EmbedView /> : <Dashboard />
}

export default App
