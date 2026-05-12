import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error

  // Thêm useRef để chặn React StrictMode gọi API 2 lần
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    // Chỉ gọi API khi có token VÀ chưa từng gọi API trước đó
    if (token && !hasCalledAPI.current) {
      hasCalledAPI.current = true; // Đánh dấu là đã bắt đầu gọi API
      
      axios.get(`http://localhost:8080/api/auth/activate?token=${token}`)
        .then(() => {
          setStatus('success');
        })
        .catch((error) => {
          console.error("LỖI KÍCH HOẠT LÀ:", error);
          setStatus('error');
        });
    } else if (!token) {
      setStatus('error');
    }
  }, [token]);

  return (
    <div className="container py-5 text-center">
      {status === 'loading' && <h2>Đang xử lý kích hoạt tài khoản...</h2>}
      
      {status === 'success' && (
        <div>
          <h2 style={{ color: '#00583b' }}>Kích hoạt tài khoản thành công!</h2>
          <p className="mt-3">Tài khoản của bạn đã sẵn sàng để sử dụng.</p>
          <button 
            className="btn mt-4" 
            style={{ backgroundColor: '#00583b', color: 'white', padding: '10px 20px' }}
            onClick={() => navigate('/login')}
          >
            Quay lại trang Đăng nhập
          </button>
        </div>
      )}

      {status === 'error' && (
        <div>
          <h2 className="text-danger">Kích hoạt thất bại!</h2>
          <p className="mt-3">Mã kích hoạt không hợp lệ hoặc đã hết hạn.</p>
          <Link to="/register" className="btn btn-secondary mt-4">Quay lại trang Đăng ký</Link>
        </div>
      )}
    </div>
  );
};

export default ActivateAccount;