import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  
  // State lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Kiểm tra validation (SĐT và Email)
    const phoneRegex = /^0\d{9}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!phoneRegex.test(formData.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Sai định dạng',
        text: 'Số điện thoại phải đủ 10 số và bắt đầu bằng số 0!',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#00583b'
      });
      return;
    }

    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Sai định dạng',
        text: 'Email phải đúng định dạng @gmail.com!',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#00583b'
      });
      return;
    }

    // 2. Gửi API đăng ký
    try {
      const payload = {
        fullName: `${formData.lastName} ${formData.firstName}`.trim(),
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        username: formData.email.split('@')[0], // Lấy phần trước @ làm username tạm
        provider: 'LOCAL'
      };

      await axios.post('http://localhost:8080/api/auth/register', payload);

      // 3. Thông báo thành công nếu DB chưa có
      Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công!',
        text: 'Chúc mừng bạn đã đăng ký tài khoản thành công. Vui lòng truy cập email vừa đăng ký để kích hoạt tài khoản.',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#00583b'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login'); // Chuyển về login khi bấm Đóng
        }
      });

    } catch (error) {
      // 4. Xử lý lỗi trùng lặp từ Backend trả về
      if (error.response && error.response.data) {
        const errorType = error.response.data;
        let errorMsg = 'Đã có lỗi xảy ra, vui lòng thử lại.';
        
        if (errorType === 'EMAIL_EXISTS') {
          errorMsg = 'Email này đã được sử dụng!';
        } else if (errorType === 'PHONE_EXISTS') {
          errorMsg = 'Số điện thoại này đã được sử dụng!';
        }

        Swal.fire({
          icon: 'warning',
          title: 'Thông báo',
          text: errorMsg,
          confirmButtonText: 'Đăng ký lại',
          confirmButtonColor: '#d33' // Nút màu đỏ cho cảnh báo
        });
      }
    }
  };

  return (
    <div className="auth-wrapper bg-light-gray">
      <div className="breadcrumb-container">
        <Link to="/">TRANG CHỦ</Link> <span className="separator">/</span> <span className="active">ĐĂNG KÝ TÀI KHOẢN</span>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-card shadow-sm">
              <h2 className="text-center mb-4 auth-title">Đăng ký tài khoản</h2>
              
              <form onSubmit={handleRegister}>
                <div className="mb-3 form-group">
                  <label>Họ<span className="text-danger">*</span></label>
                  <input type="text" name="lastName" className="form-control" placeholder="Nhập Họ" required value={formData.lastName} onChange={handleChange} />
                </div>
                
                <div className="mb-3 form-group">
                  <label>Tên<span className="text-danger">*</span></label>
                  <input type="text" name="firstName" className="form-control" placeholder="Nhập Tên" required value={formData.firstName} onChange={handleChange} />
                </div>
                
                <div className="mb-3 form-group">
                  <label>Số điện thoại<span className="text-danger">*</span></label>
                  <input type="tel" name="phone" className="form-control" placeholder="Nhập Số điện thoại" required value={formData.phone} onChange={handleChange} />
                </div>
                
                <div className="mb-3 form-group">
                  <label>Email<span className="text-danger">*</span></label>
                  <input type="email" name="email" className="form-control" placeholder="Nhập Địa chỉ Email" required value={formData.email} onChange={handleChange} />
                </div>
                
                <div className="mb-4 form-group">
                  <label>Mật khẩu<span className="text-danger">*</span></label>
                  <input type="password" name="password" className="form-control" placeholder="Nhập Mật khẩu" required value={formData.password} onChange={handleChange} />
                </div>
                
                <button type="submit" className="btn w-100 btn-submit-auth" style={{backgroundColor: '#00583b', color: 'white'}}>TẠO TÀI KHOẢN</button>
              </form>

              <div className="text-center mt-4 pt-3 border-top-dashed">
                <p className="text-muted mb-3">Hoặc đăng nhập qua</p>
                <div className="d-flex justify-content-center gap-2 social-login">
                  <button className="btn btn-facebook" style={{backgroundColor: '#3b5998', color: 'white', marginRight: '10px', border: 'none', padding: '8px 15px', borderRadius: '4px'}}>
                     Facebook
                  </button>
                  <button className="btn btn-google" style={{backgroundColor: '#ea4335', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px'}}>
                     Google
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

export default Register;