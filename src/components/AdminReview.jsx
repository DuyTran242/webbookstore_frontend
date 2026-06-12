import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const userSession = JSON.parse(localStorage.getItem('adminSession') || localStorage.getItem('userSession'));

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/productsreview/all');
      setReviews(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Xóa bình luận?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });
    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/productsreview/${id}?userId=${userSession?.id}`);
        Swal.fire('Đã xóa', 'Bình luận đã bị xóa', 'success');
        fetchReviews();
      } catch (error) {
        Swal.fire('Lỗi', error.response?.data || 'Không thể xóa', 'error');
      }
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyContent.trim()) return Swal.fire('Lỗi', 'Vui lòng nhập nội dung!', 'warning');
    
    const payload = {
        productId: null, // Inherited from backend
        userId: userSession?.id,
        rating: 0,
        comment: replyContent,
        parentId: parentId
    };

    try {
        await axios.post('http://localhost:8080/api/productsreview', payload);
        Swal.fire('Thành công', 'Đã gửi phản hồi!', 'success');
        setReplyingTo(null);
        setReplyContent('');
        fetchReviews();
    } catch (error) {
        Swal.fire('Lỗi', 'Không thể gửi phản hồi', 'error');
    }
  };

  if (loading) return <div className="p-4 text-center">Đang tải...</div>;

  return (
    <div className="p-4 bg-white m-4 rounded shadow-sm">
      <h4 className="fw-bold mb-4" style={{ color: '#00583b' }}>Quản lý Đánh giá</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Người dùng</th>
              <th>Đánh giá</th>
              <th>Nội dung</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(rv => (
              <React.Fragment key={rv.id}>
                <tr>
                  <td>{rv.id}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                        <img src={rv.userAvatar || 'https://via.placeholder.com/30'} alt="avt" width="30" height="30" className="rounded-circle" style={{objectFit: 'cover'}} />
                        <span className="fw-bold">{rv.userName}</span>
                    </div>
                  </td>
                  <td className="text-warning">
                    {rv.rating > 0 ? Array.from({length: rv.rating}).map((_, i) => <i key={i} className="fas fa-star"></i>) : <span className="text-muted fst-italic">Phản hồi</span>}
                  </td>
                  <td>{rv.comment}</td>
                  <td>{new Date(rv.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => {setReplyingTo(replyingTo === rv.id ? null : rv.id); setReplyContent('');}}>Trả lời</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(rv.id)}>Xóa</button>
                  </td>
                </tr>
                {replyingTo === rv.id && (
                  <tr>
                    <td colSpan="6" className="bg-light">
                        <div className="d-flex gap-2">
                            <input type="text" className="form-control" placeholder="Nhập phản hồi của Admin..." value={replyContent} onChange={e => setReplyContent(e.target.value)} />
                            <button className="btn btn-primary text-nowrap" onClick={() => handleReplySubmit(rv.id)}>Gửi</button>
                        </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {reviews.length === 0 && (
                <tr><td colSpan="6" className="text-center text-muted">Chưa có đánh giá nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReview;
