import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Chapter from './pages/Chapter'
import Guestbook from './pages/Guestbook'

export default function App() {
  return (
    <div className="min-h-screen bg-[#f6f5ef]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chapter/:id" element={<Chapter />} />
        <Route path="/guestbook" element={<Guestbook />} />
      </Routes>
    </div>
  )
}
