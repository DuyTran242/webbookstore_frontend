import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CartDrawer from './CartDrawer';
import { useTranslation } from 'react-i18next'; // [THÊM MỚI] Import thư viện đa ngôn ngữ

// 1. Định nghĩa Type cho Category rõ ràng để sửa lỗi "never[]" của TypeScript
interface Category {
  id: number;
  name: string;
}

const Header = () => {
  // [THÊM MỚI] Khởi tạo hàm dịch và i18n để đổi ngôn ngữ
  const { t, i18n } = useTranslation();

  // Các state quản lý UI (Dropdown)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // 2. Sử dụng State ĐỘC LẬP cho giỏ hàng (Đã XÓA useContext để không bị lỗi trùng lặp biến)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Khởi tạo state danh mục với interface Category
  const [categories, setCategories] = useState<Category[]>([]);

  const navigate = useNavigate();

  // Lấy dữ liệu user từ phiên làm việc
  const sessionString = localStorage.getItem('userSession');
  const userSession = sessionString ? JSON.parse(sessionString) : null;
  const userId = userSession ? userSession.id : null;

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('userSession');
    setIsUserMenuOpen(false);
    setCartItems([]); // Xóa giỏ hàng hiển thị khi đăng xuất
    navigate('/login');
  };

  // [THÊM MỚI] Hàm xử lý chuyển đổi ngôn ngữ
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // --- LOGIC GỌI API ---

  // Lấy danh mục khi Header vừa load
  useEffect(() => {
    fetch('http://localhost:8080/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Lỗi lấy danh mục:", err));
  }, []);

  // Hàm Lấy giỏ hàng từ API
  const fetchCartItems = async () => {
    if (!userId) {
      setCartItems([]);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8080/api/cart/user/${userId}`);
      setCartItems(response.data);
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
    }
  };

  // Tự động lấy giỏ hàng khi người dùng đăng nhập thành công (có userId)
  useEffect(() => {
    fetchCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Lắng nghe sự kiện "cartUpdated" từ các trang khác (như trang Chi tiết sản phẩm)
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartItems();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);


  return (
    <header className="wolfbed-header">
      {/* --- TOP HEADER --- */}
      <div className="container py-3">
        <div className="row align-items-center">
          {/* Logo */}
          <div className="col-lg-2 col-md-3">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 className="logo-text m-0">HOME<span>LIVING</span></h1>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="col-lg-5 col-md-5">
            <div className="search-wrapper">
              <input
                type="text"
                className="form-control rounded-pill border-0 shadow-sm"
                placeholder={t('header.search_placeholder')} // [SỬA ĐỂ DỊCH]
              />
              <button className="search-btn">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>

          {/* Action Icons */}
          <div className="col-lg-5 col-md-4 d-flex justify-content-end align-items-center gap-4">
            <div className="header-info d-none d-xl-flex align-items-center">
              <i className="fa-solid fa-headset fs-4 icon-wolf-green"></i>
              <div className="ms-2">
                <small className="d-block text-muted">{t('header.sales')}</small> {/* [SỬA ĐỂ DỊCH] */}
                <strong className="hotline-text">1900 6750</strong>
              </div>
            </div>

            <div className="header-info d-none d-xl-flex align-items-center">
              <i className="fa-solid fa-house-chimney fs-4"></i>
              <div className="ms-2">
                <small className="d-block text-muted">{t('header.system')}</small> {/* [SỬA ĐỂ DỊCH] */}
                <strong className="text-dark">Showroom</strong>
              </div>
            </div>

            <div className="header-icons d-flex gap-3 ms-2 align-items-center">
              {/* USER MENU DROPDOWN */}
              <div
                className="position-relative hover-trigger"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <i className={`fa-regular fa-user fs-5 pointer-icon ${isUserMenuOpen ? 'active-icon' : ''} ${userSession ? 'text-success' : ''}`}></i>

                {isUserMenuOpen && (
                  <div className="user-dropdown shadow" style={{ minWidth: '200px', right: '-20px', position: 'absolute', backgroundColor: '#fff', zIndex: 1000, borderRadius: '8px', overflow: 'hidden' }}>
                    {userSession ? (
                      <>
                        <div className="px-3 py-3 border-bottom text-center bg-light">
                          <small className="text-muted">{t('header.hello')}</small><br /> {/* [SỬA ĐỂ DỊCH] */}
                          <strong style={{ color: '#00583b' }}>{userSession.fullName || userSession.email}</strong>
                        </div>
                        <Link to="/profile" className="d-block px-3 py-2 text-decoration-none text-dark border-bottom hover-dropdown-item">
                          <i className="fa-regular fa-id-card me-2"></i> {t('header.account_info')} {/* [SỬA ĐỂ DỊCH] */}
                        </Link>
                        <Link to="/orders" className="d-block px-3 py-2 text-decoration-none text-dark border-bottom hover-dropdown-item">
                          <i className="fa-solid fa-clipboard-list me-2"></i> {t('header.my_orders')} {/* [SỬA ĐỂ DỊCH] */}
                        </Link>
                        <div
                          className="px-3 py-2 text-danger hover-dropdown-item"
                          style={{ cursor: 'pointer' }}
                          onClick={handleLogout}
                        >
                          <i className="fa-solid fa-arrow-right-from-bracket me-2"></i> {t('header.logout')} {/* [SỬA ĐỂ DỊCH] */}
                        </div>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="d-block px-3 py-2 text-decoration-none text-dark border-bottom hover-dropdown-item">
                          <i className="fa-regular fa-user me-2"></i> {t('header.login')} {/* [SỬA ĐỂ DỊCH] */}
                        </Link>
                        <Link to="/register" className="d-block px-3 py-2 text-decoration-none text-dark hover-dropdown-item">
                          <i className="fa-solid fa-user-plus me-2"></i> {t('header.register')} {/* [SỬA ĐỂ DỊCH] */}
                        </Link>
                        {/* THÊM MỤC QUẢN TRỊ VIÊN Ở ĐÂY */}
                        <Link to="/admin-login" className="d-block px-3 py-2 text-decoration-none hover-dropdown-item" style={{ backgroundColor: '#f8f9fa', color: '#00583b', fontWeight: '500' }}>
                          <i className="fa-solid fa-user-shield me-2"></i> Quản trị viên
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Yêu thích */}
              <div className="position-relative">
                <i className="fa-regular fa-heart fs-5 pointer-icon"></i>
                <span className="badge-count bg-wolf-green">0</span>
              </div>

              {/* GIỎ HÀNG */}
              <div className="position-relative" onClick={() => setIsCartOpen(true)} style={{ cursor: 'pointer' }}>
                <i className="fa-solid fa-cart-shopping fs-5 pointer-icon"></i>
                <span className="badge-count bg-wolf-yellow text-dark">{userSession ? cartItems.length : 0}</span>
              </div>

              {/* [THÊM MỚI] BUTTON ĐỔI NGÔN NGỮ */}
              <div className="d-flex bg-light rounded-pill p-1 border">
                <button
                  className={`btn btn-sm rounded-pill border-0 ${i18n.language === 'vi' ? 'btn-success text-white' : 'text-muted'}`}
                  style={{ fontSize: '0.8rem', padding: '2px 8px' }}
                  onClick={() => changeLanguage('vi')}
                >
                  VI
                </button>
                <button
                  className={`btn btn-sm rounded-pill border-0 ${i18n.language === 'en' ? 'btn-success text-white' : 'text-muted'}`}
                  style={{ fontSize: '0.8rem', padding: '2px 8px' }}
                  onClick={() => changeLanguage('en')}
                >
                  EN
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION BAR --- */}
      <nav className="main-nav">
        <div className="container p-0 d-flex align-items-center position-relative h-100">

          {/* CATEGORY DROPDOWN */}
          <div
            className="category-wrapper h-100"
            onMouseEnter={() => setIsCategoryOpen(true)}
            onMouseLeave={() => setIsCategoryOpen(false)}
          >
            <div className="category-btn px-4 d-flex align-items-center justify-content-between h-100">
              <div>
                <i className="fa-solid fa-border-all me-2"></i>
                <span>{t('header.product_category')}</span> {/* [SỬA ĐỂ DỊCH] */}
              </div>
              <i className="fa-solid fa-chevron-down ms-4 small"></i>
            </div>

            {isCategoryOpen && (
              <ul className="category-list shadow">
                <li>
                  <Link to="/san-pham" className="text-decoration-none text-dark d-flex w-100">
                    <i className="fa-solid fa-border-all me-3 mt-1"></i> {t('header.all_products')} {/* [SỬA ĐỂ DỊCH] */}
                  </Link>
                </li>
                {/* Map category đã được fix lỗi TypeScript */}
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/san-pham?categoryId=${cat.id}`} className="text-decoration-none text-dark d-flex w-100">
                      <i className="fa-solid fa-tag me-3 mt-1"></i> {cat.name}
                      <i className="fa-solid fa-chevron-right ms-auto small mt-1"></i>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ul className="nav-links d-flex m-0 list-unstyled align-items-center h-100 position-static">
            <li><a href="/">{t('header.home')}</a></li> {/* [SỬA ĐỂ DỊCH] */}
            <li><a href="/flash-sale"><i className="fa-solid fa-bolt-lightning text-warning me-1"></i> {t('header.flash_sale')}</a></li> {/* [SỬA ĐỂ DỊCH] */}

            {/* SẢN PHẨM MEGA MENU */}
            <li
              className="has-mega h-100"
              onMouseEnter={() => setIsProductOpen(true)}
              onMouseLeave={() => setIsProductOpen(false)}
            >
              <Link to="/san-pham">{t('header.products')} <i className="fa-solid fa-chevron-down small ms-1"></i></Link> {/* [SỬA ĐỂ DỊCH] */}
              {isProductOpen && (
                <div className="mega-menu shadow-lg">
                  <div className="container py-4">
                    <div className="mega-section-title mb-2">Nệm</div>
                    <div className="row mb-4">
                      <div className="col">
                        <p className="menu-label">Kích thước</p>
                        <ul className="mega-list">
                          <li>100 x 200cm</li><li>120 x 200cm</li><li>140 x 200cm</li><li>160 x 200cm</li><li>180 x 200cm</li><li>200 x 200cm</li><li>220 x 200cm</li>
                        </ul>
                      </div>
                      <div className="col">
                        <p className="menu-label">Giá tiền</p>
                        <ul className="mega-list">
                          <li>Dưới 5 triệu</li><li>5 triệu - 10 triệu</li><li>10 triệu - 15 triệu</li><li>15 triệu - 30 triệu</li><li>30 triệu - 50 triệu</li><li>Trên 50 triệu</li>
                        </ul>
                      </div>
                      <div className="col">
                        <p className="menu-label">Loại sản phẩm</p>
                        <ul className="mega-list">
                          <li>Nệm bông ép</li><li>Nệm cao su</li><li>Nệm lò xo</li><li>Nệm foam</li>
                        </ul>
                      </div>
                      <div className="col">
                        <p className="menu-label">Thương hiệu</p>
                        <ul className="mega-list">
                          <li>Amando</li><li>Aeroflow</li><li>Dunlopillo</li><li>Goodnight</li><li>Gummi</li><li>Kim Cương</li><li>Liên Á</li><li>Comfy</li>
                        </ul>
                      </div>
                      <div className="col">
                        <p className="menu-label">Nhu cầu</p>
                        <ul className="mega-list">
                          <li>Nệm gấp gọn</li><li>Nệm hỗ trợ đau lưng</li><li>Nệm làm mát</li><li>Nệm khách sạn</li><li>Nệm cao cấp</li><li>Nệm cưới</li>
                        </ul>
                      </div>
                    </div>

                    <div className="mega-section-title mb-2 mt-2">Chăn ga</div>
                    <div className="row">
                      <div className="col">
                        <p className="menu-label">Loại sản phẩm</p>
                        <ul className="mega-list">
                          <li>Bộ ga chun</li><li>Bộ chăn ga chun</li>
                        </ul>
                      </div>
                      <div className="col">
                        <p className="menu-label">Kích thước</p>
                        <ul className="mega-list">
                          <li>120 x 200cm</li><li>160 x 200cm</li>
                        </ul>
                      </div>
                      <div className="col">
                        <p className="menu-label">Giá tiền</p>
                        <ul className="mega-list">
                          <li>Dưới 1 triệu</li><li>Từ 1 - 2 triệu</li>
                        </ul>
                      </div>
                      <div className="col">
                        <p className="menu-label">Thương hiệu</p>
                        <ul className="mega-list">
                          <li>Goodnight</li><li>Amando</li>
                        </ul>
                      </div>
                      <div className="col">
                        <p className="menu-label">Nhu cầu</p>
                        <ul className="mega-list">
                          <li>Chăn ga cưới</li><li>Chăn ga làm mát</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* TIN TỨC DROPDOWN */}
            <li
              className="has-dropdown h-100 position-relative hover-trigger"
              onMouseEnter={() => setIsNewsOpen(true)}
              onMouseLeave={() => setIsNewsOpen(false)}
            >
              <a href="/tin-tuc">{t('header.news')} <i className="fa-solid fa-chevron-down small ms-1"></i></a> {/* [SỬA ĐỂ DỊCH] */}
              {isNewsOpen && (
                <ul className="simple-dropdown shadow">
                  <li><a href="/tin-khuyen-mai">Tin khuyến mãi</a></li>
                  <li><a href="/huong-dan">Hướng dẫn chọn đệm</a></li>
                  <li><a href="/cam-nang">Cẩm nang sức khỏe</a></li>
                </ul>
              )}
            </li>

            <li><a href="/gioi-thieu">{t('header.intro')}</a></li> {/* [SỬA ĐỂ DỊCH] */}
            <li><a href="/lien-he">{t('header.contact')}</a></li> {/* [SỬA ĐỂ DỊCH] */}
            <li><a href="/he-thong">{t('header.stores')}</a></li> {/* [SỬA ĐỂ DỊCH] */}
            <li><a href="/huong-dan">{t('header.guide')} <i className="fa-solid fa-chevron-left ms-2"></i><i className="fa-solid fa-chevron-right ms-1"></i></a></li> {/* [SỬA ĐỂ DỊCH] */}
          </ul>
        </div>
      </nav>

      {/* COMPONENT CART DRAWER */}
      <CartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cartItems={cartItems}
        fetchCartItems={fetchCartItems}
      />
    </header>
  );
};

export default Header;