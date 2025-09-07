import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SalaryPage.css'; // Tái sử dụng CSS

const API_URL = 'http://localhost:5000/api/employees';

const SalaryAdjustmentModal = ({ employee, onClose, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        base_salary_for_insurance: '',
        performance_salary_base: '',
        num_dependents: 0,
        union_fee: 0
    });

    useEffect(() => {
        if (employee) {
            setFormData({
                base_salary_for_insurance: employee.base_salary_for_insurance || '',
                performance_salary_base: employee.performance_salary_base || '',
                num_dependents: employee.num_dependents || 0,
                union_fee: employee.union_fee || 0
            });
        }
    }, [employee]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/${employee.id}/salary-info`, formData);
            alert('Cập nhật thành công!');
            onSaveSuccess(); // Gọi hàm để tải lại dữ liệu nếu cần
            onClose();
        } catch (error) {
            console.error("Lỗi khi cập nhật thông tin lương:", error);
            alert(error.response?.data?.error || 'Có lỗi xảy ra.');
        }
    };

    if (!employee) return null;

    return (
        <div className="modal-backdrop">
            <div className="adjustment-modal-content">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h3>Điều chỉnh thông số lương</h3>
                <h4>Nhân viên: {employee.full_name}</h4>
                <form onSubmit={handleSubmit} className="adjustment-form">
                    <label>Lương đóng BHXH</label>
                    <input type="number" name="base_salary_for_insurance" value={formData.base_salary_for_insurance} onChange={handleInputChange} />
                    
                    <label>Lương KPI cơ bản (100%)</label>
                    <input type="number" name="performance_salary_base" value={formData.performance_salary_base} onChange={handleInputChange} />

                    <label>Số người phụ thuộc</label>
                    <input type="number" name="num_dependents" value={formData.num_dependents} onChange={handleInputChange} />

                    <label>Phí công đoàn</label>
                    <input type="number" name="union_fee" value={formData.union_fee} onChange={handleInputChange} />

                    <div className="modal-actions">
                        <button type="submit" className="save-btn">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalaryAdjustmentModal;
