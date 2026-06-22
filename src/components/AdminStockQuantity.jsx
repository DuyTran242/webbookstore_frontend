import React, { useState, useEffect, useCallback } from 'react';

const AdminStockQuantity = () => {
    const [stocks, setStocks] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [stockStatus, setStockStatus] = useState('all');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [summary, setSummary] = useState({
        totalProducts: 0, totalQuantity: 0, lowStock: 0, outOfStock: 0
    });

    // Modal nhập kho
    const [showImportModal, setShowImportModal] = useState(false);
    const [importProduct, setImportProduct] = useState(null);
    const [importQuantity, setImportQuantity] = useState('');
    const [importPrice, setImportPrice] = useState('');
    const [supplier, setSupplier] = useState('');
    const [importNote, setImportNote] = useState('');
    const [transactionType, setTransactionType] = useState('import');
    const [importLoading, setImportLoading] = useState(false);

    const pageSize = 10;

    // Load danh mục
    useEffect(() => {
        fetch('http://localhost:8080/api/categories')
            .then(res => res.json())
            .then(data => {
                if (data._embedded && data._embedded.categories) {
                    setCategories(data._embedded.categories);
                } else if (Array.isArray(data)) {
                    setCategories(data);
                }
            })
            .catch(err => console.error("Lỗi tải danh mục:", err));
    }, []);

    // Load summary
    const fetchSummary = useCallback(() => {
        fetch('http://localhost:8080/api/admin/stock/summary')
            .then(res => res.json())
            .then(data => setSummary(data))
            .catch(err => console.error("Lỗi tải thống kê:", err));
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    // Load stocks
    const fetchStocks = useCallback(async (page = 0) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (keyword.trim()) params.append('keyword', keyword.trim());
            if (categoryId) params.append('categoryId', categoryId);
            if (stockStatus && stockStatus !== 'all') params.append('stockStatus', stockStatus);
            params.append('page', page);
            params.append('size', pageSize);

            const response = await fetch(`http://localhost:8080/api/admin/stock?${params.toString()}`);
            const data = await response.json();
            setStocks(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
            setCurrentPage(data.number);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu tồn kho:", error);
        } finally {
            setIsLoading(false);
        }
    }, [keyword, categoryId, stockStatus]);

    useEffect(() => {
        fetchStocks(0);
    }, [fetchStocks]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchStocks(0);
    };

    // Hàm tiện ích hiển thị ảnh
    const renderImage = (imgSrc) => {
        if (!imgSrc) return "https://via.placeholder.com/50?text=No+Image";
        if (imgSrc.startsWith("http")) return imgSrc;
        if (!imgSrc.startsWith("data:image")) return `data:image/jpeg;base64,${imgSrc}`;
        return imgSrc;
    };

    // Trạng thái tồn kho
    const getStockStatus = (quantity) => {
        if (quantity === 0) return (
            <span className="badge d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#fce8e6', color: '#c5221f', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                <i className="fa-solid fa-circle-xmark" style={{ fontSize: '10px' }}></i> Hết hàng
            </span>
        );
        if (quantity <= 10) return (
            <span className="badge d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#fef7e0', color: '#ea8600', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '10px' }}></i> Sắp hết
            </span>
        );
        return (
            <span className="badge d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#e6f4ea', color: '#137333', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: '10px' }}></i> Còn hàng
            </span>
        );
    };

    // Nhập kho
    const openImportModal = (item) => {
        setImportProduct(item);
        setImportQuantity('');
        setImportPrice(item.importPrice || '');
        setSupplier(item.supplier || '');
        setImportNote('');
        setTransactionType('import');
        setShowImportModal(true);
    };

    const handleImportStock = async () => {
        if (!importQuantity || parseInt(importQuantity) <= 0) {
            alert('Vui lòng nhập số lượng hợp lệ!');
            return;
        }
        setImportLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/admin/stock/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: importProduct.id,
                    quantity: parseInt(importQuantity),
                    type: transactionType,
                    note: importNote || (transactionType === 'import' ? 'Nhập kho từ admin' : 'Xuất kho từ admin'),
                    importPrice: importPrice ? parseFloat(importPrice) : null,
                    supplier: supplier || null
                })
            });
            if (res.ok) {
                setShowImportModal(false);
                fetchStocks(currentPage);
                fetchSummary();
            } else {
                const err = await res.json();
                alert(err.error || 'Nhập kho thất bại!');
            }
        } catch (error) {
            alert('Lỗi kết nối server!');
        } finally {
            setImportLoading(false);
        }
    };

    // Phân trang
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    return (
        <div className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
            {/* Tiêu đề */}
            <div className="mb-4">
                <h4 className="fw-bold m-0" style={{ color: '#1a1a2e', fontSize: '22px' }}>Quản lý Tồn kho</h4>
                <p className="text-muted m-0" style={{ fontSize: '13px' }}>Theo dõi và cập nhật số lượng hàng hóa trong kho</p>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                {/* Card 1 - Tổng đầu sách */}
                <div className="col-md-3">
                    <div className="bg-white rounded-3 p-3 d-flex align-items-center gap-3 h-100" style={{ border: '1px solid #e8eaed', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '48px', height: '48px', backgroundColor: '#e8f0fe', flexShrink: 0 }}>
                            <i className="fa-solid fa-book" style={{ color: '#1967d2', fontSize: '18px' }}></i>
                        </div>
                        <div>
                            <h3 className="fw-bold m-0" style={{ color: '#1967d2', fontSize: '26px', lineHeight: 1 }}>{summary.totalProducts}</h3>
                            <small className="text-muted" style={{ fontSize: '12px' }}>Tổng đầu sách</small>
                        </div>
                    </div>
                </div>

                {/* Card 2 - Tổng tồn kho */}
                <div className="col-md-3">
                    <div className="bg-white rounded-3 p-3 d-flex align-items-center gap-3 h-100" style={{ border: '1px solid #e8eaed', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '48px', height: '48px', backgroundColor: '#e6f4ea', flexShrink: 0 }}>
                            <i className="fa-solid fa-warehouse" style={{ color: '#137333', fontSize: '18px' }}></i>
                        </div>
                        <div>
                            <h3 className="fw-bold m-0" style={{ color: '#137333', fontSize: '26px', lineHeight: 1 }}>
                                {summary.totalQuantity?.toLocaleString()}
                            </h3>
                            <small className="text-muted" style={{ fontSize: '12px' }}>Tổng tồn kho</small>
                        </div>
                    </div>
                </div>

                {/* Card 3 - Sắp hết hàng */}
                <div className="col-md-3">
                    <div className="bg-white rounded-3 p-3 d-flex align-items-center gap-3 h-100" style={{ border: '1px solid #e8eaed', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '48px', height: '48px', backgroundColor: '#fef7e0', flexShrink: 0 }}>
                            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ea8600', fontSize: '18px' }}></i>
                        </div>
                        <div>
                            <h3 className="fw-bold m-0" style={{ color: '#ea8600', fontSize: '26px', lineHeight: 1 }}>{summary.lowStock}</h3>
                            <small className="text-muted" style={{ fontSize: '12px' }}>Sắp hết hàng</small>
                        </div>
                    </div>
                </div>

                {/* Card 4 - Hết hàng */}
                <div className="col-md-3">
                    <div className="bg-white rounded-3 p-3 d-flex align-items-center gap-3 h-100" style={{ border: '1px solid #e8eaed', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '48px', height: '48px', backgroundColor: '#fce8e6', flexShrink: 0 }}>
                            <i className="fa-solid fa-ban" style={{ color: '#c5221f', fontSize: '18px' }}></i>
                        </div>
                        <div>
                            <h3 className="fw-bold m-0" style={{ color: '#c5221f', fontSize: '26px', lineHeight: 1 }}>{summary.outOfStock}</h3>
                            <small className="text-muted" style={{ fontSize: '12px' }}>Hết hàng</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="bg-white rounded-3 p-3 mb-4 d-flex align-items-center gap-3 flex-wrap" style={{ border: '1px solid #e8eaed', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {/* Search */}
                <form onSubmit={handleSearch} className="d-flex" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm tên sản phẩm hoặc thương hiệu..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            style={{ border: '1px solid #dadce0', fontSize: '13px', padding: '8px 14px' }}
                        />
                        <button className="btn" type="submit" style={{ backgroundColor: '#00583b', color: '#fff', border: 'none', padding: '8px 14px' }}>
                            <i className="fa-solid fa-search"></i>
                        </button>
                    </div>
                </form>

                {/* Lọc trạng thái */}
                <select
                    className="form-select"
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                    style={{ width: '200px', border: '1px solid #dadce0', fontSize: '13px', padding: '8px 14px', cursor: 'pointer' }}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="ok">Còn hàng</option>
                    <option value="low">Sắp hết hàng</option>
                    <option value="out">Hết hàng</option>
                </select>

                {/* Lọc danh mục */}
                <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={{ width: '200px', border: '1px solid #dadce0', fontSize: '13px', padding: '8px 14px', cursor: 'pointer' }}
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-white rounded-3 overflow-hidden" style={{ border: '1px solid #e8eaed', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="table-responsive">
                    {isLoading ? (
                        <div className="text-center p-5 text-muted">
                            <div className="spinner-border text-success mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="m-0" style={{ fontSize: '13px' }}>Đang tải dữ liệu tồn kho...</p>
                        </div>
                    ) : (
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e8eaed' }}>
                                    <th className="py-3 px-3 text-muted fw-semibold" style={{ fontSize: '12px', letterSpacing: '0.3px', width: '80px' }}>Hình ảnh</th>
                                    <th className="py-3 px-3 text-muted fw-semibold" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>Tên sản phẩm</th>
                                    <th className="py-3 px-3 text-muted fw-semibold" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>Thương hiệu</th>
                                    <th className="py-3 px-3 text-muted fw-semibold" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>Danh mục</th>
                                    <th className="py-3 px-3 text-muted fw-semibold text-end" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>Giá bán</th>
                                    <th className="py-3 px-3 text-muted fw-semibold text-center" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>Tồn kho</th>
                                    <th className="py-3 px-3 text-muted fw-semibold text-center" style={{ fontSize: '12px', letterSpacing: '0.3px' }}>Trạng thái</th>
                                    <th className="py-3 px-3 text-muted fw-semibold text-center" style={{ fontSize: '12px', letterSpacing: '0.3px', width: '120px' }}>Nhập kho</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.length > 0 ? (
                                    stocks.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td className="py-2 px-3">
                                                <img
                                                    src={renderImage(item.primaryImage)}
                                                    alt={item.name}
                                                    className="rounded"
                                                    style={{ width: '44px', height: '56px', objectFit: 'cover', border: '1px solid #e8eaed' }}
                                                />
                                            </td>
                                            <td className="py-2 px-3">
                                                <div className="fw-medium text-dark" style={{ fontSize: '13px', maxWidth: '200px' }}>
                                                    {item.name}
                                                </div>
                                                <small className="text-muted" style={{ fontSize: '11px' }}>#{item.id}</small>
                                            </td>
                                            <td className="py-2 px-3 text-muted">{item.brand || '—'}</td>
                                            <td className="py-2 px-3">
                                                {item.categoryName ? (
                                                    <span className="badge" style={{ backgroundColor: '#f1f3f4', color: '#3c4043', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                                                        {item.categoryName}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="py-2 px-3 text-end" style={{ color: '#c5221f', fontWeight: '600' }}>
                                                {item.price ? `${item.price.toLocaleString()} ₫` : '—'}
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                <span className="fw-bold" style={{
                                                    fontSize: '18px',
                                                    color: item.stockQuantity === 0 ? '#c5221f' : item.stockQuantity <= 10 ? '#ea8600' : '#137333'
                                                }}>
                                                    {item.stockQuantity}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                {getStockStatus(item.stockQuantity)}
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                <button
                                                    className="btn btn-sm d-inline-flex align-items-center gap-1"
                                                    onClick={() => openImportModal(item)}
                                                    style={{
                                                        backgroundColor: '#00583b',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '6px 14px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.backgroundColor = '#004730'}
                                                    onMouseOut={(e) => e.target.style.backgroundColor = '#00583b'}
                                                >
                                                    <i className="fa-solid fa-plus" style={{ fontSize: '10px' }}></i> Cập nhật
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center p-5 text-muted">
                                            <i className="fa-solid fa-box-open fs-1 mb-3 d-block" style={{ color: '#dadce0' }}></i>
                                            <p className="m-0" style={{ fontSize: '14px' }}>Không tìm thấy sản phẩm nào.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer phân trang */}
                {!isLoading && stocks.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center px-3 py-3" style={{ borderTop: '1px solid #e8eaed' }}>
                        <small className="text-muted" style={{ fontSize: '12px' }}>
                            Trang {currentPage + 1} / {totalPages} — {startItem}–{endItem} / {totalElements} sách
                        </small>
                        <div className="d-flex align-items-center gap-1">
                            <button
                                className="btn btn-sm d-flex align-items-center justify-content-center"
                                disabled={currentPage === 0}
                                onClick={() => fetchStocks(currentPage - 1)}
                                style={{
                                    width: '32px', height: '32px', border: '1px solid #dadce0', borderRadius: '6px',
                                    backgroundColor: currentPage === 0 ? '#f8f9fa' : '#fff',
                                    color: currentPage === 0 ? '#bdc1c6' : '#3c4043'
                                }}
                            >
                                <i className="fa-solid fa-chevron-left" style={{ fontSize: '11px' }}></i>
                            </button>
                            {[...Array(totalPages)].map((_, idx) => {
                                // Chỉ hiển thị tối đa 5 nút trang xung quanh trang hiện tại
                                if (totalPages <= 7 || idx === 0 || idx === totalPages - 1 || Math.abs(idx - currentPage) <= 1) {
                                    return (
                                        <button
                                            key={idx}
                                            className="btn btn-sm d-flex align-items-center justify-content-center"
                                            onClick={() => fetchStocks(idx)}
                                            style={{
                                                width: '32px', height: '32px',
                                                borderRadius: '6px',
                                                border: currentPage === idx ? 'none' : '1px solid #dadce0',
                                                backgroundColor: currentPage === idx ? '#00583b' : '#fff',
                                                color: currentPage === idx ? '#fff' : '#3c4043',
                                                fontWeight: currentPage === idx ? '600' : '400',
                                                fontSize: '13px'
                                            }}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                } else if (idx === 1 && currentPage > 3) {
                                    return <span key={idx} className="px-1 text-muted" style={{ fontSize: '12px' }}>...</span>;
                                } else if (idx === totalPages - 2 && currentPage < totalPages - 4) {
                                    return <span key={idx} className="px-1 text-muted" style={{ fontSize: '12px' }}>...</span>;
                                }
                                return null;
                            })}
                            <button
                                className="btn btn-sm d-flex align-items-center justify-content-center"
                                disabled={currentPage === totalPages - 1}
                                onClick={() => fetchStocks(currentPage + 1)}
                                style={{
                                    width: '32px', height: '32px', border: '1px solid #dadce0', borderRadius: '6px',
                                    backgroundColor: currentPage === totalPages - 1 ? '#f8f9fa' : '#fff',
                                    color: currentPage === totalPages - 1 ? '#bdc1c6' : '#3c4043'
                                }}
                            >
                                <i className="fa-solid fa-chevron-right" style={{ fontSize: '11px' }}></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Nhập Kho */}
            {showImportModal && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
                    onClick={() => setShowImportModal(false)}
                >
                    <div
                        className="bg-white rounded-3 p-0 overflow-hidden"
                        style={{ width: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#00583b' }}>
                            <h6 className="m-0 text-white fw-bold d-flex align-items-center gap-2" style={{ fontSize: '15px' }}>
                                <i className="fa-solid fa-box-open"></i> Cập nhật tồn kho
                            </h6>
                            <button
                                className="btn btn-sm text-white p-0"
                                onClick={() => setShowImportModal(false)}
                                style={{ fontSize: '18px', lineHeight: 1, opacity: 0.8 }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4">
                            {/* Thông tin sản phẩm */}
                            <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e8eaed' }}>
                                <img
                                    src={renderImage(importProduct?.primaryImage)}
                                    alt={importProduct?.name}
                                    className="rounded"
                                    style={{ width: '50px', height: '64px', objectFit: 'cover', border: '1px solid #e8eaed' }}
                                />
                                <div>
                                    <div className="fw-medium text-dark" style={{ fontSize: '14px' }}>{importProduct?.name}</div>
                                    <small className="text-muted" style={{ fontSize: '12px' }}>
                                        Tồn kho hiện tại: <strong style={{ color: '#137333' }}>{importProduct?.stockQuantity}</strong>
                                    </small>
                                </div>
                            </div>

                            {/* Loại giao dịch */}
                            <div className="mb-4 d-flex gap-3">
                                <label className="form-label fw-medium me-2" style={{ fontSize: '13px', color: '#3c4043' }}>Loại giao dịch:</label>
                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="transactionType" id="typeImport" value="import" checked={transactionType === 'import'} onChange={(e) => setTransactionType(e.target.value)} />
                                    <label className="form-check-label" htmlFor="typeImport" style={{ fontSize: '13px' }}>Nhập thêm (Cộng kho)</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="transactionType" id="typeExport" value="export" checked={transactionType === 'export'} onChange={(e) => setTransactionType(e.target.value)} />
                                    <label className="form-check-label" htmlFor="typeExport" style={{ fontSize: '13px' }}>Xuất/Giảm kho (Trừ kho)</label>
                                </div>
                            </div>

                            {/* Input */}
                            <div className="row mb-3">
                                <div className={transactionType === 'import' ? 'col-md-6' : 'col-md-12'}>
                                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#3c4043' }}>
                                        {transactionType === 'import' ? 'Số lượng nhập thêm' : 'Số lượng xuất/giảm'} <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={importQuantity}
                                        onChange={(e) => setImportQuantity(e.target.value)}
                                        min="1"
                                        placeholder="VD: 50"
                                        autoFocus
                                        style={{ fontSize: '14px', padding: '10px 14px', border: '1px solid #dadce0' }}
                                    />
                                    {importQuantity && parseInt(importQuantity) > 0 && (
                                        <small className="text-muted mt-1 d-block" style={{ fontSize: '12px' }}>
                                            Sau khi {transactionType === 'import' ? 'nhập' : 'giảm'}: <strong style={{ color: transactionType === 'import' ? '#1967d2' : '#c5221f' }}>
                                                {transactionType === 'import' ? ((importProduct?.stockQuantity || 0) + parseInt(importQuantity)) : Math.max(0, (importProduct?.stockQuantity || 0) - parseInt(importQuantity))} quyển
                                            </strong>
                                        </small>
                                    )}
                                </div>
                                {transactionType === 'import' && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#3c4043' }}>
                                            Giá nhập (VNĐ)
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={importPrice}
                                            onChange={(e) => setImportPrice(e.target.value)}
                                            min="0"
                                            placeholder="VD: 50000"
                                            style={{ fontSize: '14px', padding: '10px 14px', border: '1px solid #dadce0' }}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            {transactionType === 'import' && (
                                <div className="mb-3">
                                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#3c4043' }}>
                                        Nhà cung cấp
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={supplier}
                                        onChange={(e) => setSupplier(e.target.value)}
                                        placeholder="Tên nhà cung cấp"
                                        style={{ fontSize: '14px', padding: '10px 14px', border: '1px solid #dadce0' }}
                                    />
                                </div>
                            )}

                            {transactionType === 'export' ? (
                                <div className="mb-4">
                                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#3c4043' }}>
                                        Lý do giảm kho
                                    </label>
                                    <select
                                        className="form-select"
                                        value={importNote}
                                        onChange={(e) => setImportNote(e.target.value)}
                                        style={{ fontSize: '14px', padding: '10px 14px', border: '1px solid #dadce0' }}
                                    >
                                        <option value="">Chọn lý do...</option>
                                        <option value="Xuất bán lẻ">Xuất bán lẻ</option>
                                        <option value="Hàng lỗi/Hỏng">Hàng lỗi/Hỏng</option>
                                        <option value="Chênh lệch khi kiểm kê">Chênh lệch khi kiểm kê</option>
                                        <option value="Trả hàng cho NCC">Trả hàng cho NCC</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#3c4043' }}>
                                        Ghi chú
                                    </label>
                                    <textarea
                                        className="form-control"
                                        value={importNote}
                                        onChange={(e) => setImportNote(e.target.value)}
                                        placeholder="Ghi chú thêm (tùy chọn)"
                                        rows="2"
                                        style={{ fontSize: '14px', padding: '10px 14px', border: '1px solid #dadce0' }}
                                    ></textarea>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="d-flex gap-2 justify-content-end">
                                <button
                                    className="btn"
                                    onClick={() => setShowImportModal(false)}
                                    style={{ padding: '8px 20px', fontSize: '13px', border: '1px solid #dadce0', backgroundColor: '#fff', color: '#3c4043', borderRadius: '6px' }}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn"
                                    onClick={handleImportStock}
                                    disabled={importLoading || !importQuantity || parseInt(importQuantity) <= 0}
                                    style={{
                                        padding: '8px 20px', fontSize: '13px', border: 'none',
                                        backgroundColor: '#00583b', color: '#fff', borderRadius: '6px',
                                        opacity: (importLoading || !importQuantity || parseInt(importQuantity) <= 0) ? 0.6 : 1
                                    }}
                                >
                                    {importLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check me-1"></i> Xác nhận nhập
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStockQuantity;