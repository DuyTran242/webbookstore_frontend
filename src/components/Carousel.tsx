// src/components/Carousel.tsx
import React from 'react';
import './Carousel.css';

// Import ảnh từ thư mục src/img/
import slide1 from '../img/slideshow_1.png';
import slide2 from '../img/slideshow_2.png';

// Import các ảnh banner (giả định tên file dựa trên ảnh bạn cung cấp)
import rightBanner1 from '../img/rigth1.jpg'; 
import rightBanner2 from '../img/right2.jpg'; 
import rightBanner3 from '../img/right3.jpg'; 

import bottom1 from '../img/ca1.jpg';
import bottom2 from '../img/ca2.jpg';
import bottom3 from '../img/ca3.jpg';

const Carousel: React.FC = () => {
  return (
    <div className="container mt-3">
      <div className="row">
        
        {/* CỘT TRÁI: MENU DANH MỤC */}
        <div className="col-md-3 p-0 sidebar-wrapper">
          <ul className="sidebar-menu">
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                Bếp - Phòng ăn <i className="fas fa-chevron-right hover-icon"></i>
              </a>
            </li>
            
            {/* Mục có Sub-menu */}
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                Đèn Phòng Khách <i className="fas fa-chevron-right hover-icon"></i>
              </a>
              {/* Menu con hiện ra khi hover */}
              <div className="sub-menu">
                <a href="#" className="sub-menu-item">ĐÈN ĐỂ BÀN</a>
                <a href="#" className="sub-menu-item">ĐÈN TREO TƯỜNG</a>
                <a href="#" className="sub-menu-item">ĐÈN TRẦN</a>
              </div>
            </li>

            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                SALON - SOFA <i className="fas fa-chevron-right hover-icon"></i>
              </a>
              <div className="sub-menu">
                <a href="#" className="sub-menu-item">ĐÈN ĐỂ BÀN</a>
                <a href="#" className="sub-menu-item">ĐÈN TREO TƯỜNG</a>
                <a href="#" className="sub-menu-item">ĐÈN TRẦN</a>
              </div>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                Bàn ghế văn phòng <i className="fas fa-chevron-right hover-icon"></i>
              </a>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                Tủ kệ <i className="fas fa-chevron-right hover-icon"></i>
              </a>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                Giường - Nệm <i className="fas fa-chevron-right hover-icon"></i>
              </a>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                Đồ gia dụng <i className="fas fa-chevron-right hover-icon"></i>
              </a>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                Gia Dụng, Tủ Bếp <i className="fas fa-chevron-right hover-icon"></i>
              </a>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                Thiết bị vệ sinh <i className="fas fa-chevron-right hover-icon"></i>
              </a>
            </li>
          </ul>
        </div>

        {/* CỘT GIỮA: CAROUSEL SLIDESHOW */}
        {/* data-bs-ride="carousel" và data-bs-interval="3000" giúp tự chuyển ảnh sau 3s */}
        <div className="col-md-6">
          <div id="mainCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
            <div className="carousel-inner h-100">
              <div className="carousel-item active h-100">
                <img src={slide1} className="d-block w-100 h-100" alt="Slide 1" style={{ objectFit: 'cover' }} />
              </div>
              <div className="carousel-item h-100">
                <img src={slide2} className="d-block w-100 h-100" alt="Slide 2" style={{ objectFit: 'cover' }} />
              </div>
            </div>
            
            {/* Nút điều hướng Carousel (Tùy chọn, bạn có thể xóa nếu không cần) */}
            <button className="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: 3 BANNER DỌC */}
        <div className="col-md-3">
          <div className="d-flex flex-column justify-content-between h-100">
            <img src={rightBanner1} alt="Xu hướng hiện đại" className="right-banner-img" />
            <img src={rightBanner2} alt="Đảm bảo chất lượng" className="right-banner-img" />
            <img src={rightBanner3} alt="Nhận đặt theo yêu cầu" className="right-banner-img mb-0" />
          </div>
        </div>

      </div>

     {/* 4. BOTTOM AUTOMATIC CAROUSEL (3s interval) */}
      <div className="row mt-4 mb-5">
        <div className="col-12 p-0">
          <div id="bottomCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
            <div className="carousel-inner">
              {/* Slide 1 */}
              <div className="carousel-item active">
                <div className="row">
                  <div className="col-md-4"><img src={bottom1} className="bottom-carousel-img" alt="Bottom ca1" /></div>
                  <div className="col-md-4"><img src={bottom2} className="bottom-carousel-img" alt="Bottom ca2" /></div>
                  <div className="col-md-4"><img src={bottom3} className="bottom-carousel-img" alt="Bottom ca3" /></div>
                </div>
              </div>
              {/* Slide 2 */}
              <div className="carousel-item">
                <div className="row">
                  <div className="col-md-4"><img src={bottom1} className="bottom-carousel-img" alt="Bottom ca4" /></div>
                  <div className="col-md-4"><img src={bottom2} className="bottom-carousel-img" alt="Bottom ca5" /></div>
                  <div className="col-md-4"><img src={bottom3} className="bottom-carousel-img" alt="Bottom ca6" /></div>
                </div>
              </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#bottomCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#bottomCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Carousel;