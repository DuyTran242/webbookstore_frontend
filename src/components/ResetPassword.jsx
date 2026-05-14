import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ''; // Lấy email từ trang trước truyền sang

  // Nếu không có email (truy cập thẳng link), đá về trang quên pass
  if (!email) {
    navigate('/forgot-password');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setLoading(true);
      await axios.post('http://localhost:8080/api/auth/reset-password', {
        email: email,
        otp: otp,
        newPassword: newPassword
      });
      setLoading(false);
      
      // Hiển thị modal thành công
      setSuccessMsg(true);

    } catch (error) {
      setLoading(false);
      const errRes = error.response?.data;
      if (errRes === 'INVALID_OTP') {
        setErrorMsg('Mã xác thực không chính xác. Vui lòng kiểm tra lại!');
      } else if (errRes === 'EXPIRED_OTP') {
        setErrorMsg('Mã xác thực đã hết hạn. Vui lòng quay lại để gửi mã mới.');
      } else {
        setErrorMsg('Có lỗi xảy ra, vui lòng thử lại.');
      }
    }
  };

  const handleCloseSuccess = () => {
    setSuccessMsg(false);
    navigate('/login'); // Cập nhật xong thì đá về login
  };

  return (
    <div className="forgot-password-page bg-white pb-5 position-relative">
      <div className="border-bottom py-3 mb-5">
        <div className="container">
          <small className="text-uppercase" style={{ fontSize: '12px' }}>
            <Link to="/" className="text-decoration-none text-muted">Trang chủ</Link> 
            <span className="mx-2 text-muted">/</span> 
            <strong className="text-dark">Khôi phục mật khẩu</strong>
          </small>
        </div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card border-0 shadow-sm" style={{ border: '1px solid #eaeaea', borderRadius: '8px' }}>
              <div className="card-body p-4 p-md-5">
                <h3 className="text-center mb-3" style={{ fontFamily: 'serif', fontWeight: 'bold' }}>Tạo mật khẩu mới</h3>
                <p className="text-center text-muted mb-4" style={{ fontSize: '14px' }}>
                  Mã OTP đã được gửi đến email <strong>{email}</strong>. Vui lòng kiểm tra hộp thư.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ fontSize: '14px' }}>Mã xác thực (OTP)<span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control py-2 shadow-none"
                      placeholder="Nhập 6 số OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ fontSize: '14px' }}>Mật khẩu mới<span className="text-danger">*</span></label>
                    <input
                      type="password"
                      className="form-control py-2 shadow-none"
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn w-100 text-white fw-bold py-2 mb-3"
                    style={{ backgroundColor: '#00583b' }}
                    disabled={loading}
                  >
                    {loading ? 'ĐANG XỬ LÝ...' : 'CẬP NHẬT MẬT KHẨU'}
                  </button>
                  <div className="text-center mt-2">
                    <span className="text-muted" style={{ fontSize: '14px' }}>Không nhận được mã? </span>
                    <Link to="/forgot-password" className="text-decoration-none" style={{ color: '#00583b', fontSize: '14px' }}>Thử lại.</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Lỗi */}
      {errorMsg && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center py-4">
              <div className="modal-body">
                <i className="fa-solid fa-circle-xmark text-danger mb-3" style={{ fontSize: '40px' }}></i>
                <h5 className="mb-3">Mã không hợp lệ!</h5>
                <p className="text-muted">{errorMsg}</p>
                <button className="btn text-white mt-3 px-4" style={{ backgroundColor: '#00583b' }} onClick={() => setErrorMsg('')}>Thử lại</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thành công */}
      {successMsg && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center py-4">
              <div className="modal-body">
                <i className="fa-solid fa-circle-check text-success mb-3" style={{ fontSize: '40px' }}></i>
                <h5 className="mb-3">Cập nhật thành công!</h5>
                <p className="text-muted">Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại.</p>
                <button className="btn text-white mt-3 px-4" style={{ backgroundColor: '#00583b' }} onClick={handleCloseSuccess}>Đóng & Đăng nhập</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;