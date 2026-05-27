import React, { useState, useEffect, useCallback } from 'react';

const AdminUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            let url = `http://localhost:8080/api/admin/users?page=${currentPage}&size=${pageSize}`;
            if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setUsers(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }
        } catch (error) {
            console.error('Lỗi kết nối:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, keyword]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSearch = () => { setKeyword(searchInput.trim()); setCurrentPage(0); };
    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };
    const handleClearSearch = () => { setSearchInput(''); setKeyword(''); setCurrentPage(0); };

    const handleViewDetail = async (userId) => {
        setModalLoading(true);
        setShowModal(true);
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${userId}`);
            if (res.ok) setSelectedUser(await res.json());
        } catch (e) { console.error(e); }
        finally { setModalLoading(false); }
    };

    const handleLock = async (user) => {
        if (!window.confirm(`Khóa tài khoản "${user.fullName || user.email}"?`)) return;
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${user.id}/lock`, { method: 'PATCH' });
            if (res.ok) {
                alert('Đã khóa tài khoản!');
                fetchUsers();
                if (selectedUser?.id === user.id) setSelectedUser(p => ({ ...p, status: 2 }));
            } else alert('Lỗi: ' + await res.text());
        } catch { alert('Lỗi kết nối!'); }
    };

    const handleUnlock = async (user) => {
        if (!window.confirm(`Mở khóa tài khoản "${user.fullName || user.email}"?`)) return;
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${user.id}/unlock`, { method: 'PATCH' });
            if (res.ok) {
                alert('Đã mở khóa tài khoản!');
                fetchUsers();
                if (selectedUser?.id === user.id) setSelectedUser(p => ({ ...p, status: 1 }));
            } else alert('Lỗi: ' + await res.text());
        } catch { alert('Lỗi kết nối!'); }
    };

    const renderStatusBadge = (status) => {
        if (status === 1) return <span className="badge bg-success">Hoạt động</span>;
        if (status === 2) return <span className="badge bg-danger">Đã khóa</span>;
        return <span className="badge bg-secondary">Chưa kích hoạt</span>;
    };

    const renderProviderBadge = (provider) => {
        if (provider === 'GOOGLE') return <span className="badge" style={{ backgroundColor: '#ea4335', fontSize: '10px' }}>Google</span>;
        if (provider === 'FB') return <span className="badge" style={{ backgroundColor: '#3b5998', fontSize: '10px' }}>Facebook</span>;
        return <span className="badge bg-secondary" style={{ fontSize: '10px' }}>Local</span>;
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
    const formatDateTime = (d) => d ? new Date(d).toLocaleString('vi-VN') : '—';

    const getAvatarSrc = (user) => {
        if (!user.avatar) return null;
        if (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) return user.avatar;
        return `http://localhost:8080${user.avatar}`;
    };

    const getInitials = (user) =>
        (user.fullName || user.email || 'U').charAt(0).toUpperCase();

    const renderPageNumbers = () => {
        const pages = [];
        const start = Math.max(0, currentPage - 2);
        const end = Math.min(totalPages - 1, currentPage + 2);
        if (start > 0) {
            pages.push(<li key="f" className="page-item"><button className="page-link text-dark" onClick={() => setCurrentPage(0)}>1</button></li>);
            if (start > 1) pages.push(<li key="d1" className="page-item disabled"><span className="page-link">...</span></li>);
        }
        for (let i = start; i <= end; i++) {
            pages.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button className="page-link"
                            style={currentPage === i ? { backgroundColor: '#00583b', borderColor: '#00583b', color: 'white' } : { color: 'black' }}
                            onClick={() => setCurrentPage(i)}>{i + 1}</button>
                </li>
            );
        }
        if (end < totalPages - 1) {
            if (end < totalPages - 2) pages.push(<li key="d2" className="page-item disabled"><span className="page-link">...</span></li>);
            pages.push(<li key="l" className="page-item"><button className="page-link text-dark" onClick={() => setCurrentPage(totalPages - 1)}>{totalPages}</button></li>);
        }
        return pages;
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>Quản lý Người dùng</h4>
                    <span className="text-muted small">Tổng cộng <strong>{totalElements}</strong> tài khoản</span>
                </div>
            </div>

            {/* Tìm kiếm */}
            <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body py-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="Tìm theo tên hoặc email..."
                                       value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleKeyDown} />
                                <button className="btn text-white" style={{ backgroundColor: '#00583b' }} onClick={handleSearch}>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </div>
                        </div>
                        {keyword && (
                            <div className="col-md-4 d-flex align-items-center gap-2">
                                <small className="text-muted">Kết quả cho: <strong>"{keyword}"</strong></small>
                                <button className="btn btn-sm btn-outline-secondary" onClick={handleClearSearch}>
                                    <i className="fa-solid fa-xmark me-1"></i>Xóa
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bảng */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th className="border-0 py-3 ps-4 text-muted small">Avatar</th>
                                <th className="border-0 py-3 text-muted small">Họ tên</th>
                                <th className="border-0 py-3 text-muted small">Email</th>
                                <th className="border-0 py-3 text-muted small">Số điện thoại</th>
                                <th className="border-0 py-3 text-muted small text-center">Đăng ký qua</th>
                                <th className="border-0 py-3 text-muted small text-center">Trạng thái</th>
                                <th className="border-0 py-3 text-muted small">Ngày tạo</th>
                                <th className="border-0 py-3 text-muted small text-center pe-4">Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-5">
                                    <div className="spinner-border text-success"></div>
                                    <p className="text-muted mt-2 mb-0">Đang tải dữ liệu...</p>
                                </td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-5 text-muted">
                                    <i className="fa-solid fa-users fa-2x mb-2 d-block"></i>
                                    {keyword ? `Không tìm thấy kết quả cho "${keyword}"` : 'Chưa có người dùng nào'}
                                </td></tr>
                            ) : users.map((user) => (
                                <tr key={user.id} style={{ opacity: user.status === 2 ? 0.65 : 1 }}>
                                    <td className="ps-4 py-3">
                                        {getAvatarSrc(user) ? (
                                            <img src={getAvatarSrc(user)} alt="avatar" className="rounded-circle"
                                                 style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                 onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                                        ) : (
                                            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                 style={{ width: '40px', height: '40px', backgroundColor: '#00583b', fontSize: '14px' }}>
                                                {getInitials(user)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3">
                      <span className="fw-bold d-block" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.fullName || <span className="text-muted fst-italic">Chưa cập nhật</span>}
                      </span>
                                        <small className="text-muted">#{user.id}</small>
                                    </td>
                                    <td className="py-3"><span style={{ fontSize: '13px' }}>{user.email}</span></td>
                                    <td className="py-3"><span className="text-muted small">{user.phone || '—'}</span></td>
                                    <td className="py-3 text-center">{renderProviderBadge(user.provider)}</td>
                                    <td className="py-3 text-center">{renderStatusBadge(user.status)}</td>
                                    <td className="py-3"><span className="text-muted small">{formatDate(user.createdAt)}</span></td>
                                    <td className="py-3 text-center pe-4">
                                        <button className="btn btn-sm btn-light border me-1" style={{ color: '#0d6efd' }}
                                                title="Xem chi tiết" onClick={() => handleViewDetail(user.id)}>
                                            <i className="fa-solid fa-eye"></i>
                                        </button>
                                        {user.status === 2 ? (
                                            <button className="btn btn-sm btn-light border text-success" title="Mở khóa" onClick={() => handleUnlock(user)}>
                                                <i className="fa-solid fa-lock-open"></i>
                                            </button>
                                        ) : (
                                            <button className="btn btn-sm btn-light border text-danger" title="Khóa tài khoản"
                                                    onClick={() => handleLock(user)} disabled={user.status === 0}>
                                                <i className="fa-solid fa-lock"></i>
                                            </button>
                                        )}
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
              Trang <strong>{currentPage + 1}</strong> / {totalPages} — {users.length} / <strong>{totalElements}</strong> người dùng
            </span>
                        <nav>
                            <ul className="pagination pagination-sm m-0">
                                <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                    <button className="page-link text-dark" onClick={() => setCurrentPage(p => p - 1)}>
                                        <i className="fa-solid fa-chevron-left"></i>
                                    </button>
                                </li>
                                {renderPageNumbers()}
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

            {/* MODAL CHI TIẾT */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={() => setShowModal(false)}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header" style={{ backgroundColor: '#00583b' }}>
                                    <h5 className="modal-title fw-bold text-white">
                                        <i className="fa-solid fa-user me-2"></i>Chi tiết tài khoản
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    {modalLoading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-success"></div>
                                            <p className="mt-2 text-muted">Đang tải thông tin...</p>
                                        </div>
                                    ) : selectedUser ? (
                                        <div className="row g-4">
                                            {/* Avatar + trạng thái */}
                                            <div className="col-md-4 text-center border-end">
                                                {getAvatarSrc(selectedUser) ? (
                                                    <img src={getAvatarSrc(selectedUser)} alt="avatar"
                                                         className="rounded-circle border mb-3"
                                                         style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                         onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                                                ) : (
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mx-auto mb-3"
                                                         style={{ width: '100px', height: '100px', backgroundColor: '#00583b', fontSize: '36px' }}>
                                                        {getInitials(selectedUser)}
                                                    </div>
                                                )}
                                                <h6 className="fw-bold">{selectedUser.fullName || 'Chưa cập nhật'}</h6>
                                                <p className="text-muted small mb-2">{selectedUser.email}</p>
                                                <div className="mb-2">{renderStatusBadge(selectedUser.status)}</div>
                                                <div className="mb-4">{renderProviderBadge(selectedUser.provider)}</div>
                                                {selectedUser.status === 2 ? (
                                                    <button className="btn btn-success btn-sm w-100" onClick={() => handleUnlock(selectedUser)}>
                                                        <i className="fa-solid fa-lock-open me-2"></i>Mở khóa
                                                    </button>
                                                ) : selectedUser.status === 1 ? (
                                                    <button className="btn btn-danger btn-sm w-100" onClick={() => handleLock(selectedUser)}>
                                                        <i className="fa-solid fa-lock me-2"></i>Khóa tài khoản
                                                    </button>
                                                ) : (
                                                    <span className="text-muted small">Chưa kích hoạt</span>
                                                )}
                                            </div>

                                            {/* Thông tin chi tiết */}
                                            <div className="col-md-8">
                                                <table className="table table-borderless table-sm">
                                                    <tbody>
                                                    {[
                                                        ['ID', `#${selectedUser.id}`],
                                                        ['Họ tên', selectedUser.fullName || '—'],
                                                        ['Email', selectedUser.email],
                                                        ['Số điện thoại', selectedUser.phone || '—'],
                                                        ['Giới tính', selectedUser.gender || '—'],
                                                        ['Ngày sinh', selectedUser.birthdate ? formatDate(selectedUser.birthdate) : '—'],
                                                        ['Địa chỉ', selectedUser.address || '—'],
                                                        ['Ngày đăng ký', formatDateTime(selectedUser.createdAt)],
                                                    ].map(([label, value]) => (
                                                        <tr key={label}>
                                                            <td className="text-muted" style={{ width: '140px', fontWeight: 500 }}>{label}</td>
                                                            <td>{value}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center text-muted">Không tìm thấy thông tin.</p>
                                    )}
                                </div>
                                <div className="modal-footer bg-light border-0">
                                    <button className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>Đóng</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminUser;