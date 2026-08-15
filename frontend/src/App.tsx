import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { ShelterDetailPage } from './pages/ShelterDetailPage'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shelter/:id" element={<ShelterDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
