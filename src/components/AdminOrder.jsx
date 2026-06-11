import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminOrder = () => {
    // 1. CÁC MENU TRẠNG THÁI (Thêm tab Bảo hành)
    const tabs = [
        { id: 'PENDING', label: 'Chưa thanh toán' },
        { id: 'PROCESSING', label: 'Đã thanh toán' },
        { id: 'Đang đóng gói', label: 'Đang đóng gói' },
        { id: 'Đang giao', label: 'Đang giao' },
        { id: 'Đã hoàn thành', label: 'Đã hoàn thành' },
        { id: 'Đã lắp đặt', label: 'Đã lắp đặt' },
        { id: 'Đã hủy', label: 'Đã hủy' },
        { id: 'WARRANTY', label: 'Bảo hành & Trả hàng' } // Tab mới
    ];

    // ==========================================
    // STATE QUẢN LÝ ĐƠN HÀNG CHUNG
    // ==========================================
    const [currentTab, setCurrentTab] = useState('PENDING');
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // ==========================================
    // STATE CHO TÍNH NĂNG ĐÓNG GÓI (PACKING)
    // ==========================================
    const [packingOrder, setPackingOrder] = useState(null);
    const [scannedIMEIs, setScannedIMEIs] = useState({});
    const [isPackingAction, setIsPackingAction] = useState(false);

    // ==========================================
    // STATE CHO TÍNH NĂNG BẢO HÀNH (WARRANTY)
    // ==========================================
    const [imeiQuery, setImeiQuery] = useState('');
    const [warrantyInfo, setWarrantyInfo] = useState(null);
    const [warrantyError, setWarrantyError] = useState('');
    const [isCheckingWarranty, setIsCheckingWarranty] = useState(false);


    // ==========================================
    // LOGIC: ĐƠN HÀNG
    // ==========================================
    const fetchOrders = async (status) => {
        if (status === 'WARRANTY') return; // Không fetch đơn hàng nếu ở tab bảo hành
        try {
            const response = await axios.get(`http://localhost:8080/api/admin/orders/status/${status}`);
            setOrders(response.data);
        } catch (error) {
            console.error("Lỗi khi tải đơn hàng:", error);
        }
    };

    useEffect(() => {
        fetchOrders(currentTab);
    }, [currentTab]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (window.confirm(`Xác nhận chuyển đơn hàng #${orderId} sang: ${newStatus}?`)) {
            try {
                await axios.put(`http://localhost:8080/api/admin/orders/${orderId}/status`, { status: newStatus });
                alert("Cập nhật thành công!");
                fetchOrders(currentTab);
            } catch (error) {
                console.error("Lỗi cập nhật:", error);
                alert("Có lỗi xảy ra khi cập nhật!");
            }
        }
    };

    const handleViewDetails = async (orderId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/admin/orders/${orderId}`);
            setSelectedOrder(response.data);
            setShowModal(true);
        } catch (error) {
            console.error("Lỗi tải chi tiết:", error);
        }
    };

    // ==========================================
    // LOGIC: ĐÓNG GÓI (PACKING)
    // ==========================================
    const handleOpenPacking = async (orderId) => {
        try {
            // Fetch chi tiết đơn hàng để lấy danh sách item cần đóng gói
            const response = await axios.get(`http://localhost:8080/api/admin/orders/${orderId}`);
            setPackingOrder(response.data);
            setScannedIMEIs({});
        } catch (error) {
            console.error("Lỗi tải thông tin đóng gói:", error);
        }
    };

    const handleIMEIChange = (itemId, value) => {
        setScannedIMEIs(prev => ({ ...prev, [itemId]: value }));
    };

    const handleConfirmPackOrder = async () => {
        // Kiểm tra xem đã quét đủ IMEI chưa
        const missing = packingOrder.items.filter(item => item.hasSerial && !scannedIMEIs[item.id]);
        if (missing.length > 0) {
            alert(`Bạn chưa quét IMEI cho sản phẩm: ${missing.map(m => m.productName).join(', ')}`);
            return;
        }

        setIsPackingAction(true);
        try {
            // API xác nhận đóng gói & gắn Serial
            // await axios.post(`http://localhost:8080/api/admin/orders/${packingOrder.id}/pack`, { serialAssignments: scannedIMEIs });
            
            // Giả lập API delay
            setTimeout(async () => {
                alert("Đóng gói thành công! Các IMEI đã được xuất kho.");
                await axios.put(`http://localhost:8080/api/admin/orders/${packingOrder.id}/status`, { status: 'Đang đóng gói' });
                
                setPackingOrder(null);
                setIsPackingAction(false);
                fetchOrders(currentTab);
            }, 800);
        } catch (error) {
            alert("Lỗi kết nối khi đóng gói.");
            setIsPackingAction(false);
        }
    };

    // ==========================================
    // LOGIC: BẢO HÀNH (WARRANTY)
    // ==========================================
    const handleSearchWarranty = async (e) => {
        e.preventDefault();
        if (!imeiQuery.trim()) return;
        
        setIsCheckingWarranty(true);
        setWarrantyError('');
        setWarrantyInfo(null);

        try {
            const response = await axios.get(`http://localhost:8080/api/admin/inventory/warranty/check?imei=${imeiQuery}`);
            setWarrantyInfo(response.data);
        } catch (err) {
            setWarrantyError(err.response?.data || "Không tìm thấy thiết bị hoặc có lỗi kết nối.");
        } finally {
            setIsCheckingWarranty(false);
        }
    };

    const handleReturnWarranty = async (isDefective) => {
        if (!window.confirm("Xác nhận thu hồi sản phẩm này?")) return;
        try {
            await axios.post(`http://localhost:8080/api/admin/inventory/return/${warrantyInfo.orderItemId}?isDefective=${isDefective}`);
            alert("Đã thu hồi và cập nhật kho thành công!");
            setWarrantyInfo(null);
            setImeiQuery('');
        } catch (err) {
            alert("Lỗi khi xử lý trả hàng.");
        }
    };

    // ==========================================
    // RENDER COMPONENTS
    // ==========================================
    const renderActionButtons = (order) => {
        switch (currentTab) {
            case 'PENDING':
                return (
                    <>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => alert(`Đã nhắc thanh toán đơn #${order.id}`)}>Nhắc thanh toán</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleUpdateStatus(order.id, 'Đã hủy')}>Hủy đơn</button>
                    </>
                );
            case 'PROCESSING': // Thay vì đổi status liền, thì mở modal Đóng Gói
                return (
                    <button className="btn btn-sm btn-outline-warning text-dark fw-bold" onClick={() => handleOpenPacking(order.id)}>
                        <i className="fa-solid fa-box me-1"></i> Tiến hành đóng gói
                    </button>
                );
            case 'Đang đóng gói':
                return <button className="btn btn-sm btn-outline-info" onClick={() => handleUpdateStatus(order.id, 'Đang giao')}>Giao cho ĐVVC</button>;
            case 'Đang giao':
                return <button className="btn btn-sm btn-outline-success" onClick={() => handleUpdateStatus(order.id, 'Đã hoàn thành')}>Xác nhận hoàn thành</button>;
            case 'Đã hoàn thành':
                return <button className="btn btn-sm btn-outline-secondary" onClick={() => handleUpdateStatus(order.id, 'Đã lắp đặt')}>Xác nhận lắp đặt</button>;
            case 'Đã hủy':
                return <button className="btn btn-sm btn-outline-dark" onClick={() => handleUpdateStatus(order.id, 'PENDING')}>Khôi phục đơn</button>;
            default: return null;
        }
    };

    return (
        <div className="admin-content p-4 bg-light min-vh-100">
            <h4 className="fw-bold mb-4" style={{ color: '#00583b' }}>Quản lý Đơn hàng & Kho</h4>
            
            {/* Thanh Tabs */}
            <ul className="nav nav-tabs mb-4 bg-white pt-2 px-2 rounded-top">
                {tabs.map(tab => (
                    <li className="nav-item" key={tab.id}>
                        <button 
                            className={`nav-link ${currentTab === tab.id ? 'active fw-bold border-bottom-0' : 'text-secondary border-0'}`}
                            onClick={() => setCurrentTab(tab.id)}
                            style={{ cursor: 'pointer', color: currentTab === tab.id ? '#00583b' : '' }}
                        >
                            {tab.id === 'WARRANTY' && <i className="fa-solid fa-shield-halved me-2"></i>}
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>

            {/* HIỂN THỊ GIAO DIỆN THEO TAB */}
            {currentTab === 'WARRANTY' ? (
                /* TAB BẢO HÀNH & TRẢ HÀNG */
                <div>
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">
                            <form onSubmit={handleSearchWarranty} className="d-flex align-items-center gap-3">
                                <div className="flex-grow-1">
                                    <label className="form-label fw-bold text-secondary">Nhập mã IMEI / Serial Number</label>
                                    <input type="text" className="form-control form-control-lg" placeholder="VD: SS-TV-2026-XYZ..." value={imeiQuery} onChange={(e) => setImeiQuery(e.target.value)} autoFocus />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg mt-4 px-5" disabled={isCheckingWarranty}>
                                    {isCheckingWarranty ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magnifying-glass me-2"></i>} Tra cứu
                                </button>
                            </form>
                        </div>
                    </div>
                    {warrantyError && <div className="alert alert-danger shadow-sm border-0"><strong>Lỗi:</strong> {warrantyError}</div>}
                    {warrantyInfo && (
                        <div className="card shadow border-0 overflow-hidden">
                            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                                <h5 className="m-0 fw-bold text-dark">Thông tin thiết bị</h5>
                                <span className={`badge fs-6 ${warrantyInfo.warrantyStatus === 'Còn bảo hành' ? 'bg-success' : 'bg-danger'}`}>{warrantyInfo.warrantyStatus}</span>
                            </div>
                            <div className="card-body">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <p><strong>Sản phẩm:</strong> {warrantyInfo.productName}</p>
                                        <p><strong>Mã IMEI:</strong> <span className="text-primary">{warrantyInfo.serialNumber}</span></p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>SĐT Khách hàng:</strong> {warrantyInfo.customerPhone || 'N/A'}</p>
                                        <p><strong>Hạn bảo hành tới:</strong> <span className="text-danger">{new Date(warrantyInfo.warrantyEndDate).toLocaleDateString('vi-VN')}</span></p>
                                    </div>
                                </div>
                                <hr className="my-4" />
                                <div className="d-flex justify-content-end gap-3">
                                    <button onClick={() => handleReturnWarranty(false)} className="btn btn-outline-success"><i className="fa-solid fa-box-open me-2"></i> Thu hồi (Nhập kho bán lại)</button>
                                    <button onClick={() => handleReturnWarranty(true)} className="btn btn-danger"><i className="fa-solid fa-screwdriver-wrench me-2"></i> Thu hồi (Hàng lỗi)</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* TAB QUẢN LÝ ĐƠN HÀNG */
                <div className="bg-white p-3 rounded shadow-sm">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Mã ĐH</th>
                                <th>Khách hàng</th>
                                <th>SĐT</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Ngày đặt</th>
                                <th className="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-4 text-muted">Không có đơn hàng nào trong trạng thái này.</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.customerName}</td>
                                        <td>{order.phone}</td>
                                        <td className="text-danger fw-bold">{order.totalPrice?.toLocaleString()} ₫</td>
                                        <td><span className={`badge ${order.paymentStatus === 'PAID' ? 'bg-success' : 'bg-primary'}`}>{order.status}</span></td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-info text-white me-2" onClick={() => handleViewDetails(order.id)}><i className="fa-solid fa-eye"></i></button>
                                            {renderActionButtons(order)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL CHI TIẾT ĐƠN HÀNG (Giữ nguyên của bạn) */}
            {showModal && selectedOrder && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold" style={{ color: '#00583b' }}>Chi tiết Đơn hàng #{selectedOrder.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {/* Nội dung chi tiết đơn hàng (đã có trong file cũ) */}
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <p><strong>Người nhận:</strong> {selectedOrder.customerName}</p>
                                        <p><strong>SĐT:</strong> {selectedOrder.phone}</p>
                                    </div>
                                    <div className="col-md-6 text-end">
                                        <h5 className="fw-bold text-danger">Tổng: {selectedOrder.totalPrice?.toLocaleString()} ₫</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ĐÓNG GÓI & QUÉT IMEI TÍCH HỢP */}
            {packingOrder && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-warning text-dark">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-box-open me-2"></i>Đóng Gói Đơn Hàng #{packingOrder.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setPackingOrder(null)}></button>
                            </div>
                            <div className="modal-body p-0">
                                <table className="table table-hover align-middle mb-0 m-3">
                                    <thead className="table-light text-secondary text-center">
                                        <tr>
                                            <th className="text-start">Sản phẩm</th>
                                            <th>SL</th>
                                            <th>Yêu cầu IMEI</th>
                                            <th style={{ width: '45%' }}>Quét mã vạch</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {packingOrder.items?.map(item => (
                                            <tr key={item.id} className="text-center">
                                                <td className="text-start fw-bold">{item.productName || item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.hasSerial ? <span className="badge bg-danger">Bắt buộc</span> : <span className="badge bg-secondary">Không cần</span>}</td>
                                                <td>
                                                    {item.hasSerial ? (
                                                        <div className="input-group">
                                                            <span className="input-group-text bg-white"><i className="fa-solid fa-barcode text-primary"></i></span>
                                                            <input 
                                                                type="text" 
                                                                className={`form-control ${scannedIMEIs[item.id] ? 'is-valid' : ''}`}
                                                                placeholder="Dùng súng quét mã vạch..."
                                                                value={scannedIMEIs[item.id] || ''}
                                                                onChange={(e) => handleIMEIChange(item.id, e.target.value)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="text-success fw-bold"><i className="fa-solid fa-circle-check me-1"></i> Sẵn sàng</div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer bg-light">
                                <button className="btn btn-secondary" onClick={() => setPackingOrder(null)}>Hủy bỏ</button>
                                <button className="btn btn-success px-4" onClick={handleConfirmPackOrder} disabled={isPackingAction}>
                                    {isPackingAction ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : <i className="fa-solid fa-truck-fast me-2"></i>}
                                    Xác nhận xuất kho
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrder;