import React, { useState, useEffect } from 'react';

const AdminStockQuantity = () => {
    const [stocks, setStocks] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [keyword, setKeyword] = useState('');

    const fetchStocks = async (page = 0, searchKeyword = '') => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/admin/stock?keyword=${searchKeyword}&page=${page}&size=10`);
            const data = await response.json();
            setStocks(data.content);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu tồn kho:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks(0, keyword);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchStocks(0, keyword);
    };

    // Hàm tiện ích hiển thị ảnh
    const renderImage = (imgSrc) => {
        if (!imgSrc) return "https://via.placeholder.com/50?text=No+Image";
        if (imgSrc.startsWith("http")) return imgSrc;
        if (!imgSrc.startsWith("data:image")) return `data:image/jpeg;base64,${imgSrc}`;
        return imgSrc;
    };

    // Đánh giá tình trạng tồn kho
    const getStockStatus = (quantity) => {
        if (quantity === 0) return <span className="badge bg-danger p-2"><i className="fa-solid fa-circle-xmark me-1"></i> Hết hàng</span>;
        if (quantity <= 10) return <span className="badge bg-warning text-dark p-2"><i className="fa-solid fa-triangle-exclamation me-1"></i> Sắp hết</span>;
        return <span className="badge bg-success p-2"><i className="fa-solid fa-circle-check me-1"></i> Còn hàng</span>;
    };

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark m-0">
                    <i className="fa-solid fa-boxes-stacked text-primary me-2"></i>
                    Quản Lý Tồn Kho
                </h2>
                
                {/* Form Tìm kiếm */}
                <form onSubmit={handleSearch} className="d-flex w-25">
                    <div className="input-group">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Tìm tên sản phẩm..." 
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <button className="btn btn-primary" type="submit">
                            <i className="fa-solid fa-search"></i>
                        </button>
                    </div>
                </form>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h5 className="m-0 fw-bold text-secondary">Danh sách sản phẩm trong kho</h5>
                </div>
                
                <div className="card-body p-0 table-responsive min-vh-50">
                    {isLoading ? (
                        <div className="text-center p-5 text-muted">
                            <i className="fa-solid fa-spinner fa-spin fs-2 mb-3"></i>
                            <p>Đang tải dữ liệu tồn kho...</p>
                        </div>
                    ) : (
                        <table className="table table-hover align-middle mb-0 text-center">
                            <thead className="table-light text-secondary">
                                <tr>
                                    <th className="py-3">Mã SP</th>
                                    <th className="py-3">Hình ảnh</th>
                                    <th className="py-3 text-start">Tên sản phẩm</th>
                                    <th className="py-3">Thương hiệu</th>
                                    <th className="py-3">Số lượng tồn</th>
                                    <th className="py-3">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.length > 0 ? (
                                    stocks.map((item) => (
                                        <tr key={item.id}>
                                            <td className="fw-bold text-secondary">#{item.id}</td>
                                            <td>
                                                <img 
                                                    src={renderImage(item.primaryImage)} 
                                                    alt={item.name} 
                                                    className="rounded border shadow-sm"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                                />
                                            </td>
                                            <td className="text-start fw-medium text-dark">{item.name}</td>
                                            <td>{item.brand || 'N/A'}</td>
                                            <td>
                                                <span className={`fs-5 fw-bold ${item.stockQuantity === 0 ? 'text-danger' : item.stockQuantity <= 10 ? 'text-warning' : 'text-success'}`}>
                                                    {item.stockQuantity}
                                                </span>
                                            </td>
                                            <td>{getStockStatus(item.stockQuantity)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-5 text-muted">
                                            <i className="fa-solid fa-box-open fs-2 mb-3 d-block"></i>
                                            Không tìm thấy sản phẩm nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {/* Phân trang */}
                {totalPages > 1 && !isLoading && (
                    <div className="card-footer bg-white d-flex justify-content-end py-3">
                        <ul className="pagination pagination-sm m-0 shadow-sm">
                            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => fetchStocks(currentPage - 1, keyword)}>
                                    Trước
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, idx) => (
                                <li key={idx} className={`page-item ${currentPage === idx ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => fetchStocks(idx, keyword)}>
                                        {idx + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => fetchStocks(currentPage + 1, keyword)}>
                                    Sau
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminStockQuantity;