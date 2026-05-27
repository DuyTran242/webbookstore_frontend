import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import AdminProduct from './AdminProduct';
import AdminAddProduct from './AdminAddProduct';
import AdminEditProduct from './AdminEditProduct';
import AdminUser from './AdminUser';
import AdminCategory from './AdminCategory';
import AdminInventory from './AdminInventory';
import AdminOrders from './AdminOrders';
import AdminReviews from './AdminReviews';
import AdminDashboard from './AdminDashboard';   // <-- THÊM IMPORT NÀY

const Admin = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editProductId, setEditProductId] = useState(null);

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

  // Helper: kiểm tra tab đang active
  const isActive = (...tabs) => tabs.includes(activeTab);

  const menuItems = [
    { key: 'dashboard', icon: 'fa-table-cells-large', label: 'Dashboard' },
    { key: 'products',  icon: 'fa-book',              label: 'Sách',       also: ['add_product', 'edit_product'] },
    { key: 'orders',    icon: 'fa-receipt',     label: 'Đơn hàng' },
    { key: 'users',     icon: 'fa-users',             label: 'Người dùng' },
    { key: 'inventory', icon: 'fa-warehouse',    label: 'Tồn kho' },
    { key: 'categories',icon: 'fa-list',              label: 'Danh mục' },
    { key: 'reviews',   icon: 'fa-comment-dots',      label: 'Đánh giá',  regular: true },
    { key: 'coupons',   icon: 'fa-ticket',            label: 'Mã giảm giá' },
    { key: 'banners',   icon: 'fa-image',             label: 'Banner',    regular: true },
  ];

  return (
      <div className="admin-layout d-flex">
        {/* SIDEBAR */}
        <aside className="admin-sidebar bg-white border-end"
               style={{ width: '250px', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Logo */}
          <div className="d-flex align-items-center gap-3 px-3 py-4 border-bottom">
            <div className="d-flex justify-content-center align-items-center rounded"
                 style={{ width: '40px', height: '40px', backgroundColor: '#00583b' }}>
              <i className="fa-solid fa-book-open text-white"></i>
            </div>
            <div>
              <h6 className="m-0 fw-bold text-dark" style={{ fontSize: '15px' }}>Bookstore</h6>
              <small className="text-muted" style={{ fontSize: '11px' }}>Quản trị hệ thống</small>
            </div>
          </div>

          {/* Menu */}
          <ul className="list-unstyled px-2 m-0 pt-2" style={{ overflowY: 'auto', flex: 1 }}>
            {menuItems.map(item => {
              const active = isActive(item.key, ...(item.also || []));
              return (
                  <li key={item.key}
                      className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${active ? 'fw-bold text-dark' : 'text-secondary'}`}
                      style={{ cursor: 'pointer', backgroundColor: active ? '#f0faf5' : 'transparent', borderLeft: active ? '3px solid #00583b' : '3px solid transparent' }}
                      onClick={() => setActiveTab(item.key)}
                  >
                    <i className={`fa-${item.regular ? 'regular' : 'solid'} ${item.icon}`}
                       style={{ width: '20px', textAlign: 'center', color: active ? '#00583b' : undefined }}></i>
                    <span style={{ fontSize: '14px' }}>{item.label}</span>
                  </li>
              );
            })}
          </ul>

          {/* Logout */}
          <div className="p-3 border-top">
            <button className="btn btn-outline-danger w-100 btn-sm" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket me-2"></i>Đăng xuất
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="admin-main bg-light w-100" style={{ minHeight: '100vh' }}>
          {/* HEADER */}
          <header className="admin-header shadow-sm d-flex justify-content-between align-items-center px-4 py-3 bg-white"
                  style={{ position: 'sticky', top: 0, zIndex: 100 }}>
            <div className="search-bar position-relative" style={{ width: '280px' }}>
              <input type="text" className="form-control rounded-pill bg-light border-0 ps-4"
                     placeholder="Tìm kiếm..." style={{ fontSize: '14px' }} />
              <i className="fa-solid fa-magnifying-glass position-absolute text-muted"
                 style={{ top: '10px', left: '15px', fontSize: '13px' }}></i>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                <i className="fa-regular fa-bell fs-5 text-muted pointer"></i>
              </div>
              <div className="d-flex align-items-center gap-2">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser.email)}&background=00583b&color=fff`}
                     alt="avatar" className="rounded-circle" width="36" height="36" />
                <div className="d-flex flex-column">
                  <strong style={{ fontSize: '13px', color: '#00583b' }}>{adminUser.email}</strong>
                  <span className="text-muted" style={{ fontSize: '11px' }}>{adminUser.role}</span>
                </div>
              </div>
            </div>
          </header>

          {/* NỘI DUNG THEO TAB */}

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
              <AdminDashboard />
          )}

          {activeTab === 'dashboard_old' && (
              <div className="p-4">
                <h4 className="fw-bold mb-4" style={{ color: '#00583b' }}>Tổng quan hệ thống</h4>
                <div className="row g-4">
                  {[
                    { label: 'Tổng doanh thu', value: '2.540.231 ₫', icon: 'fa-chart-line', color: 'primary' },
                    { label: 'Thu nhập ròng',  value: '1.431.000 ₫', icon: 'fa-money-bill-wave', color: 'success' },
                    { label: 'Đơn đã thanh toán', value: '150',      icon: 'fa-box-open', color: 'warning' },
                    { label: 'Lượt truy cập',  value: '1.450',        icon: 'fa-eye', color: 'info' },
                  ].map(card => (
                      <div key={card.label} className="col-md-3">
                        <div className="bg-white shadow-sm p-4 rounded-3 d-flex justify-content-between align-items-center"
                             style={{ borderLeft: '4px solid', borderColor: card.color === 'primary' ? '#0d6efd' : card.color === 'success' ? '#198754' : card.color === 'warning' ? '#ffc107' : '#0dcaf0' }}>
                          <div>
                            <h4 className="fw-bold m-0">{card.value}</h4>
                            <span className="text-muted small">{card.label}</span>
                          </div>
                          <div className={`stat-icon bg-${card.color} text-white p-3 rounded`}>
                            <i className={`fa-solid ${card.icon}`}></i>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* Quản lý sách */}
          {activeTab === 'products' && (
              <AdminProduct setActiveTab={setActiveTab} setEditProductId={setEditProductId} />
          )}
          {activeTab === 'add_product' && (
              <AdminAddProduct setActiveTab={setActiveTab} />
          )}
          {activeTab === 'edit_product' && (
              <AdminEditProduct setActiveTab={setActiveTab} productId={editProductId} />
          )}

          {/* Quản lý người dùng — ĐÃ THÊM */}
          {activeTab === 'orders' && (
              <AdminOrders />
          )}

          {activeTab === 'inventory' && (
              <AdminInventory />
          )}

          {activeTab === 'categories' && (
              <AdminCategory />
          )}

          {activeTab === 'users' && (
              <AdminUser />
          )}

          {activeTab === 'reviews' && (
              <AdminReviews />
          )}

          {/* Các tab chưa làm */}
          {['coupons', 'banners'].includes(activeTab) && (
              <div className="p-4">
                <div className="bg-white rounded-3 shadow-sm p-5 text-center">
                  <i className="fa-solid fa-wrench fa-3x text-muted mb-3 d-block"></i>
                  <h5 className="text-muted">Tính năng đang được phát triển</h5>
                  <p className="text-muted small">Module này sẽ sớm được hoàn thiện</p>
                </div>
              </div>
          )}
        </main>
      </div>
  );
};

export default Admin;