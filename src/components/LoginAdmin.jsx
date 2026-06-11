import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginAdmin.css';

const LoginAdmin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:8080/api/admin/login', credentials);

            if (response.data && response.data.role) {
                // Lưu thông tin admin vào session hoặc local storage
                localStorage.setItem('adminSession', JSON.stringify(response.data));
                alert(`Đăng nhập thành công với vai trò: ${response.data.role}`);
                // ✅ Sửa lại thành đường dẫn trỏ tới trang Admin của bạn
                navigate('/admin');
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data); // Lỗi từ backend ("Không có quyền", "Mật khẩu sai"...)
            } else {
                setError('Lỗi kết nối đến máy chủ!');
            }
        }
    };

    return (
        <div className="admin-login-container d-flex align-items-center justify-content-center">
            <div className="admin-login-card shadow-lg d-flex overflow-hidden">

                <div className="admin-login-image d-none d-md-block">
                    <div className="image-overlay d-flex flex-column justify-content-center align-items-center text-white p-4">
                        <h2 className="fw-bold mb-3">BOOK STORE</h2>
                        <p className="text-center">Hệ thống quản trị nội dung & Đơn hàng</p>
                    </div>
                </div>

                <div className="admin-login-form p-5 bg-white d-flex flex-column justify-content-center">
                    <div className="text-center mb-4">
                        <i className="fa-solid fa-user-shield fs-1 mb-2" style={{ color: '#00583b' }}></i>
                        <h3 className="fw-bold" style={{ color: '#00583b' }}>Admin Portal</h3>
                        <p className="text-muted small">Vui lòng đăng nhập để tiếp tục</p>
                    </div>

                    {error && <div className="alert alert-danger py-2 text-center small">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label text-muted small fw-bold">Email quản trị</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="fa-regular fa-envelope text-muted"></i>
                                </span>
                                <input
                                    type="email"
                                    className="form-control bg-light border-start-0"
                                    name="email"
                                    placeholder="Nhập email"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold">Mật khẩu</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="fa-solid fa-lock text-muted"></i>
                                </span>
                                <input
                                    type="password"
                                    className="form-control bg-light border-start-0"
                                    name="password"
                                    placeholder="Nhập mật khẩu"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn w-100 fw-bold text-white mb-3" style={{ backgroundColor: '#00583b', padding: '10px' }}>
                            ĐĂNG NHẬP
                        </button>

                        <div className="text-center">
                            <span className="text-muted small" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                                <i className="fa-solid fa-arrow-left me-1"></i> Quay lại trang chủ
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginAdmin;