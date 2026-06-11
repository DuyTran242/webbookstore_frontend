import React, { useState, useEffect } from 'react';

const AdminUser = () => {
    const [activeTab, setActiveTab] = useState('USERS'); // USERS, EMPLOYEES, LOCKED
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [potentialEmployees, setPotentialEmployees] = useState([]);

    const fetchUsers = async () => {
        let url = '';
        if (activeTab === 'USERS') url = '/api/admin/users/role/2';
        else if (activeTab === 'EMPLOYEES') url = '/api/admin/users/role/3';
        else if (activeTab === 'LOCKED') url = '/api/admin/users/locked';

        try {
            // Thay bằng api call thực tế (VD: axios.get)
            const response = await fetch(`http://localhost:8080${url}`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const handleLockToggle = async (id, isDelete) => {
        if (!window.confirm(isDelete === 1 ? "Bạn muốn khóa tài khoản này?" : "Bạn muốn mở khóa tài khoản này?")) return;
        
        try {
            await fetch(`http://localhost:8080/api/admin/users/${id}/lock`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDelete })
            });
            fetchUsers(); // Refresh data
        } catch (error) {
            console.error("Error toggling lock:", error);
        }
    };

    const handlePromote = async (id) => {
        if (!window.confirm("Thêm người dùng này làm nhân viên?")) return;
        
        try {
            await fetch(`http://localhost:8080/api/admin/users/${id}/promote`, {
                method: 'PUT'
            });
            setIsAddEmployeeModalOpen(false);
            fetchUsers(); // Refresh
        } catch (error) {
            console.error("Error promoting user:", error);
        }
    };

    const viewDetails = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${id}`);
            const data = await response.json();
            setSelectedUser(data);
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error("Error fetching details:", error);
        }
    };

    const openAddEmployeeModal = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/role/2`);
            const data = await response.json();
            setPotentialEmployees(data);
            setIsAddEmployeeModalOpen(true);
        } catch (error) {
            console.error("Error fetching potential employees:", error);
        }
    };

    const getAvatar = (avatarUrl, roleId) => {
        if (avatarUrl) return avatarUrl;
        return roleId === 3 
            ? 'https://cdn-icons-png.flaticon.com/512/3225/3225134.png' 
            : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; 
    };

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark m-0">
                    <i className="fa-solid fa-users-gear text-primary me-2"></i>
                    Quản Lý Người Dùng
                </h2>
                {activeTab === 'EMPLOYEES' && (
                    <button onClick={openAddEmployeeModal} className="btn btn-primary shadow-sm">
                        <i className="fa-solid fa-user-plus me-2"></i>Thêm Nhân Viên
                    </button>
                )}
            </div>

            {/* Nav Tabs */}
            <ul className="nav nav-tabs mb-4 border-bottom">
                <li className="nav-item cursor-pointer" onClick={() => setActiveTab('USERS')}>
                    <button className={`nav-link fw-semibold ${activeTab === 'USERS' ? 'active text-success' : 'text-secondary border-transparent'}`}>
                        <i className="fa-solid fa-user me-2"></i>Người Dùng
                    </button>
                </li>
                <li className="nav-item cursor-pointer" onClick={() => setActiveTab('EMPLOYEES')}>
                    <button className={`nav-link fw-semibold ${activeTab === 'EMPLOYEES' ? 'active text-primary' : 'text-secondary border-transparent'}`}>
                        <i className="fa-solid fa-user-tie me-2"></i>Nhân Viên
                    </button>
                </li>
                <li className="nav-item cursor-pointer" onClick={() => setActiveTab('LOCKED')}>
                    <button className={`nav-link fw-semibold ${activeTab === 'LOCKED' ? 'active text-danger' : 'text-secondary border-transparent'}`}>
                        <i className="fa-solid fa-user-lock me-2"></i>Tài Khoản Bị Khóa
                    </button>
                </li>
            </ul>

            {/* Data Table */}
            <div className="card shadow-sm border-0">
                <div className="card-body p-0 table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-secondary">
                            <tr>
                                <th className="py-3 px-4">ID</th>
                                <th className="py-3 px-4">Thông tin</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Số ĐT</th>
                                <th className="py-3 px-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-4 fw-medium text-secondary">#{user.id}</td>
                                    <td className="px-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <img 
                                                src={getAvatar(user.avatar, user.roleId)} 
                                                alt="avatar" 
                                                className="rounded-circle border"
                                                style={{ width: '45px', height: '45px', objectFit: 'cover' }} 
                                            />
                                            <span className="fw-bold text-dark">{user.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4">{user.email}</td>
                                    <td className="px-4">{user.phone}</td>
                                    <td className="px-4 text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button onClick={() => viewDetails(user.id)} className="btn btn-sm btn-outline-secondary">
                                                <i className="fa-solid fa-eye me-1"></i> Chi tiết
                                            </button>
                                            
                                            {activeTab !== 'LOCKED' ? (
                                                <button onClick={() => handleLockToggle(user.id, 1)} className="btn btn-sm btn-outline-danger">
                                                    <i className="fa-solid fa-lock me-1"></i> Khóa
                                                </button>
                                            ) : (
                                                <button onClick={() => handleLockToggle(user.id, 0)} className="btn btn-sm btn-outline-success">
                                                    <i className="fa-solid fa-unlock me-1"></i> Mở Khóa
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="text-center p-5 text-muted">
                            <i className="fa-solid fa-folder-open fs-1 mb-3"></i>
                            <p>Không có dữ liệu.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Xem chi tiết (Custom using standard Bootstrap classes) */}
            {isDetailModalOpen && selectedUser && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title fw-bold mx-auto">Thông tin chi tiết</h5>
                                <button type="button" className="btn-close m-0 position-absolute end-0 top-0 mt-3 me-3" onClick={() => setIsDetailModalOpen(false)}></button>
                            </div>
                            <div className="modal-body text-center">
                                <img 
                                    src={getAvatar(selectedUser.avatar, selectedUser.roleId)} 
                                    alt="avatar" 
                                    className="rounded-circle border border-3 mb-3 shadow-sm" 
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                                />
                                <h4 className="fw-bold mb-4">{selectedUser.fullName}</h4>
                                
                                <div className="text-start px-3">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item px-0"><i className="fa-solid fa-user-tag text-muted me-2 w-20px"></i> <strong>Username:</strong> {selectedUser.username}</li>
                                        <li className="list-group-item px-0"><i className="fa-solid fa-envelope text-muted me-2 w-20px"></i> <strong>Email:</strong> {selectedUser.email}</li>
                                        <li className="list-group-item px-0"><i className="fa-solid fa-phone text-muted me-2 w-20px"></i> <strong>Số ĐT:</strong> {selectedUser.phone}</li>
                                        <li className="list-group-item px-0"><i className="fa-solid fa-location-dot text-muted me-2 w-20px"></i> <strong>Địa chỉ:</strong> {selectedUser.address || 'Chưa cập nhật'}</li>
                                        <li className="list-group-item px-0"><i className="fa-solid fa-venus-mars text-muted me-2 w-20px"></i> <strong>Giới tính:</strong> {selectedUser.gender || 'Chưa cập nhật'}</li>
                                        <li className="list-group-item px-0"><i className="fa-solid fa-calendar-days text-muted me-2 w-20px"></i> <strong>Ngày sinh:</strong> {selectedUser.birthdate || 'Chưa cập nhật'}</li>
                                        <li className="list-group-item px-0"><i className="fa-solid fa-shield-halved text-muted me-2 w-20px"></i> <strong>Vai trò:</strong> <span className="badge bg-info text-dark">{selectedUser.roleId === 3 ? 'Nhân viên' : 'Người dùng'}</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Thêm Nhân Viên */}
            {isAddEmployeeModalOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">Chọn Người Dùng Làm Nhân Viên</h5>
                                <button type="button" className="btn-close" onClick={() => setIsAddEmployeeModalOpen(false)}></button>
                            </div>
                            <div className="modal-body p-0" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th className="px-4 py-3">Tên</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3 text-end">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {potentialEmployees.map(user => (
                                            <tr key={user.id}>
                                                <td className="px-4">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <img src={getAvatar(user.avatar, 2)} alt="avt" className="rounded-circle" style={{ width: '30px', height: '30px', objectFit: 'cover' }} />
                                                        <span className="fw-medium">{user.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 text-muted">{user.email}</td>
                                                <td className="px-4 text-end">
                                                    <button onClick={() => handlePromote(user.id)} className="btn btn-sm btn-primary">
                                                        <i className="fa-solid fa-plus me-1"></i>Thêm
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {potentialEmployees.length === 0 && (
                                    <div className="text-center p-4 text-muted">
                                        Không có người dùng nào để thêm.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUser;