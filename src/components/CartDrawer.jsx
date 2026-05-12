import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; // Thêm thư viện điều hướng của React
import './CartDrawer.css'; // Đảm bảo bạn có file CSS này cho UI trượt

const CartDrawer = ({ isCartOpen, setIsCartOpen, cartItems, fetchCartItems }) => {
    // Khởi tạo hook điều hướng
    const navigate = useNavigate();

    // Format tiền Việt Nam
    const formatPrice = (price) => {
        if (!price) return "0 đ";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Tính tổng tiền
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // GỌI API: Cập nhật số lượng
    const handleQuantityChange = async (item, newQuantity) => {
        // Nếu giảm xuống 0, tự động gọi API xóa
        if (newQuantity <= 0) {
            handleRemoveItem(item.id);
            return;
        }

        try {
            // API Khớp với @PutMapping("/update/{itemId}") trong Controller
            await axios.put(`http://localhost:8080/api/cart/update/${item.id}?quantity=${newQuantity}`);
            fetchCartItems(); // Load lại giỏ hàng
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Không thể cập nhật số lượng!' });
        }
    };

    // GỌI API: Xóa sản phẩm khỏi giỏ
    const handleRemoveItem = async (itemId) => {
        try {
            // API Khớp với @DeleteMapping("/remove/{itemId}") trong Controller
            await axios.delete(`http://localhost:8080/api/cart/remove/${itemId}`);
            fetchCartItems(); // Load lại giỏ hàng
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
        }
    };

    // Xử lý chuyển hướng đến trang giỏ hàng chi tiết
    const handleViewCart = () => {
        setIsCartOpen(false); // Đóng drawer
        
        // CẬP NHẬT: Sử dụng navigate để chuyển hướng mượt mà không bị reload lại trang
        // Lưu ý: Đổi '/gio-hang' thành đúng đường dẫn route mà bạn đã định nghĩa trong App.js cho trang GioHang.jsx
        navigate('/gio-hang'); 
    };

    return (
        <>
            {/* Lớp phủ đen mờ */}
            <div
                className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Drawer trượt ra */}
            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>

                {/* Header Drawer */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <h5 className="m-0 fw-bold text-uppercase fs-6">Giỏ hàng ({cartItems.length})</h5>
                    <button className="btn btn-sm border-0 bg-transparent" onClick={() => setIsCartOpen(false)}>
                        <i className="fa-solid fa-xmark fs-4 text-secondary"></i>
                    </button>
                </div>

                {/* Body Drawer: Danh sách sản phẩm */}
                <div className="cart-body p-3 overflow-auto" style={{ height: 'calc(100vh - 150px)' }}>
                    {cartItems.length === 0 ? (
                        <div className="text-center mt-5 text-secondary">
                            <i className="fa-solid fa-cart-shopping mb-3" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                            <h6 className="fw-bold">Chưa có sản phẩm</h6>
                            <p className="small">Hãy thêm sản phẩm vào giỏ hàng nhé.</p>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="d-flex mb-3 position-relative border p-2 rounded">

                                {/* Ảnh sản phẩm (Khớp với trường imageUrl trong CartItemResponse DTO) */}
                                <img
                                    src={item.imageUrl || "https://placehold.co/80"}
                                    alt={item.productName}
                                    className="rounded object-fit-cover me-3"
                                    style={{ width: '80px', height: '80px' }}
                                />

                                {/* Thông tin sản phẩm */}
                                <div className="flex-grow-1 pe-4">
                                    {/* Khớp với productName trong DTO */}
                                    <h6 className="mb-1 text-dark text-truncate" style={{ fontSize: '0.9rem', maxWidth: '180px' }}>
                                        {item.productName}
                                    </h6>
                                    {/* Khớp với price trong DTO */}
                                    <p className="text-danger fw-bold mb-2" style={{ fontSize: '0.9rem' }}>
                                        {formatPrice(item.price)}
                                    </p>

                                    {/* Cụm tăng giảm số lượng */}
                                    <div className="d-flex align-items-center border rounded bg-light" style={{ width: '90px' }}>
                                        <button
                                            className="btn btn-sm text-secondary border-0 px-2 fw-bold"
                                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                        >-</button>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm text-center border-0 bg-transparent px-0 fw-semibold"
                                            value={item.quantity}
                                            readOnly
                                        />
                                        <button
                                            className="btn btn-sm text-secondary border-0 px-2 fw-bold"
                                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                        >+</button>
                                    </div>
                                </div>

                                {/* Nút Xóa (Thùng rác) */}
                                <button
                                    className="btn btn-link text-danger position-absolute top-0 end-0 p-2"
                                    onClick={() => handleRemoveItem(item.id)}
                                >
                                    <i className="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>


                {/* Footer Drawer: Tổng thanh toán */}
                {cartItems.length > 0 && (
                    <div className="p-3 border-top bg-white shadow-sm position-absolute bottom-0 w-100">
                        <div className="d-flex justify-content-between mb-3 align-items-end">
                            <span className="text-secondary fw-semibold">Tổng tạm tính:</span>
                            <span className="fw-bold text-danger fs-5">{formatPrice(calculateTotal())}</span>
                        </div>
                        <button
                            className="btn w-100 fw-bold py-2 mb-2"
                            style={{ border: '1px solid #0f4f34', color: '#0f4f34', backgroundColor: 'transparent' }}
                            onClick={handleViewCart}
                        >
                            XEM GIỎ HÀNG
                        </button>
                        <button className="btn w-100 fw-bold py-2 text-white" style={{ backgroundColor: '#0f4f34' }}>
                            THANH TOÁN
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;