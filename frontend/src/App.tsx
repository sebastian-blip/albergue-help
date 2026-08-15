import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminShelterFormPage } from './pages/AdminShelterFormPage'
import { AdminUserFormPage } from './pages/AdminUserFormPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { HomePage } from './pages/HomePage'
import { ShelterDetailPage } from './pages/ShelterDetailPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shelter/:id" element={<ShelterDetailPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/shelters/new"
              element={
                <ProtectedRoute>
                  <AdminShelterFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/shelters/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminShelterFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/new"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUserFormPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
