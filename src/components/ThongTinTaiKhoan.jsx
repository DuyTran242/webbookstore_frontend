import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../api/favoriteApi';

const ThongTinTaiKhoan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabQuery = searchParams.get('tab');

  const fileInputRef = useRef(null);

  const sessionString = localStorage.getItem('userSession');
  const userSession = sessionString ? JSON.parse(sessionString) : null;

  const [activeTab, setActiveTab] = useState(tabQuery || 'profile');

  useEffect(() => {
    if (tabQuery) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Nam',
    birthdate: '',
    address: ''
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // ====== 1. STATE CHO FORM ĐỔI MẬT KHẨU ======
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ====== 2. STATE CHO LỊCH SỬ ĐƠN HÀNG ======
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  useEffect(() => {
    if (!userSession) {
      navigate('/login');
      return;
    }

    // Load thông tin user
    fetch(`http://localhost:8080/api/auth/user/${userSession.id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || 'Nam',
          birthdate: data.birthdate || '',
          address: data.address || ''
        });

        if (data.avatar) {
          const isFullUrl = data.avatar.startsWith('http') || data.avatar.startsWith('data:image');
          setAvatarPreview(isFullUrl ? data.avatar : `http://localhost:8080${data.avatar}`);
        } else {
          setAvatarPreview('https://via.placeholder.com/150');
        }
      })
      .catch(err => console.error("Lỗi khi lấy thông tin user:", err));
  }, [navigate]);

  // ====== 3. EFFECT VÀ HÀM LẤY DATA ĐƠN HÀNG ======
  // Gọi API lấy danh sách đơn hàng mỗi khi chuyển sang tab 'orders'
  useEffect(() => {
    if (activeTab === 'orders' && userSession && userSession.id) {
      fetchOrders();
    }
  }, [activeTab]);

  // Load favorite products when component mounts or when user changes
  useEffect(() => {
    const fetchFavs = async () => {
      if (userSession && userSession.id) {
        try {
          const data = await getFavorites(userSession.id);
          setFavoriteProducts(data);
        } catch (error) {
          console.error("Error loading favorite products:", error);
          setFavoriteProducts([]);
        }
      }
    };
    fetchFavs();
  }, [userSession]);

  // Listen for favorites updates from other components
  useEffect(() => {
    const handler = async () => {
      if (userSession && userSession.id) {
        try {
          const data = await getFavorites(userSession.id);
          setFavoriteProducts(data);
        } catch (error) {
          console.error("Error updating favorite products:", error);
        }
      }
    };
    window.addEventListener('favoritesUpdated', handler);
    return () => window.removeEventListener('favoritesUpdated', handler);
  }, [userSession]);

  const handleRemoveFavorite = async (productId) => {
    try {
      if (userSession && userSession.id) {
        await removeFavorite(userSession.id, productId);
        setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
        window.dispatchEvent(new Event('favoritesUpdated'));
        alert("Sản phẩm đã được xóa khỏi danh sách yêu thích!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa khỏi danh sách yêu thích", error);
      alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`http://localhost:8080/api/orders/user/${userSession.id}/history`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử đơn hàng", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/details`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng", error);
    }
  };

  // Hàm tiện ích format tiền và ngày tháng
  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  // ====== CÁC HÀM XỬ LÝ KHÁC (PROFILE, PASSWORD) ======
  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file quá lớn. Vui lòng chọn ảnh dưới 5MB.");
        return;
      }
      setAvatarPreview(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('id', userSession.id);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('fullName', formData.fullName);
    formDataToSend.append('phone', formData.phone || '');
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('address', formData.address || '');

    if (formData.birthdate) formDataToSend.append('birthdate', formData.birthdate);
    if (selectedFile) formDataToSend.append('avatar', selectedFile);

    fetch('http://localhost:8080/api/auth/update-profile', {
      method: 'PUT',
      body: formDataToSend
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText);
        }
        return res.json();
      })
      .then((updatedUser) => {
        alert("Cập nhật thông tin thành công!");
        setFormData({
          ...formData,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          gender: updatedUser.gender,
          birthdate: updatedUser.birthdate,
          address: updatedUser.address
        });

        if (updatedUser.avatar) {
          const isFullUrl = updatedUser.avatar.startsWith('http') || updatedUser.avatar.startsWith('data:image');
          setAvatarPreview(isFullUrl ? updatedUser.avatar : `http://localhost:8080${updatedUser.avatar}`);
        } else {
          setAvatarPreview('https://via.placeholder.com/150');
        }

        setSelectedFile(null);
        localStorage.setItem('userSession', JSON.stringify(updatedUser));
      })
      .catch(err => {
        console.error(err);
        alert("Lỗi cập nhật: " + err.message);
      });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới nhập lại không đúng vui lòng nhập lại");
      return;
    }
    try {
      const response = await fetch('http://localhost:8080/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userSession.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        alert("Cập nhật mật khẩu mới thành công");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert("Mật khẩu hiện tại không đúng vui lòng kiểm tra lại");
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      alert("Lỗi kết nối máy chủ, vui lòng thử lại sau.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="border-bottom pb-3 mb-4">
              <h4 className="fw-bold mb-1">Hồ Sơ Của Tôi</h4>
              <p className="text-muted mb-0">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
            </div>
            <div className="row">
              <div className="col-md-8 border-end pe-4">
                <form onSubmit={handleUpdateProfile}>
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-3 col-form-label text-end text-muted">Email</label>
                    <div className="col-sm-9">
                      <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-3 col-form-label text-end text-muted">Tên</label>
                    <div className="col-sm-9">
                      <input type="text" className="form-control" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
                    </div>
                  </div>
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-3 col-form-label text-end text-muted">Số điện thoại</label>
                    <div className="col-sm-9">
                      <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-3 col-form-label text-end text-muted">Địa chỉ</label>
                    <div className="col-sm-9">
                      <input type="text" className="form-control" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Nhập địa chỉ của bạn" />
                    </div>
                  </div>
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-3 col-form-label text-end text-muted">Giới tính</label>
                    <div className="col-sm-9 d-flex gap-3">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="gender" checked={formData.gender === 'Nam'} onChange={() => setFormData({ ...formData, gender: 'Nam' })} /> Nam
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="gender" checked={formData.gender === 'Nữ'} onChange={() => setFormData({ ...formData, gender: 'Nữ' })} /> Nữ
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="gender" checked={formData.gender === 'Khác'} onChange={() => setFormData({ ...formData, gender: 'Khác' })} /> Khác
                      </div>
                    </div>
                  </div>
                  <div className="row mb-4 align-items-center">
                    <label className="col-sm-3 col-form-label text-end text-muted">Ngày sinh</label>
                    <div className="col-sm-9">
                      <input type="date" className="form-control" value={formData.birthdate} onChange={e => setFormData({ ...formData, birthdate: e.target.value })} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-9 offset-sm-3">
                      <button type="submit" className="btn text-white px-4" style={{ backgroundColor: '#00583b' }}>Lưu thay đổi</button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="col-md-4 d-flex flex-column align-items-center justify-content-center">
                <div className="avatar-preview-wrapper rounded-circle overflow-hidden mb-3 border border-2" style={{ width: '120px', height: '120px' }}>
                  <img src={avatarPreview} alt="Avatar" className="w-100 h-100 object-fit-cover" />
                </div>
                <input type="file" accept=".jpeg, .png, .jpg" ref={fileInputRef} onChange={handleFileChange} className="d-none" />
                <button type="button" className="btn btn-outline-secondary mb-2" onClick={handleAvatarClick}>Chọn Ảnh</button>
                <div className="text-muted text-center" style={{ fontSize: '0.8rem' }}>
                  <p className="mb-0">Dung lượng file tối đa 5 MB</p>
                  <p className="mb-0">Định dạng: .JPEG, .PNG, .JPG</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="bg-white p-4 rounded shadow-sm position-relative">
            <h4 className="fw-bold border-bottom pb-3 mb-4">Đơn Hàng Của Bạn</h4>
            <div className="table-responsive">
              <table className="table table-hover align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>Mã ĐH</th>
                    <th>Ngày mua</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">Đang tải dữ liệu...</td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">Chưa có đơn hàng nào</td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id}>
                        <td className="fw-bold">#{order.id}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td className="text-danger fw-bold">{formatPrice(order.totalPrice)}</td>
                        <td>
                          <span className={`badge ${order.status === 'PENDING' ? 'bg-warning text-dark' : order.status === 'PROCESSING' ? 'bg-info' : order.status === 'DELIVERED' ? 'bg-success' : 'bg-secondary'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm text-white" 
                            style={{ backgroundColor: '#0f4f34' }}
                            onClick={() => handleViewDetails(order.id)}
                          >
                            <i className="fa-solid fa-eye me-1"></i> Details Order
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal hiển thị chi tiết đơn hàng */}
            {showModal && selectedOrder && (
              <>
                <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
                <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                  <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow">
                      <div className="modal-header bg-light">
                        <h5 className="modal-title fw-bold" style={{ color: '#0f4f34' }}>
                          Chi tiết đơn hàng #{selectedOrder.id}
                        </h5>
                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        {/* Thông tin giao hàng */}
                        <div className="mb-4 p-3 bg-light rounded border border-light-subtle">
                          <h6 className="fw-bold mb-2 border-bottom pb-2">Thông tin nhận hàng</h6>
                          <div className="row">
                            <div className="col-md-6">
                              <p className="mb-1"><strong>Trạng thái ĐH:</strong> <span className="badge bg-info">{selectedOrder.status}</span></p>
                              <p className="mb-1"><strong>Thanh toán:</strong> <span className={`badge ${selectedOrder.paymentStatus === 'PAID' ? 'bg-success' : 'bg-danger'}`}>{selectedOrder.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></p>
                            </div>
                            <div className="col-md-6">
                              <p className="mb-1"><strong>SĐT:</strong> {selectedOrder.phone}</p>
                              <p className="mb-1"><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</p>
                              <p className="mb-0"><strong>Ghi chú:</strong> {selectedOrder.note || 'Không có'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Danh sách sản phẩm */}
                        <h6 className="fw-bold mb-3">Sản phẩm đã đặt</h6>
                        <div className="table-responsive">
                          <table className="table align-middle border">
                            <thead className="table-light text-center">
                              <tr>
                                <th>Hình ảnh</th>
                                <th className="text-start">Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedOrder.items && selectedOrder.items.map((item, index) => (
                                <tr key={index} className="text-center">
                                  <td>
                                    <img 
                                      src={item.imageUrl || 'https://via.placeholder.com/60'} 
                                      alt={item.productName} 
                                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px', border: '1px solid #ddd' }}
                                    />
                                  </td>
                                  <td className="text-start fw-medium">{item.productName}</td>
                                  <td>{item.quantity}</td>
                                  <td>{formatPrice(item.price)}</td>
                                  <td className="fw-bold text-danger">{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Tổng kết tiền */}
                        <div className="d-flex justify-content-end mt-4">
                          <table className="table-borderless" style={{ width: '350px' }}>
                            <tbody>
                              <tr>
                                <td className="text-muted">Phí vận chuyển:</td>
                                <td className="text-end">{formatPrice(selectedOrder.shippingFee)}</td>
                              </tr>
                              <tr className="border-top">
                                <td className="fw-bold pt-2 fs-6">Tổng cộng:</td>
                                <td className="text-end fw-bold text-danger fs-5 pt-2">{formatPrice(selectedOrder.totalPrice)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="modal-footer bg-light border-0">
                        <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>Đóng</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

        case 'wishlist':
          return (
            <div className="bg-white p-4 rounded shadow-sm">
              <h4 className="fw-bold border-bottom pb-3 mb-4">Danh Sách Yêu Thích</h4>
              {favoriteProducts && favoriteProducts.length > 0 ? (
                <div className="row g-3">
                  {favoriteProducts.map(product => (
                    <div key={product.id} className="col-6 col-md-4 col-lg-3">
                      <div className="card h-100 position-relative border-0 shadow-sm" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <button 
                          className="btn btn-light text-danger position-absolute shadow" 
                          style={{ top: '10px', right: '10px', padding: '0.4rem 0.5rem', borderRadius: '50%', zIndex: 10, width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFavorite(product.id);
                          }}
                          title="Xóa khỏi danh sách yêu thích"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                        
                        <Link to={`/product/${product.id}`} className="text-decoration-none text-dark d-block h-100">
                          <img src={product.image || 'https://via.placeholder.com/150'}
                            alt={product.name}
                            className="card-img-top"
                            style={{ height: '180px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                          />
                          <div className="card-body p-3 text-center">
                            <h6 className="card-title text-truncate fw-bold mb-2" title={product.name}>{product.name}</h6>
                            <p className="card-text fw-bold text-danger mb-0" style={{ fontSize: '1.1rem' }}>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
              )}
            </div>
          );

      case 'password':
        return (
          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="fw-bold border-bottom pb-3 mb-4">Đổi Mật Khẩu</h4>
            <div className="row">
              <div className="col-md-8">
                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label className="form-label">Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      required 
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      required 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      required 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="btn text-white px-4" style={{ backgroundColor: '#00583b' }}>
                    Cập nhật mật khẩu
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
              <h4 className="fw-bold m-0">Sổ Địa Chỉ</h4>
              <button className="btn text-white" style={{ backgroundColor: '#00583b' }}>+ Thêm địa chỉ mới</button>
            </div>
            <div className="border p-3 rounded mb-3 position-relative">
              <span className="badge bg-success position-absolute top-0 end-0 m-2">Mặc định</span>
              <h6 className="fw-bold">{formData.fullName} | {formData.phone}</h6>
              <p className="text-muted mb-0">{formData.address || 'Chưa cập nhật địa chỉ'}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!userSession) return null;

  return (
    <div className="container mt-5 mb-5">
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <img src={avatarPreview} alt="User Avatar" className="rounded-circle border me-3 object-fit-cover" style={{ width: '50px', height: '50px' }} />
            <div>
              <p className="text-muted mb-0 small">Tài khoản của</p>
              <h6 className="fw-bold mb-0">{formData.fullName}</h6>
            </div>
          </div>

          <div className="list-group list-group-flush account-sidebar-menu">
            <button className={`list-group-item list-group-item-action border-0 mb-1 rounded ${activeTab === 'profile' ? 'fw-bold text-success bg-light' : ''}`} onClick={() => setActiveTab('profile')}>
              <i className="fa-regular fa-user me-2 text-primary"></i> Thông tin tài khoản
            </button>
            <button className={`list-group-item list-group-item-action border-0 mb-1 rounded ${activeTab === 'orders' ? 'fw-bold text-success bg-light' : ''}`} onClick={() => setActiveTab('orders')}>
              <i className="fa-solid fa-clipboard-list me-2 text-info"></i> Đơn hàng của bạn
            </button>
            <button className={`list-group-item list-group-item-action border-0 mb-1 rounded ${activeTab === 'wishlist' ? 'fw-bold text-success bg-light' : ''}`} onClick={() => setActiveTab('wishlist')}>
              <i className="fa-regular fa-heart me-2 text-danger"></i> Danh sách yêu thích
            </button>
            <button className={`list-group-item list-group-item-action border-0 mb-1 rounded ${activeTab === 'password' ? 'fw-bold text-success bg-light' : ''}`} onClick={() => setActiveTab('password')}>
              <i className="fa-solid fa-shield-halved me-2 text-warning"></i> Đổi mật khẩu
            </button>
            <button className={`list-group-item list-group-item-action border-0 mb-1 rounded ${activeTab === 'address' ? 'fw-bold text-success bg-light' : ''}`} onClick={() => setActiveTab('address')}>
              <i className="fa-solid fa-location-dot me-2 text-success"></i> Sổ địa chỉ
            </button>
            <button className="list-group-item list-group-item-action border-0 mt-3 text-danger fw-bold rounded hover-bg-danger" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket me-2"></i> Đăng xuất
            </button>
          </div>
        </div>

        <div className="col-md-9">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ThongTinTaiKhoan;