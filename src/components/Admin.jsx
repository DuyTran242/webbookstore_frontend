import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import AdminProduct from './AdminProduct';
import AdminAddProduct from './AdminAddProduct'; // <--- IMPORT COMPONENT THÊM SẢN PHẨM
import AdminEditProduct from './AdminEditProduct'; // <--- IMPORT COMPONENT SỬA SẢN PHẨM

const Admin = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  
  // STATE ĐỂ QUẢN LÝ TAB ĐANG ACTIVE VÀ ID SẢN PHẨM CẦN SỬA
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editProductId, setEditProductId] = useState(null); // <--- THÊM STATE NÀY

  useEffect(() => {
    const sessionStr = localStorage.getItem('adminSession');
    if (sessionStr) {
      setAdminUser(JSON.parse(sessionStr));
    } else {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/admin-login');
  };

  if (!adminUser) return null;

  return (
    <div className="admin-layout d-flex">
      {/* SIDEBAR */}
      <aside className="admin-sidebar bg-white border-end" style={{ width: '250px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-brand d-flex align-items-center gap-3 px-3 py-4">
          <div className="bg-warning text-white rounded d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px', fontWeight: 'bold', fontSize: '18px' }}>
            <i className="fa-solid fa-store"></i>
          </div>
          <div>
            <h6 className="m-0 fw-bold text-dark" style={{ fontSize: '15px' }}>Admin</h6>
            <small className="text-muted" style={{ fontSize: '11px' }}>Bookstore</small>
          </div>
        </div>

        <ul className="sidebar-menu list-unstyled px-2 m-0" style={{ overflowY: 'auto', flex: 1 }}>
          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'dashboard' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('dashboard')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-table-cells-large" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Dashboard</span>
          </li>
          
          <li 
            // CẬP NHẬT: Thêm điều kiện activeTab === 'edit_product' để giữ tab Sáng khi đang sửa
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${(activeTab === 'products' || activeTab === 'add_product' || activeTab === 'edit_product') ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('products')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-box" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Sản phẩm</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'categories' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('categories')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-list" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Danh mục</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'attributes' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('attributes')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-layer-group" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Thuộc tính</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'orders' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('orders')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-cart-shopping" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Đơn hàng</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'inventory' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('inventory')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-warehouse" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Tồn kho</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'users' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('users')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-users" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Người dùng</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'banners' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('banners')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-regular fa-image" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Banner</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'posts' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('posts')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-regular fa-newspaper" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Bài viết</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'warranty' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('warranty')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-shield-halved" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Bảo hành</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'import_imei' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('import_imei')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-barcode" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Nhập IMEI</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'return' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('return')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-box-archive" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Trả hàng</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'coupons' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('coupons')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-ticket" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Mã giảm giá</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'brands' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('brands')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-tag" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Thương hiệu</span>
          </li>

          <li 
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'reviews' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('reviews')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-regular fa-comment-dots" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Đánh giá</span>
          </li>
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main bg-light w-100" style={{ minHeight: '100vh' }}>
        {/* TOP HEADER */}
        <header className="admin-header shadow-sm d-flex justify-content-between align-items-center px-4 py-3 bg-white">
          <div className="search-bar position-relative w-25">
            <input type="text" className="form-control rounded-pill bg-light border-0 ps-4" placeholder="Tìm kiếm ở đây..." />
            <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ top: '10px', left: '15px' }}></i>
          </div>
          
          <div className="header-actions d-flex align-items-center gap-4">
            <i className="fa-regular fa-bell fs-5 text-muted pointer"></i>
            <i className="fa-regular fa-envelope fs-5 text-muted pointer"></i>
            <div className="user-profile d-flex align-items-center gap-2">
              <img src="https://ui-avatars.com/api/?name=Admin" alt="avatar" className="rounded-circle" width="40" />
              <div className="d-flex flex-column text-end me-2">
                <strong className="m-0" style={{fontSize: '14px', color: '#00583b'}}>{adminUser.email}</strong>
                <span className="text-muted" style={{fontSize: '12px'}}>{adminUser.role}</span>
              </div>
              <i className="fa-solid fa-right-from-bracket text-danger ms-2 pointer" onClick={handleLogout} title="Đăng xuất"></i>
            </div>
          </div>
        </header>

        {/* --- KHU VỰC HIỂN THỊ NỘI DUNG THAY ĐỔI THEO TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="admin-content p-4">
            <h4 className="fw-bold mb-4" style={{ color: '#00583b' }}>Tổng quan hệ thống</h4>
            <div className="row g-4">
              <div className="col-md-3">
                <div className="stat-card bg-white shadow-sm p-4 rounded-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold m-0">2.540.231 ₫</h3>
                    <span className="text-muted small">Tổng doanh thu</span>
                  </div>
                  <div className="stat-icon bg-primary text-white p-3 rounded"><i className="fa-solid fa-chart-line"></i></div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white shadow-sm p-4 rounded-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold m-0">1.431.000 ₫</h3>
                    <span className="text-muted small">Thu nhập ròng</span>
                  </div>
                  <div className="stat-icon bg-success text-white p-3 rounded"><i className="fa-solid fa-money-bill-wave"></i></div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white shadow-sm p-4 rounded-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold m-0">150</h3>
                    <span className="text-muted small">Đơn hàng đã thanh toán</span>
                  </div>
                  <div className="stat-icon bg-warning text-dark p-3 rounded"><i className="fa-solid fa-box-open"></i></div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white shadow-sm p-4 rounded-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold m-0">1.450</h3>
                    <span className="text-muted small">Lượt truy cập</span>
                  </div>
                  <div className="stat-icon bg-info text-white p-3 rounded"><i className="fa-solid fa-eye"></i></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRUYỀN setActiveTab XUỐNG ĐỂ COMPONENT CÓ THỂ ĐIỀU HƯỚNG VÀ setEditProductId ĐỂ LẤY ID */}
        {activeTab === 'products' && <AdminProduct setActiveTab={setActiveTab} setEditProductId={setEditProductId} />}
        
        {/* COMPONENT THÊM SẢN PHẨM MỚI */}
        {activeTab === 'add_product' && <AdminAddProduct setActiveTab={setActiveTab} />}

        {/* COMPONENT SỬA SẢN PHẨM MỚI THÊM VÀO */}
        {activeTab === 'edit_product' && <AdminEditProduct setActiveTab={setActiveTab} productId={editProductId} />}

      </main>
    </div>
  );
};

export default Admin;