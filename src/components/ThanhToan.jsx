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
            // SỬA DÒNG NÀY: Đổi totalAmount thành totalPrice
            totalPrice: state.totalAmount + shippingFee,
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
                        <hr />
                        <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="fw-bold fs-5">TỔNG CỘNG</span>
                            <span className="fw-bold fs-4 text-danger">{formatVND(state.totalAmount + shippingFee)}</span>
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
        </div>
    );
};

export default ThanhToan;