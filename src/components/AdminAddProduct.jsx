import React, { useState, useEffect } from 'react';

const AdminAddProduct = ({ setActiveTab }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',       // Tác giả
    color: '',       // Ngôn ngữ
    description: '',
    material: '',    // Nhà xuất bản
    price: '',
    stockQuantity: '',
    categoryId: '',
    status: 1,
    weight: ''       // Khối lượng (gram)
  });

  const [images, setImages] = useState([]);

  // Lấy danh sách danh mục để chọn
  useEffect(() => {
    fetch('http://localhost:8080/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error('Lỗi lấy danh mục:', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Upload và convert ảnh sang Base64
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      // Kiểm tra kích thước file (tối đa 2MB mỗi ảnh)
      if (file.size > 2 * 1024 * 1024) {
        alert(`Ảnh "${file.name}" quá lớn (tối đa 2MB). Vui lòng chọn ảnh khác!`);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImages(prev => {
          const isFirst = prev.length === 0;
          return [...prev, { imageUrl: reader.result, isPrimary: isFirst ? 1 : 0 }];
        });
      };
    });
  };

  const setPrimaryImage = (index) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index ? 1 : 0 })));
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    if (images[index].isPrimary === 1 && newImages.length > 0) {
      newImages[0].isPrimary = 1;
    }
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) { alert('Vui lòng nhập tên sách!'); return; }
    if (!formData.price || parseFloat(formData.price) <= 0) { alert('Vui lòng nhập giá hợp lệ!'); return; }
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) { alert('Vui lòng nhập số lượng hợp lệ!'); return; }
    if (!formData.categoryId) { alert('Vui lòng chọn danh mục!'); return; }
    if (images.length === 0) { alert('Vui lòng tải lên ít nhất 1 hình ảnh bìa sách!'); return; }

    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),       // Tác giả
      color: formData.color.trim(),       // Ngôn ngữ
      description: formData.description.trim(),
      material: formData.material.trim(), // Nhà xuất bản
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      categoryId: parseInt(formData.categoryId),
      status: parseInt(formData.status),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      images: images
    };

    try {
      const response = await fetch('http://localhost:8080/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Thêm sách mới thành công!');
        setActiveTab('products');
      } else {
        const err = await response.text();
        alert('Lỗi: ' + err);
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      alert('Lỗi kết nối đến máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="admin-content p-4 w-100">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light shadow-sm border" onClick={() => setActiveTab('products')}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div>
              <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>Thêm Sách Mới</h4>
              <small className="text-muted">Nhập thông tin và hình ảnh bìa sách</small>
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
                : <><i className="fa-solid fa-floppy-disk me-2"></i>Lưu Sách</>
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
                    placeholder="VD: Đắc Nhân Tâm, Nhà Giả Kim..."
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
                    placeholder="Tóm tắt nội dung, đánh giá ngắn về cuốn sách..."
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Danh mục <span className="text-danger">*</span></label>
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
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Trạng thái</label>
                  <select className="form-select bg-light" name="status" value={formData.status} onChange={handleInputChange}>
                    <option value={1}>Đang bán</option>
                    <option value={0}>Ngừng bán</option>
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
                      placeholder="VD: Dale Carnegie, Paulo Coelho..."
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
                      placeholder="VD: NXB Trẻ, NXB Kim Đồng..."
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
                      placeholder="VD: Tiếng Việt, English..."
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
                <i className="fa-solid fa-cloud-arrow-up fa-2x mb-2 text-success"></i>
                <span className="fw-bold text-success small">Click để tải ảnh bìa lên</span>
                <span className="text-muted" style={{ fontSize: '11px' }}>PNG, JPG — tối đa 2MB/ảnh</span>
                <input type="file" multiple accept="image/*" className="d-none" onChange={handleImageUpload} />
              </label>

              {/* Preview ảnh */}
              <div className="d-flex flex-column gap-2">
                {images.map((img, index) => (
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
                            onClick={() => removeImage(index)}
                            title="Xóa ảnh"
                        >
                          <i className="fa-solid fa-trash" style={{ fontSize: '11px' }}></i>
                        </button>
                      </div>
                    </div>
                ))}
              </div>

              {images.length === 0 && (
                  <p className="text-muted text-center small mt-2 fst-italic">Chưa có ảnh nào được chọn</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminAddProduct;