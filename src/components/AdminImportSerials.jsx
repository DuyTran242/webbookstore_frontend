import React, { useState, useEffect } from 'react';

const AdminImportSerials = () => {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [serialText, setSerialText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

   // Gọi API thực tế để lấy danh sách sản phẩm cần Serial
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // SỬA LẠI ĐƯỜNG DẪN API Ở ĐÂY CHO KHỚP VỚI BACK-END
                const response = await fetch('http://localhost:8080/api/admin/products/require-serial');
                
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                } else {
                    setMessage({ type: 'danger', text: 'Không thể tải danh sách sản phẩm từ máy chủ.' });
                }
            } catch (error) {
                console.error("Lỗi khi fetch sản phẩm:", error);
                setMessage({ type: 'danger', text: 'Lỗi kết nối đến máy chủ. Vui lòng kiểm tra Back-end.' });
            }
        };

        fetchProducts();
    }, []);

    // Tách chuỗi từ textarea thành mảng các IMEI (bỏ dòng trống)
    const getSerialArray = () => {
        return serialText.split('\n').map(s => s.trim()).filter(s => s !== '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const serials = getSerialArray();
        
        if (!selectedProductId) {
            setMessage({ type: 'danger', text: 'Vui lòng chọn sản phẩm!' });
            return;
        }
        if (serials.length === 0) {
            setMessage({ type: 'danger', text: 'Vui lòng nhập ít nhất 1 mã IMEI!' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`http://localhost:8080/api/admin/inventory/product/${selectedProductId}/import-serials`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                    // 'Authorization': `Bearer ${token}` // Mở comment dòng này nếu bạn dùng JWT
                },
                body: JSON.stringify({ serialNumbers: serials })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: `Đã nhập thành công ${serials.length} mã IMEI vào kho!` });
                setSerialText(''); 
                setSelectedProductId('');
            } else {
                setMessage({ type: 'danger', text: 'Có lỗi xảy ra, có thể mã IMEI bị trùng lặp!' });
            }
        } catch (error) {
            setMessage({ type: 'danger', text: 'Lỗi kết nối đến máy chủ khi lưu IMEI.' });
        } finally {
            setIsLoading(false);
        }
    };

    const serialCount = getSerialArray().length;

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <h2 className="fw-bold text-dark mb-4">
                <i className="fa-solid fa-barcode text-primary me-2"></i>
                Nhập Mã IMEI / Serial Vào Kho
            </h2>

            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3">
                            <h5 className="m-0 fw-bold text-secondary">Biểu mẫu nhập kho</h5>
                        </div>
                        <div className="card-body">
                            {message.text && (
                                <div className={`alert alert-${message.type} shadow-sm border-0`}>
                                    <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} me-2`}></i>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Chọn sản phẩm <span className="text-danger">*</span></label>
                                    <select 
                                        className="form-select form-select-lg" 
                                        value={selectedProductId} 
                                        onChange={(e) => setSelectedProductId(e.target.value)}
                                        disabled={products.length === 0}
                                    >
                                        <option value="">
                                            {products.length === 0 ? "Đang tải dữ liệu..." : "-- Chọn sản phẩm cần nhập IMEI --"}
                                        </option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>#{p.id} - {p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold d-flex justify-content-between">
                                        <span>Danh sách mã IMEI (Mỗi mã 1 dòng) <span className="text-danger">*</span></span>
                                        <span className="badge bg-primary fs-6">{serialCount} mã hợp lệ</span>
                                    </label>
                                    <textarea 
                                        className="form-control text-monospace bg-light" 
                                        rows="10" 
                                        placeholder="Dùng súng quét mã vạch tít liên tục vào đây, hoặc Copy/Paste từ Excel..."
                                        value={serialText}
                                        onChange={(e) => setSerialText(e.target.value)}
                                        style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}
                                    ></textarea>
                                    <small className="text-muted mt-2 d-block">
                                        <i className="fa-solid fa-circle-info me-1"></i> Hệ thống tự động bỏ qua các dòng trống và khoảng trắng thừa.
                                    </small>
                                </div>

                                <hr className="my-4" />
                                
                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                                        {isLoading ? (
                                            <><i className="fa-solid fa-spinner fa-spin me-2"></i> Đang xử lý...</>
                                        ) : (
                                            <><i className="fa-solid fa-floppy-disk me-2"></i> Lưu {serialCount > 0 ? serialCount : ''} Mã IMEI Vào Kho</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminImportSerials;