import React, { useState, useEffect, useCallback } from 'react';

// ── Cấu hình trạng thái ─────────────────────────────────────────────────────
const ORDER_STATUS = {
    PENDING:    { label: 'Chờ xử lý',    badge: 'bg-warning text-dark', icon: 'fa-clock',         next: ['PROCESSING', 'CANCELLED'] },
    PROCESSING: { label: 'Đang xử lý',   badge: 'bg-info text-dark',    icon: 'fa-gear',           next: ['SHIPPED',     'CANCELLED'] },
    SHIPPED:    { label: 'Đang giao',     badge: 'bg-primary',           icon: 'fa-truck',          next: ['DELIVERED',   'CANCELLED'] },
    DELIVERED:  { label: 'Đã giao',       badge: 'bg-success',           icon: 'fa-circle-check',   next: [] },
    CANCELLED:  { label: 'Đã hủy',        badge: 'bg-danger',            icon: 'fa-ban',            next: [] },
};

const PAY_STATUS = {
    UNPAID:  { label: 'Chưa TT',  badge: 'bg-secondary' },
    PAID:    { label: 'Đã TT',    badge: 'bg-success'   },
    FAILED:  { label: 'Thất bại', badge: 'bg-danger'    },
    PENDING: { label: 'Đang xử lý',badge:'bg-warning text-dark'},
};

const STATUS_TABS = [
    { key: 'all',        label: 'Tất cả' },
    { key: 'PENDING',    label: 'Chờ xử lý' },
    { key: 'PROCESSING', label: 'Đang xử lý' },
    { key: 'SHIPPED',    label: 'Đang giao' },
    { key: 'DELIVERED',  label: 'Đã giao' },
    { key: 'CANCELLED',  label: 'Đã hủy' },
];

const AdminOrders = () => {
    // ── Danh sách & phân trang ──────────────────────────────────────────────────
    const [orders,        setOrders]        = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [currentPage,   setCurrentPage]   = useState(0);
    const [totalPages,    setTotalPages]    = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const PAGE_SIZE = 15;

    // ── Thống kê ────────────────────────────────────────────────────────────────
    const [summary, setSummary] = useState(null);

    // ── Bộ lọc ──────────────────────────────────────────────────────────────────
    const [activeTab,    setActiveTab]    = useState('all');
    const [searchInput,  setSearchInput]  = useState('');
    const [keyword,      setKeyword]      = useState('');
    const [payStatus,    setPayStatus]    = useState('all');
    const [fromDate,     setFromDate]     = useState('');
    const [toDate,       setToDate]       = useState('');

    // ── Modal chi tiết ───────────────────────────────────────────────────────────
    const [showDetail,    setShowDetail]    = useState(false);
    const [detailData,    setDetailData]    = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // ── Modal hủy đơn ────────────────────────────────────────────────────────────
    const [showCancel,   setShowCancel]   = useState(false);
    const [cancelOrder,  setCancelOrder]  = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading,setCancelLoading]= useState(false);

    // ── Lấy dữ liệu ─────────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            let url = `http://localhost:8080/api/admin/orders?page=${currentPage}&size=${PAGE_SIZE}`;
            url += `&status=${activeTab}&payStatus=${payStatus}`;
            if (keyword)  url += `&keyword=${encodeURIComponent(keyword)}`;
            if (fromDate) url += `&fromDate=${fromDate}`;
            if (toDate)   url += `&toDate=${toDate}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [currentPage, activeTab, keyword, payStatus, fromDate, toDate]);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:8080/api/admin/orders/summary');
            if (res.ok) setSummary(await res.json());
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchOrders(); },  [fetchOrders]);
    useEffect(() => { fetchSummary(); }, [fetchSummary]);

    // ── Tìm kiếm / lọc ──────────────────────────────────────────────────────────
    const handleSearch    = () => { setKeyword(searchInput.trim()); setCurrentPage(0); };
    const handleKeyDown   = e  => { if (e.key === 'Enter') handleSearch(); };
    const handleTabChange = tab => { setActiveTab(tab); setCurrentPage(0); };

    const handleClearAll = () => {
        setSearchInput(''); setKeyword('');
        setPayStatus('all'); setFromDate(''); setToDate('');
        setActiveTab('all'); setCurrentPage(0);
    };

    // ── Cập nhật trạng thái nhanh ────────────────────────────────────────────────
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`http://localhost:8080/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) { fetchOrders(); fetchSummary(); }
            else alert('Lỗi: ' + await res.text());
        } catch { alert('Lỗi kết nối!'); }
    };

    // ── Xem chi tiết ─────────────────────────────────────────────────────────────
    const handleViewDetail = async (orderId) => {
        setDetailLoading(true); setShowDetail(true); setDetailData(null);
        try {
            const res = await fetch(`http://localhost:8080/api/admin/orders/${orderId}`);
            if (res.ok) setDetailData(await res.json());
        } catch (e) { console.error(e); }
        finally { setDetailLoading(false); }
    };

    // ── Hủy đơn ──────────────────────────────────────────────────────────────────
    const handleOpenCancel = (order) => {
        setCancelOrder(order); setCancelReason(''); setShowCancel(true);
    };

    const handleConfirmCancel = async () => {
        if (!cancelOrder) return;
        setCancelLoading(true);
        try {
            const res = await fetch(
                `http://localhost:8080/api/admin/orders/${cancelOrder.id}/cancel`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: cancelReason })
                });
            if (res.ok) {
                setShowCancel(false);
                fetchOrders(); fetchSummary();
            } else alert('Lỗi: ' + await res.text());
        } catch { alert('Lỗi kết nối!'); }
        finally { setCancelLoading(false); }
    };

    // ── Helpers ──────────────────────────────────────────────────────────────────
    const fmt = n => n != null ? new Intl.NumberFormat('vi-VN').format(n) + ' ₫' : '—';
    const fmtDate = d => d ? new Date(d).toLocaleString('vi-VN', {
        day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
    }) : '—';
    const fmtDateShort = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

    const hasFilter = keyword || payStatus !== 'all' || fromDate || toDate;

    const renderPages = () => {
        const pages = [];
        const s = Math.max(0, currentPage - 2), e = Math.min(totalPages - 1, currentPage + 2);
        if (s > 0) {
            pages.push(<li key="f" className="page-item"><button className="page-link text-dark" onClick={() => setCurrentPage(0)}>1</button></li>);
            if (s > 1) pages.push(<li key="d1" className="page-item disabled"><span className="page-link">…</span></li>);
        }
        for (let i = s; i <= e; i++) pages.push(
            <li key={i} className={`page-item ${currentPage===i?'active':''}`}>
                <button className="page-link"
                        style={currentPage===i?{backgroundColor:'#00583b',borderColor:'#00583b',color:'#fff'}:{color:'#000'}}
                        onClick={() => setCurrentPage(i)}>{i+1}</button>
            </li>
        );
        if (e < totalPages-1) {
            if (e < totalPages-2) pages.push(<li key="d2" className="page-item disabled"><span className="page-link">…</span></li>);
            pages.push(<li key="l" className="page-item"><button className="page-link text-dark" onClick={() => setCurrentPage(totalPages-1)}>{totalPages}</button></li>);
        }
        return pages;
    };

    // ────────────────────────────────────────────────────────────────────────────
    return (
        <div className="p-4">

            {/* ── Tiêu đề ── */}
            <div className="mb-4">
                <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>Quản lý Đơn hàng</h4>
                <span className="text-muted small">Theo dõi và xử lý đơn hàng của khách</span>
            </div>

            {/* ── Thẻ thống kê ── */}
            {summary && (
                <div className="row g-3 mb-4">
                    {[
                        { label:'Tổng đơn',       value: summary.totalOrders,
                            color:'#00583b', bg:'#f0faf5', icon:'fa-receipt',
                            tab: 'all' },
                        { label:'Chờ xử lý',      value: summary.pending,
                            color:'#e67e00', bg:'#fffbf0', icon:'fa-clock',
                            tab: 'PENDING' },
                        { label:'Đang giao',      value: summary.shipped,
                            color:'#0d6efd', bg:'#f0f4ff', icon:'fa-truck',
                            tab: 'SHIPPED' },
                        { label:'Chưa thanh toán',value: summary.unpaid,
                            color:'#dc3545', bg:'#fff5f5', icon:'fa-circle-xmark',
                            tab: null },
                        { label:'Doanh thu',
                            value: summary.totalRevenue
                                ? new Intl.NumberFormat('vi-VN').format(summary.totalRevenue) + ' ₫'
                                : '0 ₫',
                            color:'#198754', bg:'#f0faf5', icon:'fa-chart-line',
                            tab: null },
                    ].map(card => (
                        <div key={card.label} className="col-md" style={{ minWidth: 170 }}>
                            <div className="rounded-3 p-3 d-flex align-items-center gap-3 shadow-sm"
                                 style={{ backgroundColor: card.bg, borderLeft: `4px solid ${card.color}`,
                                     cursor: card.tab ? 'pointer' : 'default' }}
                                 onClick={() => card.tab && handleTabChange(card.tab)}>
                                <div className="rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ width:40, height:40, backgroundColor: card.color+'20', flexShrink:0 }}>
                                    <i className={`fa-solid ${card.icon}`} style={{ color: card.color, fontSize:16 }}></i>
                                </div>
                                <div style={{ minWidth:0 }}>
                                    <div className="fw-bold" style={{ color: card.color, fontSize:17, lineHeight:1.2 }}>
                                        {card.value}
                                    </div>
                                    <div className="text-muted" style={{ fontSize:11 }}>{card.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Tab trạng thái ── */}
            <div className="d-flex gap-1 mb-3 flex-wrap">
                {STATUS_TABS.map(tab => (
                    <button key={tab.key}
                            className={`btn btn-sm px-3 ${activeTab === tab.key ? 'text-white' : 'btn-outline-secondary'}`}
                            style={activeTab === tab.key ? { backgroundColor:'#00583b', borderColor:'#00583b' } : {}}
                            onClick={() => handleTabChange(tab.key)}>
                        {tab.label}
                        {summary && tab.key !== 'all' && (
                            <span className={`ms-1 badge rounded-pill ${activeTab===tab.key?'bg-white text-success':'bg-secondary'}`}
                                  style={{ fontSize:10 }}>
                {summary[tab.key.toLowerCase()] ?? ''}
              </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Bộ lọc ── */}
            <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body py-3">
                    <div className="row g-2 align-items-end">
                        {/* Tìm kiếm */}
                        <div className="col-md-4">
                            <label className="form-label small text-muted mb-1">Tìm kiếm</label>
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="Mã đơn, tên, email, SĐT..."
                                       value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={handleKeyDown} />
                                <button className="btn text-white" style={{ backgroundColor:'#00583b' }} onClick={handleSearch}>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </div>
                        </div>
                        {/* Thanh toán */}
                        <div className="col-md-2">
                            <label className="form-label small text-muted mb-1">Thanh toán</label>
                            <select className="form-select" value={payStatus}
                                    onChange={e => { setPayStatus(e.target.value); setCurrentPage(0); }}>
                                <option value="all">Tất cả</option>
                                <option value="UNPAID">Chưa TT</option>
                                <option value="PAID">Đã TT</option>
                                <option value="FAILED">Thất bại</option>
                            </select>
                        </div>
                        {/* Từ ngày */}
                        <div className="col-md-2">
                            <label className="form-label small text-muted mb-1">Từ ngày</label>
                            <input type="date" className="form-control" value={fromDate}
                                   onChange={e => { setFromDate(e.target.value); setCurrentPage(0); }} />
                        </div>
                        {/* Đến ngày */}
                        <div className="col-md-2">
                            <label className="form-label small text-muted mb-1">Đến ngày</label>
                            <input type="date" className="form-control" value={toDate}
                                   onChange={e => { setToDate(e.target.value); setCurrentPage(0); }} />
                        </div>
                        {/* Xóa lọc */}
                        {hasFilter && (
                            <div className="col-md-2">
                                <label className="form-label small text-muted mb-1 d-block">&nbsp;</label>
                                <button className="btn btn-outline-secondary w-100" onClick={handleClearAll}>
                                    <i className="fa-solid fa-xmark me-1"></i>Xóa lọc
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Bảng đơn hàng ── */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead style={{ backgroundColor:'#f8f9fa' }}>
                            <tr>
                                <th className="border-0 py-3 ps-4 text-muted small">Mã ĐH</th>
                                <th className="border-0 py-3 text-muted small">Khách hàng</th>
                                <th className="border-0 py-3 text-muted small">Sản phẩm</th>
                                <th className="border-0 py-3 text-muted small text-end">Tổng tiền</th>
                                <th className="border-0 py-3 text-muted small text-center">Thanh toán</th>
                                <th className="border-0 py-3 text-muted small text-center">Trạng thái</th>
                                <th className="border-0 py-3 text-muted small">Ngày đặt</th>
                                <th className="border-0 py-3 text-muted small text-center pe-4">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-5">
                                    <div className="spinner-border text-success"></div>
                                    <p className="text-muted mt-2 mb-0">Đang tải dữ liệu...</p>
                                </td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-5 text-muted">
                                    <i className="fa-solid fa-receipt fa-2x mb-2 d-block"></i>
                                    Không tìm thấy đơn hàng nào
                                </td></tr>
                            ) : orders.map(order => {
                                const stCfg  = ORDER_STATUS[order.status]  || {};
                                const payCfg = PAY_STATUS[order.paymentStatus] || {};
                                return (
                                    <tr key={order.id}>
                                        {/* Mã đơn */}
                                        <td className="ps-4 py-3">
                                            <span className="fw-bold" style={{ color:'#00583b' }}>#{order.id}</span>
                                        </td>

                                        {/* Khách hàng */}
                                        <td className="py-3">
                                            <div className="fw-semibold" style={{ fontSize:13 }}>
                                                {order.customerName || 'Khách vãng lai'}
                                            </div>
                                            <div className="text-muted" style={{ fontSize:11 }}>
                                                {order.phone}
                                            </div>
                                        </td>

                                        {/* Số loại sách */}
                                        <td className="py-3">
                        <span className="badge bg-light text-dark border">
                          {order.itemCount} loại sách
                        </span>
                                            {order.paymentMethod && (
                                                <div className="text-muted mt-1" style={{ fontSize:10 }}>
                                                    {order.paymentMethod}
                                                </div>
                                            )}
                                        </td>

                                        {/* Tổng tiền */}
                                        <td className="py-3 text-end fw-bold text-danger" style={{ fontSize:13 }}>
                                            {fmt(order.totalPrice)}
                                        </td>

                                        {/* Thanh toán */}
                                        <td className="py-3 text-center">
                        <span className={`badge ${payCfg.badge}`} style={{ fontSize:10 }}>
                          {payCfg.label}
                        </span>
                                        </td>

                                        {/* Trạng thái + chuyển nhanh */}
                                        <td className="py-3 text-center">
                        <span className={`badge ${stCfg.badge} d-block mb-1`} style={{ fontSize:10 }}>
                          <i className={`fa-solid ${stCfg.icon} me-1`}></i>
                            {stCfg.label}
                        </span>
                                            {/* Nút chuyển trạng thái nhanh */}
                                            {stCfg.next && stCfg.next.filter(s => s !== 'CANCELLED').map(ns => (
                                                <button key={ns}
                                                        className="btn btn-sm border-0 p-0 text-primary"
                                                        style={{ fontSize:10, textDecoration:'underline' }}
                                                        onClick={() => handleStatusChange(order.id, ns)}>
                                                    → {ORDER_STATUS[ns]?.label}
                                                </button>
                                            ))}
                                        </td>

                                        {/* Ngày đặt */}
                                        <td className="py-3">
                                            <span className="text-muted small">{fmtDateShort(order.createdAt)}</span>
                                        </td>

                                        {/* Thao tác */}
                                        <td className="py-3 text-center pe-4">
                                            {/* Xem chi tiết */}
                                            <button className="btn btn-sm btn-light border me-1"
                                                    style={{ color:'#0d6efd' }} title="Xem chi tiết"
                                                    onClick={() => handleViewDetail(order.id)}>
                                                <i className="fa-solid fa-eye"></i>
                                            </button>
                                            {/* Hủy đơn */}
                                            {['PENDING','PROCESSING'].includes(order.status) && (
                                                <button className="btn btn-sm btn-light border text-danger"
                                                        title="Hủy đơn hàng"
                                                        onClick={() => handleOpenCancel(order)}>
                                                    <i className="fa-solid fa-ban"></i>
                                                </button>
                                            )}
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
              Trang <strong>{currentPage+1}</strong> / {totalPages} —
                {orders.length} / <strong>{totalElements}</strong> đơn hàng
            </span>
                        <nav>
                            <ul className="pagination pagination-sm m-0">
                                <li className={`page-item ${currentPage===0?'disabled':''}`}>
                                    <button className="page-link text-dark" onClick={() => setCurrentPage(p=>p-1)}>
                                        <i className="fa-solid fa-chevron-left"></i>
                                    </button>
                                </li>
                                {renderPages()}
                                <li className={`page-item ${currentPage===totalPages-1?'disabled':''}`}>
                                    <button className="page-link text-dark" onClick={() => setCurrentPage(p=>p+1)}>
                                        <i className="fa-solid fa-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* ════════════ MODAL CHI TIẾT ════════════ */}
            {showDetail && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex:1040 }}
                         onClick={() => setShowDetail(false)}></div>
                    <div className="modal fade show d-block" style={{ zIndex:1050 }}>
                        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content border-0 shadow">

                                <div className="modal-header" style={{ backgroundColor:'#00583b' }}>
                                    <h5 className="modal-title fw-bold text-white">
                                        <i className="fa-solid fa-receipt me-2"></i>
                                        Chi tiết đơn hàng {detailData ? `#${detailData.id}` : ''}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white"
                                            onClick={() => setShowDetail(false)}></button>
                                </div>

                                <div className="modal-body p-0">
                                    {detailLoading ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-success"></div>
                                            <p className="mt-2 text-muted">Đang tải chi tiết...</p>
                                        </div>
                                    ) : detailData ? (
                                        <div>
                                            {/* ─ Thanh trạng thái ─ */}
                                            <div className="px-4 py-3 border-bottom bg-light d-flex align-items-center gap-3 flex-wrap">
                                                <span className="text-muted small">Trạng thái đơn:</span>
                                                <span className={`badge ${ORDER_STATUS[detailData.status]?.badge}`}>
                          <i className={`fa-solid ${ORDER_STATUS[detailData.status]?.icon} me-1`}></i>
                                                    {ORDER_STATUS[detailData.status]?.label}
                        </span>
                                                <span className="text-muted small ms-3">Thanh toán:</span>
                                                <span className={`badge ${PAY_STATUS[detailData.paymentStatus]?.badge}`}>
                          {PAY_STATUS[detailData.paymentStatus]?.label}
                        </span>
                                                {detailData.transactionId && (
                                                    <span className="text-muted small ms-2">
                            Mã GD: <code>{detailData.transactionId}</code>
                          </span>
                                                )}
                                                {/* Nút chuyển trạng thái trong modal */}
                                                <div className="ms-auto d-flex gap-2 flex-wrap">
                                                    {ORDER_STATUS[detailData.status]?.next
                                                        .filter(s => s !== 'CANCELLED')
                                                        .map(ns => (
                                                            <button key={ns}
                                                                    className="btn btn-sm text-white"
                                                                    style={{ backgroundColor:'#00583b', fontSize:12 }}
                                                                    onClick={async () => {
                                                                        await handleStatusChange(detailData.id, ns);
                                                                        const res = await fetch(`http://localhost:8080/api/admin/orders/${detailData.id}`);
                                                                        if (res.ok) setDetailData(await res.json());
                                                                    }}>
                                                                <i className="fa-solid fa-arrow-right me-1"></i>
                                                                {ORDER_STATUS[ns]?.label}
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>

                                            <div className="row g-0">
                                                {/* ─ Cột trái: Thông tin ─ */}
                                                <div className="col-md-5 border-end p-4">
                                                    {/* Khách hàng */}
                                                    <h6 className="fw-bold mb-3 pb-2 border-bottom">
                                                        <i className="fa-solid fa-user me-2 text-success"></i>Khách hàng
                                                    </h6>
                                                    <table className="table table-borderless table-sm mb-4">
                                                        <tbody>
                                                        {[
                                                            ['Họ tên', detailData.customerName],
                                                            ['Email',  detailData.customerEmail || '—'],
                                                            ['SĐT',    detailData.phone],
                                                            ['Địa chỉ',detailData.shippingAddress],
                                                        ].map(([k,v]) => (
                                                            <tr key={k}>
                                                                <td className="text-muted" style={{ width:90, fontWeight:500, fontSize:13 }}>{k}</td>
                                                                <td style={{ fontSize:13 }}>{v || '—'}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>

                                                    {/* Vận chuyển */}
                                                    <h6 className="fw-bold mb-3 pb-2 border-bottom">
                                                        <i className="fa-solid fa-truck me-2 text-primary"></i>Vận chuyển
                                                    </h6>
                                                    <table className="table table-borderless table-sm mb-4">
                                                        <tbody>
                                                        {[
                                                            ['Đơn vị',       detailData.shippingProvider || '—'],
                                                            ['Mã vận đơn',   detailData.trackingCode     || 'Chưa có'],
                                                            ['Trạng thái VC',detailData.shippingStatus   || '—'],
                                                        ].map(([k,v]) => (
                                                            <tr key={k}>
                                                                <td className="text-muted" style={{ width:110, fontWeight:500, fontSize:13 }}>{k}</td>
                                                                <td style={{ fontSize:13 }}>{v}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>

                                                    {/* Tài chính */}
                                                    <h6 className="fw-bold mb-3 pb-2 border-bottom">
                                                        <i className="fa-solid fa-file-invoice-dollar me-2 text-warning"></i>Tài chính
                                                    </h6>
                                                    <table className="table table-borderless table-sm">
                                                        <tbody>
                                                        <tr>
                                                            <td className="text-muted" style={{ fontSize:13 }}>Phương thức TT</td>
                                                            <td className="fw-semibold" style={{ fontSize:13 }}>{detailData.paymentMethod || '—'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="text-muted" style={{ fontSize:13 }}>Phí ship</td>
                                                            <td style={{ fontSize:13 }}>{fmt(detailData.shippingFee)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="text-muted" style={{ fontSize:13 }}>Giảm giá</td>
                                                            <td style={{ fontSize:13 }}>- {fmt(detailData.discount)}</td>
                                                        </tr>
                                                        <tr className="border-top">
                                                            <td className="fw-bold pt-2" style={{ fontSize:14 }}>Tổng cộng</td>
                                                            <td className="fw-bold text-danger pt-2" style={{ fontSize:15 }}>
                                                                {fmt(detailData.totalPrice)}
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>

                                                    {detailData.note && (
                                                        <div className="alert alert-light border py-2 mt-2" style={{ fontSize:12 }}>
                                                            <i className="fa-solid fa-note-sticky me-2 text-muted"></i>
                                                            {detailData.note}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ─ Cột phải: Danh sách sách ─ */}
                                                <div className="col-md-7 p-4">
                                                    <h6 className="fw-bold mb-3 pb-2 border-bottom">
                                                        <i className="fa-solid fa-book me-2 text-success"></i>
                                                        Sách trong đơn ({detailData.items?.length || 0} loại)
                                                    </h6>
                                                    <div style={{ maxHeight:460, overflowY:'auto' }}>
                                                        {detailData.items?.map((item, idx) => (
                                                            <div key={idx}
                                                                 className="d-flex gap-3 align-items-center p-3 mb-2 rounded-3"
                                                                 style={{ backgroundColor:'#f8f9fa' }}>
                                                                {item.imageUrl ? (
                                                                    <img src={item.imageUrl} alt=""
                                                                         className="rounded" style={{ width:45, height:62, objectFit:'cover', flexShrink:0 }} />
                                                                ) : (
                                                                    <div className="rounded d-flex align-items-center justify-content-center bg-light border"
                                                                         style={{ width:45, height:62, flexShrink:0 }}>
                                                                        <i className="fa-solid fa-book text-muted fa-sm"></i>
                                                                    </div>
                                                                )}
                                                                <div className="flex-grow-1" style={{ minWidth:0 }}>
                                                                    <div className="fw-semibold text-truncate" style={{ fontSize:13 }}>
                                                                        {item.productName}
                                                                    </div>
                                                                    <div className="text-muted" style={{ fontSize:11 }}>
                                                                        {item.author || 'Không rõ tác giả'}
                                                                    </div>
                                                                    <div className="d-flex justify-content-between mt-1">
                                    <span className="text-muted small">
                                      {fmt(item.price)} × {item.quantity}
                                    </span>
                                                                        <span className="fw-bold text-danger small">
                                      {fmt(item.subtotal)}
                                    </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Tổng kết */}
                                                    <div className="border-top pt-3 mt-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="fw-bold">Tổng cộng:</span>
                                                            <span className="fw-bold text-danger fs-5">{fmt(detailData.totalPrice)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5 text-muted">Không tìm thấy thông tin đơn hàng.</div>
                                    )}
                                </div>

                                <div className="modal-footer bg-light border-0">
                                    {detailData && ['PENDING','PROCESSING'].includes(detailData.status) && (
                                        <button className="btn btn-outline-danger me-auto"
                                                onClick={() => { setShowDetail(false); handleOpenCancel(detailData); }}>
                                            <i className="fa-solid fa-ban me-2"></i>Hủy đơn
                                        </button>
                                    )}
                                    <button className="btn btn-secondary px-4"
                                            onClick={() => setShowDetail(false)}>Đóng</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ════════════ MODAL HỦY ĐƠN ════════════ */}
            {showCancel && cancelOrder && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex:1060 }}
                         onClick={() => setShowCancel(false)}></div>
                    <div className="modal fade show d-block" style={{ zIndex:1070 }}>
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth:460 }}>
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold text-danger">
                                        <i className="fa-solid fa-triangle-exclamation me-2"></i>Hủy đơn hàng
                                    </h5>
                                    <button className="btn-close" onClick={() => setShowCancel(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">
                                        Bạn sắp hủy đơn hàng <strong className="text-dark">#{cancelOrder.id}</strong> của
                                        khách <strong className="text-dark">{cancelOrder.customerName}</strong>.
                                        {cancelOrder.paymentStatus === 'PAID' && (
                                            <span className="d-block mt-1 text-info small">
                        <i className="fa-solid fa-circle-info me-1"></i>
                        Đơn này đã thanh toán — tồn kho sẽ được hoàn lại tự động.
                      </span>
                                        )}
                                    </p>
                                    <div>
                                        <label className="form-label fw-semibold">
                                            Lý do hủy <span className="text-muted fw-normal">(tùy chọn)</span>
                                        </label>
                                        <textarea className="form-control" rows="3"
                                                  placeholder="VD: Khách yêu cầu hủy, hết hàng, sai địa chỉ..."
                                                  value={cancelReason}
                                                  onChange={e => setCancelReason(e.target.value)}>
                    </textarea>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-0">
                                    <button className="btn btn-secondary px-4" onClick={() => setShowCancel(false)}>
                                        Thoát
                                    </button>
                                    <button className="btn btn-danger px-4 fw-bold"
                                            onClick={handleConfirmCancel} disabled={cancelLoading}>
                                        {cancelLoading
                                            ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
                                            : <><i className="fa-solid fa-ban me-2"></i>Xác nhận hủy</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminOrders;