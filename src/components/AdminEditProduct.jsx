import React, { useState, useEffect } from 'react';

const AdminEditProduct = ({ setActiveTab, productId }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    brand: '',       // Tác giả
    color: '',       // Ngôn ngữ
    description: '',
    material: '',    // Nhà xuất bản
    stockQuantity: '',
    categoryId: '',
    weight: ''
  });
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Lấy danh sách danh mục
  useEffect(() => {
    fetch('http://localhost:8080/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error('Lỗi lấy danh mục:', err));
  }, []);

  // Load thông tin sách cần sửa
  useEffect(() => {
    if (productId) fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    setFetching(true);
    try {
      const response = await fetch(`http://localhost:8080/api/products/admin/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          price: data.price || '',
          brand: data.brand || '',
          color: data.color || '',
          description: data.description || '',
          material: data.material || '',
          stockQuantity: data.stockQuantity || '',
          categoryId: data.categoryId || '',
          weight: data.weight || ''
        });
        setImages(data.images || []);
      } else {
        alert('Không tìm thấy thông tin sách!');
        setActiveTab('products');
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin sách:', error);
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Thêm ảnh mới (convert sang Base64)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`Ảnh "${file.name}" quá lớn (tối đa 2MB)!`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [
          ...prev,
          { imageUrl: reader.result, isPrimary: prev.length === 0 ? 1 : 0 }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    const newImages = images.filter((_, i) => i !== indexToRemove);
    // Nếu xóa ảnh chính, đặt ảnh đầu tiên còn lại làm ảnh chính
    if (images[indexToRemove]?.isPrimary === 1 && newImages.length > 0) {
      newImages[0].isPrimary = 1;
    }
    setImages(newImages);
  };

  const setPrimaryImage = (indexToPrimary) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === indexToPrimary ? 1 : 0 })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) { alert('Vui lòng nhập tên sách!'); return; }
    if (!formData.price || parseFloat(formData.price) <= 0) { alert('Vui lòng nhập giá hợp lệ!'); return; }
    if (!formData.categoryId) { alert('Vui lòng chọn danh mục!'); return; }

    setLoading(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      categoryId: parseInt(formData.categoryId),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      images: images
    };

    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Cập nhật thông tin sách thành công!');
        setActiveTab('products');
      } else {
        alert('Cập nhật thất bại. Vui lòng kiểm tra lại!');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton khi đang tải dữ liệu
  if (fetching) {
    return (
        <div className="p-4 text-center">
          <div className="spinner-border text-success" role="status"></div>
          <p className="text-muted mt-2">Đang tải thông tin sách...</p>
        </div>
    );
  }

  return (
      <div className="admin-content p-4 w-100">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light shadow-sm border" onClick={() => setActiveTab('products')}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div>
              <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>
                Chỉnh sửa Sách <span className="text-muted fs-6 fw-normal">#{productId}</span>
              </h4>
              <small className="text-muted">Cập nhật thông tin và hình ảnh bìa sách</small>
            </div>
          </div>
          <button
              className="btn text-white fw-bold px-4 py-2"
              style={{ backgroundColor: '#00583b', borderRadius: '8px' }}
              onClick={handleSubmit}
              disabled={loading}
          >
            {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</>
                : <><i className="fa-solid fa-floppy-disk me-2"></i>Lưu thay đổi</>
            }
          </button>
        </div>

        <div className="row g-4">
          {/* CỘT TRÁI: THÔNG TIN SÁCH */}
          <div className="col-lg-8">

            {/* Thông tin chung */}
            <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
              <h6 className="fw-bold mb-3 pb-2 border-bottom">
                <i className="fa-solid fa-book me-2 text-success"></i>Thông tin sách
              </h6>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Tên sách <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className="form-control bg-light"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Tên sách"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Mô tả / Giới thiệu sách</label>
                <textarea
                    className="form-control bg-light"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tóm tắt nội dung sách..."
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Danh mục <span className="text-danger">*</span>
                  </label>
                  <select
                      className="form-select bg-light"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Thuộc tính chi tiết */}
            <div className="bg-white p-4 rounded-3 shadow-sm">
              <h6 className="fw-bold mb-3 pb-2 border-bottom">
                <i className="fa-solid fa-circle-info me-2 text-info"></i>Thông tin chi tiết
              </h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Tác giả</label>
                  <input
                      type="text"
                      className="form-control bg-light"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="Tên tác giả"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Nhà xuất bản</label>
                  <input
                      type="text"
                      className="form-control bg-light"
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      placeholder="VD: NXB Trẻ"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Ngôn ngữ</label>
                  <input
                      type="text"
                      className="form-control bg-light"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="VD: Tiếng Việt"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Khối lượng (gram)</label>
                  <input
                      type="number"
                      step="1"
                      className="form-control bg-light"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="VD: 350"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: GIÁ, TỒN KHO & BÌA SÁCH */}
          <div className="col-lg-4">

            {/* Giá & Tồn kho */}
            <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
              <h6 className="fw-bold mb-3 pb-2 border-bottom">
                <i className="fa-solid fa-tags me-2 text-warning"></i>Giá & Tồn kho
              </h6>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Giá bán (VNĐ) <span className="text-danger">*</span>
                </label>
                <input
                    type="number"
                    className="form-control bg-light fw-bold text-danger"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Số lượng tồn kho <span className="text-danger">*</span>
                </label>
                <input
                    type="number"
                    className="form-control bg-light"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                />
              </div>
            </div>

            {/* Hình ảnh bìa sách */}
            <div className="bg-white p-4 rounded-3 shadow-sm">
              <h6 className="fw-bold mb-3 pb-2 border-bottom">
                <i className="fa-solid fa-image me-2 text-primary"></i>Hình ảnh bìa sách
              </h6>

              <label
                  className="d-flex flex-column align-items-center justify-content-center w-100 p-3 mb-3 rounded-3 text-center"
                  style={{ border: '2px dashed #00583b', cursor: 'pointer', backgroundColor: '#f0faf5' }}
              >
                <i className="fa-solid fa-cloud-arrow-up fa-lg mb-1 text-success"></i>
                <span className="text-success small fw-bold">Tải thêm ảnh</span>
                <span className="text-muted" style={{ fontSize: '11px' }}>PNG, JPG — tối đa 2MB/ảnh</span>
                <input type="file" multiple accept="image/*" className="d-none" onChange={handleImageChange} />
              </label>

              {/* Preview ảnh */}
              <div className="d-flex flex-column gap-2">
                {images.length === 0 ? (
                    <p className="text-muted text-center small fst-italic">Chưa có ảnh bìa nào</p>
                ) : (
                    images.map((img, index) => (
                        <div
                            key={index}
                            className={`d-flex align-items-center justify-content-between p-2 rounded-2 border ${img.isPrimary === 1 ? 'border-success bg-light' : 'border-light-subtle'}`}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <img
                                src={img.imageUrl}
                                alt="preview"
                                style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '3px' }}
                            />
                            <div>
                              {img.isPrimary === 1
                                  ? <span className="badge bg-success" style={{ fontSize: '10px' }}>Ảnh bìa chính</span>
                                  : <span className="text-muted" style={{ fontSize: '11px' }}>Ảnh phụ</span>
                              }
                            </div>
                          </div>
                          <div className="d-flex gap-1">
                            {img.isPrimary !== 1 && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => setPrimaryImage(index)}
                                    title="Đặt làm ảnh bìa chính"
                                >
                                  <i className="fa-solid fa-star" style={{ fontSize: '11px' }}></i>
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveImage(index)}
                                title="Xóa ảnh"
                            >
                              <i className="fa-solid fa-trash" style={{ fontSize: '11px' }}></i>
                            </button>
                          </div>
                        </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminEditProduct;