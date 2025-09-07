import React, { useState, useMemo } from 'react';
import './EvaluationTable.css'; // Cần tạo file CSS

// Component con cho Status Badge
const StatusBadge = ({ status }) => {
    const statusClass = (status || 'Chưa tạo').toLowerCase().replace(/\s+/g, '-');
    return <span className={`status-badge status--${statusClass}`}>{status}</span>;
};

const EvaluationTable = ({ 
    subordinates, 
    loading, 
    error,
    onViewKpi,
    selectedEmployees,
    setSelectedEmployees
}) => {
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });

    // Logic sắp xếp dữ liệu
    const sortedSubordinates = useMemo(() => {
        let sortableItems = [...subordinates];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [subordinates, sortConfig]);

    // Hàm thay đổi cấu hình sắp xếp
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Hàm xử lý chọn
    const handleSelectOne = (employeeId) => {
        const newSelection = new Set(selectedEmployees);
        if (newSelection.has(employeeId)) {
            newSelection.delete(employeeId);
        } else {
            newSelection.add(employeeId);
        }
        setSelectedEmployees(newSelection);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedEmployees(new Set(subordinates.map(s => s.id)));
        } else {
            setSelectedEmployees(new Set());
        }
    };

    // Hàm render nội dung bảng
    const renderTableBody = () => {
        if (loading) return <tr><td colSpan="6" className="table-state">Đang tải...</td></tr>;
        if (error) return <tr><td colSpan="6" className="table-state error">{error}</td></tr>;
        if (sortedSubordinates.length === 0) return <tr><td colSpan="6" className="table-state">Không có dữ liệu.</td></tr>;

        return sortedSubordinates.map((employee, index) => (
            <tr key={employee.id}>
                <td>
                    <input 
                        type="checkbox"
                        checked={selectedEmployees.has(employee.id)}
                        onChange={() => handleSelectOne(employee.id)}
                    />
                </td>
                <td>{index + 1}</td>
                <td>{employee.full_name}</td>
                <td>{employee.position_name || 'N/A'}</td>
                <td><StatusBadge status={employee.kpi_status} /></td>
                <td>
                    <button className="btn-view" onClick={() => onViewKpi(employee.id)}>
                        Xem & Chấm điểm
                    </button>
                </td>
            </tr>
        ));
    };

    return (
        <div className="table-container">
            <table className="evaluation-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" onChange={handleSelectAll} /></th>
                        <th>STT</th>
                        <th onClick={() => requestSort('full_name')}>Họ và Tên</th>
                        <th onClick={() => requestSort('position_name')}>Chức vụ</th>
                        <th onClick={() => requestSort('kpi_status')}>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {renderTableBody()}
                </tbody>
            </table>
        </div>
    );
};

export default EvaluationTable;