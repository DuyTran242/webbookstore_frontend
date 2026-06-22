import React, { useState, useEffect } from 'react';
import './ProductList.css';
import { Link, useSearchParams } from 'react-router-dom';
import { getFavorites, addFavorite, removeFavorite } from '../api/favoriteApi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { CartContext } from './CartContext';
import { useContext } from 'react';

import com1 from '../img/company1.jpg';
import com2 from '../img/company2.png';
import com3 from '../img/company3.jpg';
import com4 from '../img/company4.png';
import com5 from '../img/company5.jpg';
import com6 from '../img/company6.jpg';
import com7 from '../img/company7.jpg';
import com8 from '../img/company8.jpg';
import com9 from '../img/company9.jpg';
import com10 from '../img/company10.jpg';

// Khai báo kiểu dữ liệu của Ảnh lấy từ Backend
interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  images: ProductImage[];

  oldPrice?: number;
  badgeText?: string;
  badgeType?: 'teal' | 'red';
}

const ProductItem: React.FC<{ product: Product; formatPrice: (price: number) => string }> = ({ product, formatPrice }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const { fetchCartItems } = useContext(CartContext);

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
      }
    };

    fetchFavoriteStatus();

    const handleUpdate = () => fetchFavoriteStatus();
    window.addEventListener('favoritesUpdated', handleUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleUpdate);
  }, [product.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const userSessionStr = localStorage.getItem('userSession');
    if (!userSessionStr) {
      alert("Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const userSessionStr = localStorage.getItem('userSession');
    if (!userSessionStr) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa đăng nhập',
        text: 'Vui lòng đăng nhập để thêm vào giỏ hàng!'
      });
      return;
    }

    const user = JSON.parse(userSessionStr);
    try {
      await axios.post('http://localhost:8080/api/cart/add', {
        userId: user.id,
        productId: product.id,
        quantity: 1
      });

      Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Đã thêm sản phẩm vào giỏ hàng.', timer: 1500, showConfirmButton: false });


      fetchCartItems();
      window.dispatchEvent(new Event('cartUpdated'));

    } catch (error: any) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      const errorMsg = error.response?.data?.error || error.response?.data || 'Có lỗi xảy ra, vui lòng thử lại!';
      Swal.fire({ icon: 'error', title: 'Thất bại', text: errorMsg });
    }
  };

  const primaryImageObj = product.images?.find(img => img.isPrimary === 1) || product.images?.[0];
  const imageUrl = primaryImageObj ? primaryImageObj.imageUrl : '';

  return (
    <div className="col-md-3">
      <div className="product-card">

        {product.badgeText && (
          <div className={`product-badge badge-${product.badgeType}`}>
            {product.badgeText}
          </div>
        )}

        <div className="product-img-wrapper">
          <Link to={`/product/${product.id}`}>
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="product-img" />
            ) : (
              <div className="d-flex justify-content-center align-items-center bg-light" style={{ height: '250px' }}>
                <span className="text-muted">Chưa có ảnh</span>
              </div>
            )}
          </Link>
        </div>

        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>

        <div className="mb-2">
          <span className="product-price">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="product-old-price">{formatPrice(product.oldPrice)}</span>
          )}
        </div>

        <div className="d-flex justify-content-center align-items-center mt-3">
          <button
            className="btn btn-add-to-cart"
            style={{ backgroundColor: '#28a745', borderColor: '#28a745', color: '#fff', fontSize: '13px', padding: '6px 12px' }}
            onClick={handleAddToCart}
          >
            <i className="fa-solid fa-cart-plus me-1"></i> Thêm vào giỏ
          </button>
          <i
            className={`fa-heart heart-icon ms-3 fs-5 ${isFavorited ? 'fa-solid text-danger' : 'fa-regular'}`}
            title="Thêm vào yêu thích"
            onClick={handleLike}
            style={{ cursor: 'pointer' }}
          ></i>
        </div>

      </div>
    </div>
  );
};

const ProductList: React.FC = () => {

  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setLoading(true);

    let apiUrl = 'http://localhost:8080/api/products';
    if (categoryId) {

      apiUrl = `http://localhost:8080/api/products?categoryId=${categoryId}`;
    }

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Lỗi mạng hoặc API chưa chạy');
        }
        return response.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch(error => {
        console.error("Lỗi khi gọi API lấy sản phẩm:", error);
        setLoading(false);
      });
  }, [categoryId]);

  // Logic tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  useEffect(() => {
    const bootstrap = (window as any).bootstrap;
    if (bootstrap) {
      const myCarouselElement = document.querySelector('#partnerCarousel');
      if (myCarouselElement) {
        new bootstrap.Carousel(myCarouselElement, {
          interval: 3000,
          ride: 'carousel'
        });
      }
    }
  }, []);

  return (
    <div className="container mt-4 mb-5">

      {/* Tiêu đề */}
      <div className="product-list-header">
        <h2 className="product-list-title mb-0">
          {categoryId ? 'KẾT QUẢ LỌC SẢN PHẨM' : 'TẤT CẢ SẢN PHẨM'}
        </h2>
      </div>

      {/* Thanh công cụ (Toolbar) */}
      <div className="toolbar d-flex justify-content-between align-items-center bg-light">
        <div className="d-flex align-items-center">
          <i className="fas fa-th-large view-icon active me-2"></i>
          <i className="fas fa-list view-icon me-4"></i>
          <span className="me-2">Sản phẩm/trang</span>
          <select className="toolbar-select">
            <option>12</option>
            <option>24</option>
          </select>
        </div>
        <div className="d-flex align-items-center">
          <span className="me-2">Sắp xếp</span>
          <select className="toolbar-select">
            <option>Mặc định</option>
            <option>Giá tăng dần</option>
            <option>Giá giảm dần</option>
            <option>Tên sản phẩm: A to Z</option>
            <option>Tên sản phẩm: Z to A</option>
          </select>
        </div>
      </div>

      {/* Hiển thị Loading khi đang chờ gọi API */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải dữ liệu sản phẩm...</p>
        </div>
      ) : (
        <>
          {/* Grid Sản phẩm */}
          {products.length === 0 ? (
            <div className="text-center my-5 py-5 text-muted">
              <h4>Không tìm thấy sản phẩm nào trong danh mục này.</h4>
            </div>
          ) : (
            <div className="row g-0">
              {currentItems.map((product) => (
                <ProductItem key={product.id} product={product} formatPrice={formatPrice} />
              ))}
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>«</button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>»</button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {/* Băng chuyền Đối tác */}
      <div className="partner-section position-relative mt-5">
        <h3 className="partner-title">ĐỐI TÁC</h3>
        <div id="partnerCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
          <div className="carousel-inner px-5">
            <div className="carousel-item active">
              <div className="row align-items-center text-center">
                <div className="col"><img src={com1} className="partner-img" alt="Partner 1" /></div>
                <div className="col"><img src={com2} className="partner-img" alt="Partner 2" /></div>
                <div className="col"><img src={com3} className="partner-img" alt="Partner 3" /></div>
                <div className="col"><img src={com4} className="partner-img" alt="Partner 4" /></div>
                <div className="col"><img src={com5} className="partner-img" alt="Partner 5" /></div>
              </div>
            </div>
            <div className="carousel-item">
              <div className="row align-items-center text-center">
                <div className="col"><img src={com6} className="partner-img" alt="Partner 6" /></div>
                <div className="col"><img src={com7} className="partner-img" alt="Partner 7" /></div>
                <div className="col"><img src={com8} className="partner-img" alt="Partner 8" /></div>
                <div className="col"><img src={com9} className="partner-img" alt="Partner 9" /></div>
                <div className="col"><img src={com10} className="partner-img" alt="Partner 10" /></div>
              </div>
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#partnerCarousel" data-bs-slide="prev" style={{ width: '5%' }}>
            <span className="carousel-control-prev-icon" aria-hidden="true" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '50%', padding: '15px' }}></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#partnerCarousel" data-bs-slide="next" style={{ width: '5%' }}>
            <span className="carousel-control-next-icon" aria-hidden="true" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '50%', padding: '15px' }}></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductList;