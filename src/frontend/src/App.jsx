import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import RotulosPage from './pages/RotulosPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/inventario" element={
              <ProtectedRoute><InventoryPage /></ProtectedRoute>
            } />
            <Route path="/rotulos" element={
              <ProtectedRoute><RotulosPage /></ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
