import React, { useState } from 'react';

const AdminWarranty = () => {
    const [imeiQuery, setImeiQuery] = useState('');
    const [warrantyInfo, setWarrantyInfo] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Xử lý tìm kiếm
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!imeiQuery.trim()) return;
        
        setIsLoading(true);
        setError('');
        setWarrantyInfo(null);

        try {
            const response = await fetch(`http://localhost:8080/api/admin/inventory/warranty/check?imei=${imeiQuery}`);
            if (response.ok) {
                const data = await response.json();
                setWarrantyInfo(data);
            } else {
                const errText = await response.text();
                setError(errText);
            }
        } catch (err) {
            setError("Lỗi kết nối đến máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý thu hồi hàng
    const handleReturn = async (isDefective) => {
        if (!window.confirm("Xác nhận thu hồi sản phẩm này?")) return;
        
        try {
            const response = await fetch(`http://localhost:8080/api/admin/inventory/return/${warrantyInfo.orderItemId}?isDefective=${isDefective}`, {
                method: 'POST'
            });
            if (response.ok) {
                alert("Đã thu hồi và cập nhật kho thành công!");
                setWarrantyInfo(null); // Reset form
                setImeiQuery('');
            }
        } catch (err) {
            alert("Lỗi khi xử lý trả hàng.");
        }
    };

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <h2 className="fw-bold text-dark mb-4">
                <i className="fa-solid fa-shield-halved text-primary me-2"></i>
                Tra Cứu Bảo Hành & Trả Hàng
            </h2>

            {/* Search Box */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="d-flex align-items-center gap-3">
                        <div className="flex-grow-1">
                            <label className="form-label fw-bold text-secondary">Nhập mã IMEI / Serial Number</label>
                            <input 
                                type="text" 
                                className="form-control form-control-lg" 
                                placeholder="VD: SS-TV-2026-XYZ..." 
                                value={imeiQuery}
                                onChange={(e) => setImeiQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg mt-4 px-5" disabled={isLoading}>
                            {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magnifying-glass me-2"></i>} Tra cứu
                        </button>
                    </form>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center">
                    <i className="fa-solid fa-triangle-exclamation fs-4 me-3"></i>
                    <div><strong>Không tìm thấy:</strong> {error}</div>
                </div>
            )}

            {/* Result Card */}
            {warrantyInfo && (
                <div className="card shadow border-0 overflow-hidden">
                    <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                        <h5 className="m-0 fw-bold text-dark">Thông tin thiết bị</h5>
                        <span className={`badge fs-6 ${warrantyInfo.warrantyStatus === 'Còn bảo hành' ? 'bg-success' : 'bg-danger'}`}>
                            {warrantyInfo.warrantyStatus}
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between px-0">
                                        <span className="text-secondary fw-medium">Sản phẩm:</span>
                                        <span className="fw-bold text-dark">{warrantyInfo.productName}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between px-0">
                                        <span className="text-secondary fw-medium">Mã IMEI:</span>
                                        <span className="fw-bold text-primary">{warrantyInfo.serialNumber}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between px-0">
                                        <span className="text-secondary fw-medium">SĐT Khách hàng:</span>
                                        <span className="fw-bold text-dark">{warrantyInfo.customerPhone || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between px-0">
                                        <span className="text-secondary fw-medium">Hạn bảo hành tới:</span>
                                        <span className="fw-bold text-danger">
                                            {new Date(warrantyInfo.warrantyEndDate).toLocaleDateString('vi-VN')}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <hr className="my-4" />
                        
                        <div className="d-flex justify-content-end gap-3">
                            <button onClick={() => handleReturn(false)} className="btn btn-outline-success">
                                <i className="fa-solid fa-box-open me-2"></i> Thu hồi (Nhập kho bán lại)
                            </button>
                            <button onClick={() => handleReturn(true)} className="btn btn-danger">
                                <i className="fa-solid fa-screwdriver-wrench me-2"></i> Thu hồi (Hàng lỗi)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWarranty;