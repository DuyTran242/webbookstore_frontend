import React, { useState, useEffect, useCallback } from 'react';

// Render sao
const Stars = ({ rating, size = 13 }) => (
    <span>
    {[1,2,3,4,5].map(i => (
        <i key={i}
           className={`fa-star ${i <= rating ? 'fas' : 'far'}`}
           style={{ color: i <= rating ? '#f59e0b' : '#d1d5db', fontSize: size, marginRight: 1 }}
        ></i>
    ))}
  </span>
);

//  Màu sắc theo số sao
const RATING_COLOR = { 5:'#22c55e', 4:'#84cc16', 3:'#f59e0b', 2:'#f97316', 1:'#ef4444' };

const AdminReviews = () => {
    // Danh sách & phân trang
    const [reviews,       setReviews]       = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [currentPage,   setCurrentPage]   = useState(0);
    const [totalPages,    setTotalPages]    = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const PAGE_SIZE = 15;

    //  Thống kê
    const [summary, setSummary] = useState(null);

    // Bộ lọc
    const [searchInput, setSearchInput] = useState('');
    const [keyword,     setKeyword]     = useState('');
    const [filterRating,setFilterRating]= useState('');
    const [sortBy,      setSortBy]      = useState('newest');

    //  Chọn nhiều để xóa hàng loạt
    const [selected,    setSelected]    = useState(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);

    // Modal xem chi tiết
    const [showDetail, setShowDetail] = useState(false);
    const [detailItem, setDetailItem] = useState(null);

    //Lấy dữ liệu
    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            let url = `http://localhost:8080/api/admin/reviews?page=${currentPage}&size=${PAGE_SIZE}&sortBy=${sortBy}`;
            if (keyword)      url += `&keyword=${encodeURIComponent(keyword)}`;
            if (filterRating) url += `&rating=${filterRating}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [currentPage, keyword, filterRating, sortBy]);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:8080/api/admin/reviews/summary');
            if (res.ok) setSummary(await res.json());
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchReviews(); },  [fetchReviews]);
    useEffect(() => { fetchSummary(); }, [fetchSummary]);

    // Tìm kiếm
    const handleSearch  = () => { setKeyword(searchInput.trim()); setCurrentPage(0); setSelected(new Set()); };
    const handleKeyDown = e  => { if (e.key === 'Enter') handleSearch(); };

    const handleClearAll = () => {
        setSearchInput(''); setKeyword('');
        setFilterRating(''); setSortBy('newest');
        setCurrentPage(0); setSelected(new Set());
    };

    // Chọn / bỏ chọn
    const toggleSelect = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === reviews.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(reviews.map(r => r.id)));
        }
    };

    //Xóa 1 đánh giá
    const handleDelete = async (review) => {
        if (!window.confirm(
            `Xóa đánh giá của "${review.userName}" cho sách "${review.productName}"?\nHành động này không thể hoàn tác!`
        )) return;

        try {
            const res = await fetch(`http://localhost:8080/api/admin/reviews/${review.id}`, { method: 'DELETE' });
            if (res.ok) { fetchReviews(); fetchSummary(); setSelected(new Set()); }
            else alert('Lỗi: ' + await res.text());
        } catch { alert('Lỗi kết nối!'); }
    };

    //Xóa hàng loạt
    const handleBulkDelete = async () => {
        if (selected.size === 0) return;
        if (!window.confirm(`Bạn chắc chắn muốn xóa ${selected.size} đánh giá đã chọn?`)) return;

        setBulkLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/admin/reviews/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selected) })
            });
            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                setSelected(new Set());
                fetchReviews(); fetchSummary();
            } else alert('Lỗi: ' + await res.text());
        } catch { alert('Lỗi kết nối!'); }
        finally { setBulkLoading(false); }
    };

    //Helpers
    const fmtDate = d => d ? new Date(d).toLocaleString('vi-VN', {
        day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
    }) : '—';

    const getAvatarSrc = (u) => {
        if (!u.userAvatar) return null;
        if (u.userAvatar.startsWith('http') || u.userAvatar.startsWith('data:')) return u.userAvatar;
        return `http://localhost:8080${u.userAvatar}`;
    };

    const hasFilter = keyword || filterRating || sortBy !== 'newest';

    const renderPages = () => {
        const pages = [];
        const s = Math.max(0, currentPage-2), e = Math.min(totalPages-1, currentPage+2);
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

    return (
        <div className="p-4">

            {/*Tiêu đề*/}
            <div className="mb-4">
                <h4 className="fw-bold m-0" style={{ color:'#00583b' }}>Quản lý Đánh giá</h4>
                <span className="text-muted small">Kiểm duyệt đánh giá sách từ khách hàng</span>
            </div>

            {/*Thống kê*/}
            {summary && (
                <div className="row g-3 mb-4">
                    {/* Tổng + trung bình */}
                    <div className="col-md-4">
                        <div className="bg-white rounded-3 shadow-sm p-4 h-100 d-flex align-items-center gap-4">
                            <div className="text-center">
                                <div className="fw-bold" style={{ fontSize:32, color:'#00583b', lineHeight:1 }}>
                                    {summary.totalReviews.toLocaleString()}
                                </div>
                                <div className="text-muted small">Tổng đánh giá</div>
                            </div>
                            <div className="vr"></div>
                            <div className="text-center">
                                <div className="fw-bold d-flex align-items-center gap-1" style={{ fontSize:26, color:'#f59e0b', lineHeight:1 }}>
                                    {summary.avgRating.toFixed(1)}
                                    <i className="fas fa-star" style={{ fontSize:20 }}></i>
                                </div>
                                <div className="text-muted small">Điểm TB</div>
                            </div>
                        </div>
                    </div>

                    {/* Phân phối sao */}
                    <div className="col-md-8">
                        <div className="bg-white rounded-3 shadow-sm p-4 h-100">
                            <div className="small text-muted fw-semibold mb-2">Phân phối đánh giá</div>
                            {summary.ratingDistribution && [5,4,3,2,1].map(star => {
                                const count = summary.ratingDistribution[star] || 0;
                                const pct   = summary.totalReviews > 0
                                    ? Math.round((count / summary.totalReviews) * 100) : 0;
                                return (
                                    <div key={star} className="d-flex align-items-center gap-2 mb-1"
                                         style={{ cursor:'pointer' }}
                                         onClick={() => { setFilterRating(String(star)); setCurrentPage(0); }}>
                    <span style={{ width:22, fontSize:12, fontWeight:600, color: RATING_COLOR[star] }}>
                      {star}★
                    </span>
                                        <div className="flex-grow-1 rounded-pill overflow-hidden bg-light"
                                             style={{ height:10 }}>
                                            <div className="rounded-pill h-100"
                                                 style={{ width:`${pct}%`, backgroundColor: RATING_COLOR[star],
                                                     transition:'width 0.5s ease', minWidth: count > 0 ? 6 : 0 }}>
                                            </div>
                                        </div>
                                        <span className="text-muted" style={{ width:55, fontSize:11, textAlign:'right' }}>
                      {count.toLocaleString()} ({pct}%)
                    </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/*  tìm kiếm + lọc + xóa hàng loạt  */}
            <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body py-3">
                    <div className="row g-2 align-items-end">
                        {/* Tìm kiếm */}
                        <div className="col-md-4">
                            <label className="form-label small text-muted mb-1">Tìm kiếm</label>
                            <div className="input-group">
                                <input type="text" className="form-control"
                                       placeholder="Tên sách, tên người dùng, nội dung..."
                                       value={searchInput}
                                       onChange={e => setSearchInput(e.target.value)}
                                       onKeyDown={handleKeyDown} />
                                <button className="btn text-white" style={{ backgroundColor:'#00583b' }} onClick={handleSearch}>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </div>
                        </div>

                        {/* Lọc sao */}
                        <div className="col-md-2">
                            <label className="form-label small text-muted mb-1">Số sao</label>
                            <select className="form-select" value={filterRating}
                                    onChange={e => { setFilterRating(e.target.value); setCurrentPage(0); setSelected(new Set()); }}>
                                <option value="">Tất cả</option>
                                {[5,4,3,2,1].map(s => (
                                    <option key={s} value={s}>{'⭐'.repeat(s)} ({s} sao)</option>
                                ))}
                            </select>
                        </div>

                        {/* Sắp xếp */}
                        <div className="col-md-2">
                            <label className="form-label small text-muted mb-1">Sắp xếp</label>
                            <select className="form-select" value={sortBy}
                                    onChange={e => { setSortBy(e.target.value); setCurrentPage(0); }}>
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="rating_desc">Sao cao → thấp</option>
                                <option value="rating_asc">Sao thấp → cao</option>
                            </select>
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

                        {/* Xóa hàng loạt */}
                        {selected.size > 0 && (
                            <div className="col-md-2">
                                <label className="form-label small text-muted mb-1 d-block">&nbsp;</label>
                                <button className="btn btn-danger w-100 fw-bold"
                                        onClick={handleBulkDelete} disabled={bulkLoading}>
                                    {bulkLoading
                                        ? <span className="spinner-border spinner-border-sm"></span>
                                        : <><i className="fa-solid fa-trash me-1"></i>Xóa ({selected.size})</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/*  Bảng đánh giá  */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead style={{ backgroundColor:'#f8f9fa' }}>
                            <tr>
                                {/* Checkbox chọn tất cả */}
                                <th className="border-0 py-3 ps-4" style={{ width:44 }}>
                                    <input type="checkbox" className="form-check-input"
                                           checked={reviews.length > 0 && selected.size === reviews.length}
                                           onChange={toggleSelectAll} />
                                </th>
                                <th className="border-0 py-3 text-muted small">Sách</th>
                                <th className="border-0 py-3 text-muted small">Người đánh giá</th>
                                <th className="border-0 py-3 text-muted small text-center">Sao</th>
                                <th className="border-0 py-3 text-muted small">Nội dung</th>
                                <th className="border-0 py-3 text-muted small">Ngày đánh giá</th>
                                <th className="border-0 py-3 text-muted small text-center pe-4">Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-5">
                                    <div className="spinner-border text-success"></div>
                                    <p className="text-muted mt-2 mb-0">Đang tải dữ liệu...</p>
                                </td></tr>
                            ) : reviews.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">
                                    <i className="fa-regular fa-comment-dots fa-2x mb-2 d-block"></i>
                                    {keyword ? `Không tìm thấy kết quả cho "${keyword}"` : 'Chưa có đánh giá nào'}
                                </td></tr>
                            ) : reviews.map(review => (
                                <tr key={review.id}
                                    style={{ backgroundColor: selected.has(review.id) ? '#f0faf5' : undefined }}>

                                    {/* Checkbox */}
                                    <td className="ps-4">
                                        <input type="checkbox" className="form-check-input"
                                               checked={selected.has(review.id)}
                                               onChange={() => toggleSelect(review.id)} />
                                    </td>

                                    {/* Sách */}
                                    <td className="py-2">
                                        <div className="d-flex align-items-center gap-2">
                                            {review.productImage ? (
                                                <img src={review.productImage} alt=""
                                                     className="rounded" style={{ width:36, height:50, objectFit:'cover', flexShrink:0 }} />
                                            ) : (
                                                <div className="rounded d-flex align-items-center justify-content-center bg-light"
                                                     style={{ width:36, height:50, flexShrink:0 }}>
                                                    <i className="fa-solid fa-book text-muted fa-xs"></i>
                                                </div>
                                            )}
                                            <div style={{ minWidth:0 }}>
                                                <div className="fw-semibold text-truncate" style={{ fontSize:12, maxWidth:160 }}
                                                     title={review.productName}>
                                                    {review.productName}
                                                </div>
                                                <div className="text-muted" style={{ fontSize:10 }}>#{review.productId}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Người đánh giá */}
                                    <td className="py-2">
                                        <div className="d-flex align-items-center gap-2">
                                            {getAvatarSrc(review) ? (
                                                <img src={getAvatarSrc(review)} alt=""
                                                     className="rounded-circle"
                                                     style={{ width:32, height:32, objectFit:'cover', flexShrink:0 }}
                                                     onError={e => { e.target.style.display='none'; }} />
                                            ) : (
                                                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                     style={{ width:32, height:32, backgroundColor:'#00583b', fontSize:12, flexShrink:0 }}>
                                                    {(review.userName || 'K').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div style={{ minWidth:0 }}>
                                                <div className="fw-semibold text-truncate" style={{ fontSize:12, maxWidth:120 }}>
                                                    {review.userName}
                                                </div>
                                                {review.userEmail && (
                                                    <div className="text-muted text-truncate" style={{ fontSize:10, maxWidth:120 }}>
                                                        {review.userEmail}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Sao */}
                                    <td className="py-2 text-center">
                                        <Stars rating={review.rating} />
                                        <div className="fw-bold" style={{ fontSize:12, color: RATING_COLOR[review.rating] }}>
                                            {review.rating}/5
                                        </div>
                                    </td>

                                    {/* Nội dung */}
                                    <td className="py-2" style={{ maxWidth:240 }}>
                                        <div className="text-truncate" style={{ fontSize:12 }}
                                             title={review.comment}>
                                            {review.comment || <span className="text-muted fst-italic">Không có nội dung</span>}
                                        </div>
                                        <button className="btn btn-link p-0 text-primary" style={{ fontSize:10 }}
                                                onClick={() => { setDetailItem(review); setShowDetail(true); }}>
                                            Xem đầy đủ
                                        </button>
                                    </td>

                                    {/* Ngày */}
                                    <td className="py-2">
                      <span className="text-muted small" style={{ fontSize:11 }}>
                        {fmtDate(review.createdAt)}
                      </span>
                                    </td>

                                    {/* Hành động */}
                                    <td className="py-2 text-center pe-4">
                                        <button className="btn btn-sm btn-light border me-1"
                                                style={{ color:'#0d6efd' }} title="Xem chi tiết"
                                                onClick={() => { setDetailItem(review); setShowDetail(true); }}>
                                            <i className="fa-solid fa-eye"></i>
                                        </button>
                                        <button className="btn btn-sm btn-light border text-danger"
                                                title="Xóa đánh giá"
                                                onClick={() => handleDelete(review)}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Phân trang */}
                {!loading && totalPages > 0 && (
                    <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center px-4">
            <span className="text-muted small">
              {selected.size > 0 && (
                  <span className="me-3 fw-bold" style={{ color:'#00583b' }}>
                  Đã chọn {selected.size} đánh giá
                </span>
              )}
                Trang <strong>{currentPage+1}</strong> / {totalPages} —
                {reviews.length} / <strong>{totalElements}</strong> đánh giá
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

            {/* MODAL CHI TIẾT ĐÁNH GIÁ */}
            {showDetail && detailItem && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex:1040 }}
                         onClick={() => setShowDetail(false)}></div>
                    <div className="modal fade show d-block" style={{ zIndex:1050 }}>
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth:520 }}>
                            <div className="modal-content border-0 shadow">

                                <div className="modal-header" style={{ backgroundColor:'#00583b' }}>
                                    <h5 className="modal-title fw-bold text-white">
                                        <i className="fa-regular fa-comment-dots me-2"></i>Chi tiết đánh giá
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white"
                                            onClick={() => setShowDetail(false)}></button>
                                </div>

                                <div className="modal-body p-4">
                                    {/* Thông tin sách */}
                                    <div className="d-flex gap-3 p-3 rounded-3 mb-4"
                                         style={{ backgroundColor:'#f8f9fa' }}>
                                        {detailItem.productImage ? (
                                            <img src={detailItem.productImage} alt=""
                                                 className="rounded" style={{ width:50, height:68, objectFit:'cover', flexShrink:0 }} />
                                        ) : (
                                            <div className="rounded d-flex align-items-center justify-content-center bg-light"
                                                 style={{ width:50, height:68, flexShrink:0 }}>
                                                <i className="fa-solid fa-book text-muted"></i>
                                            </div>
                                        )}
                                        <div>
                                            <div className="fw-bold" style={{ fontSize:14 }}>{detailItem.productName}</div>
                                            <div className="text-muted small">Mã sách: #{detailItem.productId}</div>
                                        </div>
                                    </div>

                                    {/* Thông tin người dùng */}
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        {getAvatarSrc(detailItem) ? (
                                            <img src={getAvatarSrc(detailItem)} alt=""
                                                 className="rounded-circle border"
                                                 style={{ width:52, height:52, objectFit:'cover' }}
                                                 onError={e => { e.target.style.display='none'; }} />
                                        ) : (
                                            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                 style={{ width:52, height:52, backgroundColor:'#00583b', fontSize:18 }}>
                                                {(detailItem.userName || 'K').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <div className="fw-bold">{detailItem.userName}</div>
                                            {detailItem.userEmail && (
                                                <div className="text-muted small">{detailItem.userEmail}</div>
                                            )}
                                            <div className="text-muted small">{fmtDate(detailItem.createdAt)}</div>
                                        </div>
                                        <div className="ms-auto text-center">
                                            <div className="fw-bold" style={{ fontSize:28, color: RATING_COLOR[detailItem.rating] }}>
                                                {detailItem.rating}
                                            </div>
                                            <Stars rating={detailItem.rating} size={14} />
                                        </div>
                                    </div>

                                    {/* Nội dung đánh giá */}
                                    <div className="p-3 rounded-3 border" style={{ backgroundColor:'#fafafa', minHeight:80 }}>
                                        {detailItem.comment
                                            ? <p className="mb-0" style={{ lineHeight:1.7 }}>{detailItem.comment}</p>
                                            : <p className="mb-0 text-muted fst-italic">Không có nội dung đánh giá.</p>}
                                    </div>
                                </div>

                                <div className="modal-footer bg-light border-0">
                                    <button className="btn btn-outline-danger me-auto"
                                            onClick={() => { setShowDetail(false); handleDelete(detailItem); }}>
                                        <i className="fa-solid fa-trash me-2"></i>Xóa đánh giá
                                    </button>
                                    <button className="btn btn-secondary px-4"
                                            onClick={() => setShowDetail(false)}>Đóng</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminReviews;