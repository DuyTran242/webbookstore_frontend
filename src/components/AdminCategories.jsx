import React, { useState, useEffect } from 'react';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [products, setProducts] = useState([]);
    
    // Phân trang
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Fetch Categories
    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/categories');
            const data = await response.json();
            setCategories(data);
            if (data.length > 0 && !activeCategoryId) {
                setActiveCategoryId(data[0].id); // Mặc định chọn tab đầu tiên
            }
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };

    // Fetch Products by Category & Page
    const fetchProducts = async (categoryId, page = 0) => {
        if (!categoryId) return;
        try {
            const response = await fetch(`http://localhost:8080/api/admin/categories/${categoryId}/products?page=${page}&size=5`);
            const data = await response.json();
            setProducts(data.content);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (activeCategoryId) {
            fetchProducts(activeCategoryId, 0);
        }
    }, [activeCategoryId]);

    // Thêm danh mục
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            const response = await fetch('http://localhost:8080/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });
            if (response.ok) {
                setNewCategoryName('');
                setIsAddModalOpen(false);
                fetchCategories(); // Làm mới danh sách tab
                alert("Thêm danh mục thành công!");
            }
        } catch (error) {
            console.error("Lỗi khi thêm danh mục:", error);
        }
    };

    // Xóa danh mục
    const handleDeleteCategory = async () => {
        if (!activeCategoryId) return;
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa danh mục này?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:8080/api/admin/categories/${activeCategoryId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                setActiveCategoryId(null); // Reset để chọn lại tab đầu
                fetchCategories();
            } else {
                alert(result.error); // Thông báo lỗi (VD: Còn sản phẩm)
            }
        } catch (error) {
            console.error("Lỗi khi xóa danh mục:", error);
        }
    };

    // Chuyển tab
    const handleTabClick = (id) => {
        setActiveCategoryId(id);
        setCurrentPage(0);
    };

    // Xử lý hiển thị ảnh (nếu là chuỗi Base64 hoặc URL)
    const renderImage = (imgSrc) => {
        if (!imgSrc) return "https://via.placeholder.com/60";
        if (imgSrc.startsWith("http")) return imgSrc;
        if (!imgSrc.startsWith("data:image")) return `data:image/jpeg;base64,${imgSrc}`;
        return imgSrc;
    };

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark m-0">
                    <i className="fa-solid fa-layer-group text-primary me-2"></i>
                    Danh Mục Sản Phẩm
                </h2>
                <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary shadow-sm">
                    <i className="fa-solid fa-plus me-2"></i>Thêm Danh Mục
                </button>
            </div>

            {/* Dynamic Tabs */}
            <ul className="nav nav-tabs mb-4 border-bottom">
                {categories.map((cat) => (
                    <li className="nav-item cursor-pointer" key={cat.id} onClick={() => handleTabClick(cat.id)}>
                        <button className={`nav-link fw-semibold ${activeCategoryId === cat.id ? 'active text-primary' : 'text-secondary border-transparent'}`}>
                            {cat.name}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Content Container */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <h5 className="m-0 fw-bold text-secondary">
                        Sản phẩm thuộc: {categories.find(c => c.id === activeCategoryId)?.name || ''}
                    </h5>
                    <button onClick={handleDeleteCategory} className="btn btn-sm btn-outline-danger">
                        <i className="fa-solid fa-trash me-1"></i> Xóa danh mục này
                    </button>
                </div>
                
                <div className="card-body p-0 table-responsive">
                    <table className="table table-hover align-middle mb-0 text-center">
                        <thead className="table-light text-secondary">
                            <tr>
                                <th className="py-3">Hình ảnh</th>
                                <th className="py-3 text-start">Tên sản phẩm</th>
                                <th className="py-3">Thương hiệu</th>
                                <th className="py-3">Giá tiền</th>
                                <th className="py-3">Tồn kho</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map((prod) => (
                                    <tr key={prod.id}>
                                        <td>
                                            <img 
                                                src={renderImage(prod.primaryImage)} 
                                                alt={prod.name} 
                                                className="rounded border"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                                            />
                                        </td>
                                        <td className="text-start fw-medium">{prod.name}</td>
                                        <td><span className="badge bg-info text-dark">{prod.brand || 'N/A'}</span></td>
                                        <td className="text-success fw-bold">
                                            {prod.price?.toLocaleString('vi-VN')} đ
                                        </td>
                                        <td>{prod.stockQuantity}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-5 text-muted">
                                        <i className="fa-solid fa-box-open fs-2 mb-3 d-block"></i>
                                        Chưa có sản phẩm nào thuộc danh mục này.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="card-footer bg-white d-flex justify-content-end py-3">
                        <ul className="pagination pagination-sm m-0">
                            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => fetchProducts(activeCategoryId, currentPage - 1)}>
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, idx) => (
                                <li key={idx} className={`page-item ${currentPage === idx ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => fetchProducts(activeCategoryId, idx)}>
                                        {idx + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => fetchProducts(activeCategoryId, currentPage + 1)}>
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Modal Add Category */}
            {isAddModalOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">Thêm Danh Mục Mới</h5>
                                <button type="button" className="btn-close" onClick={() => setIsAddModalOpen(false)}></button>
                            </div>
                            <form onSubmit={handleAddCategory}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Tên danh mục <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Nhập tên (VD: Đèn trang trí...)" 
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Hủy</button>
                                    <button type="submit" className="btn btn-primary">Lưu Danh Mục</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;