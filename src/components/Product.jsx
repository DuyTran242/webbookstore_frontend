import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, addFavorite, removeFavorite } from '../api/favoriteApi';
import './Product.css';

// ==========================================
// COMPONENT PHỤ: THẺ SẢN PHẨM (ĐƯA RA NGOÀI)
// ==========================================
const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = product.images && product.images.length > 0 
                     ? product.images[0].url || product.images[0].imageUrl 
                     : "https://via.placeholder.com/300x300?text=No+Image";

  let reviewCount = 0;
  let averageRating = 0;
  
  if (product.reviews && product.reviews.length > 0) {
    reviewCount = product.reviews.length;
    const totalStars = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    averageRating = Math.round(totalStars / reviewCount);
  }

  const [isFavorited, setIsFavorited] = useState(false);

  // Load favorite status on mount and update when favorites change elsewhere
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const userSessionStr = localStorage.getItem('userSession');
      if (userSessionStr) {
        const user = JSON.parse(userSessionStr);
        try {
          const favorites = await getFavorites(user.id);
          setIsFavorited(favorites.some(fav => fav.id === product.id));
        } catch (error) {
          console.error("Lỗi khi tải danh sách yêu thích:", error);
        }
      } else {
        setIsFavorited(false);
      }
    };

    fetchFavoriteStatus();
    
    // Listen for changes from other components (if we want to keep it)
    const handleUpdate = () => fetchFavoriteStatus();
    window.addEventListener('favoritesUpdated', handleUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleUpdate);
  }, [product.id]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const userSessionStr = localStorage.getItem('userSession');
    if (!userSessionStr) {
      alert("Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
      // Optionally trigger login modal if there's a global way
      return;
    }
    const user = JSON.parse(userSessionStr);

    try {
      if (isFavorited) {
        await removeFavorite(user.id, product.id);
        setIsFavorited(false);
        alert(`Sản phẩm "${product.name}" đã được xóa khỏi danh sách yêu thích (DB)!`);
      } else {
        await addFavorite(user.id, product.id);
        setIsFavorited(true);
        alert(`Đã thêm "${product.name}" vào danh sách yêu thích (DB)!`);
      }
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu thích:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };
  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <Link to={`/san-pham/${product.id}`} className="text-decoration-none text-dark">
      <div 
        className="product-card position-relative border rounded bg-white overflow-hidden h-100 d-flex flex-column" 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 10px 20px rgba(0,0,0,0.12)' : '0 2px 5px rgba(0,0,0,0.05)'
        }}
      >
        {/* KHUNG HÌNH ẢNH */}
        <div className="product-img-wrapper position-relative overflow-hidden" style={{ height: '250px' }}>
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="img-fluid w-100 h-100" 
            style={{ 
              objectFit: 'cover', 
              transform: isHovered ? 'scale(1.1)' : 'scale(1)', 
              transition: 'transform 0.5s ease' 
            }} 
          />

          {/* Màn sương mờ che nhẹ ảnh khi hover */}
          <div 
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              backgroundColor: isHovered ? 'rgba(0,0,0,0.1)' : 'transparent',
              transition: 'background-color 0.3s ease',
              zIndex: 1
            }}
          ></div>

          {/* Nút Trái Tim */}
            <button 
              onClick={handleLike}
              className="position-absolute bg-white border-0 rounded-circle d-flex justify-content-center align-items-center" 
              style={{ 
                top: '10px', 
                right: isHovered ? '10px' : '-40px',
                opacity: isHovered ? 1 : 0, 
                width: '35px', 
                height: '35px', 
                zIndex: 2,
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
              title="Yêu thích"
            >
              <i className={`fa-regular fa-heart text-danger ${isFavorited ? 'fa-solid' : ''}`}></i>
            </button>

          {/* Nút Thêm Vào Giỏ */}
          <button 
            onClick={handleAddToCart}
            className="position-absolute border-0 text-white fw-bold rounded-pill" 
            style={{ 
              bottom: isHovered ? '15px' : '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#00583b', 
              padding: '8px 20px',
              opacity: isHovered ? 1 : 0,
              zIndex: 2,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              width: '80%',
              whiteSpace: 'nowrap'
            }}
          >
            <i className="fa-solid fa-cart-plus me-2"></i> Thêm vào giỏ
          </button>
        </div>
        
        {/* KHUNG THÔNG TIN */}
        <div className="product-info p-3 d-flex flex-column flex-grow-1 bg-white" style={{ zIndex: 3 }}>
          <h3 
            className="product-title fs-6 mb-2" 
            style={{ 
              height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              color: isHovered ? '#00583b' : '#333',
              transition: 'color 0.3s ease'
            }}
          >
            {product.name}
          </h3>
          
          <div className="product-rating mb-2" style={{ color: '#ffc107', fontSize: '0.9rem' }}>
            {[...Array(5)].map((_, index) => (
              <i key={index} className={index < averageRating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
            ))}
            <span className="text-muted ms-2" style={{ fontSize: '0.8rem' }}>({reviewCount})</span>
          </div>

          <div className="product-price fw-bold mt-auto" style={{ color: '#d9534f', fontSize: '1.2rem' }}>
            {formatPrice(product.price)}
          </div>
        </div>
      </div>
    </Link>
  );
};


// ==========================================
// COMPONENT CHÍNH: PRODUCT
// ==========================================
const Product = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // States cho Bộ lọc
  const [priceFilter, setPriceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  // States cho Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  // States cho Carousels
  const [bestSellerIndex, setBestSellerIndex] = useState(0);
  const [relatedIndex, setRelatedIndex] = useState(0);

  // 1. GỌI API LẤY SẢN PHẨM
  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
        
        const uniqueCategories = [];
        data.forEach(p => {
            if (p.category && !uniqueCategories.some(c => c.id === p.category.id)) {
                uniqueCategories.push(p.category);
            }
        });
        setCategories(uniqueCategories);
      })
      .catch(err => console.error("Lỗi khi tải sản phẩm:", err));
  }, []);

  // 2. XỬ LÝ BỘ LỌC
  useEffect(() => {
    let result = products;

    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category && p.category.id.toString() === categoryFilter);
    }

    if (priceFilter === 'under5') {
      result = result.filter(p => p.price < 5000000);
    } else if (priceFilter === '5to10') {
      result = result.filter(p => p.price >= 5000000 && p.price <= 10000000);
    } else if (priceFilter === 'over10') {
      result = result.filter(p => p.price > 10000000);
    }

    setFilteredProducts(result);
    setCurrentPage(1); 
  }, [priceFilter, categoryFilter, products]);

  // 3. XỬ LÝ PHÂN TRANG
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 500, behavior: 'smooth' }); 
    }
  };

  // 4. XỬ LÝ CAROUSEL TỰ ĐỘNG
  useEffect(() => {
    const timer = setInterval(() => {
      if (products.length > 4) {
        setBestSellerIndex(prev => (prev >= products.length - 4 ? 0 : prev + 1));
        setRelatedIndex(prev => (prev >= products.length - 4 ? 0 : prev + 1));
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [products]);

  const maxIndex = Math.max(0, products.length - 4);
  const nextBestSeller = () => setBestSellerIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  const prevBestSeller = () => setBestSellerIndex(prev => prev <= 0 ? maxIndex : prev - 1);
  
  const nextRelated = () => setRelatedIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  const prevRelated = () => setRelatedIndex(prev => prev <= 0 ? maxIndex : prev - 1);

  return (
    <div className="product-page">
      {/* BANNER */}
      <div className="container-fluid p-0">
        <img 
          src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2000&auto=format&fit=crop" 
          alt="Banner Khuyến Mãi" 
          className="product-page-banner w-100"
          style={{ maxHeight: '400px', objectFit: 'cover' }}
        />
      </div>

      <div className="container mb-5 mt-4">
        
        {/* CAROUSEL SẢN PHẨM BÁN CHẠY */}
        {products.length > 0 && (
          <div className="best-sellers-section mb-5">
            <h2 className="mb-4 text-center" style={{color: '#00583b', fontWeight: 'bold'}}>SẢN PHẨM BÁN CHẠY</h2>
            <div className="custom-carousel-wrapper position-relative">
              <button className="carousel-control-prev border-0 bg-transparent fs-3 position-absolute top-50 start-0 translate-middle-y" style={{zIndex: 10}} onClick={prevBestSeller}>
                <i className="fa-solid fa-chevron-left text-dark"></i>
              </button>
              <div className="overflow-hidden p-2">
                <div 
                  className="custom-carousel-track d-flex transition-transform" 
                  style={{ transform: `translateX(-${bestSellerIndex * (100/4)}%)`, transition: 'transform 0.5s ease' }}
                >
                  {products.map(product => (
                    <div key={`best-${product.id}`} className="carousel-item-card p-2" style={{ minWidth: '25%' }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
              <button className="carousel-control-next border-0 bg-transparent fs-3 position-absolute top-50 end-0 translate-middle-y" style={{zIndex: 10}} onClick={nextBestSeller}>
                <i className="fa-solid fa-chevron-right text-dark"></i>
              </button>
            </div>
          </div>
        )}

        {/* PHẦN CHÍNH: BỘ LỌC VÀ DANH SÁCH SẢN PHẨM */}
        <div className="row">
          {/* CỘT TRÁI: BỘ LỌC */}
          <div className="col-lg-3 col-md-4 mb-4">
            <div className="filter-sidebar p-3 border rounded shadow-sm bg-white">
              <div className="filter-group">
                <h4 className="filter-title mb-3 fs-5 fw-bold border-bottom pb-2">Loại Sản Phẩm</h4>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="radio" name="category" id="cat-all" value="all" checked={categoryFilter === 'all'} onChange={(e) => setCategoryFilter(e.target.value)} />
                  <label className="form-check-label" htmlFor="cat-all">Tất cả sản phẩm</label>
                </div>
                {categories.map(cat => (
                  <div className="form-check mb-2" key={cat.id}>
                    <input className="form-check-input" type="radio" name="category" id={`cat-${cat.id}`} value={cat.id} checked={categoryFilter === cat.id.toString()} onChange={(e) => setCategoryFilter(e.target.value)} />
                    <label className="form-check-label" htmlFor={`cat-${cat.id}`}>{cat.name}</label>
                  </div>
                ))}
              </div>

              <div className="filter-group mt-4">
                <h4 className="filter-title mb-3 fs-5 fw-bold border-bottom pb-2">Mức Giá</h4>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="radio" name="price" id="price-all" value="all" checked={priceFilter === 'all'} onChange={(e) => setPriceFilter(e.target.value)} />
                  <label className="form-check-label" htmlFor="price-all">Tất cả mức giá</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="radio" name="price" id="price-under5" value="under5" checked={priceFilter === 'under5'} onChange={(e) => setPriceFilter(e.target.value)} />
                  <label className="form-check-label" htmlFor="price-under5">Dưới 5 triệu</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="radio" name="price" id="price-5to10" value="5to10" checked={priceFilter === '5to10'} onChange={(e) => setPriceFilter(e.target.value)} />
                  <label className="form-check-label" htmlFor="price-5to10">5 triệu - 10 triệu</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="radio" name="price" id="price-over10" value="over10" checked={priceFilter === 'over10'} onChange={(e) => setPriceFilter(e.target.value)} />
                  <label className="form-check-label" htmlFor="price-over10">Trên 10 triệu</label>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: GRID SẢN PHẨM & PHÂN TRANG */}
          <div className="col-lg-9 col-md-8">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
              <h3 className="m-0" style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#00583b'}}>Tất cả sản phẩm</h3>
              <span className="text-muted">Hiển thị {currentProducts.length} trên tổng số {filteredProducts.length} sản phẩm</span>
            </div>

            <div className="row g-3">
              {currentProducts.length > 0 ? (
                currentProducts.map(product => (
                  <div key={`grid-${product.id}`} className="col-6 col-md-6 col-lg-3">
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-muted fs-5">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
                </div>
              )}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="pagination-wrapper d-flex justify-content-center mt-5">
                <button className="btn btn-outline-success me-2" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button 
                    key={index + 1} 
                    className={`btn me-2 ${currentPage === index + 1 ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button className="btn btn-outline-success" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CAROUSEL SẢN PHẨM LIÊN QUAN */}
        {products.length > 0 && (
          <div className="related-products-section mt-5 pt-4 border-top">
            <h3 className="mb-4 text-center" style={{color: '#00583b', fontWeight: 'bold'}}>SẢN PHẨM CÙNG DANH MỤC</h3>
            <div className="custom-carousel-wrapper position-relative">
              <button className="carousel-control-prev border-0 bg-transparent fs-3 position-absolute top-50 start-0 translate-middle-y" style={{zIndex: 10}} onClick={prevRelated}>
                <i className="fa-solid fa-chevron-left text-dark"></i>
              </button>
              <div className="overflow-hidden p-2">
                <div 
                  className="custom-carousel-track d-flex transition-transform" 
                  style={{ transform: `translateX(-${relatedIndex * (100/4)}%)`, transition: 'transform 0.5s ease' }}
                >
                  {[...products].reverse().map(product => (
                    <div key={`related-${product.id}`} className="carousel-item-card p-2" style={{ minWidth: '25%' }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
              <button className="carousel-control-next border-0 bg-transparent fs-3 position-absolute top-50 end-0 translate-middle-y" style={{zIndex: 10}} onClick={nextRelated}>
                <i className="fa-solid fa-chevron-right text-dark"></i>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Product;