import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/layout/Footer'
import { NavBar } from './components/layout/NavBar'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { AdminProfilePage } from './pages/AdminProfilePage'
import { CartPage } from './pages/CartPage'
import { CategoryPage } from './pages/CategoryPage'
import { ContactPage } from './pages/ContactPage'
import { CustomerProfilePage } from './pages/CustomerProfilePage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'

function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <CustomerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
