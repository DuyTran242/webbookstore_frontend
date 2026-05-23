import React, { useState, useEffect, useCallback } from 'react';

const AdminProduct = ({ setActiveTab, setEditProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State phân trang từ Backend
  const [currentPage, setCurrentPage] = useState(0); // Backend dùng 0-based
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // State tìm kiếm và lọc
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);

  // Lấy danh mục để hiển thị dropdown lọc
  useEffect(() => {
    fetch('http://localhost:8080/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error('Lỗi lấy danh mục:', err));
  }, []);

  // Gọi API phân trang + tìm kiếm từ Backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let url = `http://localhost:8080/api/admin/products?page=${currentPage}&size=${pageSize}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (categoryId) url += `&categoryId=${categoryId}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Backend trả về Page object của Spring
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      }
    } catch (error) {
      console.error('Lỗi kết nối server:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Xử lý tìm kiếm (Enter hoặc bấm nút)
  const handleSearch = () => {
    setKeyword(searchInput.trim());
    setCurrentPage(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Xóa bộ lọc
  const handleClearFilter = () => {
    setSearchInput('');
    setKeyword('');
    setCategoryId('');
    setCurrentPage(0);
  };

  // Lấy ảnh chính của sách
  const getPrimaryImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.isPrimary === 1) || product.images[0];
      return primary?.imageUrl || null;
    }
    return null;
  };

  // Xóa sách
  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa sách "${product.name}" không?\nHành động này không thể hoàn tác!`);
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Xóa sách thành công!');
        // Nếu xóa hết trang hiện tại thì quay về trang trước
        if (products.length === 1 && currentPage > 0) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchProducts();
        }
      } else {
        const err = await response.text();
        alert('Xóa thất bại: ' + err);
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      alert('Lỗi kết nối máy chủ!');
    }
  };

  // Format tiền
  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  // Render số trang (hiển thị tối đa 5 trang xung quanh trang hiện tại)
  const renderPageNumbers = () => {
    const pages = [];
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    if (start > 0) {
      pages.push(
          <li key="first" className="page-item">
            <button className="page-link text-dark" onClick={() => setCurrentPage(0)}>1</button>
          </li>
      );
      if (start > 1) pages.push(<li key="dots-start" className="page-item disabled"><span className="page-link">...</span></li>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
          <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
            <button
                className="page-link"
                style={currentPage === i ? { backgroundColor: '#00583b', borderColor: '#00583b', color: 'white' } : { color: 'black' }}
                onClick={() => setCurrentPage(i)}
            >
              {i + 1}
            </button>
          </li>
      );
    }

    if (end < totalPages - 1) {
      if (end < totalPages - 2) pages.push(<li key="dots-end" className="page-item disabled"><span className="page-link">...</span></li>);
      pages.push(
          <li key="last" className="page-item">
            <button className="page-link text-dark" onClick={() => setCurrentPage(totalPages - 1)}>{totalPages}</button>
          </li>
      );
    }

    return pages;
  };

  return (
      <div className="admin-product-container p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>Quản lý Sách</h4>
            <span className="text-muted small">
            Tổng cộng <strong>{totalElements}</strong> đầu sách trong kho
          </span>
          </div>
          <button
              className="btn text-white fw-bold px-4 py-2"
              style={{ backgroundColor: '#00583b', borderRadius: '8px' }}
              onClick={() => setActiveTab('add_product')}
          >
            <i className="fa-solid fa-plus me-2"></i> Thêm Sách Mới
          </button>
        </div>

        {/* Thanh tìm kiếm + lọc */}
        <div className="card border-0 shadow-sm rounded-3 mb-3">
          <div className="card-body py-3">
            <div className="row g-2 align-items-center">
              {/* Ô tìm kiếm */}
              <div className="col-md-5">
                <div className="input-group">
                  <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm theo tên sách hoặc tác giả..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                  />
                  <button
                      className="btn text-white"
                      style={{ backgroundColor: '#00583b' }}
                      onClick={handleSearch}
                  >
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
              </div>

              {/* Lọc theo danh mục */}
              <div className="col-md-3">
                <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => { setCategoryId(e.target.value); setCurrentPage(0); }}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Nút xóa bộ lọc */}
              <div className="col-md-2">
                {(keyword || categoryId) && (
                    <button className="btn btn-outline-secondary w-100" onClick={handleClearFilter}>
                      <i className="fa-solid fa-xmark me-1"></i> Xóa lọc
                    </button>
                )}
              </div>

              {/* Hiển thị kết quả tìm kiếm */}
              {keyword && (
                  <div className="col-md-2 text-end">
                    <small className="text-muted">
                      Kết quả cho: <strong className="text-dark">"{keyword}"</strong>
                    </small>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Bảng danh sách sách */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th className="border-0 py-3 ps-4 text-muted small">Bìa sách</th>
                  <th className="border-0 py-3 text-muted small">Mã sách</th>
                  <th className="border-0 py-3 text-muted small">Tên sách</th>
                  <th className="border-0 py-3 text-muted small">Tác giả</th>
                  <th className="border-0 py-3 text-muted small">Nhà xuất bản</th>
                  <th className="border-0 py-3 text-muted small text-end">Giá bán</th>
                  <th className="border-0 py-3 text-muted small text-center">Tồn kho</th>
                  <th className="border-0 py-3 text-muted small text-center pe-4">Hành động</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="spinner-border text-success" role="status"></div>
                        <p className="text-muted mt-2 mb-0">Đang tải dữ liệu...</p>
                      </td>
                    </tr>
                ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        <i className="fa-solid fa-book-open fa-2x mb-2 d-block"></i>
                        {keyword ? `Không tìm thấy sách nào với từ khóa "${keyword}"` : 'Chưa có sách nào trong kho'}
                      </td>
                    </tr>
                ) : (
                    products.map((product) => {
                      const imgUrl = getPrimaryImage(product);
                      return (
                          <tr key={product.id}>
                            {/* Bìa sách */}
                            <td className="ps-4 py-3">
                              {imgUrl ? (
                                  <img
                                      src={imgUrl}
                                      alt={product.name}
                                      className="rounded"
                                      style={{ width: '45px', height: '60px', objectFit: 'cover' }}
                                  />
                              ) : (
                                  <div
                                      className="rounded d-flex align-items-center justify-content-center bg-light"
                                      style={{ width: '45px', height: '60px' }}
                                  >
                                    <i className="fa-solid fa-book text-muted"></i>
                                  </div>
                              )}
                            </td>

                            {/* Mã sách */}
                            <td className="py-3">
                              <span className="badge bg-light text-dark border">#{product.id}</span>
                            </td>

                            {/* Tên sách */}
                            <td className="py-3">
                          <span
                              className="fw-bold d-block"
                              style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={product.name}
                          >
                            {product.name}
                          </span>
                            </td>

                            {/* Tác giả — dùng trường brand */}
                            <td className="py-3 text-muted small">
                              {product.brand || <span className="fst-italic text-muted">Chưa có</span>}
                            </td>

                            {/* Nhà xuất bản — dùng trường material */}
                            <td className="py-3 text-muted small">
                              {product.material || <span className="fst-italic text-muted">Chưa có</span>}
                            </td>

                            {/* Giá bán */}
                            <td className="py-3 text-end fw-bold text-danger">
                              {formatPrice(product.price)}
                            </td>

                            {/* Tồn kho */}
                            <td className="py-3 text-center">
                          <span
                              className={`badge ${
                                  product.stockQuantity > 10
                                      ? 'bg-success'
                                      : product.stockQuantity > 0
                                          ? 'bg-warning text-dark'
                                          : 'bg-danger'
                              }`}
                          >
                            {product.stockQuantity ?? 0}
                          </span>
                            </td>

                            {/* Hành động */}
                            <td className="py-3 text-center pe-4">
                              <button
                                  className="btn btn-sm btn-light me-2 text-primary border"
                                  title="Sửa thông tin sách"
                                  onClick={() => {
                                    setEditProductId(product.id);
                                    setActiveTab('edit_product');
                                  }}
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button
                                  className="btn btn-sm btn-light text-danger border"
                                  title="Xóa sách"
                                  onClick={() => handleDelete(product)}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                      );
                    })
                )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phân trang */}
          {!loading && totalPages > 0 && (
              <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center px-4">
            <span className="text-muted small">
              Trang <strong>{currentPage + 1}</strong> / {totalPages} —
              Hiển thị {products.length} trong tổng số <strong>{totalElements}</strong> sách
            </span>
                <nav>
                  <ul className="pagination pagination-sm m-0">
                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                      <button className="page-link text-dark" onClick={() => setCurrentPage(prev => prev - 1)}>
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                    </li>

                    {renderPageNumbers()}

                    <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                      <button className="page-link text-dark" onClick={() => setCurrentPage(prev => prev + 1)}>
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
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