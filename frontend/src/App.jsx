import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BoardPage from './pages/BoardPage'
import MindMapPage from './pages/MindMapPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
        <Route path="/mindmap/:boardId" element={<MindMapPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
