import React, { useState, useEffect, useCallback } from 'react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

// ── Màu sắc ──────────────────────────────────────────────────────────────────
const GREEN   = '#00583b';
const GREEN2  = '#22c55e';
const BLUE    = '#3b82f6';
const ORANGE  = '#f59e0b';
const RED     = '#ef4444';
const PIE_COLORS = ['#00583b','#22c55e','#3b82f6','#f59e0b','#a855f7'];

// ── Format tiền đầy đủ (dùng cho KPI card — không làm tròn) ──────────────────
const fmtVND = (n) => {
    if (!n && n !== 0) return '0 ₫';
    const num = typeof n === 'object' ? Number(n) : n;
    return new Intl.NumberFormat('vi-VN').format(Math.floor(num)) + ' ₫';
};

// ── Format tiền rút gọn (dùng cho trục Y biểu đồ — tránh tràn) ───────────────
const fmtVNDShort = (n) => {
    if (!n && n !== 0) return '0';
    const num = typeof n === 'object' ? Number(n) : n;
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + ' tỷ';
    if (num >= 1_000_000)     return (num / 1_000_000).toFixed(1) + ' tr';
    if (num >= 1_000)         return (num / 1_000).toFixed(0) + ' k';
    return num.toString();
};

// ── Custom Tooltip biểu đồ ───────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border shadow-sm rounded-3 p-3" style={{ fontSize: 12 }}>
            <p className="fw-bold mb-1 text-dark">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="mb-0" style={{ color: p.color }}>
                    {p.name}: {p.name === 'Doanh thu' ? fmtVND(p.value) : p.value.toLocaleString()}
                </p>
            ))}
        </div>
    );
};

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, subColor, color, bg }) => (
    <div className="bg-white rounded-3 shadow-sm p-4 h-100"
         style={{ borderLeft: `4px solid ${color}` }}>
        <div className="d-flex justify-content-between align-items-start">
            <div>
                <div className="text-muted small mb-1">{label}</div>
                <div className="fw-bold" style={{ fontSize: 22, color, lineHeight: 1.2 }}>{value}</div>
                {sub && (
                    <div className="small mt-1" style={{ color: subColor || '#6b7280' }}>{sub}</div>
                )}
            </div>
            <div className="rounded-circle d-flex align-items-center justify-content-center"
                 style={{ width: 44, height: 44, backgroundColor: bg || color + '18', flexShrink: 0 }}>
                <i className={`fa-solid ${icon}`} style={{ color, fontSize: 18 }}></i>
            </div>
        </div>
    </div>
);

// ── AdminDashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [period,  setPeriod]  = useState('30days');
    const [error,   setError]   = useState(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch(
                `http://localhost:8080/api/admin/dashboard?period=${period}`);
            if (!res.ok) throw new Error('API trả về lỗi: ' + res.status);
            setData(await res.json());
        } catch (e) {
            console.error(e);
            setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

    // ── Growth indicator ────────────────────────────────────────────────────────
    const growthBadge = (pct) => {
        if (pct === 0) return <span className="text-muted small">= Không đổi</span>;
        const up = pct > 0;
        return (
            <span className="small fw-semibold" style={{ color: up ? GREEN2 : RED }}>
        <i className={`fa-solid fa-arrow-${up ? 'up' : 'down'} me-1`}></i>
                {Math.abs(pct)}% so với tháng trước
      </span>
        );
    };

    if (loading) return (
        <div className="d-flex align-items-center justify-content-center" style={{ height: 400 }}>
            <div className="text-center">
                <div className="spinner-border text-success mb-3"></div>
                <p className="text-muted">Đang tải dữ liệu thống kê...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-4">
            <div className="alert alert-danger d-flex align-items-center gap-3">
                <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                <div>
                    <strong>Lỗi tải dữ liệu</strong>
                    <div className="small">{error}</div>
                </div>
                <button className="btn btn-outline-danger ms-auto btn-sm" onClick={fetchDashboard}>
                    <i className="fa-solid fa-rotate-right me-1"></i>Thử lại
                </button>
            </div>
        </div>
    );

    const { kpi, chartData, topBooks, topCategories } = data || {};

    // Chuẩn hóa chartData cho recharts
    const chartFormatted = (chartData || []).map(p => ({
        name:    p.label,
        revenue: typeof p.revenue === 'object' ? Number(p.revenue) : (p.revenue || 0),
        orders:  p.orders  || 0,
        users:   p.users   || 0,
    }));

    // PieChart data
    const pieData = (topCategories || []).map(c => ({
        name:  c.categoryName,
        value: c.soldQty,
        pct:   c.percentage,
    }));

    return (
        <div className="p-4">

            {/* ── Header + chọn kỳ ─────────────────────────────────────────────────── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold m-0" style={{ color: GREEN }}>Thống kê & Báo cáo</h4>
                    <span className="text-muted small">Tổng quan hoạt động kinh doanh</span>
                </div>
                <div className="d-flex gap-2">
                    {[
                        { key: '30days',   label: '30 ngày' },
                        { key: '12months', label: '12 tháng' },
                    ].map(p => (
                        <button key={p.key}
                                className={`btn btn-sm px-3 ${period === p.key ? 'text-white' : 'btn-outline-secondary'}`}
                                style={period === p.key ? { backgroundColor: GREEN, borderColor: GREEN } : {}}
                                onClick={() => setPeriod(p.key)}>
                            {p.label}
                        </button>
                    ))}
                    <button className="btn btn-sm btn-outline-secondary" onClick={fetchDashboard}
                            title="Làm mới">
                        <i className="fa-solid fa-rotate-right"></i>
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
          ROW 1: 8 thẻ KPI
      ══════════════════════════════════════════════════════════════ */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <KpiCard icon="fa-chart-line" label="Tổng doanh thu" color={GREEN}
                             value={fmtVND(kpi?.totalRevenue)}
                             sub={growthBadge(kpi?.revenueGrowth || 0)} />
                </div>
                <div className="col-md-3">
                    <KpiCard icon="fa-calendar-day" label="Doanh thu tháng này" color="#0d6efd"
                             value={fmtVND(kpi?.revenueThisMonth)}
                             sub={`Tháng trước: ${fmtVND(kpi?.revenueLastMonth)}`} />
                </div>
                <div className="col-md-3">
                    <KpiCard icon="fa-receipt" label="Tổng đơn hàng" color={ORANGE}
                             value={(kpi?.totalOrders || 0).toLocaleString()}
                             sub={`Tháng này: ${kpi?.ordersThisMonth || 0} đơn`} />
                </div>
                <div className="col-md-3">
                    <KpiCard icon="fa-clock" label="Đơn chờ xử lý" color={RED}
                             value={(kpi?.pendingOrders || 0).toLocaleString()}
                             sub={`Đang giao: ${kpi?.shippedOrders || 0} đơn`}
                             subColor={BLUE} />
                </div>
                <div className="col-md-3">
                    <KpiCard icon="fa-users" label="Tổng người dùng" color="#8b5cf6"
                             value={(kpi?.totalUsers || 0).toLocaleString()}
                             sub={`Mới tháng này: +${kpi?.newUsersThisMonth || 0}`}
                             subColor={GREEN2} />
                </div>
                <div className="col-md-3">
                    <KpiCard icon="fa-book" label="Tổng đầu sách" color="#06b6d4"
                             value={(kpi?.totalProducts || 0).toLocaleString()}
                             sub={kpi?.outOfStockProducts > 0
                                 ? `⚠ ${kpi.outOfStockProducts} sách hết hàng` : '✓ Tất cả còn hàng'}
                             subColor={kpi?.outOfStockProducts > 0 ? RED : GREEN2} />
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
          ROW 2: Biểu đồ doanh thu (area) + biểu đồ đơn hàng (bar)
      ══════════════════════════════════════════════════════════════ */}
            <div className="row g-3 mb-4">

                {/* Biểu đồ doanh thu */}
                <div className="col-md-8">
                    <div className="bg-white rounded-3 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold m-0">
                                <i className="fa-solid fa-chart-area me-2 text-success"></i>
                                Doanh thu {period === '30days' ? '30 ngày gần nhất' : '12 tháng năm nay'}
                            </h6>
                            <span className="badge text-dark" style={{ backgroundColor: '#dcfce7', fontSize: 11 }}>
                Đơn đã thanh toán
              </span>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={chartFormatted}
                                       margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={GREEN} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={GREEN} stopOpacity={0}   />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }}
                                       interval={period === '30days' ? 4 : 0} />
                                <YAxis tickFormatter={v => fmtVNDShort(v)} tick={{ fontSize: 10 }} width={75} />
                                <Tooltip content={<RevenueTooltip />} />
                                <Area type="monotone" dataKey="revenue" name="Doanh thu"
                                      stroke={GREEN} fill="url(#colorRevenue)"
                                      strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ đơn hàng */}
                <div className="col-md-4">
                    <div className="bg-white rounded-3 shadow-sm p-4 h-100">
                        <h6 className="fw-bold mb-3">
                            <i className="fa-solid fa-chart-bar me-2 text-primary"></i>
                            Số đơn hàng
                        </h6>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartFormatted}
                                      margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 9 }}
                                       interval={period === '30days' ? 6 : 0} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip
                                    formatter={(v, n) => [v.toLocaleString(), n]}
                                    labelStyle={{ fontSize: 11 }}
                                    contentStyle={{ fontSize: 11 }} />
                                <Bar dataKey="orders" name="Đơn hàng" fill={BLUE}
                                     radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
          ROW 3: Top sách + Top danh mục (pie) + User mới
      ══════════════════════════════════════════════════════════════ */}
            <div className="row g-3">

                {/* Top 5 sách bán chạy */}
                <div className="col-md-5">
                    <div className="bg-white rounded-3 shadow-sm p-4 h-100">
                        <h6 className="fw-bold mb-3">
                            <i className="fa-solid fa-trophy me-2 text-warning"></i>
                            Top 5 sách bán chạy
                            <span className="text-muted fw-normal small ms-2">
                ({period === '30days' ? '30 ngày' : '12 tháng'})
              </span>
                        </h6>

                        {!topBooks || topBooks.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <i className="fa-solid fa-book fa-2x mb-2 d-block"></i>
                                Chưa có dữ liệu
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {topBooks.map((book, idx) => (
                                    <div key={book.productId} className="d-flex align-items-center gap-3">
                                        {/* Hạng */}
                                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                             style={{
                                                 width: 28, height: 28, fontSize: 12,
                                                 backgroundColor: idx === 0 ? '#fbbf24'
                                                     : idx === 1 ? '#9ca3af'
                                                         : idx === 2 ? '#cd7c4f'
                                                             : '#e5e7eb',
                                                 color: idx < 3 ? '#fff' : '#374151'
                                             }}>
                                            {idx + 1}
                                        </div>

                                        {/* Ảnh bìa */}
                                        {book.imageUrl ? (
                                            <img src={book.imageUrl} alt=""
                                                 className="rounded flex-shrink-0"
                                                 style={{ width: 36, height: 50, objectFit: 'cover' }} />
                                        ) : (
                                            <div className="rounded d-flex align-items-center justify-content-center bg-light flex-shrink-0"
                                                 style={{ width: 36, height: 50 }}>
                                                <i className="fa-solid fa-book text-muted fa-xs"></i>
                                            </div>
                                        )}

                                        {/* Thông tin */}
                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                            <div className="fw-semibold text-truncate" style={{ fontSize: 12 }}
                                                 title={book.productName}>
                                                {book.productName}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: 10 }}>
                                                {book.author || 'Không rõ tác giả'}
                                            </div>
                                        </div>

                                        {/* Số liệu */}
                                        <div className="text-end flex-shrink-0">
                                            <div className="fw-bold" style={{ fontSize: 13, color: GREEN }}>
                                                {book.soldQty.toLocaleString()} quyển
                                            </div>
                                            <div className="text-muted" style={{ fontSize: 10 }}>
                                                {fmtVND(book.revenue)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top danh mục — Pie chart */}
                <div className="col-md-4">
                    <div className="bg-white rounded-3 shadow-sm p-4 h-100">
                        <h6 className="fw-bold mb-3">
                            <i className="fa-solid fa-chart-pie me-2 text-purple" style={{ color: '#8b5cf6' }}></i>
                            Doanh số theo danh mục
                        </h6>

                        {!topCategories || topCategories.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <i className="fa-solid fa-list fa-2x mb-2 d-block"></i>
                                Chưa có dữ liệu
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%"
                                             innerRadius={45} outerRadius={75}
                                             paddingAngle={3} dataKey="value">
                                            {pieData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(v, n, p) => [`${v.toLocaleString()} quyển (${p.payload.pct}%)`, p.payload.name]}
                                            contentStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Legend */}
                                <div className="d-flex flex-column gap-1 mt-2">
                                    {topCategories.map((cat, i) => (
                                        <div key={cat.categoryName}
                                             className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="rounded-circle flex-shrink-0"
                                                     style={{ width: 10, height: 10,
                                                         backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                                                <span style={{ fontSize: 11 }} className="text-truncate"
                                                      title={cat.categoryName}>
                          {cat.categoryName}
                        </span>
                                            </div>
                                            <span className="fw-bold text-muted" style={{ fontSize: 11 }}>
                        {cat.percentage}%
                      </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Người dùng mới + biểu đồ nhỏ */}
                <div className="col-md-3">
                    <div className="bg-white rounded-3 shadow-sm p-4 h-100">
                        <h6 className="fw-bold mb-3">
                            <i className="fa-solid fa-user-plus me-2 text-info"></i>
                            Người dùng mới
                        </h6>

                        <div className="text-center mb-3">
                            <div className="fw-bold" style={{ fontSize: 36, color: '#06b6d4' }}>
                                +{(kpi?.newUsersThisMonth || 0).toLocaleString()}
                            </div>
                            <div className="text-muted small">tháng này</div>
                            <div className="mt-2 text-muted small">
                                Tổng: <strong>{(kpi?.totalUsers || 0).toLocaleString()}</strong> người dùng
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={chartFormatted}
                                      margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 8 }}
                                       interval={period === '30days' ? 9 : 2} />
                                <YAxis tick={{ fontSize: 9 }} />
                                <Tooltip
                                    formatter={v => [v.toLocaleString(), 'User mới']}
                                    contentStyle={{ fontSize: 11 }} />
                                <Bar dataKey="users" name="User mới" fill="#06b6d4"
                                     radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Trạng thái đơn hàng mini */}
                        <div className="border-top pt-3 mt-3">
                            <div className="small text-muted fw-semibold mb-2">Trạng thái đơn</div>
                            {[
                                { label:'Chờ xử lý', value: kpi?.pendingOrders,   color: ORANGE },
                                { label:'Đang giao',  value: kpi?.shippedOrders,   color: BLUE   },
                            ].map(s => (
                                <div key={s.label}
                                     className="d-flex justify-content-between align-items-center mb-1">
                                    <span style={{ fontSize: 11 }} className="text-muted">{s.label}</span>
                                    <span className="fw-bold" style={{ fontSize: 12, color: s.color }}>
                    {(s.value || 0).toLocaleString()}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;