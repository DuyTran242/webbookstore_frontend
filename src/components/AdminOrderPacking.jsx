import React, { useState, useEffect } from 'react';

const AdminOrderPacking = ({ orderId = 101 }) => {
    const [order, setOrder] = useState(null);
    const [scannedIMEIs, setScannedIMEIs] = useState({}); // Lưu trữ map: { orderItemId: 'IMEI_STRING' }
    const [isLoading, setIsLoading] = useState(false);

    // Giả lập fetch chi tiết đơn hàng
    useEffect(() => {
        // Dữ liệu giả lập thay cho API
        setOrder({
            id: 101,
            customerName: 'Nguyễn Văn A',
            status: 'PENDING',
            items: [
                { id: 501, name: 'Tivi Samsung 4K 65 Inch', quantity: 1, hasSerial: true },
                { id: 502, name: 'Tủ lạnh LG Inverter 500L', quantity: 1, hasSerial: true },
                { id: 503, name: 'Chảo chống dính Sunhouse', quantity: 2, hasSerial: false }
            ]
        });
    }, [orderId]);

    const handleIMEIChange = (itemId, value) => {
        setScannedIMEIs(prev => ({ ...prev, [itemId]: value }));
    };

    const handlePackOrder = async () => {
        // Kiểm tra xem đã quét đủ IMEI cho các SP yêu cầu chưa
        const missing = order.items.filter(item => item.hasSerial && !scannedIMEIs[item.id]);
        if (missing.length > 0) {
            alert(`Bạn chưa quét IMEI cho sản phẩm: ${missing.map(m => m.name).join(', ')}`);
            return;
        }

        setIsLoading(true);
        try {
            // API call giả định: Gửi map { orderItemId: SerialNumber } xuống backend
            /*
            await fetch(`http://localhost:8080/api/admin/orders/${orderId}/pack`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serialAssignments: scannedIMEIs })
            });
            */
            setTimeout(() => {
                alert("Đóng gói thành công! Các IMEI đã được xuất kho và kích hoạt bảo hành.");
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            alert("Lỗi kết nối khi đóng gói.");
            setIsLoading(false);
        }
    };

    if (!order) return <div className="p-5 text-center"><i className="fa-solid fa-spinner fa-spin fs-2"></i></div>;

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark m-0">
                    <i className="fa-solid fa-box-open text-warning me-2"></i>
                    Đóng Gói Đơn Hàng #{order.id}
                </h2>
                <span className="badge bg-warning text-dark fs-6 px-3 py-2">
                    Khách hàng: {order.customerName}
                </span>
            </div>

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                    <h5 className="m-0 fw-bold text-secondary">Danh sách sản phẩm cần đóng gói</h5>
                </div>
                <div className="card-body p-0 table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-secondary text-center">
                            <tr>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Yêu cầu IMEI</th>
                                <th style={{ width: '40%' }}>Thao tác quét / Gắn IMEI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map(item => (
                                <tr key={item.id} className="text-center">
                                    <td className="text-start fw-bold">{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>
                                        {item.hasSerial ? (
                                            <span className="badge bg-danger"><i className="fa-solid fa-fingerprint me-1"></i> Bắt buộc</span>
                                        ) : (
                                            <span className="badge bg-secondary">Không cần</span>
                                        )}
                                    </td>
                                    <td>
                                        {item.hasSerial ? (
                                            <div className="input-group">
                                                <span className="input-group-text bg-white">
                                                    <i className="fa-solid fa-barcode text-primary"></i>
                                                </span>
                                                <input 
                                                    type="text" 
                                                    className={`form-control ${scannedIMEIs[item.id] ? 'is-valid' : ''}`}
                                                    placeholder="Dùng súng quét mã vạch..."
                                                    value={scannedIMEIs[item.id] || ''}
                                                    onChange={(e) => handleIMEIChange(item.id, e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-success fw-bold">
                                                <i className="fa-solid fa-circle-check me-1"></i> Có thể xuất ngay
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="d-flex justify-content-end gap-3">
                <button className="btn btn-secondary btn-lg px-4">
                    <i className="fa-solid fa-arrow-left me-2"></i> Quay lại
                </button>
                <button className="btn btn-success btn-lg px-5" onClick={handlePackOrder} disabled={isLoading}>
                    {isLoading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : <i className="fa-solid fa-truck-fast me-2"></i>}
                    Xác nhận đóng gói & Xuất kho
                </button>
            </div>
        </div>
    );
};

export default AdminOrderPacking;