import React, { useState, useEffect, useCallback, useContext } from 'react'; // Nhớ có useCallback
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ChiTietSanPham.css';
import { CartContext } from './CartContext';

const ChiTietSanPham = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);

    // States cho phần Review
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [averageRating, setAverageRating] = useState(0);
    // Bên trong function ChiTietSanPham
    const { fetchCartItems, setIsCartOpen } = useContext(CartContext);

    // Lấy thông tin user đã đăng nhập
    const userSession = JSON.parse(localStorage.getItem('userSession'));

    // Nhớ kiểm tra ở đầu file xem đã import useCallback chưa nhé:
    // import React, { useState, useEffect, useCallback, ... } from 'react';

    // 1. Bọc toàn bộ hàm bằng useCallback và thêm [id] làm dependency
    const fetchProductData = useCallback(() => {
        fetch(`http://localhost:8080/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                const primary = data.images?.find(img => img.isPrimary === 1) || data.images?.[0];
                if (primary) setMainImage(primary.imageUrl);

                // Tính toán số sao trung bình
                if (data.reviews && data.reviews.length > 0) {
                    const totalStars = data.reviews.reduce((sum, review) => sum + review.rating, 0);
                    setAverageRating((totalStars / data.reviews.length).toFixed(1));
                } else {
                    setAverageRating(0);
                }

                // Lấy sản phẩm liên quan (Dùng data.categoryId từ ProductDetailDTO)
                if (data.categoryId) {
                    fetch(`http://localhost:8080/api/products/category/${data.categoryId}`)
                        .then(res => res.json())
                        .then(allProds => {
                            const related = allProds.filter(p => p.id !== data.id);
                            setRelatedProducts(related);
                        });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi tải chi tiết:", err);
                setLoading(false);
            });
    }, [id]); // <--- useCallback sẽ theo dõi sự thay đổi của id

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        fetchProductData();
    }, [id, fetchProductData]); // <--- Thêm fetchProductData vào đây để hết cảnh báo

    const formatPrice = (price) => price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ" : "0 đ";

    // XỬ LÝ TĂNG GIẢM SỐ LƯỢNG (Chặn min 1, max stockQuantity)
    const handleQtyChange = (type) => {
        if (type === 'minus' && quantity > 1) {
            setQuantity(quantity - 1);
        }
        if (type === 'plus') {
            if (quantity < product.stockQuantity) {
                setQuantity(quantity + 1);
            } else {
                Swal.fire({ icon: 'warning', title: 'Rất tiếc', text: `Trong kho chỉ còn ${product.stockQuantity} sản phẩm!` });
            }
        }
    };

    // KIỂM TRA ĐĂNG NHẬP TRƯỚC KHI MUA/YÊU THÍCH
    const requireLogin = (actionCallback) => {
        if (!userSession) {
            Swal.fire({
                icon: 'info',
                title: 'Yêu cầu đăng nhập',
                text: 'Bạn cần đăng nhập để thực hiện chức năng này!',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập ngay',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) navigate('/login');
            });
        } else {
            actionCallback();
        }
    };

    const handleAddToCart2 = () => {
        requireLogin(async () => {
            try {
                // Bỏ chữ null và params đi, gom dữ liệu thành 1 object truyền thẳng vào vị trí thứ 2
                await axios.post('http://localhost:8080/api/cart/add', {
                    userId: userSession.id,
                    productId: product.id,
                    quantity: quantity
                });

                // Nếu thành công
                Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã thêm vào giỏ hàng!', timer: 1500 });

                // Gọi hàm cập nhật lại state giỏ hàng ở Context (Header sẽ tự tăng số lượng)
                fetchCartItems();

                // (Tuỳ chọn) Tự động mở form giỏ hàng bên phải ra
                setIsCartOpen(true);

            } catch (error) {
                // Xử lý lỗi trả về từ ResponseEntity.badRequest() ở backend
                if (error.response && error.response.status === 400) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Thông báo',
                        text: error.response.data // "Sản phẩm đã tồn tại trong giỏ hàng của bạn."
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể thêm vào giỏ hàng lúc này.' });
                }
            }
        });
    };
    // Hàm xử lý thêm vào giỏ
    const handleAddToCart = async () => {
        // 1. Kiểm tra User đã đăng nhập chưa
        const storedUserSession = localStorage.getItem('userSession');

        if (!storedUserSession) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa đăng nhập',
                text: 'Vui lòng đăng nhập để thêm vào giỏ hàng!'
            });
            return;
        }

        const user = JSON.parse(storedUserSession);

        // 2. Gom dữ liệu theo CHUẨN ĐÚNG CỦA AddToCartRequest DTO (Back-end)
        const requestData = {
            userId: user.id,
            productId: product.id,
            quantity: quantity
        };

        try {
            // 3. Gọi API Add
            // Khớp với @PostMapping("/add") trong Controller
            await axios.post('http://localhost:8080/api/cart/add', requestData);

            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã thêm sản phẩm vào giỏ hàng.',
                timer: 1500,
                showConfirmButton: false
            });

            // 4. Phát sự kiện để Header tự động load lại số lượng giỏ hàng
            window.dispatchEvent(new Event('cartUpdated'));

        } catch (error) {
            console.error("Lỗi thêm vào giỏ hàng:", error);
            // Hiển thị lỗi từ Back-end (Ví dụ: Sản phẩm đã tồn tại)
            const errorMsg = error.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại!';
            Swal.fire({ icon: 'error', title: 'Thất bại', text: errorMsg });
        }
    };

    // XỬ LÝ SUBMIT BÌNH LUẬN
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewContent.trim()) {
            Swal.fire({ icon: 'warning', title: 'Lỗi', text: 'Vui lòng nhập nội dung đánh giá!' });
            return;
        }

        const payload = {
            productId: product.id,
            userId: userSession ? userSession.id : null, // Nếu có session gởi ID, không có gởi null (Khách)
            rating: reviewRating,
            comment: reviewContent
        };

        try {
            await axios.post('http://localhost:8080/api/productsreview', payload);
            Swal.fire({ icon: 'success', title: 'Tuyệt vời', text: 'Cảm ơn bạn đã đánh giá!', timer: 1500 });
            setReviewContent('');
            setReviewRating(5);
            fetchProductData(); // Tải lại dữ liệu để cập nhật sao và danh sách bình luận
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể gửi đánh giá lúc này.' });
        }
    };

    // Helper render ngôi sao
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(<i key={i} className={`fa-star ${i <= rating ? 'fas text-warning' : 'far text-muted'}`}></i>);
        }
        return stars;
    };

    // FIX LỖI: Tạo hàm chia mảng sản phẩm liên quan thành các nhóm (mỗi nhóm 4 sản phẩm) để đưa vào Carousel
    const chunkArray = (arr, size) => {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    // Gán dữ liệu vào biến relatedChunks
    const relatedChunks = chunkArray(relatedProducts || [], 4);

    if (loading) return <div className="text-center my-5"><div className="spinner-border text-success"></div></div>;
    if (!product) return <div className="text-center my-5"><h3>Sản phẩm không tồn tại!</h3></div>;

    return (
        <div className="product-detail-page mb-5">
            <div className="container mt-4">
                <div className="row mb-5">
                    {/* Cột trái: Hình ảnh */}
                    <div className="col-md-5">
                        <div className="main-image-container border rounded mb-3 d-flex justify-content-center p-3">
                            {mainImage ? (
                                <img src={mainImage} alt={product.name} className="img-fluid max-h-100" />
                            ) : (
                                <span className="text-muted">Chưa có hình ảnh</span>
                            )}
                        </div>
                        {/* Thumbnail images (nếu có) */}
                        <div className="d-flex gap-2 overflow-auto">
                            {product.images?.map((img, index) => (
                                <img
                                    key={index}
                                    src={img.imageUrl}
                                    alt="thumbnail"
                                    className={`img-thumbnail cursor-pointer ${mainImage === img.imageUrl ? 'border-success' : ''}`}
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                                    onClick={() => setMainImage(img.imageUrl)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Cột phải: Thông tin */}
                    <div className="col-md-7 ps-md-5">
                        <h1 className="product-detail-title">{product.name}</h1>

                        <div className="d-flex align-items-center mb-3">
                            <div className="stars me-2">
                                {renderStars(Math.round(averageRating))}
                            </div>
                            <span className="text-muted fw-bold me-2">{averageRating}/5</span>
                            <span className="text-muted">({product.reviews?.length || 0} Đánh giá)</span>
                        </div>

                        <div className="product-detail-price fs-3 fw-bold text-danger mb-3">{formatPrice(product.price)}</div>
                        <p className="product-short-desc">{product.description}</p>
                        <hr className="my-4" />

                        {/* Nút thêm giỏ hàng có kiểm tra Stock và Auth */}
                        <div className="cart-action-group d-flex align-items-center gap-3">
                            <div className="qty-control d-flex border rounded">
                                <button className="btn btn-light border-0" onClick={() => handleQtyChange('minus')}>-</button>
                                <input type="text" className="form-control text-center border-0" style={{ width: '60px' }} value={quantity} readOnly />
                                <button className="btn btn-light border-0" onClick={() => handleQtyChange('plus')}>+</button>
                            </div>

                            <button
                                className="btn btn-success px-4 py-2 fw-bold"
                                onClick={handleAddToCart}
                                disabled={product.stockQuantity <= 0} // Disable nếu hết hàng
                            >
                                <i className="fas fa-shopping-cart me-2"></i>
                                {product.stockQuantity > 0 ? 'THÊM VÀO GIỎ' : 'HẾT HÀNG'}
                            </button>

                            <button className="btn btn-outline-danger px-3 py-2" onClick={() => requireLogin(() => alert('Đã thêm yêu thích'))} title="Yêu thích">
                                <i className="far fa-heart"></i>
                            </button>
                        </div>

                        <hr className="my-4" />
                        <div className="product-meta">
                            {/* KIỂM TRA TÌNH TRẠNG KHO */}
                            <p className="mb-2">Tình trạng: <span className={product.stockQuantity > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                {product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity})` : 'Hết hàng'}
                            </span></p>
                            <p className="mb-2">Danh mục: <span className="fw-semibold">{product.categoryName || "N/A"}</span></p>
                            <p className="mb-0">Thương hiệu: <span className="fw-semibold">{product.brand || "N/A"}</span></p>
                        </div>
                    </div>
                </div>

                {/* Tabs Mô tả và Đánh giá */}
                <div className="row mb-5 mt-5">
                    <div className="col-12">
                        <ul className="nav nav-tabs detail-tabs mb-4 border-bottom-0" role="tablist">
                            <li className="nav-item">
                                <button className="nav-link active fw-bold text-dark px-4 py-3" data-bs-toggle="tab" data-bs-target="#desc">MÔ TẢ SẢN PHẨM</button>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link fw-bold text-dark px-4 py-3" data-bs-toggle="tab" data-bs-target="#reviews">ĐÁNH GIÁ ({product.reviews?.length || 0})</button>
                            </li>
                        </ul>
                        <div className="tab-content border rounded p-4 shadow-sm bg-white" style={{ lineHeight: '1.8' }}>
                            <div className="tab-pane fade show active" id="desc">
                                <p>{product.description}</p>
                                <ul className="list-unstyled mt-3">
                                    {product.material && <li><strong>Chất liệu:</strong> {product.material}</li>}
                                    {product.color && <li><strong>Màu sắc:</strong> {product.color}</li>}
                                    {product.weight && <li><strong>Trọng lượng:</strong> {product.weight}</li>}
                                </ul>
                            </div>

                            {/* GIAO DIỆN ĐÁNH GIÁ MỚI */}
                            <div className="tab-pane fade" id="reviews">
                                <div className="row">
                                    <div className="col-md-7 border-end pe-md-4">
                                        <h5 className="mb-4 fw-bold">Bình luận của khách hàng</h5>

                                        {/* VÙNG CHỨA BÌNH LUẬN CÓ THANH CUỘN */}
                                        <div
                                            className="review-scroll-container pe-2"
                                            style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'hidden' }}
                                        >
                                            {product.reviews?.length > 0 ? (
                                                product.reviews.map(rv => (
                                                    <div key={rv.id} className="d-flex border-bottom pb-3 mb-3">
                                                        <img src={rv.userAvatar || 'https://via.placeholder.com/50'} alt="avatar" className="rounded-circle me-3 border" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                                        <div>
                                                            <h6 className="mb-0 text-dark fw-bold">{rv.userName}</h6>
                                                            <div className="text-warning small mb-1">{renderStars(rv.rating)}</div>
                                                            <p className="mb-1 text-dark">{rv.comment}</p>
                                                            <small className="text-muted">{new Date(rv.createdAt).toLocaleDateString('vi-VN')}</small>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="fst-italic text-center mt-4 text-muted">Chưa có đánh giá nào cho sản phẩm này.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-5 ps-md-4">
                                        <h5 className="mb-4 fw-bold">Viết đánh giá của bạn</h5>
                                        {!userSession && (
                                            <div className="alert alert-secondary text-center p-2 mb-3">
                                                <small>Bạn đang bình luận dưới tư cách <strong>Khách vãng lai</strong>. <Link to="/login" className="text-primary text-decoration-none fw-bold">Đăng nhập</Link> để lưu danh tính.</small>
                                            </div>
                                        )}
                                        <form onSubmit={handleSubmitReview}>
                                            {/* ... (Giữ nguyên form đánh giá của bạn ở đây) ... */}
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Số sao:</label>
                                                <select className="form-select border-dark-subtle" value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}>
                                                    <option value="5">5 Sao - Tuyệt vời</option>
                                                    <option value="4">4 Sao - Rất tốt</option>
                                                    <option value="3">3 Sao - Bình thường</option>
                                                    <option value="2">2 Sao - Tạm được</option>
                                                    <option value="1">1 Sao - Tệ</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Nội dung đánh giá:</label>
                                                <textarea
                                                    className="form-control border-dark-subtle"
                                                    rows="4"
                                                    placeholder="Sản phẩm này thế nào..."
                                                    value={reviewContent}
                                                    onChange={e => setReviewContent(e.target.value)}
                                                ></textarea>
                                            </div>
                                            <button type="submit" className="btn btn-dark w-100 fw-bold py-2">GỬI BÌNH LUẬN</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sản phẩm tương tự - Carousel */}
                {relatedProducts.length > 0 && (
                    <div className="row related-carousel mt-5">
                        <div className="col-12 position-relative">
                            <h3 className="related-title text-center mb-4 fw-bold border-bottom pb-2">SẢN PHẨM TƯƠNG TỰ</h3>
                            <div id="relatedCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
                                <div className="carousel-inner px-md-5">
                                    {relatedChunks.map((chunk, idx) => (
                                        <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={idx}>
                                            <div className="row">
                                                {chunk.map(rel => {
                                                    const relImg = rel.images?.find(img => img.isPrimary === 1) || rel.images?.[0];
                                                    return (
                                                        <div className="col-md-3 mb-4" key={rel.id}>
                                                            <div className="product-card text-center border rounded p-3 h-100 shadow-sm bg-white">
                                                                <Link to={`/product/${rel.id}`} className="text-decoration-none">
                                                                    <div style={{ height: '200px' }} className="d-flex align-items-center justify-content-center mb-3">
                                                                        {relImg ? <img src={relImg.imageUrl} alt={rel.name} className="img-fluid max-h-100 object-fit-contain" /> : <span className="text-muted">Chưa có ảnh</span>}
                                                                    </div>
                                                                    <h6 className="text-dark text-truncate fw-bold">{rel.name}</h6>
                                                                    <div className="stars mb-2 text-warning">
                                                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                                                    </div>
                                                                    <p className="text-danger fw-bold fs-5">{formatPrice(rel.price)}</p>
                                                                </Link>
                                                                <button className="btn btn-outline-success w-100 mt-auto fw-bold py-2">
                                                                    <i className="fas fa-shopping-cart me-2"></i>THÊM VÀO GIỎ
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Controls cho Carousel nếu có nhiều hơn 1 trang */}
                                {relatedChunks.length > 1 && (
                                    <>
                                        <button className="carousel-control-prev" type="button" data-bs-target="#relatedCarousel" data-bs-slide="prev" style={{ width: '5%', filter: 'invert(100%)' }}>
                                            <span className="carousel-control-prev-icon"></span>
                                        </button>
                                        <button className="carousel-control-next" type="button" data-bs-target="#relatedCarousel" data-bs-slide="next" style={{ width: '5%', filter: 'invert(100%)' }}>
                                            <span className="carousel-control-next-icon"></span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChiTietSanPham;