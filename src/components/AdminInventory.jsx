import React, { useState, useEffect, useCallback } from 'react';

// ── Hằng số màu sắc theo trạng thái ──────────────────────────────────────────
const STATUS_CONFIG = {
    out: { label: 'Hết hàng',  badge: 'bg-danger',              icon: 'fa-ban',          row: '#fff5f5' },
    low: { label: 'Sắp hết',   badge: 'bg-warning text-dark',   icon: 'fa-triangle-exclamation', row: '#fffbf0' },
    ok:  { label: 'Còn hàng',  badge: 'bg-success',             icon: 'fa-check',        row: '#ffffff' },
};

const AdminInventory = () => {
    // ── State danh sách ──────────────────────────────────────────────────────────
    const [items, setItems]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [summary, setSummary]           = useState(null);

    // ── Phân trang ───────────────────────────────────────────────────────────────
    const [currentPage, setCurrentPage]   = useState(0);
    const [totalPages, setTotalPages]     = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const PAGE_SIZE = 15;

    // ── Bộ lọc ──────────────────────────────────────────────────────────────────
    const [searchInput, setSearchInput]   = useState('');
    const [keyword, setKeyword]           = useState('');
    const [stockStatus, setStockStatus]   = useState('all');
    const [categories, setCategories]     = useState([]);
    const [categoryId, setCategoryId]     = useState('');

    // ── Modal nhập kho 1 sản phẩm ───────────────────────────────────────────────
    const [showModal, setShowModal]       = useState(false);
    const [modalItem, setModalItem]       = useState(null);
    const [inputQty, setInputQty]         = useState('');
    const [inputType, setInputType]       = useState('ADD');
    const [inputNote, setInputNote]       = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError]     = useState('');

    // ── Lấy dữ liệu ─────────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let url = `http://localhost:8080/api/admin/stock?page=${currentPage}&size=${PAGE_SIZE}&stockStatus=${stockStatus}`;
            if (keyword)    url += `&keyword=${encodeURIComponent(keyword)}`;
            if (categoryId) url += `&categoryId=${categoryId}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setItems(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [currentPage, keyword, stockStatus, categoryId]);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:8080/api/admin/stock/summary');
            if (res.ok) setSummary(await res.json());
        } catch (e) { console.error(e); }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:8080/api/categories');
            if (res.ok) setCategories(await res.json());
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchData(); },       [fetchData]);
    useEffect(() => { fetchSummary(); },    [fetchSummary]);
    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    // ── Tìm kiếm ────────────────────────────────────────────────────────────────
    const handleSearch = () => { setKeyword(searchInput.trim()); setCurrentPage(0); };
    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

    const handleFilterChange = (field, value) => {
        if (field === 'stockStatus') setStockStatus(value);
        if (field === 'categoryId')  setCategoryId(value);
        setCurrentPage(0);
    };

    const handleClearAll = () => {
        setSearchInput(''); setKeyword('');
        setStockStatus('all'); setCategoryId('');
        setCurrentPage(0);
    };

    // ── Mở modal nhập kho ────────────────────────────────────────────────────────
    const handleOpenModal = (item) => {
        setModalItem(item);
        setInputQty('');
        setInputType('ADD');
        setInputNote('');
        setModalError('');
        setShowModal(true);
    };

    // ── Submit nhập kho ──────────────────────────────────────────────────────────
    const handleSubmitStock = async (e) => {
        e.preventDefault();
        const qty = parseInt(inputQty);
        if (!inputQty || isNaN(qty)) { setModalError('Vui lòng nhập số lượng hợp lệ!'); return; }
        if (inputType === 'ADD' && qty === 0) { setModalError('Số lượng nhập thêm phải khác 0!'); return; }
        if (inputType === 'SET' && qty < 0)  { setModalError('Số lượng đặt lại không được âm!'); return; }

        setModalLoading(true); setModalError('');
        try {
            const res = await fetch('http://localhost:8080/api/admin/stock/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: modalItem.productId,
                    quantity: qty,
                    type: inputType,
                    note: inputNote
                })
            });
            if (res.ok) {
                setShowModal(false);
                fetchData();
                fetchSummary();
            } else {
                setModalError(await res.text());
            }
        } catch { setModalError('Lỗi kết nối máy chủ!'); }
        finally { setModalLoading(false); }
    };

    // ── Helpers ──────────────────────────────────────────────────────────────────
    const formatPrice  = (p) => p ? new Intl.NumberFormat('vi-VN').format(p) + ' ₫' : '—';
    const hasFilter    = keyword || stockStatus !== 'all' || categoryId;

    const renderPages = () => {
        const pages = [];
        const start = Math.max(0, currentPage - 2);
        const end   = Math.min(totalPages - 1, currentPage + 2);
        if (start > 0) {
            pages.push(<li key="f" className="page-item"><button className="page-link text-dark" onClick={() => setCurrentPage(0)}>1</button></li>);
            if (start > 1) pages.push(<li key="d1" className="page-item disabled"><span className="page-link">…</span></li>);
        }
        for (let i = start; i <= end; i++) {
            pages.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button className="page-link"
                            style={currentPage === i ? { backgroundColor: '#00583b', borderColor: '#00583b', color: '#fff' } : { color: '#000' }}
                            onClick={() => setCurrentPage(i)}>{i + 1}</button>
                </li>
            );
        }
        if (end < totalPages - 1) {
            if (end < totalPages - 2) pages.push(<li key="d2" className="page-item disabled"><span className="page-link">…</span></li>);
            pages.push(<li key="l" className="page-item"><button className="page-link text-dark" onClick={() => setCurrentPage(totalPages - 1)}>{totalPages}</button></li>);
        }
        return pages;
    };

    // ── Tính số lượng sau điều chỉnh (preview) ──────────────────────────────────
    const previewQty = () => {
        if (!modalItem || !inputQty || isNaN(parseInt(inputQty))) return null;
        const qty = parseInt(inputQty);
        if (inputType === 'SET') return qty;
        return (modalItem.stockQuantity || 0) + qty;
    };

    // ────────────────────────────────────────────────────────────────────────────
    return (
        <div className="p-4">

            {/* ── Tiêu đề ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>Quản lý Tồn kho</h4>
                    <span className="text-muted small">
            Theo dõi và cập nhật số lượng sách trong kho
          </span>
                </div>
            </div>

            {/* ── Thẻ thống kê ── */}
            {summary && (
                <div className="row g-3 mb-4">
                    {[
                        { label: 'Tổng đầu sách',   value: summary.totalProducts,  color: '#00583b', bg: '#f0faf5', icon: 'fa-book' },
                        { label: 'Tổng tồn kho',    value: summary.totalQuantity + ' quyển', color: '#0d6efd', bg: '#f0f4ff', icon: 'fa-warehouse' },
                        { label: 'Sắp hết hàng',    value: summary.lowStock,       color: '#e67e00', bg: '#fffbf0', icon: 'fa-triangle-exclamation',
                            action: () => { setStockStatus('low'); setCurrentPage(0); } },
                        { label: 'Hết hàng',        value: summary.outOfStock,     color: '#dc3545', bg: '#fff5f5', icon: 'fa-ban',
                            action: () => { setStockStatus('out'); setCurrentPage(0); } },
                    ].map(card => (
                        <div key={card.label} className="col-md-3">
                            <div
                                className="rounded-3 p-3 d-flex align-items-center gap-3 shadow-sm"
                                style={{ backgroundColor: card.bg, borderLeft: `4px solid ${card.color}`, cursor: card.action ? 'pointer' : 'default' }}
                                onClick={card.action}
                            >
                                <div className="rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ width: 44, height: 44, backgroundColor: card.color + '20' }}>
                                    <i className={`fa-solid ${card.icon}`} style={{ color: card.color, fontSize: 18 }}></i>
                                </div>
                                <div>
                                    <div className="fw-bold fs-5" style={{ color: card.color }}>{card.value}</div>
                                    <div className="text-muted" style={{ fontSize: 12 }}>{card.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Bộ lọc ── */}
            <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body py-3">
                    <div className="row g-2 align-items-center">
                        {/* Tìm kiếm */}
                        <div className="col-md-4">
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="Tìm tên sách hoặc tác giả..."
                                       value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={handleKeyDown} />
                                <button className="btn text-white" style={{ backgroundColor: '#00583b' }} onClick={handleSearch}>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </div>
                        </div>

                        {/* Lọc trạng thái */}
                        <div className="col-md-3">
                            <select className="form-select" value={stockStatus}
                                    onChange={e => handleFilterChange('stockStatus', e.target.value)}>
                                <option value="all">Tất cả trạng thái</option>
                                <option value="out">🔴 Hết hàng (= 0)</option>
                                <option value="low">🟡 Sắp hết (1 – 10)</option>
                                <option value="ok" >🟢 Còn hàng (&gt; 10)</option>
                            </select>
                        </div>

                        {/* Lọc danh mục */}
                        <div className="col-md-3">
                            <select className="form-select" value={categoryId}
                                    onChange={e => handleFilterChange('categoryId', e.target.value)}>
                                <option value="">Tất cả danh mục</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* Xóa lọc */}
                        {hasFilter && (
                            <div className="col-md-2">
                                <button className="btn btn-outline-secondary w-100" onClick={handleClearAll}>
                                    <i className="fa-solid fa-xmark me-1"></i>Xóa lọc
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Bảng tồn kho ── */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th className="border-0 py-3 ps-4 text-muted small">Bìa sách</th>
                                <th className="border-0 py-3 text-muted small">Tên sách</th>
                                <th className="border-0 py-3 text-muted small">Tác giả</th>
                                <th className="border-0 py-3 text-muted small">Danh mục</th>
                                <th className="border-0 py-3 text-muted small text-end">Giá bán</th>
                                <th className="border-0 py-3 text-muted small text-center">Tồn kho</th>
                                <th className="border-0 py-3 text-muted small text-center">Trạng thái</th>
                                <th className="border-0 py-3 text-muted small text-center pe-4">Nhập kho</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-5">
                                    <div className="spinner-border text-success"></div>
                                    <p className="text-muted mt-2 mb-0">Đang tải dữ liệu...</p>
                                </td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-5 text-muted">
                                    <i className="fa-solid fa-warehouse fa-2x mb-2 d-block"></i>
                                    {keyword ? `Không tìm thấy kết quả cho "${keyword}"` : 'Không có dữ liệu tồn kho'}
                                </td></tr>
                            ) : items.map(item => {
                                const cfg = STATUS_CONFIG[item.stockStatus] || STATUS_CONFIG.ok;
                                return (
                                    <tr key={item.productId} style={{ backgroundColor: cfg.row }}>
                                        {/* Bìa sách */}
                                        <td className="ps-4 py-2">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.productName}
                                                     className="rounded" style={{ width: 40, height: 55, objectFit: 'cover' }} />
                                            ) : (
                                                <div className="rounded d-flex align-items-center justify-content-center bg-light"
                                                     style={{ width: 40, height: 55 }}>
                                                    <i className="fa-solid fa-book text-muted fa-sm"></i>
                                                </div>
                                            )}
                                        </td>

                                        {/* Tên */}
                                        <td className="py-2">
                        <span className="fw-semibold d-block"
                              style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={item.productName}>
                          {item.productName}
                        </span>
                                            <small className="text-muted">#{item.productId}</small>
                                        </td>

                                        {/* Tác giả */}
                                        <td className="py-2 text-muted small">
                                            {item.author || <span className="fst-italic">—</span>}
                                        </td>

                                        {/* Danh mục */}
                                        <td className="py-2">
                                            {item.categoryName
                                                ? <span className="badge bg-light text-dark border" style={{ fontSize: 11 }}>{item.categoryName}</span>
                                                : <span className="text-muted small fst-italic">—</span>}
                                        </td>

                                        {/* Giá */}
                                        <td className="py-2 text-end fw-bold text-danger small">
                                            {formatPrice(item.price)}
                                        </td>

                                        {/* Tồn kho — hiển thị to nổi bật */}
                                        <td className="py-2 text-center">
                        <span className="fw-bold fs-5" style={{
                            color: item.stockStatus === 'out' ? '#dc3545'
                                : item.stockStatus === 'low' ? '#e67e00'
                                    : '#198754'
                        }}>
                          {item.stockQuantity}
                        </span>
                                            <div className="text-muted" style={{ fontSize: 10 }}>quyển</div>
                                        </td>

                                        {/* Trạng thái */}
                                        <td className="py-2 text-center">
                        <span className={`badge ${cfg.badge}`} style={{ fontSize: 11 }}>
                          <i className={`fa-solid ${cfg.icon} me-1`}></i>
                            {cfg.label}
                        </span>
                                        </td>

                                        {/* Nút nhập kho */}
                                        <td className="py-2 text-center pe-4">
                                            <button
                                                className="btn btn-sm text-white fw-semibold px-3"
                                                style={{ backgroundColor: '#00583b', borderRadius: 6, fontSize: 12 }}
                                                onClick={() => handleOpenModal(item)}
                                            >
                                                <i className="fa-solid fa-plus me-1"></i>Nhập kho
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Phân trang */}
                {!loading && totalPages > 0 && (
                    <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center px-4">
            <span className="text-muted small">
              Trang <strong>{currentPage + 1}</strong> / {totalPages} —
                {items.length} / <strong>{totalElements}</strong> sách
            </span>
                        <nav>
                            <ul className="pagination pagination-sm m-0">
                                <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                    <button className="page-link text-dark" onClick={() => setCurrentPage(p => p - 1)}>
                                        <i className="fa-solid fa-chevron-left"></i>
                                    </button>
                                </li>
                                {renderPages()}
                                <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                    <button className="page-link text-dark" onClick={() => setCurrentPage(p => p + 1)}>
                                        <i className="fa-solid fa-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* ════════════════ MODAL NHẬP KHO ════════════════ */}
            {showModal && modalItem && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={() => setShowModal(false)}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 480 }}>
                            <div className="modal-content border-0 shadow">

                                {/* Header */}
                                <div className="modal-header" style={{ backgroundColor: '#00583b' }}>
                                    <h5 className="modal-title fw-bold text-white">
                                        <i className="fa-solid fa-boxes-stacked me-2"></i>Cập nhật tồn kho
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                </div>

                                <form onSubmit={handleSubmitStock}>
                                    <div className="modal-body p-4">

                                        {/* Thông tin sách */}
                                        <div className="d-flex gap-3 align-items-center mb-4 p-3 rounded-3"
                                             style={{ backgroundColor: '#f8f9fa' }}>
                                            {modalItem.imageUrl ? (
                                                <img src={modalItem.imageUrl} alt="" className="rounded"
                                                     style={{ width: 48, height: 64, objectFit: 'cover', flexShrink: 0 }} />
                                            ) : (
                                                <div className="rounded d-flex align-items-center justify-content-center bg-light"
                                                     style={{ width: 48, height: 64, flexShrink: 0 }}>
                                                    <i className="fa-solid fa-book text-muted"></i>
                                                </div>
                                            )}
                                            <div style={{ minWidth: 0 }}>
                                                <div className="fw-bold text-truncate">{modalItem.productName}</div>
                                                <div className="text-muted small">{modalItem.author || 'Không rõ tác giả'}</div>
                                                <div className="mt-1 d-flex align-items-center gap-2">
                                                    <span className="text-muted small">Tồn kho hiện tại:</span>
                                                    <span className="fw-bold" style={{
                                                        color: modalItem.stockStatus === 'out' ? '#dc3545'
                                                            : modalItem.stockStatus === 'low' ? '#e67e00' : '#198754'
                                                    }}>
                            {modalItem.stockQuantity} quyển
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lỗi */}
                                        {modalError && (
                                            <div className="alert alert-danger py-2 small mb-3">
                                                <i className="fa-solid fa-circle-exclamation me-2"></i>{modalError}
                                            </div>
                                        )}

                                        {/* Loại cập nhật */}
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Loại cập nhật</label>
                                            <div className="d-flex gap-2">
                                                {[
                                                    { value: 'ADD', label: '➕ Nhập thêm',      desc: 'Cộng thêm vào số hiện tại' },
                                                    { value: 'SET', label: '🎯 Đặt lại số',     desc: 'Đặt về số lượng cụ thể' },
                                                ].map(opt => (
                                                    <div key={opt.value}
                                                         className="flex-fill p-3 rounded-3 border text-center"
                                                         style={{
                                                             cursor: 'pointer',
                                                             borderColor: inputType === opt.value ? '#00583b' : '#dee2e6',
                                                             backgroundColor: inputType === opt.value ? '#f0faf5' : '#fff',
                                                         }}
                                                         onClick={() => { setInputType(opt.value); setModalError(''); }}
                                                    >
                                                        <div className="fw-bold" style={{ fontSize: 13, color: inputType === opt.value ? '#00583b' : '#333' }}>
                                                            {opt.label}
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: 11 }}>{opt.desc}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Số lượng */}
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                {inputType === 'ADD' ? 'Số lượng nhập thêm' : 'Số lượng mới'}
                                                <span className="text-danger"> *</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control bg-light fw-bold text-center fs-5"
                                                placeholder={inputType === 'ADD' ? 'VD: 50' : 'VD: 100'}
                                                value={inputQty}
                                                min={inputType === 'SET' ? 0 : undefined}
                                                onChange={e => { setInputQty(e.target.value); setModalError(''); }}
                                                autoFocus
                                            />
                                            {/* Preview sau điều chỉnh */}
                                            {previewQty() !== null && (
                                                <div className="mt-2 text-center">
                                                    <small className="text-muted">Tồn kho sau cập nhật: </small>
                                                    <strong style={{ color: previewQty() === 0 ? '#dc3545' : previewQty() <= 10 ? '#e67e00' : '#198754' }}>
                                                        {previewQty()} quyển
                                                    </strong>
                                                </div>
                                            )}
                                        </div>

                                        {/* Ghi chú */}
                                        <div className="mb-1">
                                            <label className="form-label fw-semibold">Ghi chú <span className="text-muted fw-normal">(tùy chọn)</span></label>
                                            <input
                                                type="text"
                                                className="form-control bg-light"
                                                placeholder="VD: Nhập từ NXB Trẻ, điều chỉnh sau kiểm kê..."
                                                value={inputNote}
                                                onChange={e => setInputNote(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="modal-footer bg-light border-0">
                                        <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>
                                            Hủy
                                        </button>
                                        <button type="submit" className="btn text-white px-4 fw-bold"
                                                style={{ backgroundColor: '#00583b' }} disabled={modalLoading}>
                                            {modalLoading
                                                ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</>
                                                : <><i className="fa-solid fa-floppy-disk me-2"></i>Xác nhận</>}
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminInventory;