import './App.css'

import ApiTest from './components/ApiTest'
import DialogServiceTest from './components/DialogServiceTest'
import ContentServiceTest from './components/ContentServiceTest'

function App() {
  return (
    <>
      <ContentServiceTest />
      <hr style={{ margin: '40px 0' }} />
      <DialogServiceTest />
      <hr style={{ margin: '40px 0' }} />
      <ApiTest />
    </>
  )
}

export default App
