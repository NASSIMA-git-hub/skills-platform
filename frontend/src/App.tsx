import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState<string>('')

  const testApi = async () => {
    try {
      const res = await fetch('/api/test')
      const data = await res.json()
      setMessage(JSON.stringify(data))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error connecting to backend')
    }
  }

  return (
    <div className="app">
      <h1>Skills Platform</h1>
      <p>Vite + React 19 frontend is ready!</p>
      <button onClick={testApi}>Test API Connection</button>
      {message && <pre>{message}</pre>}
    </div>
  )
}

export default App
