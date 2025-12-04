import './App.css'

import ApiTest from './components/ApiTest'
import DialogServiceTest from './components/DialogServiceTest'
import ContentServiceTest from './components/ContentServiceTest'
import UserServiceTest from './components/UserServiceTest'

function App() {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '900px',
      margin: '0 auto',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <UserServiceTest />
      <hr />
      <ContentServiceTest />
      <hr />
      <DialogServiceTest />
      <hr />
      <ApiTest />
    </div>
  )
}

export default App
