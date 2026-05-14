// src/App.tsx
import './i18n';
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Import components
import Header from './components/Header';
import Carousel from './components/Carousel';
import ProductList from './components/ProductList';
import Footer from './components/Footer';
import Register from './components/Register';
import Login from './components/Login';
import ActivateAccount from './components/ActivateAccount';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ChiTietSanPham from './components/ChiTietSanPham';
import Product from './components/Product';
import ThongTinTaiKhoan from './components/ThongTinTaiKhoan';

// Import CartProvider từ CartContext
import { CartProvider } from './components/CartContext';
import GioHang from './components/GioHang';
import PaymentResult from './components/PaymentResult';
import ThanhToan from './components/ThanhToan';
import LoginAdmin from './components/LoginAdmin';
import Admin from './components/Admin';

// Tách nội dung ra một component riêng để có thể dùng useLocation
const AppContent = () => {
  const location = useLocation();
  
  // Kiểm tra xem URL hiện tại có bắt đầu bằng '/admin' không (áp dụng cho cả /admin và /admin-login)
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {/* Chỉ hiển thị Header nếu KHÔNG PHẢI là trang Admin */}
      {!isAdminPage && <Header />}

      {/* Khu vực nội dung thay đổi theo đường dẫn (Route) */}
      <Routes>
        {/* TRANG CHỦ: Hiển thị Carousel và ProductList */}
        <Route
          path="/"
          element={
            <main>
              <Carousel />
              <ProductList />
            </main>
          }
        />

        {/* CÁC TRANG CỦA KHÁCH HÀNG */}
        <Route path="/register" element={<Register />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ChiTietSanPham />} />
        <Route path="/san-pham" element={<Product />} />
        <Route path="/san-pham/:id" element={<ChiTietSanPham />} />
        <Route path="/profile" element={<ThongTinTaiKhoan />} />
        <Route path="/gio-hang" element={<GioHang />} />
        <Route path="/thanh-toan" element={<ThanhToan />} />
        <Route path="/payment-status" element={<PaymentResult />} />

        {/* CÁC TRANG QUẢN TRỊ (ADMIN) */}
        <Route path="/admin-login" element={<LoginAdmin />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {/* Chỉ hiển thị Footer nếu KHÔNG PHẢI là trang Admin */}
      {!isAdminPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    // BỌC TOÀN BỘ BẰNG <CartProvider>
    <CartProvider>
      <Router>
        {/* Gọi component AppContent đã chứa logic kiểm tra URL */}
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;