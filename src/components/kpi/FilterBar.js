import React from 'react';
import './FilterBar.css';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả các trạng thái' },
    { value: 'Chưa tạo', label: 'Chưa lập kế hoạch' },
    { value: 'Mới tạo', label: 'Mới tạo (Bản nháp)' },
    { value: 'Chờ tự chấm', label: 'Chờ tự chấm' },
    { value: 'Chờ QL chấm', label: 'Chờ QL chấm' },
    { value: 'Chờ TGĐ chấm', label: 'Chờ TGĐ chấm' },
    { value: 'Hoàn thành', label: 'Hoàn thành' },
];

const FilterBar = ({ filters, onFilterChange, companies, isAdminOrCEO }) => {

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    return (
        <div className="filter-bar">
            {/* Bộ lọc theo công ty (chỉ cho Admin/CEO) */}
            {isAdminOrCEO && (
                <div className="filter-item">
                    <label htmlFor="company-filter">Đơn vị</label>
                    <select id="company-filter" name="company" value={filters.company} onChange={handleInputChange}>
                        <option value="">-- Chọn đơn vị --</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                    </select>
                </div>
            )}
            
            {/* Bộ lọc Tháng/Năm/Trạng thái */}
            <div className="filter-item">
                <label htmlFor="month-filter">Tháng</label>
                <select id="month-filter" name="month" value={filters.month} onChange={handleInputChange}>
                    {[...Array(12).keys()].map(i => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                </select>
            </div>
            <div className="filter-item">
                <label htmlFor="year-filter">Năm</label>
                <select id="year-filter" name="year" value={filters.year} onChange={handleInputChange}>
                    {[...Array(7).keys()].map(i => <option key={2024 + i} value={2024 + i}>{2024 + i}</option>)}
                </select>
            </div>
            <div className="filter-item">
                <label htmlFor="status-filter">Trạng thái</label>
                <select id="status-filter" name="status" value={filters.status} onChange={handleInputChange}>
                    {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            {/* Ô tìm kiếm mới */}
            <div className="filter-item filter-item--search">
                <label htmlFor="search-filter">Tìm kiếm nhân viên</label>
                <input
                    type="text"
                    id="search-filter"
                    name="searchTerm"
                    placeholder="Nhập tên để tìm..."
                    value={filters.searchTerm}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default FilterBar;