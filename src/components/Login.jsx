import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'; // Thêm import Google
import './Auth.css';

// Tách phần Content ra để dùng được hook của Google
const LoginContent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({ icon: 'warning', title: 'Sai định dạng', text: 'Vui lòng nhập email đúng định dạng (VD: ten@gmail.com)' });
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      localStorage.setItem('userSession', JSON.stringify(response.data));
      Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đăng nhập thành công!', timer: 1500, showConfirmButton: false })
        .then(() => { navigate('/'); });
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMsg = error.response.data;
        if (errorMsg === 'INVALID_CREDENTIALS') {
          Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Thông tin tài khoản hoặc mật khẩu không chính xác!' });
        } else if (errorMsg === 'NOT_ACTIVATED') {
          Swal.fire({ icon: 'info', title: 'Chưa kích hoạt', text: 'Vui lòng kiểm tra email để kích hoạt tài khoản trước!' });
        }
      }
    }
  };

  const handleFacebookSuccess = async (response) => {
    const fbUser = {
      fullName: response.name,
      username: response.name,
      phone: response.id,
      email: response.email,
      avatar: response.picture?.data?.url
    };

    try {
      const res = await axios.post('http://localhost:8080/api/auth/facebook-login', fbUser);
      localStorage.setItem('userSession', JSON.stringify(res.data));
      Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đăng nhập Facebook thành công!', timer: 1500, showConfirmButton: false })
        .then(() => { navigate('/'); });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Có lỗi xảy ra khi liên kết Facebook.' });
    }
  };

  // ==========================================
  // HÀM XỬ LÝ KHI ĐĂNG NHẬP GOOGLE THÀNH CÔNG
  // ==========================================
  const loginWithGoogleAction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // 1. Dùng Access Token để lấy thông tin chi tiết user từ Google (email, tên, avatar)
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        // 2. Gom dữ liệu theo chuẩn Entity Backend
        const googleUser = {
          email: userInfo.data.email,
          fullName: userInfo.data.name,
          username: userInfo.data.name,
          avatar: userInfo.data.picture, // Google trả về link avatar thẳng vào thuộc tính picture
          phone: userInfo.data.sub // Tạm dùng ID Google lưu vào phone để tránh rỗng nếu cần
        };

        // 3. Gửi xuống Backend
        const res = await axios.post('http://localhost:8080/api/auth/google-login', googleUser);
        
        // 4. Lưu session và chuyển trang
        localStorage.setItem('userSession', JSON.stringify(res.data));
        Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đăng nhập Google thành công!', timer: 1500, showConfirmButton: false })
          .then(() => { navigate('/'); });

      } catch (error) {
        console.error("Lỗi lấy thông tin Google:", error);
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Có lỗi xảy ra khi liên kết tài khoản Google.' });
      }
    },
    onError: error => {
      console.log('Login Google Failed:', error);
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Đăng nhập Google thất bại hoặc bị hủy.' });
    }
  });

  return (
    <div className="auth-wrapper bg-light-gray">
      <div className="breadcrumb-container">
        <Link to="/">TRANG CHỦ</Link> <span className="separator">/</span> <span className="active">ĐĂNG NHẬP TÀI KHOẢN</span>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-card shadow-sm">
              <h2 className="text-center mb-4 auth-title">Đăng nhập</h2>

              <form onSubmit={handleLogin}>
                <div className="mb-3 form-group">
                  <label>Email<span className="text-danger">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="Nhập Địa chỉ Email" required />
                </div>
                <div className="mb-3 form-group">
                  <label>Mật khẩu<span className="text-danger">*</span></label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" placeholder="Nhập Mật khẩu" required />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 form-links">
                  <Link to="/forgot-password" className="text-muted text-decoration-none" style={{ fontSize: '13px' }}>Quên mật khẩu?</Link>
                  <Link to="/register" className="register-link">Đăng ký tài khoản</Link>
                </div>

                <button type="submit" className="btn w-100 btn-submit-auth">ĐĂNG NHẬP</button>
                <p className="privacy-text text-center mt-3 mb-4">
                  Wolf Bed cam kết bảo mật và sẽ không bao giờ đăng <br className="d-none d-md-block" />
                  hay chia sẻ thông tin mà chưa có được sự đồng ý của bạn.
                </p>
              </form>

              <div className="text-center pt-3 border-top-dashed">
                <p className="text-muted mb-3">Hoặc đăng nhập qua</p>
                <div className="d-flex justify-content-center gap-2 social-login">
                  
                  <FacebookLogin
                    appId="1976532713251363"
                    fields="name,email,picture"
                    onProfileSuccess={handleFacebookSuccess}
                    onFail={(error) => console.log('Login FB Failed!', error)}
                    render={({ onClick }) => (
                      <button type="button" onClick={onClick} className="btn btn-facebook">
                        <i className="fa-brands fa-facebook-f me-2"></i> Facebook
                      </button>
                    )}
                  />

                  {/* NÚT GOOGLE SỬ DỤNG HÀM TỪ useGoogleLogin */}
                  <button type="button" onClick={() => loginWithGoogleAction()} className="btn btn-google">
                    <i className="fa-brands fa-google-plus-g me-2"></i> Google
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component bọc ngoài để cung cấp Provider cho Google Login
const Login = () => {
  return (
    // THAY CLIENT ID CỦA BẠN VÀO ĐÂY
    <GoogleOAuthProvider clientId="792782340133-ovlq78791lu2tfbu53089c8n0qd3i5rb.apps.googleusercontent.com">
      <LoginContent />
    </GoogleOAuthProvider>
  );
};

export default Login;