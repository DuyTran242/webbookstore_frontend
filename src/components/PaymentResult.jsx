import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const PaymentResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState({ loading: true, success: false, message: '' });

   useEffect(() => {
        // Lấy tham số từ URL
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get('status');
        const message = queryParams.get('message');

        // Vì Backend đã xử lý xong và truyền kết quả qua URL, 
        // ta chỉ cần đọc 'status' để hiển thị giao diện.
        if (status === 'success') {
            setResult({ 
                loading: false, 
                success: true, 
                message: 'Thanh toán đơn hàng thành công!' 
            });
        } else {
            // Trường hợp status = 'failed' hoặc 'error'
            setResult({ 
                loading: false, 
                success: false, 
                message: message || 'Thanh toán không thành công hoặc đã bị hủy.' 
            });
        }
    }, [location]);

    if (result.loading) {
        return (
            <div className="container text-center mt-5" style={{ minHeight: '50vh', paddingTop: '100px' }}>
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 fw-bold">Đang xác nhận thanh toán từ VNPAY...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5 text-center">
            <div className="card shadow border-0 p-5" style={{ borderRadius: '20px', maxWidth: '600px', margin: '0 auto' }}>
                {result.success ? (
                    <div>
                        <i className="fa-solid fa-circle-check text-success" style={{ fontSize: '5rem' }}></i>
                        <h2 className="fw-bold mt-4 text-success">Thanh toán thành công!</h2>
                        <p className="text-secondary">Cảm ơn bạn đã tin tưởng mua hàng. Đơn hàng của bạn đã được xác nhận và đang chờ xử lý.</p>
                    </div>
                ) : (
                    <div>
                        <i className="fa-solid fa-circle-xmark text-danger" style={{ fontSize: '5rem' }}></i>
                        <h2 className="fw-bold mt-4 text-danger">Thanh toán thất bại</h2>
                        <p className="text-secondary">{result.message}</p>
                    </div>
                )}

                <div className="mt-4 d-flex gap-3 justify-content-center">
                    <Link to="/" className="btn btn-outline-dark px-4 py-2" style={{ borderRadius: '8px' }}>
                        QUAY LẠI TRANG CHỦ
                    </Link>
                    {result.success && (
                        <button 
                            onClick={() => navigate('/lich-su-don-hang')} 
                            className="btn text-white px-4 py-2" 
                            style={{ backgroundColor: '#0f4f34', borderRadius: '8px' }}
                        >
                            XEM ĐƠN HÀNG
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;