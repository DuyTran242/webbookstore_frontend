import React, { useState, useEffect, useCallback } from 'react';

const AdminCategory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tìm kiếm
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');

    // Modal thêm/sửa
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null); // null = thêm mới
    const [formData, setFormData] = useState({ name: '', description: '', parentId: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Danh sách danh mục dùng cho dropdown chọn cha
    const [allCategories, setAllCategories] = useState([]);

    // Lấy danh sách danh mục
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:8080/api/admin/categories';
            if (keyword) url += `?keyword=${encodeURIComponent(keyword)}`;
            const res = await fetch(url);
            if (res.ok) setCategories(await res.json());
        } catch (e) {
            console.error('Lỗi lấy danh mục:', e);
        } finally {
            setLoading(false);
        }
    }, [keyword]);

    // Lấy tất cả danh mục cho dropdown (không lọc)
    const fetchAllForDropdown = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:8080/api/admin/categories');
            if (res.ok) setAllCategories(await res.json());
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);
    useEffect(() => { fetchAllForDropdown(); }, [fetchAllForDropdown]);

    const handleSearch = () => { setKeyword(searchInput.trim()); };
    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };
    const handleClearSearch = () => { setSearchInput(''); setKeyword(''); };

    // Mở modal thêm mới
    const handleOpenAdd = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '', parentId: '' });
        setFormError('');
        setShowModal(true);
    };

    // Mở modal sửa
    const handleOpenEdit = (cat) => {
        setEditingCategory(cat);
        setFormData({
            name: cat.name || '',
            description: cat.description || '',
            parentId: cat.parentId ? String(cat.parentId) : ''
        });
        setFormError('');
        setShowModal(true);
    };

    // Submit form thêm/sửa
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) { setFormError('Tên danh mục không được để trống!'); return; }

        setFormLoading(true);
        setFormError('');

        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            parentId: formData.parentId ? parseInt(formData.parentId) : null
        };

        try {
            const url = editingCategory
                ? `http://localhost:8080/api/admin/categories/${editingCategory.id}`
                : 'http://localhost:8080/api/admin/categories';
            const method = editingCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowModal(false);
                fetchCategories();
                fetchAllForDropdown();
            } else {
                const errText = await res.text();
                setFormError(errText);
            }
        } catch (e) {
            setFormError('Lỗi kết nối máy chủ!');
        } finally {
            setFormLoading(false);
        }
    };

    // Xóa danh mục
    const handleDelete = async (cat) => {
        if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}" không?\n\nLưu ý: Không thể xóa nếu còn sách hoặc danh mục con.`)) return;

        try {
            const res = await fetch(`http://localhost:8080/api/admin/categories/${cat.id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCategories();
                fetchAllForDropdown();
            } else {
                const errText = await res.text();
                alert('Lỗi: ' + errText);
            }
        } catch (e) {
            alert('Lỗi kết nối máy chủ!');
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

    // Dropdown options cho chọn danh mục cha (loại trừ chính nó khi edit)
    const parentOptions = allCategories.filter(c =>
        !editingCategory || (c.id !== editingCategory.id)
    );

    return (
        <div className="p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>Quản lý Danh mục</h4>
                    <span className="text-muted small">
            Tổng cộng <strong>{categories.length}</strong> danh mục
          </span>
                </div>
                <button
                    className="btn text-white fw-bold px-4 py-2"
                    style={{ backgroundColor: '#00583b', borderRadius: '8px' }}
                    onClick={handleOpenAdd}
                >
                    <i className="fa-solid fa-plus me-2"></i>Thêm Danh mục
                </button>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body py-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-5">
                            <div className="input-group">
                                <input
                                    type="text" className="form-control"
                                    placeholder="Tìm theo tên danh mục..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
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

            {/* Bảng danh mục */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th className="border-0 py-3 ps-4 text-muted small">ID</th>
                                <th className="border-0 py-3 text-muted small">Tên danh mục</th>
                                <th className="border-0 py-3 text-muted small">Danh mục cha</th>
                                <th className="border-0 py-3 text-muted small">Mô tả</th>
                                <th className="border-0 py-3 text-muted small text-center">Số sách</th>
                                <th className="border-0 py-3 text-muted small">Ngày tạo</th>
                                <th className="border-0 py-3 text-muted small text-center pe-4">Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-5">
                                    <div className="spinner-border text-success"></div>
                                    <p className="text-muted mt-2 mb-0">Đang tải...</p>
                                </td></tr>
                            ) : categories.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">
                                    <i className="fa-solid fa-list fa-2x mb-2 d-block"></i>
                                    {keyword ? `Không tìm thấy danh mục nào với từ khóa "${keyword}"` : 'Chưa có danh mục nào'}
                                </td></tr>
                            ) : categories.map((cat) => (
                                <tr key={cat.id}>
                                    {/* ID */}
                                    <td className="ps-4 py-3">
                                        <span className="badge bg-light text-dark border">#{cat.id}</span>
                                    </td>

                                    {/* Tên */}
                                    <td className="py-3">
                                        <div className="d-flex align-items-center gap-2">
                                            {cat.parentId ? (
                                                <i className="fa-solid fa-turn-up fa-xs text-muted" style={{ transform: 'rotate(90deg)' }}></i>
                                            ) : (
                                                <i className="fa-solid fa-folder text-warning fa-sm"></i>
                                            )}
                                            <span className="fw-bold">{cat.name}</span>
                                        </div>
                                    </td>

                                    {/* Danh mục cha */}
                                    <td className="py-3">
                                        {cat.parentName ? (
                                            <span className="badge bg-light text-dark border">
                          <i className="fa-solid fa-folder text-warning me-1 fa-xs"></i>
                                                {cat.parentName}
                        </span>
                                        ) : (
                                            <span className="text-muted fst-italic small">Danh mục gốc</span>
                                        )}
                                    </td>

                                    {/* Mô tả */}
                                    <td className="py-3">
                      <span
                          className="text-muted small"
                          style={{ maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={cat.description}
                      >
                        {cat.description || '—'}
                      </span>
                                    </td>

                                    {/* Số sách */}
                                    <td className="py-3 text-center">
                      <span className={`badge ${cat.productCount > 0 ? 'bg-success' : 'bg-secondary'}`}>
                        {cat.productCount} sách
                      </span>
                                    </td>

                                    {/* Ngày tạo */}
                                    <td className="py-3">
                                        <span className="text-muted small">{formatDate(cat.createdAt)}</span>
                                    </td>

                                    {/* Hành động */}
                                    <td className="py-3 text-center pe-4">
                                        <button
                                            className="btn btn-sm btn-light border me-1 text-primary"
                                            title="Sửa danh mục"
                                            onClick={() => handleOpenEdit(cat)}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-light border text-danger"
                                            title="Xóa danh mục"
                                            onClick={() => handleDelete(cat)}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ==================== MODAL THÊM / SỬA ==================== */}
            {showModal && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        style={{ zIndex: 1040 }}
                        onClick={() => setShowModal(false)}
                    ></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
                            <div className="modal-content border-0 shadow">

                                {/* Header */}
                                <div className="modal-header" style={{ backgroundColor: '#00583b' }}>
                                    <h5 className="modal-title fw-bold text-white">
                                        <i className={`fa-solid ${editingCategory ? 'fa-pen-to-square' : 'fa-plus'} me-2`}></i>
                                        {editingCategory ? `Sửa danh mục "${editingCategory.name}"` : 'Thêm danh mục mới'}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                </div>

                                {/* Body */}
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body p-4">

                                        {/* Thông báo lỗi */}
                                        {formError && (
                                            <div className="alert alert-danger py-2 small mb-3">
                                                <i className="fa-solid fa-circle-exclamation me-2"></i>{formError}
                                            </div>
                                        )}

                                        {/* Tên danh mục */}
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Tên danh mục <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control bg-light"
                                                placeholder="VD: Văn học, Kỹ năng sống, Khoa học..."
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                autoFocus
                                            />
                                        </div>

                                        {/* Danh mục cha */}
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Danh mục cha</label>
                                            <select
                                                className="form-select bg-light"
                                                value={formData.parentId}
                                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                            >
                                                <option value="">— Không có (Danh mục gốc) —</option>
                                                {parentOptions.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.parentId ? `  ↳ ${c.name}` : c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <small className="text-muted">Để trống nếu đây là danh mục cấp cao nhất</small>
                                        </div>

                                        {/* Mô tả */}
                                        <div className="mb-2">
                                            <label className="form-label fw-semibold">Mô tả</label>
                                            <textarea
                                                className="form-control bg-light"
                                                rows="3"
                                                placeholder="Mô tả ngắn về danh mục này..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="modal-footer bg-light border-0">
                                        <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn text-white px-4 fw-bold"
                                            style={{ backgroundColor: '#00583b' }}
                                            disabled={formLoading}
                                        >
                                            {formLoading
                                                ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</>
                                                : <><i className="fa-solid fa-floppy-disk me-2"></i>{editingCategory ? 'Lưu thay đổi' : 'Thêm danh mục'}</>
                                            }
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

export default AdminCategory;