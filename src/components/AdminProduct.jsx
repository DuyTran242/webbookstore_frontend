import React, { useState, useEffect } from 'react';

const AdminProduct = ({ setActiveTab, setEditProductId}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5; // Số sản phẩm trên 1 trang

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Lỗi khi lấy dữ liệu sản phẩm');
      }
    } catch (error) {
      console.error('Lỗi kết nối server:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý lấy ảnh đại diện (is_primary = 1)
  const getPrimaryImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.is_primary === 1) || product.images[0];
      return primaryImage.imageUrl; // Chuỗi Base64
    }
    return 'https://via.placeholder.com/50'; // Ảnh mặc định nếu không có
  };

  // Tính toán dữ liệu phân trang
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  return (
    <div className="admin-product-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>Quản lý Sản Phẩm</h4>
          <span className="text-muted small">Danh sách sản phẩm trong kho</span>
        </div>
        <button
          className="btn text-white fw-bold px-4 py-2"
          style={{ backgroundColor: '#e5533d', borderRadius: '8px' }}
          onClick={() => setActiveTab('add_product')} // <-- CẬP NHẬT DÒNG NÀY
        >
          + Thêm Sản Phẩm
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 py-3 ps-4 text-muted small">Hình ảnh</th>
                  <th className="border-0 py-3 text-muted small">Mã SP (ID)</th>
                  <th className="border-0 py-3 text-muted small">Tên sản phẩm</th>
                  <th className="border-0 py-3 text-muted small">Thương hiệu</th>
                  <th className="border-0 py-3 text-muted small text-end">Giá</th>
                  <th className="border-0 py-3 text-muted small text-center">Tồn kho</th>
                  <th className="border-0 py-3 text-muted small text-center pe-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">Đang tải dữ liệu...</td>
                  </tr>
                ) : currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">Không có sản phẩm nào</td>
                  </tr>
                ) : (
                  currentProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="ps-4 py-3">
                        <img
                          src={getPrimaryImage(product)}
                          alt={product.name}
                          className="rounded"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      </td>
                      <td className="py-3">#{product.id}</td>
                      <td className="py-3 fw-bold">{product.name}</td>
                      <td className="py-3">{product.brand}</td>
                      <td className="py-3 text-end fw-bold">
                        {product.price?.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 text-center">{product.stockQuantity}</td>
                      <td className="py-3 text-center pe-4">
                        <button
                          className="btn btn-sm btn-light me-2 text-primary"
                          title="Sửa"
                          onClick={() => {
                            setEditProductId(product.id); // Lưu ID sản phẩm cần sửa
                            setActiveTab('edit_product'); // Chuyển sang tab edit
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button className="btn btn-sm btn-light text-danger" title="Xóa">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phân trang (Pagination) */}
        {!loading && products.length > 0 && (
          <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center px-4">
            <span className="text-muted small">
              Hiển thị {indexOfFirstProduct + 1} đến {Math.min(indexOfLastProduct, products.length)} trong tổng số {products.length} sản phẩm
            </span>
            <nav>
              <ul className="pagination pagination-sm m-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link text-dark" onClick={() => paginate(currentPage - 1)}>Trước</button>
                </li>

                {[...Array(totalPages)].map((_, index) => (
                  <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      style={currentPage === index + 1 ? { backgroundColor: '#e25822', borderColor: '#e25822', color: 'white' } : { color: 'black' }}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link text-dark" onClick={() => paginate(currentPage + 1)}>Sau</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProduct;