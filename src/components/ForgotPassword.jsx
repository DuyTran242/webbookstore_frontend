import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Validate định dạng email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); // Reset lỗi

    if (!validateEmail(email)) {
      setErrorMsg('Email không đúng định dạng. Vui lòng kiểm tra lại!');
      return;
    }

    try {
      setLoading(true);
      // Gọi API gửi OTP
      await axios.post(`http://localhost:8080/api/auth/forgot-password?email=${email}`);
      setLoading(false);
      
      // Chuyển sang trang nhập OTP, truyền email theo state
      navigate('/reset-password', { state: { email: email } });
      
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data === 'USER_NOT_FOUND') {
        setErrorMsg('Tài khoản email này không tồn tại trong hệ thống!');
      } else {
        setErrorMsg('Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    }
  };

  return (
    <div className="forgot-password-page bg-white pb-5 position-relative">
      {/* Breadcrumb */}
      <div className="border-bottom py-3 mb-5">
        <div className="container">
          <small className="text-uppercase" style={{ fontSize: '12px' }}>
            <Link to="/" className="text-decoration-none text-muted">Trang chủ</Link> 
            <span className="mx-2 text-muted">/</span> 
            <strong className="text-dark">Quên mật khẩu</strong>
          </small>
        </div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card border-0 shadow-sm" style={{ border: '1px solid #eaeaea', borderRadius: '8px' }}>
              <div className="card-body p-4 p-md-5">
                <h3 className="text-center mb-3" style={{ fontFamily: 'serif', fontWeight: 'bold' }}>Quên mật khẩu</h3>
                <p className="text-center text-muted mb-4" style={{ fontSize: '14px' }}>
                  Bạn quên mật khẩu? Nhập địa chỉ email để nhận mã xác thực.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ fontSize: '14px' }}>Email<span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className="form-control py-2 shadow-none"
                      placeholder="Nhập địa chỉ Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn w-100 text-white fw-bold py-2 mb-3"
                    style={{ backgroundColor: '#00583b' }}
                    disabled={loading}
                  >
                    {loading ? 'ĐANG GỬI...' : 'GỬI MÃ XÁC THỰC'}
                  </button>
                  <div className="text-center mt-2">
                    <span className="text-muted" style={{ fontSize: '14px' }}>Quay lại </span>
                    <Link to="/login" className="text-decoration-none" style={{ color: '#00583b', fontSize: '14px' }}>tại đây.</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thông báo lỗi tuỳ chỉnh */}
      {errorMsg && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center py-4">
              <div className="modal-body">
                <i className="fa-solid fa-circle-exclamation text-danger mb-3" style={{ fontSize: '40px' }}></i>
                <h5 className="mb-3">Lỗi thao tác!</h5>
                <p className="text-muted">{errorMsg}</p>
                <button className="btn text-white mt-3 px-4" style={{ backgroundColor: '#00583b' }} onClick={() => setErrorMsg('')}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;