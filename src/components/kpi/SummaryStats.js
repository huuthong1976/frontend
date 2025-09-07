import React from 'react';
import './SummaryStats.css'; // Bạn sẽ cần tạo file CSS này để định dạng

const SummaryStats = ({ stats }) => {
    // Nếu chưa có dữ liệu stats thì không hiển thị gì
    if (!stats) {
        return null;
    }

    const statItems = [
        { label: 'Tổng số', value: stats.total, className: 'total' },
        { label: 'Chờ QL duyệt', value: stats.pendingManager, className: 'pending-manager' },
        { label: 'Chờ TGĐ duyệt', value: stats.pendingCEO, className: 'pending-ceo' },
        { label: 'Hoàn thành', value: stats.completed, className: 'completed' }
    ];

    return (
        <div className="summary-stats">
            {statItems.map(item => (
                <div key={item.label} className={`stat-card stat-card--${item.className}`}>
                    <div className="stat-value">{item.value}</div>
                    <div className="stat-label">{item.label}</div>
                </div>
            ))}
        </div>
    );
};

export default SummaryStats;