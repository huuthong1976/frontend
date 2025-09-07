import React from 'react';
import './TablePagination.css';

const TablePagination = ({ currentPage, totalPages, onPageChange }) => {
    // Logic này sẽ được xây dựng khi bạn cần phân trang
    if (totalPages <= 1) {
        return null;
    }
    
    // Giao diện giữ chỗ
    return (
        <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                Trước
            </button>
            <span>Trang {currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
                Sau
            </button>
        </div>
    );
};

export default TablePagination;