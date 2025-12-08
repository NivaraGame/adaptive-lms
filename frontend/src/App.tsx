import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import LearningPage from './pages/LearningPage';
import ProfilePage from './pages/ProfilePage';
import DemoPage from './pages/DemoPage';
import { ErrorHandlingDemo } from './components/ErrorHandlingDemo';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearningPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/error-demo" element={<ErrorHandlingDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
