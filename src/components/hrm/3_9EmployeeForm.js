// FILE: src/components/hrm/EmployeeForm.js (ĐÃ SỬA LỖI VÀ HOÀN THIỆN)

import React, { useEffect, useState, useContext } from 'react';
import api from '../../utils/api';
import './HrmStyle.css';
import AuthContext from '../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const EmployeeForm = ({ onSuccess, onClose, employee }) => {
    const { user } = useContext(AuthContext);
    const isCreate = !employee;
    const isAdmin = user && user.role === 'Admin';
    const [formData, setFormData] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [managers, setManagers] = useState([]);

  

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const res = await api.get('/employees/data-for-form');
                setCompanies(res.data.companies);
                setDepartments(res.data.departments);
                setPositions(res.data.positions);
                setManagers(res.data.managers);
            } catch (err) {
                console.error("Lỗi tải danh sách dropdown:", err);
                alert("Không thể tải dữ liệu cần thiết cho form.");
            }
        };

        fetchDropdowns();

        if (employee) {
            const formattedDob = employee.dob ? String(employee.dob).split('T')[0] : '';
            const formattedStartDate = employee.start_date ? String(employee.start_date).split('T')[0] : '';
            
            setFormData({
                ...employee,
                dob: formattedDob,
                start_date: formattedStartDate,
                avatar_file: null,
                password: '', // Luôn để trống password khi sửa
            });
            setPreviewImage(employee.avatar_url ? `${API_BASE_URL}${employee.avatar_url}` : null);
        } else {
            setFormData({
                full_name: '', email: '', employee_code: '', gender: '', dob: '', phone: '',
                company_id: '', department_id: '', position_id: '', manager_id: '', start_date: '',
                status: 'Đang làm việc', username: '', password: '', role: '', avatar_file: null,
                total_salary: '', base_salary_for_insurance: '', num_dependents: 0, union_fee: ''
            });
            setPreviewImage(null);
        }
    }, [employee]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = e => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, avatar_file: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // src/components/hrm/EmployeeForm.js

const handleSubmit = async e => {
    e.preventDefault();
    const submissionForm = new FormData();
    for (const key in formData) {
        if (formData[key] !== null && formData[key] !== undefined) {
            submissionForm.append(key, formData[key]);
        }
    }
    
    try {
        if (isCreate) {
            await api.post('/employees', submissionForm, { headers: { 'Content-Type': 'multipart/form-data' }});
        } else {
            // FIX: Dùng api.put trực tiếp, không cần _method
            await api.put(`/employees/${employee.id}`, submissionForm, { headers: { 'Content-Type': 'multipart/form-data' }});
        }
        alert(`Lưu nhân sự thành công!`);
        onSuccess();
    } catch (err) {
        alert(err.response?.data?.msg || "Lỗi khi lưu nhân sự.");
        console.error("Lỗi lưu nhân sự:", err);
    }
};
    // FIX 3: Dọn dẹp và tối ưu logic lọc phòng ban
    const filteredDepartments = departments.filter(dept => 
        dept.company_id === parseInt(formData.company_id)
    );
  
    return (
        <div className="employee-form-modal">
            <h3>{isCreate ? 'Thêm' : 'Cập nhật'} Nhân sự</h3>
            <form className="employee-form" onSubmit={handleSubmit}>
                <div className="form-group full-width">
                    <label>Mã nhân viên</label>
                    <input name="employee_code" value={formData.employee_code || ''} onChange={handleChange} required />
                </div>
                <div className="form-group full-width">
                    <label>Họ và tên</label>
                    <input name="full_name" value={formData.full_name || ''} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input name="email" value={formData.email || ''} onChange={handleChange} required type="email" />
                </div>
                <div className="form-group">
                    <label>Số điện thoại</label>
                    <input name="phone" value={formData.phone || ''} onChange={handleChange} type="tel" />
                </div>
                <div className="form-group">
                    <label>Ngày sinh</label>
                    <input name="dob" value={formData.dob || ''} onChange={handleChange} type="date" />
                </div>
                <div className="form-group">
                    <label>Giới tính</label>
                    <select name="gender" value={formData.gender || ''} onChange={handleChange}>
                        <option value="">-- Chọn --</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Ngày vào làm</label>
                    <input name="start_date" value={formData.start_date || ''} onChange={handleChange} type="date" />
                </div>
                <div className="form-group">
                    <label>Đơn vị</label>
                    <select name="company_id" value={formData.company_id || ''} onChange={handleChange} required>
                        <option value="">-- Chọn --</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Phòng ban</label>
                    <select name="department_id" value={formData.department_id || ''} onChange={handleChange}>
                        <option value="">-- Chọn --</option>
                        {filteredDepartments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Chức vụ</label>
                    <select name="position_id" value={formData.position_id || ''} onChange={handleChange}>
                        <option value="">-- Chọn --</option>
                        {positions.map(p => <option key={p.id} value={p.id}>{p.position_name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Quản lý trực tiếp</label>
                    <select name="manager_id" value={formData.manager_id || ''} onChange={handleChange}>
                        <option value="">-- Chọn --</option>
                        {managers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                    </select>
                </div>

                {isAdmin && (
                    <>
                        <div className="form-group">
                            <label>Username</label>
                            <input name="username" value={formData.username || ''} onChange={handleChange} required={isCreate} />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input name="password" placeholder={isCreate ? "Mật khẩu" : "Để trống nếu không đổi"} value={formData.password || ''} onChange={handleChange} type="password" />
                        </div>
                        <div className="form-group">
                            <label>Vai trò</label>
                            <select name="role" value={formData.role || ''} onChange={handleChange} required>
                                <option value="">-- Chọn --</option>
                                <option value="Admin">Admin</option>
                                <option value="TongGiamDoc">Tổng Giám đốc</option>
                                <option value="TruongDonVi">Trưởng Đơn vị</option>
                                <option value="PhoDV">Phó trưởng Đơn vị</option>
                                <option value="NhanVienCM">Nhân viên CM</option>
                                <option value="NhanVienKD">Nhân viên KD</option>
                                <option value="NhanVienPT">Nhân viên PT</option>
                                <option value="Truongphong">Trưởng phòng</option>
                                <option value="Phophong">Phó Trưởng phòng</option>
                                <option value="NhanSu">Nhân sự</option>
                                <option value="KeToan">Kế toán</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="total-salary">Lương tổng theo quyết định</label>
                            <div className="input-with-unit">
                                {/* FIX 1: Sử dụng đúng state `formData` và hàm `handleChange` */}
                                <input
                                    type="number"
                                    id="total-salary"
                                    name="total_salary"
                                    value={formData.total_salary || ''}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: 15000000"
                                />
                                <span>VNĐ</span>
                            </div>
                        </div>
                        {/* 1. Lương cơ bản đóng bảo hiểm */}
                        <div className="form-group">
                            <label htmlFor="insurance-salary">Lương đóng BHXH (Lương vùng)</label>
                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    id="insurance-salary"
                                    name="base_salary_for_insurance"
                                    value={formData.base_salary_for_insurance || ''}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: 4800000"
                                />
                                <span>VNĐ</span>
                            </div>
                        </div>

                        {/* 2. Số người phụ thuộc */}
                        <div className="form-group">
                            <label htmlFor="dependents">Số người phụ thuộc</label>
                                <input
                                    type="number"
                                    id="dependents"
                                    name="num_dependents"
                                    value={formData.num_dependents || 0}
                                    onChange={handleChange}
                                    min="0"
                                />
                        </div>

                        {/* 3. Phí công đoàn (nếu cần nhập tay) */}
                        <div className="form-group">
                            <label htmlFor="union-fee">Phí công đoàn (nếu có)</label>
                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    id="union-fee"
                                    name="union_fee"
                                    value={formData.union_fee || ''}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: 20000"
                                />
                                <span>VNĐ</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select name="status" value={formData.status || 'Đang làm việc'} onChange={handleChange}>
                                <option value="Đang làm việc">Đang làm việc</option>
                                <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                            </select>
                        </div>
                    </>
                )}
                
                <div className="form-group full-width">
                    <label htmlFor="avatar-upload" className="file-upload-label">
                        <i className="fas fa-upload"></i> Tải ảnh đại diện
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }}/>
                </div>

                {previewImage && (
                    <div className="preview-avatar-wrapper full-width">
                        <img src={previewImage} alt="Xem trước" className="preview-avatar" />
                    </div>
                )}

                <div className="employee-form-actions full-width">
                    <button type="button" className="btn btn--secondary" onClick={onClose}>Hủy</button>
                    <button type="submit" className="btn btn--primary">Lưu</button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm;
