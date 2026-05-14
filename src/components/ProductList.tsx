import React, { useState, useEffect } from 'react';
import './ProductList.css';
import { Link, useSearchParams } from 'react-router-dom';

// Import ảnh đối tác tĩnh
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

// Cập nhật kiểu dữ liệu của Sản phẩm khớp với JSON Backend trả về
interface Product {
  id: number;
  name: string;
  price: number;
  images: ProductImage[]; // Mảng chứa ảnh Base64

  // Các trường optional (nếu sau này DB có thêm)
  oldPrice?: number;
  badgeText?: string;
  badgeType?: 'teal' | 'red';
}

const ProductList: React.FC = () => {
  // [THÊM MỚI]: Lấy params từ URL
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  // State lưu dữ liệu sản phẩm lấy từ API
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State xử lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Gọi API lấy dữ liệu từ Spring Boot khi Component Mount hoặc khi categoryId thay đổi
  useEffect(() => {
    setLoading(true); // Hiển thị loading mỗi khi đổi danh mục
    
    // Cấu hình URL API động dựa trên việc có categoryId hay không
    let apiUrl = 'http://localhost:8080/api/products';
    if (categoryId) {
      // *LƯU Ý: Backend Spring Boot cần hỗ trợ query param này (VD: @RequestParam("categoryId"))
      // Hoặc nếu Backend cấu hình endpoint khác, hãy sửa lại thành: `http://localhost:8080/api/categories/${categoryId}/products`
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
        setCurrentPage(1); // [THÊM MỚI]: Reset về trang 1 khi danh mục thay đổi
      })
      .catch(error => {
        console.error("Lỗi khi gọi API lấy sản phẩm:", error);
        setLoading(false);
      });
  }, [categoryId]); // [THÊM MỚI]: Dependency array lắng nghe sự thay đổi của categoryId

  // Logic tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  // Khởi tạo Bootstrap Carousel cho phần Đối tác
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
              {currentItems.map((product) => {
                // TÌM ẢNH ĐẠI DIỆN: Lấy ảnh có isPrimary = 1, nếu không có thì lấy ảnh đầu tiên
                const primaryImageObj = product.images?.find(img => img.isPrimary === 1) || product.images?.[0];
                const imageUrl = primaryImageObj ? primaryImageObj.imageUrl : ''; 

                return (
                  <div key={product.id} className="col-md-3">
                    <div className="product-card">

                      {/* Badge (Ví dụ: HOT, MỚI) */}
                      {product.badgeText && (
                        <div className={`product-badge badge-${product.badgeType}`}>
                          {product.badgeText}
                        </div>
                      )}
                      
                      {/* Hình ảnh Base64 */}
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
                      
                      {/* Thông tin Tên Sản Phẩm */}
                      <Link to={`/product/${product.id}`} className="product-name">
                        {product.name}
                      </Link>

                      <div className="mb-2">
                        <span className="product-price">{formatPrice(product.price)}</span>
                        {product.oldPrice && (
                          <span className="product-old-price">{formatPrice(product.oldPrice)}</span>
                        )}
                      </div>

                      {/* Nút ADD TO CART & Icon Trái Tim */}
                      <div className="d-flex justify-content-center align-items-center mt-3">
                        <button className="btn btn-add-to-cart" style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}>
                          ADD TO CART
                        </button>
                        <i className="fas fa-heart heart-icon ms-3 fs-5" title="Thêm vào yêu thích"></i>
                      </div>

                    </div>
                  </div>
                );
              })}
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