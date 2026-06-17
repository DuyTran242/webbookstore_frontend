import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const ThanhToan = () => {
    const { state } = useLocation(); // Nhận { cartItems, totalAmount, note } từ GioHang
    const navigate = useNavigate();

    // 1. Quản lý thông tin khách hàng và địa chỉ
    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        phone: '',
        email: '',
        addressDetail: '',
        provinceId: '',
        districtId: '',
        wardCode: ''
    });

    // 2. Quản lý dữ liệu vị trí từ GHN
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [shippingFee, setShippingFee] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('VNPAY');
    const [loading, setLoading] = useState(false);

    // --- STATE CHO MÃ GIẢM GIÁ ---
    const [discountCodeInput, setDiscountCodeInput] = useState('');
    const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [availableCodes, setAvailableCodes] = useState([]);
    const [showDiscountModal, setShowDiscountModal] = useState(false);

    // Thông tin cấu hình GHN
    const GHN_TOKEN = 'ba02cff9-378b-11f1-a973-aee5264794df';
    const SHOP_ID = 199945;
    // Lưu ý: Đổi 'Token' thành 'token' (viết thường) để chuẩn form header
    const GHN_HEADERS = { 'token': GHN_TOKEN, 'ShopId': String(SHOP_ID) };

    // --- EFFECT: Lấy danh sách Tỉnh/Thành khi trang vừa load ---
    useEffect(() => {
        // Đã đổi URL thành /api-ghn để gọi qua Proxy
        axios.get('https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province', { headers: GHN_HEADERS })
            .then(res => setProvinces(res.data.data || []))
            .catch(err => console.error("Lỗi lấy tỉnh thành", err));

        // Lấy danh sách mã giảm giá đang hoạt động
        axios.get('http://localhost:8080/api/discounts/active')
            .then(res => {
                // Lọc bỏ những mã đã hết lượt sử dụng
                const validCodes = res.data.filter(code => !code.usageLimit || code.usageLimit > code.usedCount);
                setAvailableCodes(validCodes);
            })
            .catch(err => console.error("Lỗi lấy mã giảm giá", err));
    }, []);

    // --- HANDLE: Khi chọn Tỉnh -> Lấy Huyện ---
    const handleProvinceChange = (e) => {
        const pId = e.target.value;
        setCustomerInfo({ ...customerInfo, provinceId: pId, districtId: '', wardCode: '' });
        setDistricts([]);
        setWards([]);
        setShippingFee(0);

        if (!pId) return; // Nếu chọn lại giá trị rỗng thì không gọi API

        // Đã đổi URL thành /api-ghn
        axios.get(`https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${pId}`, { headers: GHN_HEADERS })
            .then(res => setDistricts(res.data.data || []))
            .catch(err => console.error("Lỗi lấy huyện", err));
    };

    // --- HANDLE: Khi chọn Huyện -> Lấy Xã ---
    const handleDistrictChange = (e) => {
        const dId = e.target.value;
        setCustomerInfo({ ...customerInfo, districtId: dId, wardCode: '' });
        setWards([]);
        setShippingFee(0);

        if (!dId) return; // Nếu chọn lại giá trị rỗng thì không gọi API

        // Đã đổi URL thành /api-ghn
        axios.get(`https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${dId}`, { headers: GHN_HEADERS })
            .then(res => setWards(res.data.data || []))
            .catch(err => console.error("Lỗi lấy xã", err));
    };

    // --- HANDLE: Khi chọn Xã -> Tính phí vận chuyển ---
    const handleWardChange = (e) => {
        const wCode = e.target.value;
        setCustomerInfo({ ...customerInfo, wardCode: wCode });

        if (wCode) {
            calculateShipping(customerInfo.districtId, wCode);
        } else {
            setShippingFee(0);
        }
    };

    // --- HÀM TÍNH PHÍ VẬN CHUYỂN ---
    const calculateShipping = async (dId, wCode) => {
        // 1. Chặn ngay nếu chưa chọn đủ Quận/Huyện và Phường/Xã
        if (!dId || !wCode) {
            return; // Không làm gì cả, đợi người dùng chọn xong mới gọi API
        }

        try {
            const res = await axios.post('https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
                {
                    "from_district_id": 1454, // ID Quận gửi hàng
                    "to_district_id": parseInt(dId),
                    "to_ward_code": String(wCode), // Mã phường của GHN bắt buộc phải là dạng Chuỗi (String)
                    "service_type_id": 2, // ĐỔI SANG DÙNG CÁI NÀY: 2 = Giao hàng chuẩn E-commerce
                    "weight": 1000,
                    "length": 20,
                    "width": 20,
                    "height": 10
                }, { headers: GHN_HEADERS });

            setShippingFee(res.data.data.total);
        } catch (error) {
            // 2. In ra lỗi chi tiết từ server GHN để dễ bắt bệnh (xem trong tab Console)
            console.error("Chi tiết lỗi API tính phí GHN:", error.response?.data || error.message);
            Swal.fire("Thông báo", "Vùng này hiện chưa hỗ trợ giao hàng!", "warning");
            setShippingFee(0);
        }
    };

    // --- HÀM ÁP DỤNG MÃ GIẢM GIÁ ---
    const handleApplyDiscount = async (codeFromButton) => {
        const codeToApply = typeof codeFromButton === 'string' ? codeFromButton : discountCodeInput.trim();
        if (!codeToApply) {
            return Swal.fire("Lỗi", "Vui lòng nhập mã giảm giá", "warning");
        }
        try {
            const res = await axios.post('http://localhost:8080/api/discounts/apply', {
                code: codeToApply,
                subtotal: state.totalAmount
            });
            if (res.data.success) {
                setAppliedDiscountCode(codeToApply);
                setDiscountCodeInput(codeToApply);
                setDiscountAmount(res.data.discountAmount);
                setShowDiscountModal(false); // Đóng modal khi áp dụng thành công
                Swal.fire("Thành công", res.data.message, "success");
            } else {
                Swal.fire("Lỗi", res.data.message, "error");
                setAppliedDiscountCode('');
                setDiscountAmount(0);
            }
        } catch (error) {
            Swal.fire("Lỗi", error.response?.data?.message || "Mã giảm giá không hợp lệ", "error");
            setAppliedDiscountCode('');
            setDiscountAmount(0);
        }
    };

    // --- HÀM ĐẶT HÀNG ---
    const handlePlaceOrder = async () => {
        if (!customerInfo.wardCode || !customerInfo.fullName || !customerInfo.phone || !customerInfo.addressDetail) {
            return Swal.fire("Chú ý", "Vui lòng nhập đầy đủ thông tin và địa chỉ!", "warning");
        }

        setLoading(true);

        // Cẩn thận với userSession, nếu người dùng chưa đăng nhập có thể lỗi
        const userSession = JSON.parse(localStorage.getItem('userSession'));

        const orderRequestDTO = {
            userId: userSession ? userSession.id : null,
            fullName: customerInfo.fullName,
            phone: customerInfo.phone,
            email: customerInfo.email,
            address: `${customerInfo.addressDetail}, ${customerInfo.wardCode}, ${customerInfo.districtId}, ${customerInfo.provinceId}`,
            shippingFee: shippingFee,
            totalPrice: state.totalAmount + shippingFee - discountAmount,
            discountCode: appliedDiscountCode,
            discountAmount: discountAmount,
            paymentMethod: paymentMethod,
            note: state.note || "",
            items: state.cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            }))
        };

        try {
            // Gửi dữ liệu xuống Backend (Spring Boot)
            const response = await axios.post('http://localhost:8080/api/orders/create', orderRequestDTO);

            if (paymentMethod === 'VNPAY') {
                // Backend trả về link VNPAY
                window.location.href = response.data.paymentUrl;
            } else {
                Swal.fire('Thành công!', 'Đơn hàng của bạn đã được ghi nhận.', 'success');
                navigate('/');
            }
        } catch (error) {
            console.error("Lỗi tạo đơn hàng:", error);
            Swal.fire('Lỗi', 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatVND = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + "đ";

    // Nếu không có state (người dùng truy cập trực tiếp url /thanh-toan mà không qua giỏ hàng)
    if (!state || !state.cartItems) {
        return <div className="container mt-5 text-center"><h5>Chưa có sản phẩm nào để thanh toán.</h5></div>;
    }

    return (
        <div className="container mt-5 mb-5">
            <div className="row">
                {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG */}
                <div className="col-md-7">
                    <h4 className="fw-bold mb-4 text-uppercase" style={{ color: '#0f4f34' }}>Thông tin thanh toán</h4>

                    <div className="row g-3">
                        <div className="col-12">
                            <input type="text" className="form-control" placeholder="Họ và tên người nhận"
                                onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })} />
                        </div>
                        <div className="col-md-6">
                            <input type="text" className="form-control" placeholder="Số điện thoại"
                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
                        </div>
                        <div className="col-md-6">
                            <input type="email" className="form-control" placeholder="Email (không bắt buộc)"
                                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} />
                        </div>

                        {/* SELECT ĐỊA CHỈ */}
                        <div className="col-md-4">
                            <select className="form-select" onChange={handleProvinceChange} value={customerInfo.provinceId}>
                                <option value="">Chọn Tỉnh/Thành</option>
                                {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <select className="form-select" onChange={handleDistrictChange} value={customerInfo.districtId} disabled={!districts.length}>
                                <option value="">Chọn Quận/Huyện</option>
                                {districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <select className="form-select" onChange={handleWardChange} value={customerInfo.wardCode} disabled={!wards.length}>
                                <option value="">Chọn Phường/Xã</option>
                                {wards.map(w => <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>)}
                            </select>
                        </div>
                        <div className="col-12">
                            <input type="text" className="form-control" placeholder="Số nhà, tên đường..."
                                onChange={(e) => setCustomerInfo({ ...customerInfo, addressDetail: e.target.value })} />
                        </div>
                    </div>

                    <h5 className="fw-bold mt-4 mb-3">Phương thức thanh toán</h5>
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="form-check mb-2">
                                <input className="form-check-input" type="radio" name="pay" id="vnpay" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} />
                                <label className="form-check-label" htmlFor="vnpay">Thanh toán qua cổng VNPAY (ATM/QR-Code)</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="pay" id="cod" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                <label className="form-check-label" htmlFor="cod">Thanh toán khi nhận hàng (COD)</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
                <div className="col-md-5">
                    <div className="card shadow-sm border-0 p-4" style={{ borderRadius: '15px', backgroundColor: '#f8f9fa' }}>
                        <h5 className="fw-bold border-bottom pb-3">Đơn hàng của bạn</h5>

                        <div className="mt-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {state.cartItems.map(item => (
                                <div key={item.id} className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="position-relative">
                                            <img src={item.imageUrl} alt={item.productName} className="rounded" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary">{item.quantity}</span>
                                        </div>
                                        <span className="ms-3 small fw-bold">{item.productName}</span>
                                    </div>
                                    <span className="small">{formatVND(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <hr />
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-secondary">Tạm tính</span>
                            <span>{formatVND(state.totalAmount)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-secondary">Phí vận chuyển (GHN)</span>
                            <span className="text-primary fw-bold">+{formatVND(shippingFee)}</span>
                        </div>

                        {/* MÃ GIẢM GIÁ */}
                        <div className="mt-3 mb-3 border p-3 rounded bg-white">
                            <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>Mã giảm giá</h6>
                            <div className="d-flex gap-2">
                                <input type="text" className="form-control text-uppercase" placeholder="Nhập mã..." 
                                    value={discountCodeInput} onChange={(e) => setDiscountCodeInput(e.target.value)}
                                    disabled={appliedDiscountCode !== ''}
                                />
                                {appliedDiscountCode !== '' ? (
                                    <button className="btn btn-danger text-nowrap" onClick={() => {
                                        setAppliedDiscountCode('');
                                        setDiscountCodeInput('');
                                        setDiscountAmount(0);
                                    }}>Hủy</button>
                                ) : (
                                    <>
                                        <button className="btn btn-dark text-nowrap" onClick={() => handleApplyDiscount()}>Áp dụng</button>
                                        <button className="btn btn-outline-primary text-nowrap" onClick={() => setShowDiscountModal(true)}>
                                            <i className="fa-solid fa-list me-1"></i>Chọn mã
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {discountAmount > 0 && (
                            <div className="d-flex justify-content-between mb-2 text-success">
                                <span>Mã giảm giá ({appliedDiscountCode})</span>
                                <span className="fw-bold">-{formatVND(discountAmount)}</span>
                            </div>
                        )}

                        <hr />
                        <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="fw-bold fs-5">TỔNG CỘNG</span>
                            <span className="fw-bold fs-4 text-danger">{formatVND(Math.max(0, state.totalAmount + shippingFee - discountAmount))}</span>
                        </div>

                        <button
                            disabled={loading}
                            onClick={handlePlaceOrder}
                            className="btn w-100 mt-4 py-3 fw-bold text-white shadow-sm"
                            style={{ backgroundColor: '#0f4f34', borderRadius: '10px' }}>
                            {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DANH SÁCH MÃ GIẢM GIÁ */}
            {showDiscountModal && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content border-0 shadow">
                                <div className="modal-header bg-light">
                                    <h5 className="modal-title fw-bold" style={{ color: '#0f4f34' }}>
                                        <i className="fa-solid fa-ticket me-2"></i>Chọn mã giảm giá
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowDiscountModal(false)}></button>
                                </div>
                                <div className="modal-body bg-light">
                                    {availableCodes.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {availableCodes.map(code => (
                                                <div key={code.id} className="card border-0 shadow-sm" style={{ borderRadius: '10px' }}>
                                                    <div className="card-body p-3 d-flex align-items-center">
                                                        <div className="bg-success text-white d-flex flex-column justify-content-center align-items-center rounded me-3" style={{ minWidth: '70px', height: '70px' }}>
                                                            <span className="fw-bold fs-5">{code.discountPercentage}%</span>
                                                            <span style={{ fontSize: '10px' }}>GIẢM</span>
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <h6 className="fw-bold mb-1 border border-success text-success px-2 py-1 rounded" style={{ fontSize: '13px', display: 'inline-block' }}>{code.code}</h6>
                                                                <button 
                                                                    className="btn btn-sm btn-success rounded-pill px-3 py-1" 
                                                                    style={{ fontSize: '12px' }}
                                                                    onClick={() => handleApplyDiscount(code.code)}
                                                                >
                                                                    Dùng ngay
                                                                </button>
                                                            </div>
                                                            <p className="text-muted mb-1 mt-2" style={{ fontSize: '12px' }}>
                                                                {code.description}
                                                            </p>
                                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                                <span className="text-danger fw-medium" style={{ fontSize: '11px' }}>
                                                                    {code.usageLimit ? `Còn lại: ${Math.max(0, code.usageLimit - code.usedCount)} lượt` : 'Vô hạn lượt dùng'}
                                                                </span>
                                                                <span className="text-primary" style={{ fontSize: '11px' }}>
                                                                    {code.minOrderValue > 0 ? `Đơn tối thiểu ${formatVND(code.minOrderValue)}` : 'Áp dụng mọi đơn hàng'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted my-5">
                                            <i className="fa-solid fa-box-open fs-1 mb-3 text-light"></i>
                                            <p>Hiện không có mã giảm giá nào phù hợp cho bạn.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ThanhToan;