import React, { useState, useEffect } from 'react';

const AdminBrand = () => {
    // 6 Thương hiệu theo yêu cầu
    const brands = ['Samsung', 'LG', 'Sony', 'Panasonic', 'Electrolux', 'Daikin'];
    
    const [activeBrand, setActiveBrand] = useState(brands[0]); // Mặc định là Samsung
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch dữ liệu theo brand hiện tại
    const fetchProductsByBrand = async (brand, page = 0) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/admin/brands/${brand}/products?page=${page}&size=5`);
            const data = await response.json();
            setProducts(data.content);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm theo thương hiệu:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Khi tab thay đổi thì load trang đầu tiên (0)
    useEffect(() => {
        fetchProductsByBrand(activeBrand, 0);
    }, [activeBrand]);

    const handleTabClick = (brand) => {
        setActiveBrand(brand);
    };

    // Xử lý hiển thị ảnh
    const renderImage = (imgSrc) => {
        if (!imgSrc) return "https://via.placeholder.com/60?text=No+Image";
        if (imgSrc.startsWith("http")) return imgSrc;
        if (!imgSrc.startsWith("data:image")) return `data:image/jpeg;base64,${imgSrc}`;
        return imgSrc;
    };

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark m-0">
                    <i className="fa-solid fa-tags text-primary me-2"></i>
                    Thương Hiệu Sản Phẩm
                </h2>
            </div>

            {/* Nav Tabs for Brands */}
            <ul className="nav nav-tabs mb-4 border-bottom">
                {brands.map((brand) => (
                    <li className="nav-item cursor-pointer" key={brand} onClick={() => handleTabClick(brand)} style={{ cursor: 'pointer' }}>
                        <button className={`nav-link fw-semibold ${activeBrand === brand ? 'active text-primary' : 'text-secondary border-transparent'}`}>
                            {brand}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Content Container */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <h5 className="m-0 fw-bold text-secondary">
                        Sản phẩm thuộc hãng: <span className="text-primary">{activeBrand}</span>
                    </h5>
                    <span className="badge bg-primary rounded-pill">Trang {currentPage + 1} / {totalPages === 0 ? 1 : totalPages}</span>
                </div>
                
                <div className="card-body p-0 table-responsive min-vh-50">
                    {isLoading ? (
                        <div className="text-center p-5 text-muted">
                            <i className="fa-solid fa-spinner fa-spin fs-2 mb-3"></i>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <table className="table table-hover align-middle mb-0 text-center">
                            <thead className="table-light text-secondary">
                                <tr>
                                    <th className="py-3">Hình ảnh</th>
                                    <th className="py-3 text-start">Tên sản phẩm</th>
                                    <th className="py-3">Danh mục</th>
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
                                                    className="rounded border shadow-sm"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                                                />
                                            </td>
                                            <td className="text-start fw-medium text-dark">{prod.name}</td>
                                            <td><span className="badge bg-secondary">{prod.categoryName || 'Không có'}</span></td>
                                            <td className="text-success fw-bold">
                                                {prod.price?.toLocaleString('vi-VN')} đ
                                            </td>
                                            <td>
                                                <span className={`badge ${prod.stockQuantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                    {prod.stockQuantity > 0 ? `${prod.stockQuantity} SP` : 'Hết hàng'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-5 text-muted">
                                            <i className="fa-solid fa-box-open fs-2 mb-3 d-block"></i>
                                            Chưa có sản phẩm nào thuộc hãng {activeBrand}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && !isLoading && (
                    <div className="card-footer bg-white d-flex justify-content-end py-3">
                        <ul className="pagination pagination-sm m-0 shadow-sm">
                            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => fetchProductsByBrand(activeBrand, currentPage - 1)}>
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, idx) => (
                                <li key={idx} className={`page-item ${currentPage === idx ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => fetchProductsByBrand(activeBrand, idx)}>
                                        {idx + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => fetchProductsByBrand(activeBrand, currentPage + 1)}>
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBrand;