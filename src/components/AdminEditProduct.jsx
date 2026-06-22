import React, { useState, useEffect } from 'react';

const AdminEditProduct = ({ setActiveTab, productId }) => {
  const [formData, setFormData] = useState({
    name: '', price: '', brand: '', color: '', description: '',
    material: '', stockQuantity: '', categoryId: '', weight: ''
  });
  const [images, setImages] = useState([]); // Lưu mảng hình ảnh (Base64)
  const [loading, setLoading] = useState(false);

  // Load dữ liệu sản phẩm khi component mount
  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      // CẬP NHẬT ĐƯỜNG DẪN API DÀNH CHO ADMIN
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
        setImages(data.images || []); // Backend trả về mảng ảnh { imageUrl, isPrimary }
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin sản phẩm:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý chọn thêm ảnh mới chuyển sang Base64
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, { imageUrl: reader.result, isPrimary: prev.length === 0 ? 1 : 0 }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const setPrimaryImage = (indexToPrimary) => {
    const newImages = images.map((img, index) => ({
      ...img,
      isPrimary: index === indexToPrimary ? 1 : 0
    }));
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const productPayload = {
      ...formData,
      images: images
    };

    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });

      if (response.ok) {
        alert("Cập nhật sản phẩm thành công!");
        setActiveTab('products'); // Quay lại danh sách
      } else {
        alert("Cập nhật thất bại. Vui lòng kiểm tra lại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>Chỉnh sửa Sản Phẩm #{productId}</h4>
        <button className="btn btn-secondary" onClick={() => setActiveTab('products')}>Quay lại</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Tên sản phẩm</label>
            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Giá (VNĐ)</label>
            <input type="number" className="form-control" name="price" value={formData.price} onChange={handleInputChange} required />
          </div>
        </div>

        <div className="row mb-3">
           <div className="col-md-3">
            <label className="form-label">Thương hiệu</label>
            <input type="text" className="form-control" name="brand" value={formData.brand} onChange={handleInputChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Màu sắc</label>
            <input type="text" className="form-control" name="color" value={formData.color} onChange={handleInputChange} />
          </div>
           <div className="col-md-3">
            <label className="form-label">Tồn kho</label>
            <input type="number" className="form-control bg-light" name="stockQuantity" value={formData.stockQuantity} readOnly disabled />
          </div>
          <div className="col-md-3">
            <label className="form-label">ID Danh mục</label>
            <input type="number" className="form-control" name="categoryId" value={formData.categoryId} onChange={handleInputChange} required />
          </div>
        </div>

        {/* BỔ SUNG ROW NÀY CHO CHẤT LIỆU VÀ TRỌNG LƯỢNG */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Chất liệu</label>
            <input type="text" className="form-control" name="material" value={formData.material} onChange={handleInputChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Trọng lượng (kg)</label>
            <input type="number" step="0.01" className="form-control" name="weight" value={formData.weight} onChange={handleInputChange} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Mô tả sản phẩm</label>
          <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">Hình ảnh sản phẩm</label>
          <input type="file" className="form-control mb-3" multiple accept="image/*" onChange={handleImageChange} />
          
          <div className="d-flex flex-wrap gap-3">
            {images.map((img, index) => (
              <div key={index} className="position-relative border p-1 rounded" style={{ width: '120px' }}>
                <img src={img.imageUrl} alt="preview" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" onClick={() => handleRemoveImage(index)}>X</button>
                <div className="text-center mt-1">
                  <input type="radio" name="primaryImage" checked={img.isPrimary === 1} onChange={() => setPrimaryImage(index)} /> Mặc định
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#e5533d' }} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
        </button>
      </form>
    </div>
  );
};

export default AdminEditProduct;