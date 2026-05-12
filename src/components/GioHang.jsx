import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Dùng để làm nút quay lại trang chủ
import Swal from 'sweetalert2';

const GioHang = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('');
    // Trong GioHang.jsx
    const navigate = useNavigate();

    // --- CẬP NHẬT: Lấy thông tin user đã đăng nhập từ localStorage ---
    const userSession = JSON.parse(localStorage.getItem('userSession'));
    // Lấy id từ userSession. Thêm dấu ? để tránh lỗi nếu userSession là null
    const userId = userSession ? userSession.id : null;

    // Mốc miễn phí vận chuyển (Ví dụ: 3.000.000đ)
    const FREE_SHIPPING_THRESHOLD = 3000000;

    // Format tiền Việt Nam
    const formatPrice = (price) => {
        if (!price) return "0đ";
        return new Intl.NumberFormat('vi-VN').format(price) + "đ";
    };
    const handleGoToCheckout = () => {
        // Chuyển sang trang thanh toán và mang theo dữ liệu giỏ hàng
        navigate('/thanh-toan', { state: { cartItems, totalAmount, note } });
    };

    // Gọi API lấy danh sách giỏ hàng
    const fetchCartItems = async () => {
        // Kiểm tra nếu chưa có userId thì không gọi API
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8080/api/cart/user/${userId}`);
            setCartItems(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, [userId]); // Thêm userId vào dependency để load lại nếu user thay đổi

    // Tính tổng tiền
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Gọi API cập nhật số lượng
    const handleQuantityChange = async (item, newQuantity) => {
        if (newQuantity <= 0) {
            handleRemoveItem(item.id);
            return;
        }
        try {
            await axios.put(`http://localhost:8080/api/cart/update/${item.id}?quantity=${newQuantity}`);
            fetchCartItems();
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Không thể cập nhật số lượng!' });
        }
    };

    // Gọi API xóa sản phẩm
    const handleRemoveItem = async (itemId) => {
        try {
            await axios.delete(`http://localhost:8080/api/cart/remove/${itemId}`);
            fetchCartItems();
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
        }
    };

    const totalAmount = calculateTotal();
    const amountNeededForFreeShipping = FREE_SHIPPING_THRESHOLD - totalAmount;
    const progressPercentage = Math.min((totalAmount / FREE_SHIPPING_THRESHOLD) * 100, 100);

    if (loading) {
        return <div className="text-center mt-5">Đang tải giỏ hàng...</div>;
    }

    // GIAO DIỆN KHI GIỎ HÀNG TRỐNG HOẶC CHƯA ĐĂNG NHẬP
    if (!userId || cartItems.length === 0) {
        return (
            <div className="container mt-5 text-center" style={{ minHeight: '50vh' }}>
                <i className="fa-solid fa-cart-shopping mb-3" style={{ fontSize: '5rem', color: '#ccc' }}></i>
                <h3 className="fw-bold mt-3">
                    {!userId ? "Bạn chưa đăng nhập" : "Giỏ hàng của bạn đang trống"}
                </h3>
                <p className="text-secondary">
                    {!userId
                        ? "Vui lòng đăng nhập để xem giỏ hàng của bạn nhé!"
                        : "Hãy quay lại trang chủ để chọn thêm các sản phẩm tuyệt vời nhé!"}
                </p>
                <Link to="/" className="btn mt-3 text-white px-4 py-2" style={{ backgroundColor: '#0f4f34', borderRadius: '5px' }}>
                    TIẾP TỤC MUA SẮM
                </Link>
            </div>
        );
    }

    // GIAO DIỆN KHI CÓ SẢN PHẨM 
    return (
        <div className="container mt-4 mb-5">
            {/* Breadcrumb */}
            <div className="mb-4 text-secondary" style={{ fontSize: '0.9rem' }}>
                <Link to="/" className="text-decoration-none text-dark">TRANG CHỦ</Link> / <span className="fw-bold">GIỎ HÀNG</span>
            </div>

            <h3 className="fw-bold mb-4">Giỏ hàng của bạn</h3>

            <div className="row">
                {/* Cột trái: Danh sách sản phẩm & Ghi chú */}
                <div className="col-lg-8 mb-4">
                    <div className="d-flex flex-column gap-3">
                        {cartItems.map((item) => (
                            <div key={item.id} className="card p-3 shadow-sm border-0" style={{ borderRadius: '10px' }}>
                                <div className="row align-items-center position-relative">
                                    {/* Ảnh sản phẩm */}
                                    <div className="col-3 col-md-2">
                                        <img
                                            src={item.imageUrl || "https://placehold.co/100"}
                                            alt={item.productName}
                                            className="img-fluid rounded object-fit-cover"
                                            style={{ width: '100%', aspectRatio: '1/1' }}
                                        />
                                    </div>

                                    {/* Thông tin sản phẩm */}
                                    <div className="col-9 col-md-10">
                                        <div className="d-flex justify-content-between">
                                            <h6 className="fw-bold text-dark mb-3 pe-4">{item.productName}</h6>
                                            {/* Nút xóa thùng rác */}
                                            <button
                                                className="btn btn-link text-success p-0 position-absolute top-0 end-0 mt-2 me-3"
                                                onClick={() => handleRemoveItem(item.id)}
                                            >
                                                <i className="fa-regular fa-trash-can fs-5"></i>
                                            </button>
                                        </div>

                                        <div className="d-flex flex-column gap-2">
                                            <div className="d-flex align-items-center">
                                                <span className="text-secondary" style={{ width: '80px' }}>Giá:</span>
                                                <span className="fw-bold text-danger">{formatPrice(item.price)}</span>
                                            </div>

                                            <div className="d-flex align-items-center">
                                                <span className="text-secondary" style={{ width: '80px' }}>Số lượng:</span>
                                                <div className="d-flex align-items-center border rounded" style={{ width: '100px', height: '32px' }}>
                                                    <button className="btn btn-sm border-0 px-2 fw-bold bg-transparent" onClick={() => handleQuantityChange(item, item.quantity - 1)}>-</button>
                                                    <input type="text" className="form-control form-control-sm text-center border-0 bg-transparent px-0 fw-semibold" value={item.quantity} readOnly />
                                                    <button className="btn btn-sm border-0 px-2 fw-bold bg-transparent" onClick={() => handleQuantityChange(item, item.quantity + 1)}>+</button>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center mt-1">
                                                <span className="text-secondary" style={{ width: '80px' }}>Tổng:</span>
                                                <span className="fw-bold text-danger">{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Khung ghi chú đơn hàng */}
                    <div className="mt-4">
                        <textarea
                            className="form-control shadow-sm border-0 p-3"
                            rows="4"
                            placeholder="Ghi chú đơn hàng:"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            style={{ borderRadius: '10px', resize: 'none' }}
                        ></textarea>
                    </div>
                </div>

                {/* Cột phải: Tóm tắt đơn hàng */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 p-4" style={{ borderRadius: '10px' }}>
                        <h5 className="fw-bold mb-4">Tóm tắt đơn hàng</h5>

                        <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                            <span className="text-secondary">Tổng tiền sản phẩm:</span>
                            <span className="fw-bold text-danger fs-5">{formatPrice(totalAmount)}</span>
                        </div>

                        {/* Thanh tiến trình Miễn phí vận chuyển */}
                        <div className="mb-4">
                            {amountNeededForFreeShipping > 0 ? (
                                <p className="small text-secondary mb-2">Thêm <span className="text-danger fw-bold">{formatPrice(amountNeededForFreeShipping)}</span> nữa để được miễn phí vận chuyển!</p>
                            ) : (
                                <p className="small text-success fw-bold mb-2">Đơn hàng của bạn đã đủ điều kiện miễn phí vận chuyển!</p>
                            )}
                            <div className="progress" style={{ height: '8px' }}>
                                <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${progressPercentage}%`, backgroundColor: '#0f4f34' }}
                                    aria-valuenow={progressPercentage}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                        </div>

                        
                        <button onClick={handleGoToCheckout} className="btn w-100 fw-bold py-2 text-white" style={{ backgroundColor: '#0f4f34' }}>
                            THANH TOÁN ĐƠN HÀNG
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GioHang;