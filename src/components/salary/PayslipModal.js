import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SalaryPage.css'; // Tái sử dụng CSS

const API_URL = 'http://localhost:5000/api';

const PayslipModal = ({ employeeId, year, month, onClose }) => {
    const [payslip, setPayslip] = useState(null);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [payslipRes, empRes] = await Promise.all([
                    axios.get(`${API_URL}/salary/payslip`, { params: { year, month, employee_id: employeeId } }),
                    axios.get(`${API_URL}/employees`) // Lấy thông tin nhân viên để hiển thị tên
                ]);
                
                setPayslip(payslipRes.data);
                const currentEmp = empRes.data.find(e => e.id === employeeId);
                setEmployee(currentEmp);

            } catch (error) {
                console.error("Lỗi khi tải phiếu lương:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [employeeId, year, month]);

    const formatCurrency = (num) => num ? Number(num).toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ';

    return (
        <div className="modal-backdrop">
            <div className="payslip-modal-content">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2>Phiếu lương tháng {month}/{year}</h2>
                {loading && <p>Đang tải...</p>}
                {!loading && !payslip && <p>Không có dữ liệu lương cho kỳ này.</p>}
                {!loading && payslip && employee && (
                    <div className="payslip-details">
                        <p><strong>Nhân viên:</strong> {employee.full_name} ({employee.employee_code})</p>
                        <hr />
                        <div className="payslip-grid">
                            <div className="payslip-item">
                                <span className="label">Lương KPI cơ bản:</span>
                                <span className="value">{formatCurrency(payslip.base_salary)}</span>
                            </div>
                             <div className="payslip-item income">
                                <span className="label">Lương hiệu suất (Gross):</span>
                                <span className="value">{formatCurrency(payslip.kpi_bonus)}</span>
                            </div>
                            <div className="payslip-item deduction">
                                <span className="label">Tổng các khoản trừ:</span>
                                <span className="value">{formatCurrency(payslip.deductions)}</span>
                            </div>
                             <div className="payslip-item final">
                                <span className="label">Thực lĩnh:</span>
                                <span className="value">{formatCurrency(payslip.final_salary)}</span>
                            </div>
                        </div>
                        <p><small>(Chi tiết các khoản trừ và thuế TNCN sẽ được hiển thị đầy đủ ở đây)</small></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayslipModal;
