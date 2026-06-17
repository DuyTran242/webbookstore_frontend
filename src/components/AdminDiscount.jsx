import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminDiscount = () => {
    const [discounts, setDiscounts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCode, setCurrentCode] = useState({
        id: '',
        code: '',
        description: '',
        discountPercentage: 0,
        maxDiscountAmount: '',
        minOrderValue: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        isActive: true
    });

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/admin/discounts');
            setDiscounts(res.data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
            Swal.fire('Lỗi', 'Không thể tải danh sách mã giảm giá', 'error');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentCode({
            ...currentCode,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...currentCode,
                maxDiscountAmount: currentCode.maxDiscountAmount || null,
                minOrderValue: currentCode.minOrderValue || null,
                usageLimit: currentCode.usageLimit || null,
                startDate: currentCode.startDate || null,
                endDate: currentCode.endDate || null,
            };

            if (isEditing) {
                await axios.put(`http://localhost:8080/api/admin/discounts/${currentCode.id}`, payload);
                Swal.fire('Thành công', 'Đã cập nhật mã giảm giá', 'success');
            } else {
                await axios.post('http://localhost:8080/api/admin/discounts', payload);
                Swal.fire('Thành công', 'Đã thêm mã giảm giá', 'success');
            }
            setShowModal(false);
            fetchDiscounts();
        } catch (error) {
            Swal.fire('Lỗi', error.response?.data || 'Có lỗi xảy ra', 'error');
        }
    };

    const handleEdit = (code) => {
        setCurrentCode(code);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Mã giảm giá này sẽ bị xóa vĩnh viễn!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/api/admin/discounts/${id}`);
                Swal.fire('Đã xóa!', 'Mã giảm giá đã được xóa.', 'success');
                fetchDiscounts();
            } catch (error) {
                Swal.fire('Lỗi', 'Không thể xóa mã giảm giá', 'error');
            }
        }
    };

    const handleAddNew = () => {
        setCurrentCode({
            id: '', code: '', description: '', discountPercentage: 0,
            maxDiscountAmount: '', minOrderValue: '', startDate: '', endDate: '',
            usageLimit: '', isActive: true
        });
        setIsEditing(false);
        setShowModal(true);
    };

    return (
        <div className="admin-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0" style={{ color: '#00583b' }}>Quản lý mã giảm giá</h4>
                <button className="btn btn-success" onClick={handleAddNew}>
                    <i className="fa-solid fa-plus me-2"></i>Thêm mã mới
                </button>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Mã</th>
                                <th>Mô tả</th>
                                <th>Giảm (%)</th>
                                <th>Đã dùng</th>
                                <th>Giới hạn</th>
                                <th>Trạng thái</th>
                                <th className="text-end">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map(d => (
                                <tr key={d.id}>
                                    <td><span className="badge bg-primary fs-6">{d.code}</span></td>
                                    <td>{d.description}</td>
                                    <td>{d.discountPercentage}%</td>
                                    <td>{d.usedCount}</td>
                                    <td>{d.usageLimit || 'Vô hạn'}</td>
                                    <td>
                                        {d.isActive ? <span className="badge bg-success">Hoạt động</span> : <span className="badge bg-danger">Khóa</span>}
                                    </td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(d)}>
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(d.id)}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {discounts.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">Chưa có mã giảm giá nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL THÊM/SỬA */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold" style={{ color: '#00583b' }}>
                                    {isEditing ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Mã Code <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control text-uppercase" name="code" value={currentCode.code} onChange={handleInputChange} placeholder="VD: SALE10" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Mô tả</label>
                                    <input type="text" className="form-control" name="description" value={currentCode.description || ''} onChange={handleInputChange} placeholder="Mô tả cho mã giảm giá" />
                                </div>
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label fw-bold">Giảm giá (%) <span className="text-danger">*</span></label>
                                        <input type="number" className="form-control" name="discountPercentage" value={currentCode.discountPercentage} onChange={handleInputChange} min="1" max="100" />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold">Giảm tối đa (VNĐ)</label>
                                        <input type="number" className="form-control" name="maxDiscountAmount" value={currentCode.maxDiscountAmount || ''} onChange={handleInputChange} placeholder="VD: 50000" />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label fw-bold">Đơn tối thiểu (VNĐ)</label>
                                        <input type="number" className="form-control" name="minOrderValue" value={currentCode.minOrderValue || ''} onChange={handleInputChange} placeholder="VD: 100000" />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold">Giới hạn sử dụng</label>
                                        <input type="number" className="form-control" name="usageLimit" value={currentCode.usageLimit || ''} onChange={handleInputChange} placeholder="Để trống nếu vô hạn" />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label fw-bold">Ngày bắt đầu</label>
                                        <input type="datetime-local" className="form-control" name="startDate" value={currentCode.startDate || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold">Ngày kết thúc</label>
                                        <input type="datetime-local" className="form-control" name="endDate" value={currentCode.endDate || ''} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="form-check form-switch mb-3">
                                    <input className="form-check-input" type="checkbox" role="switch" id="isActive" name="isActive" checked={currentCode.isActive} onChange={handleInputChange} />
                                    <label className="form-check-label fw-bold" htmlFor="isActive">Kích hoạt</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="button" className="btn btn-success" onClick={handleSave}>Lưu lại</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDiscount;
