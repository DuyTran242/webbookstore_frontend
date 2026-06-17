import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterStar, setFilterStar] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const userSession = JSON.parse(localStorage.getItem('adminSession') || localStorage.getItem('userSession'));

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/productsreview/all');
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Xóa bình luận?',
      text: 'Hành động này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/productsreview/${id}?userId=${userSession?.id}`);
        Swal.fire('Đã xóa!', 'Bình luận đã bị xóa.', 'success');
        fetchReviews();
      } catch (error) {
        Swal.fire('Lỗi', error.response?.data || 'Không thể xóa', 'error');
      }
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyContent.trim()) return Swal.fire('Lỗi', 'Vui lòng nhập nội dung!', 'warning');
    const payload = {
      productId: null,
      userId: userSession?.id,
      rating: 0,
      comment: replyContent,
      parentId,
    };
    try {
      await axios.post('http://localhost:8080/api/productsreview', payload);
      Swal.fire('Thành công', 'Đã gửi phản hồi!', 'success');
      setReplyingTo(null);
      setReplyContent('');
      fetchReviews();
    } catch {
      Swal.fire('Lỗi', 'Không thể gửi phản hồi', 'error');
    }
  };

  // Thống kê
  const ratingReviews = reviews.filter(r => r.rating > 0);
  const totalReviews = ratingReviews.length;
  const avgRating = totalReviews > 0 ? (ratingReviews.reduce((s, r) => s + r.rating, 0) / totalReviews) : 0;
  const starCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratingReviews.filter(r => r.rating === star).length,
    pct: totalReviews > 0 ? Math.round((ratingReviews.filter(r => r.rating === star).length / totalReviews) * 100) : 0,
  }));
  const starColor = { 5: '#22c55e', 4: '#84cc16', 3: '#f59e0b', 2: '#f97316', 1: '#ef4444' };

  // Lọc + sắp xếp
  const filtered = reviews
    .filter(r => {
      const q = searchText.toLowerCase();
      const matchText = !q ||
        (r.bookTitle || '').toLowerCase().includes(q) ||
        (r.userName || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q);
      const matchStar = filterStar === 'all' || String(r.rating) === filterStar;
      return matchText && matchStar;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });

  // Reset về trang 1 khi thay đổi filter/search/sort
  useEffect(() => { setCurrentPage(1); }, [searchText, filterStar, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Tạo danh sách số trang hiển thị (có ellipsis)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const goToPage = (p) => { if (p >= 1 && p <= totalPages) setCurrentPage(p); };
  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) setSelectedIds([]);
    else setSelectedIds(paginated.map(r => r.id));
  };

  const renderStars = (rating, size = 14) => {
    if (!rating || rating <= 0) return null;
    return (
      <span style={{ display: 'inline-flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <i key={i} className={`fa${i <= rating ? 's' : 'r'} fa-star`}
            style={{ fontSize: size, color: i <= rating ? '#f59e0b' : '#d1d5db' }} />
        ))}
      </span>
    );
  };

  const starFilterOptions = [
    { val: 'all', label: 'Tất cả', color: '#00583b' },
    { val: '5', label: '5 sao', color: '#22c55e' },
    { val: '4', label: '4 sao', color: '#84cc16' },
    { val: '3', label: '3 sao', color: '#f59e0b' },
    { val: '2', label: '2 sao', color: '#f97316' },
    { val: '1', label: '1 sao', color: '#ef4444' },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontWeight: 700, color: '#1a1a2e', margin: 0, fontSize: '22px' }}>Quản lý Đánh giá</h4>
        <p style={{ color: '#6c757d', margin: '4px 0 0', fontSize: '14px' }}>Kiểm duyệt đánh giá sách từ khách hàng</p>
      </div>

      {/* ── Stats Card ── */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center',
      }}>
        {/* Tổng & Điểm TB */}
        <div style={{ display: 'flex', gap: '48px', minWidth: '260px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{totalReviews}</div>
            <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '6px' }}>Tổng đánh giá</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
              {avgRating.toFixed(1)}
              <i className="fas fa-star" style={{ fontSize: '28px', marginLeft: '4px', verticalAlign: 'middle' }} />
            </div>
            <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '6px' }}>Điểm TB</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', background: '#e9ecef', margin: '0 32px', height: '80px' }} />

        {/* Phân phối sao */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#6c757d', marginBottom: '10px' }}>Phân phối đánh giá</div>
          {starCounts.map(({ star, count, pct }) => (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ width: '22px', fontSize: '13px', fontWeight: 600, color: starColor[star], textAlign: 'right' }}>{star}</span>
              <i className="fas fa-star" style={{ fontSize: '12px', color: starColor[star] }} />
              <div style={{ flex: 1, height: '8px', background: '#f1f3f5', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: starColor[star], borderRadius: '99px', transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6c757d', minWidth: '56px', textAlign: 'right' }}>
                {count} ({pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter Card ── */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '16px 24px',
        marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}>
        {/* Hàng 1: Ô tìm kiếm + nút refresh */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <i className="fas fa-search" style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              color: '#adb5bd', fontSize: '14px', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Tìm theo tên sách, người dùng hoặc nội dung đánh giá..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                width: '100%', paddingLeft: '42px', paddingRight: '16px', height: '42px',
                border: '1.5px solid #e9ecef', borderRadius: '10px', fontSize: '14px',
                outline: 'none', transition: 'border-color .2s', boxSizing: 'border-box', color: '#1a1a2e',
              }}
              onFocus={e => (e.target.style.borderColor = '#00583b')}
              onBlur={e => (e.target.style.borderColor = '#e9ecef')}
            />
          </div>
          <button
            onClick={fetchReviews}
            title="Làm mới dữ liệu"
            style={{
              height: '42px', width: '42px', flexShrink: 0,
              border: '1.5px solid #e9ecef', borderRadius: '10px',
              background: '#fff', cursor: 'pointer', color: '#6c757d',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#adb5bd'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e9ecef'; }}
          >
            <i className="fas fa-rotate-right" style={{ fontSize: '14px' }} />
          </button>
        </div>

        {/* Hàng 2: Pill lọc sao + dropdown sắp xếp */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          {/* Pill buttons lọc sao */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '12px', fontWeight: 600, color: '#9ca3af',
              textTransform: 'uppercase', letterSpacing: '0.6px', marginRight: '4px', whiteSpace: 'nowrap',
            }}>
              Lọc theo sao:
            </span>
            {starFilterOptions.map(({ val, label, color }) => {
              const active = filterStar === val;
              return (
                <button
                  key={val}
                  onClick={() => setFilterStar(val)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '5px 14px', borderRadius: '99px',
                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    border: `1.5px solid ${active ? color : '#e5e7eb'}`,
                    background: active ? color : '#fff',
                    color: active ? '#fff' : '#374151',
                    transition: 'all .15s', whiteSpace: 'nowrap',
                    boxShadow: active ? `0 2px 8px ${color}40` : 'none',
                  }}
                >
                  {val !== 'all' && (
                    <i className="fas fa-star" style={{ fontSize: '10px', color: active ? '#fff' : color }} />
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          {/* Dropdown sắp xếp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '12px', fontWeight: 600, color: '#9ca3af',
              textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap',
            }}>
              Sắp xếp:
            </span>
            <div style={{ position: 'relative' }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  height: '36px', border: '1.5px solid #e5e7eb', borderRadius: '8px',
                  padding: '0 36px 0 12px', fontSize: '13px', fontWeight: 500,
                  outline: 'none', appearance: 'none', backgroundColor: '#fafbfc',
                  cursor: 'pointer', color: '#1a1a2e', minWidth: '160px',
                }}
              >
                <option value="newest">Mới nhất trước</option>
                <option value="oldest">Cũ nhất trước</option>
                <option value="highest">Điểm cao nhất</option>
                <option value="lowest">Điểm thấp nhất</option>
              </select>
              <i className="fas fa-chevron-down" style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '11px', color: '#6c757d', pointerEvents: 'none',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#adb5bd' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '28px', display: 'block', marginBottom: '12px' }} />
            <div style={{ fontSize: '15px' }}>Đang tải dữ liệu...</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f3f5', background: '#fafbfc' }}>
                <th style={{ padding: '14px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && paginated.every(r => selectedIds.includes(r.id))}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer', accentColor: '#00583b' }}
                  />
                </th>
                {['Sách', 'Người đánh giá', 'Sao', 'Nội dung', 'Ngày đánh giá', 'Hành động'].map(col => (
                  <th key={col} style={{
                    padding: '14px 16px', textAlign: 'left', fontWeight: 600,
                    color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '64px', textAlign: 'center', color: '#adb5bd' }}>
                    <i className="far fa-comment-dots" style={{ fontSize: '44px', display: 'block', marginBottom: '12px', opacity: 0.4 }} />
                    <div style={{ fontSize: '15px', fontWeight: 500 }}>Chưa có đánh giá nào</div>
                    <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.7 }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
                  </td>
                </tr>
              ) : paginated.map((rv, idx) => (
                <React.Fragment key={rv.id}>
                  <tr
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      background: selectedIds.includes(rv.id) ? '#f0fdf4' : idx % 2 === 0 ? '#fff' : '#fafbfc',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => { if (!selectedIds.includes(rv.id)) e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={e => { if (!selectedIds.includes(rv.id)) e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'; }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '14px 16px' }}>
                      <input type="checkbox" checked={selectedIds.includes(rv.id)} onChange={() => toggleSelect(rv.id)}
                        style={{ cursor: 'pointer', accentColor: '#00583b' }} />
                    </td>

                    {/* Sách */}
                    <td style={{ padding: '14px 16px', maxWidth: '160px' }}>
                      <div style={{
                        fontWeight: 500, color: '#1a1a2e', fontSize: '13px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }} title={rv.bookTitle}>
                        {rv.bookTitle || <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>—</span>}
                      </div>
                    </td>

                    {/* Người đánh giá */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={rv.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rv.userName || 'U')}&background=00583b&color=fff&size=36`}
                          alt="avatar"
                          style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e9ecef', flexShrink: 0 }}
                        />
                        <span style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a2e' }}>
                          {rv.userName || 'Ẩn danh'}
                        </span>
                      </div>
                    </td>

                    {/* Sao */}
                    <td style={{ padding: '14px 16px' }}>
                      {rv.rating > 0
                        ? renderStars(rv.rating)
                        : (
                          <span style={{
                            display: 'inline-block', padding: '2px 10px', borderRadius: '99px',
                            fontSize: '11px', fontWeight: 600, background: '#eff6ff', color: '#3b82f6',
                          }}>
                            Phản hồi
                          </span>
                        )
                      }
                    </td>

                    {/* Nội dung */}
                    <td style={{ padding: '14px 16px', maxWidth: '280px' }}>
                      <div style={{
                        color: '#4b5563', fontSize: '13px', lineHeight: '1.5',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {rv.comment || <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>Không có nội dung</span>}
                      </div>
                    </td>

                    {/* Ngày */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: '#6b7280', fontSize: '13px' }}>
                      <i className="far fa-calendar-alt" style={{ marginRight: '6px', color: '#d1d5db' }} />
                      {rv.createdAt
                        ? new Date(rv.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : '—'}
                    </td>

                    {/* Hành động */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => { setReplyingTo(replyingTo === rv.id ? null : rv.id); setReplyContent(''); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '5px 12px', borderRadius: '8px',
                            border: `1.5px solid ${replyingTo === rv.id ? '#00583b' : '#d1d5db'}`,
                            background: replyingTo === rv.id ? '#00583b' : '#fff',
                            color: replyingTo === rv.id ? '#fff' : '#374151',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                          }}
                        >
                          <i className="far fa-reply" style={{ fontSize: '11px' }} />
                          Trả lời
                        </button>
                        <button
                          onClick={() => handleDelete(rv.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '5px 12px', borderRadius: '8px',
                            border: '1.5px solid #fecaca',
                            background: '#fff', color: '#ef4444',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#ef4444'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; }}
                        >
                          <i className="fas fa-trash-alt" style={{ fontSize: '11px' }} />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Reply row */}
                  {replyingTo === rv.id && (
                    <tr>
                      <td colSpan={7} style={{ padding: '0 20px 16px 56px', background: '#f0fdf4' }}>
                        <div style={{
                          display: 'flex', gap: '10px', alignItems: 'center',
                          background: '#fff', padding: '12px 16px', borderRadius: '12px',
                          border: '1.5px solid #bbf7d0',
                        }}>
                          <i className="fas fa-reply" style={{ color: '#00583b', fontSize: '15px', flexShrink: 0 }} />
                          <input
                            type="text"
                            placeholder="Nhập phản hồi của Admin..."
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleReplySubmit(rv.id)}
                            style={{
                              flex: 1, border: 'none', outline: 'none',
                              fontSize: '14px', background: 'transparent', color: '#1a1a2e',
                            }}
                          />
                          <button
                            onClick={() => handleReplySubmit(rv.id)}
                            style={{
                              padding: '7px 20px', borderRadius: '8px', border: 'none',
                              background: '#00583b', color: '#fff', fontWeight: 600,
                              fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                          >
                            Gửi phản hồi
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            style={{
                              padding: '7px 14px', borderRadius: '8px',
                              border: '1.5px solid #e5e7eb', background: '#fff',
                              color: '#6b7280', fontWeight: 500, fontSize: '13px', cursor: 'pointer',
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer / Pagination */}
        {!loading && filtered.length > 0 && (
          <div style={{
            padding: '14px 24px', borderTop: '1px solid #f3f4f6',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '12px',
            fontSize: '13px', color: '#6b7280',
          }}>
            {/* Thông tin */}
            <span>
              Hiển thị{' '}
              <strong style={{ color: '#1a1a2e' }}>
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}
              </strong>
              {' '}/ <strong style={{ color: '#1a1a2e' }}>{filtered.length}</strong> đánh giá
              {selectedIds.length > 0 && (
                <span style={{ marginLeft: '12px', color: '#00583b', fontWeight: 600 }}>
                  • Đã chọn {selectedIds.length}
                </span>
              )}
            </span>

            {/* Nút phân trang */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* Prev */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    width: '34px', height: '34px', border: '1.5px solid #e5e7eb',
                    borderRadius: '8px', background: currentPage === 1 ? '#f9fafb' : '#fff',
                    color: currentPage === 1 ? '#d1d5db' : '#374151',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', transition: 'all .15s',
                  }}
                >
                  <i className="fas fa-chevron-left" style={{ fontSize: '11px' }} />
                </button>

                {/* Số trang */}
                {getPageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} style={{
                      width: '34px', height: '34px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', color: '#9ca3af',
                    }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      style={{
                        width: '34px', height: '34px', border: `1.5px solid ${p === currentPage ? '#00583b' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: p === currentPage ? '#00583b' : '#fff',
                        color: p === currentPage ? '#fff' : '#374151',
                        cursor: 'pointer', fontSize: '13px', fontWeight: p === currentPage ? 700 : 400,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .15s',
                        boxShadow: p === currentPage ? '0 2px 8px rgba(0,88,59,0.25)' : 'none',
                      }}
                    >
                      {p}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    width: '34px', height: '34px', border: '1.5px solid #e5e7eb',
                    borderRadius: '8px', background: currentPage === totalPages ? '#f9fafb' : '#fff',
                    color: currentPage === totalPages ? '#d1d5db' : '#374151',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', transition: 'all .15s',
                  }}
                >
                  <i className="fas fa-chevron-right" style={{ fontSize: '11px' }} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReview;
