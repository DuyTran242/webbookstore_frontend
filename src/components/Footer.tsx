import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="wolfbed-footer pt-5 pb-3">
      <div className="container text-center text-white mb-5">
        <h4 className="fw-bold mb-3">Book Store</h4>
        <p className="footer-intro mx-auto" style={{ maxWidth: '800px' }}>
          Mua Sách, Văn phòng phẩm & Phụ kiện chính hãng đến ngay Book Store. Tư vấn cá nhân hoá, 
          Đổi trả dễ, Giao tận nơi, Giá ưu đãi, Hỗ trợ trả góp 0%!
        </p>
        
        <h5 className="mt-4 mb-3 fw-bold">Hotline hỗ trợ</h5>
        <div className="hotline-container d-flex flex-wrap justify-content-center gap-3">
          <div className="hotline-box">
            <small>Tư vấn mua hàng (Miễn phí)</small>
            <div className="phone">1900 6750 <span>(Nhánh 1)</span></div>
          </div>
          <div className="hotline-box">
            <small>Hỗ trợ kỹ thuật</small>
            <div className="phone">1900 6750 <span>(Nhánh 2)</span></div>
          </div>
          <div className="hotline-box">
            <small>Góp ý, khiếu nại</small>
            <div className="phone">1900 6750 <span>(8h00 - 22h00)</span></div>
          </div>
        </div>
      </div>

      <div className="container main-footer">
        <div className="row">
          {/* Cột 1: Thông tin liên hệ */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="footer-title">Home Living</h6>
            <ul className="list-unstyled footer-contact">
              <li><i className="fa-regular fa-envelope me-2"></i> bookstore@book.vn</li>
              <li><i className="fa-solid fa-location-dot me-2"></i> 70 Lữ Gia, Phường 15, Quận 11, Thành phố Hồ Chí Minh</li>
              <li><i className="fa-solid fa-phone me-2"></i> 1900 6750</li>
            </ul>
          </div>

          {/* Cột 2: Về chúng tôi */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="footer-title">VỀ CHÚNG TÔI</h6>
            <ul className="list-unstyled footer-links">
              <li><a href="#">Giới thiệu</a></li>
              <li><a href="#">Chứng nhận & Giải thưởng</a></li>
              <li><a href="#">Hệ thống cửa hàng</a></li>
              <li><a href="#">Liên hệ</a></li>
              <li><a href="#">Tin khuyến mãi</a></li>
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="footer-title">CHÍNH SÁCH BÁN HÀNG</h6>
            <ul className="list-unstyled footer-links">
              <li><a href="#">Chính sách bảo hành</a></li>
              <li><a href="#">Chính sách đổi trả</a></li>
              <li><a href="#">Chính sách giao hàng</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Điều khoản và điều kiện</a></li>
            </ul>
          </div>

          {/* Cột 4: Dịch vụ */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="footer-title">DỊCH VỤ VÀ THÔNG TIN KHÁC</h6>
            <ul className="list-unstyled footer-links">
              <li><a href="#">Chính sách vận chuyển</a></li>
              <li><a href="#">Chính sách trả góp</a></li>
              <li><a href="#">Khách hàng thân thiết</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
              <li><a href="#">Chính sách đặt cọc/hủy/đổi/trả</a></li>
            </ul>
          </div>
        </div>

        <div className="row mt-4 align-items-end">
          {/* Kết nối */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="footer-title">KẾT NỐI VỚI WOLF BED</h6>
            <div className="social-icons d-flex gap-2">
              <a href="#" className="social-btn fb"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="social-btn ins"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="social-btn shopee">S</a>
              <a href="#" className="social-btn lazada">L</a>
              <a href="#" className="social-btn tiktok"><i className="fa-brands fa-tiktok"></i></a>
            </div>
          </div>

          {/* Thanh toán */}
          <div className="col-lg-5 col-md-6 mb-4">
            <h6 className="footer-title">PHƯƠNG THỨC THANH TOÁN</h6>
            <div className="payment-methods">
               {/* Thay thế bằng ảnh icon thật nếu có */}
               <span className="pay-tag vnpay">VNPAY</span>
               <span className="pay-tag zalopay">ZaloPay</span>
               <span className="pay-tag momo">MoMo</span>
               <span className="pay-tag visa">VISA</span>
               <span className="pay-tag master">MasterCard</span>
               <span className="pay-tag amex">AMEX</span>
            </div>
          </div>

          {/* QR App */}
          <div className="col-lg-4 col-md-12 mb-4 d-flex align-items-center">
            <div className="qr-code me-3">
               <i className="fa-solid fa-qrcode fs-1"></i>
            </div>
            <div className="qr-text">
               <strong>ZALO MINI APPS</strong>
               <p className="mb-0 small">Quét mã QR để mua hàng nhanh chóng</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom mt-5 pt-3 border-top border-secondary">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-9">
              <p className="mb-1 small">© Bản quyền thuộc về <strong>Bookstore</strong>. Cung cấp bởi Bookstore</p>
              <p className="mb-0 x-small text-muted">Mã số Doanh nghiệp: 0314314314 do Sở Kế hoạch & Đầu tư TP Hồ Chí Minh cấp ngày 24/06/2025</p>
            </div>
            <div className="col-md-3 text-end">
               <img src="https://web.archive.org/web/20211026023249im_/http://online.gov.vn/PublicImages/2015/08/27/11/20150827110756-dathongbao.png" alt="BCT" width="120" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;