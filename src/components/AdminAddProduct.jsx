import React, { useState } from 'react';

const AdminAddProduct = ({ setActiveTab }) => {
  const [loading, setLoading] = useState(false);
  
  // State lưu thông tin text của Form
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    color: '',
    description: '',
    material: '',
    price: '',
    stockQuantity: '',
    categoryId: 1, // Mặc định tạm là 1
    status: 1,
    weight: ''
  });

  // State lưu danh sách ảnh (bao gồm base64 string và cờ isPrimary)
  const [images, setImages] = useState([]);

  // Xử lý thay đổi input text
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý upload và convert ảnh sang Base64
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64String = reader.result;
        setImages(prev => {
          // Nếu là ảnh đầu tiên được tải lên, tự động set làm ảnh chính
          const isFirstImage = prev.length === 0;
          return [...prev, { imageUrl: base64String, isPrimary: isFirstImage ? 1 : 0 }];
        });
      };
    });
  };

  // Set ảnh chính
  const setPrimaryImage = (index) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index ? 1 : 0
    }));
    setImages(updatedImages);
  };

  // Xóa ảnh khỏi danh sách
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    // Nếu xóa mất ảnh chính, tự động lấy ảnh đầu tiên làm ảnh chính
    if (images[index].isPrimary === 1 && newImages.length > 0) {
      newImages[0].isPrimary = 1;
    }
    setImages(newImages);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Vui lòng tải lên ít nhất 1 hình ảnh!");
      return;
    }

    setLoading(true);

    // Ghép formData và images thành 1 payload (DTO)
    const payload = {
      name: formData.name,
      brand: formData.brand,
      color: formData.color,
      description: formData.description,
      material: formData.material,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      categoryId: parseInt(formData.categoryId),
      status: parseInt(formData.status),
      weight: parseFloat(formData.weight),
      images: images // Đã có dạng [{imageUrl: "base64...", isPrimary: 1}]
    };

    try {
      const response = await fetch('http://localhost:8080/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Thêm sản phẩm thành công!");
        // Trở về tab Danh sách sản phẩm (Component AdminProduct sẽ tự động reload API để hiển thị sản phẩm mới lên đầu)
        setActiveTab('products'); 
      } else {
        const err = await response.text();
        alert("Lỗi: " + err);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Lỗi kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-content p-4 w-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-light shadow-sm border" 
            onClick={() => setActiveTab('products')}
            title="Quay lại"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>Thêm Sản Phẩm Mới</h4>
            <small className="text-muted">Nhập thông tin và hình ảnh cho sản phẩm</small>
          </div>
        </div>
        <button 
          className="btn text-white fw-bold px-4 py-2" 
          style={{ backgroundColor: '#00583b', borderRadius: '8px' }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
        </button>
      </div>

      <div className="row g-4">
        {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
        <div className="col-lg-8">
          <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Thông tin chung</h6>
            
            <div className="mb-3">
              <label className="form-label fw-semibold">Tên sản phẩm <span className="text-danger">*</span></label>
              <input type="text" className="form-control bg-light" name="name" value={formData.name} onChange={handleInputChange} required placeholder="VD: Sách toán, vật lý..." />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Thương hiệu</label>
                <input type="text" className="form-control bg-light" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="VD: Vina Book..." />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Danh mục (Category ID)</label>
                <input type="number" className="form-control bg-light" name="categoryId" value={formData.categoryId} onChange={handleInputChange} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Mô tả sản phẩm</label>
              <textarea className="form-control bg-light" name="description" rows="4" value={formData.description} onChange={handleInputChange} placeholder="Nhập chi tiết mô tả..."></textarea>
            </div>
          </div>

          {/* THÔNG TIN CHI TIẾT */}
          <div className="bg-white p-4 rounded-3 shadow-sm">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Thuộc tính chi tiết</h6>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Chất liệu</label>
                <input type="text" className="form-control bg-light" name="material" value={formData.material} onChange={handleInputChange} placeholder="VD: Giấy loại 1, 2..." />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Màu sắc</label>
                <input type="text" className="form-control bg-light" name="color" value={formData.color} onChange={handleInputChange} placeholder="VD: Xanh lam" />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Khối lượng (kg)</label>
                <input type="number" step="0.1" className="form-control bg-light" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="0.0" />
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: GIÁ, TỒN KHO & HÌNH ẢNH */}
        <div className="col-lg-4">
          <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Giá & Tồn kho</h6>
            <div className="mb-3">
              <label className="form-label fw-semibold">Giá bán (VNĐ) <span className="text-danger">*</span></label>
              <input type="number" className="form-control bg-light text-danger fw-bold" name="price" value={formData.price} onChange={handleInputChange} required placeholder="0" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Số lượng tồn kho <span className="text-danger">*</span></label>
              <input type="number" className="form-control bg-light" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} required placeholder="0" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Trạng thái</label>
              <select className="form-select bg-light" name="status" value={formData.status} onChange={handleInputChange}>
                <option value={1}>Đang bán (Active)</option>
                <option value={0}>Ẩn (Inactive)</option>
              </select>
            </div>
          </div>

          {/* QUẢN LÝ HÌNH ẢNH */}
          <div className="bg-white p-4 rounded-3 shadow-sm">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Hình ảnh sản phẩm</h6>
            
            {/* Nút upload file */}
            <div className="mb-3">
              <label className="btn btn-outline-success w-100 border-dashed py-3" style={{ borderStyle: 'dashed' }}>
                <i className="fa-solid fa-cloud-arrow-up fs-4 mb-2 d-block"></i>
                <span className="fw-bold">Click để tải ảnh lên</span>
                <input type="file" multiple accept="image/*" className="d-none" onChange={handleImageUpload} />
              </label>
            </div>

            {/* Hiển thị danh sách ảnh preview */}
            <div className="d-flex flex-column gap-2">
              {images.map((img, index) => (
                <div key={index} className={`d-flex align-items-center justify-content-between p-2 border rounded ${img.isPrimary === 1 ? 'border-success bg-light' : ''}`}>
                  <div className="d-flex align-items-center gap-2">
                    <img src={img.imageUrl} alt="preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    {img.isPrimary === 1 && <span className="badge bg-success" style={{ fontSize: '10px' }}>Ảnh chính</span>}
                  </div>
                  
                  <div className="d-flex gap-1">
                    {img.isPrimary === 0 && (
                      <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setPrimaryImage(index)} title="Đặt làm ảnh chính">
                        <i className="fa-solid fa-star"></i>
                      </button>
                    )}
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeImage(index)} title="Xóa ảnh">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAddProduct;