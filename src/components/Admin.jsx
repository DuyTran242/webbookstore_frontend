import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import AdminProduct from './AdminProduct';
import AdminAddProduct from './AdminAddProduct';
import AdminEditProduct from './AdminEditProduct';
import AdminOrder from './AdminOrder';
import AdminUser from './AdminUser';
import AdminCategories from './AdminCategories';
import AdminBrand from './AdminBrand';
import AdminStockQuantity from './AdminStockQuantity';

// --- IMPORT 3 COMPONENT MỚI CHO LUỒNG IMEI VÀ BẢO HÀNH ---
import AdminImportSerials from './AdminImportSerials';
import AdminWarranty from './AdminWarranty';
import AdminOrderPacking from './AdminOrderPacking';
import AdminReview from './AdminReview';
import AdminDiscount from './AdminDiscount';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Admin = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  
  // STATE ĐỂ QUẢN LÝ TAB ĐANG ACTIVE VÀ ID SẢN PHẨM CẦN SỬA
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editProductId, setEditProductId] = useState(null);

  // --- THÊM STATE NÀY ĐỂ QUẢN LÝ ID ĐƠN HÀNG KHI CHUYỂN SANG TRANG ĐÓNG GÓI ---
  const [packOrderId, setPackOrderId] = useState(null);

  // STATE ĐỂ LƯU DỮ LIỆU DASHBOARD
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    netIncome: 0,
    totalPaidOrders: 0,
    totalVisitors: 0
  });
  const [chartPeriod, setChartPeriod] = useState('30days');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetch(`http://localhost:8080/api/dashboard/summary?period=${chartPeriod}`)
        .then(res => res.json())
        .then(data => setDashboardData(data))
        .catch(err => console.error("Error fetching dashboard data:", err));
    }
  }, [activeTab, chartPeriod]);

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
            <small className="text-muted" style={{ fontSize: '11px' }}>BOOK STORE</small>
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
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${(activeTab === 'orders' || activeTab === 'pack_order') ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
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
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'reviews' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('reviews')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-regular fa-comment-dots" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Đánh giá</span>
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
            className={`px-3 py-2 mb-1 rounded d-flex align-items-center gap-3 ${activeTab === 'brands' ? 'bg-light fw-bold text-dark' : 'text-secondary'}`} 
            onClick={() => setActiveTab('brands')}
            style={{ cursor: 'pointer' }}
          >
            <i className="fa-solid fa-tag" style={{ width: '20px', textAlign: 'center' }}></i> 
            <span style={{ fontSize: '14px' }}>Thương hiệu</span>
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
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main bg-light w-100" style={{ minHeight: '100vh' }}>
        {/* TOP HEADER */}
        <header className="admin-header shadow-sm d-flex justify-content-end align-items-center px-4 py-3 bg-white">
          
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
          <div className="admin-content p-4" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>Thống kê & Báo cáo</h4>
                <small className="text-muted">Tổng quan hoạt động kinh doanh</small>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn"
                  style={chartPeriod === '30days' ? { backgroundColor: '#00583b', color: 'white', border: 'none' } : { backgroundColor: 'white', border: '1px solid #dee2e6', color: '#333' }}
                  onClick={() => setChartPeriod('30days')}
                >30 ngày</button>
                <button
                  className="btn"
                  style={chartPeriod === '12months' ? { backgroundColor: '#00583b', color: 'white', border: 'none' } : { backgroundColor: 'white', border: '1px solid #dee2e6', color: '#333' }}
                  onClick={() => setChartPeriod('12months')}
                >12 tháng</button>
                <button
                  className="btn"
                  style={{ backgroundColor: 'white', border: '1px solid #dee2e6', color: '#333' }}
                  onClick={() => setChartPeriod(chartPeriod)}
                ><i className="fa-solid fa-rotate-right"></i></button>
              </div>
            </div>
            
            {/* Stat Cards */}
            <div className="row g-4 mb-4">
              {/* Card 1 */}
              <div className="col-md-3">
                <div className="card shadow-sm border-0 rounded-3 h-100" style={{ borderLeft: '4px solid #00583b' }}>
                  <div className="card-body p-4 d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1 small">Tổng doanh thu</p>
                      <h4 className="fw-bold text-dark mb-1">{(dashboardData.totalRevenue || 0).toLocaleString()} ₫</h4>
                      <small className="text-muted">= Không đổi</small>
                    </div>
                    <div>
                      <div className="bg-light rounded p-2 text-success">
                        <i className="fa-solid fa-arrow-trend-up"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Card 2 */}
              <div className="col-md-3">
                <div className="card shadow-sm border-0 rounded-3 h-100" style={{ borderLeft: '4px solid #0d6efd' }}>
                  <div className="card-body p-4 d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1 small">Doanh thu tháng này</p>
                      <h4 className="fw-bold text-primary mb-1">{(dashboardData.thisMonthRevenue || 0).toLocaleString()} ₫</h4>
                      <small className="text-muted">Tháng trước: {(dashboardData.lastMonthRevenue || 0).toLocaleString()} ₫</small>
                    </div>
                    <div>
                      <div className="bg-light rounded p-2 text-primary">
                        <i className="fa-regular fa-calendar-days"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Card 3 */}
              <div className="col-md-3">
                <div className="card shadow-sm border-0 rounded-3 h-100" style={{ borderLeft: '4px solid #ffc107' }}>
                  <div className="card-body p-4 d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1 small">Tổng đơn hàng</p>
                      <h4 className="fw-bold text-warning mb-1">{dashboardData.totalOrders || 0}</h4>
                      <small className="text-muted">Tháng này: {dashboardData.thisMonthOrders || 0} đơn</small>
                    </div>
                    <div>
                      <div className="bg-light rounded p-2 text-warning">
                        <i className="fa-solid fa-receipt"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Card 4 */}
              <div className="col-md-3">
                <div className="card shadow-sm border-0 rounded-3 h-100" style={{ borderLeft: '4px solid #dc3545' }}>
                  <div className="card-body p-4 d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1 small">Đơn chờ xử lý</p>
                      <h4 className="fw-bold text-danger mb-1">{dashboardData.pendingOrders || 0}</h4>
                      <small className="text-info">Đang giao: {dashboardData.deliveringOrders || 0} đơn</small>
                    </div>
                    <div>
                      <div className="bg-light rounded p-2 text-danger">
                        <i className="fa-regular fa-clock"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Row 2 */}
              {/* Card 5 */}
              <div className="col-md-3">
                <div className="card shadow-sm border-0 rounded-3 h-100" style={{ borderLeft: '4px solid #6f42c1' }}>
                  <div className="card-body p-4 d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1 small">Tổng người dùng</p>
                      <h4 className="fw-bold mb-1" style={{ color: '#6f42c1' }}>{dashboardData.totalUsers || 0}</h4>
                      <small className="text-success">Mới tháng này: +{dashboardData.newUsersThisMonth || 0}</small>
                    </div>
                    <div>
                      <div className="bg-light rounded p-2" style={{ color: '#6f42c1' }}>
                        <i className="fa-solid fa-users"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Card 6 */}
              <div className="col-md-3">
                <div className="card shadow-sm border-0 rounded-3 h-100" style={{ borderLeft: '4px solid #20c997' }}>
                  <div className="card-body p-4 d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1 small">Tổng đầu sách</p>
                      <h4 className="fw-bold mb-1" style={{ color: '#20c997' }}>{dashboardData.totalBooks || 0}</h4>
                      <small className="text-success">✓ Tất cả còn hàng</small>
                    </div>
                    <div>
                      <div className="bg-light rounded p-2" style={{ color: '#20c997' }}>
                        <i className="fa-solid fa-book"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card shadow-sm border-0 rounded-3">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h6 className="fw-bold m-0"><i className="fa-solid fa-chart-line text-success me-2"></i>Doanh thu 30 ngày gần nhất</h6>
                      <span className="badge" style={{ backgroundColor: '#e6f4ea', color: '#137333', fontWeight: '500' }}>Đơn đã thanh toán</span>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <AreaChart data={dashboardData.revenueChartData && dashboardData.revenueChartData.length > 0 ? dashboardData.revenueChartData : [
                          { name: '1/6', value: 0 }, { name: '15/6', value: 0 }
                        ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#20c997" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#20c997" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#adb5bd', fontSize: 12 }} dy={10} minTickGap={30} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#adb5bd', fontSize: 12 }} tickFormatter={(val) => `${(val / 1000000)}M`} width={40} />
                          <Tooltip formatter={(value) => `${value.toLocaleString()} ₫`} />
                          <Area type="monotone" dataKey="value" stroke="#20c997" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card shadow-sm border-0 rounded-3 h-100">
                  <div className="card-body p-4">
                    <h6 className="fw-bold mb-4"><i className="fa-solid fa-bars-staggered text-primary me-2"></i>Số đơn hàng</h6>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <LineChart data={dashboardData.orderChartData && dashboardData.orderChartData.length > 0 ? dashboardData.orderChartData : [
                          { name: '1/6', count: 0 }, { name: '15/6', count: 0 }
                        ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#adb5bd', fontSize: 12 }} dy={10} minTickGap={30} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#adb5bd', fontSize: 12 }} width={30} allowDecimals={false} />
                          <Tooltip formatter={(value) => `${value} đơn`} />
                          <Line type="monotone" dataKey="count" stroke="#0d6efd" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CÁC COMPONENT QUẢN LÝ SẢN PHẨM */}
        {activeTab === 'products' && <AdminProduct setActiveTab={setActiveTab} setEditProductId={setEditProductId} />}
        {activeTab === 'add_product' && <AdminAddProduct setActiveTab={setActiveTab} />}
        {activeTab === 'edit_product' && <AdminEditProduct setActiveTab={setActiveTab} productId={editProductId} />}
        
        {/* CẬP NHẬT TRUYỀN PROPS CHO ADMIN ORDER ĐỂ CHUYỂN SANG ĐÓNG GÓI */}
        {activeTab === 'orders' && <AdminOrder setActiveTab={setActiveTab} setPackOrderId={setPackOrderId} />}
        
        {/* CÁC COMPONENT DANH MỤC KHÁC */}
        {activeTab === 'users' && <AdminUser />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'brands' && <AdminBrand />}
        {activeTab === 'inventory' && <AdminStockQuantity />}
        {activeTab === 'reviews' && <AdminReview />}
        {activeTab === 'coupons' && <AdminDiscount />}

        {/* --- CÁC COMPONENT QUẢN LÝ IMEI, BẢO HÀNH VÀ ĐÓNG GÓI --- */}
        {activeTab === 'import_imei' && <AdminImportSerials />}
        
        {/* Do AdminWarranty đã tích hợp cả tra cứu bảo hành và chức năng thu hồi/trả hàng nên render cho cả 2 tab */}
        {(activeTab === 'warranty' || activeTab === 'return') && <AdminWarranty />}
        
        {/* Component Đóng gói hiển thị khi nhấn từ AdminOrder */}
        {activeTab === 'pack_order' && <AdminOrderPacking orderId={packOrderId} setActiveTab={setActiveTab} />}

      </main>
    </div>
  );
};

export default Admin;