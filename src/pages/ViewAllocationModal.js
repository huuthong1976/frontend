import React from 'react';
import { Modal, Descriptions, Empty, Button } from 'antd';

const ViewAllocationModal = ({ kpi, visible, onCancel }) => {
    // Kiểm tra xem có dữ liệu phân bổ hay không
    const hasData = kpi && kpi.monthlyAllocations && kpi.monthlyAllocations.length > 0;

    return (
        <Modal
            // SỬA LỖI: Truy cập đúng vào kpi.kpiDetail.kpi_name
            title={`Chi tiết phân bổ cho: ${kpi?.kpiDetail?.kpi_name || 'KPI'}`}
            open={visible}
            onCancel={onCancel}
            width={800}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Đóng
                </Button>
            ]}
        >
            {hasData ? (
                <>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div style={{ color: 'gray' }}>Tổng chỉ tiêu năm</div>
                        <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                            {Number(kpi.target_value).toLocaleString('vi-VN')}
                        </div>
                    </div>
                    
                    {/* CẢI TIẾN: Dùng Descriptions để có giao diện đẹp và đồng bộ */}
                    <Descriptions bordered column={4} size="small">
                        {kpi.monthlyAllocations
                            .sort((a, b) => a.month - b.month) // Sắp xếp các tháng theo thứ tự
                            .map(item => (
                                <Descriptions.Item key={item.month} label={`Tháng ${item.month}`}
                                labelStyle={{ textAlign: 'center' }}
                                    contentStyle={{ textAlign: 'center', fontWeight: '500' }}
                                >
                                    {Number(item.target_value).toLocaleString('vi-VN')}
                                </Descriptions.Item>
                            ))
                        }
                    </Descriptions>
                </>
            ) : (
                <Empty description="Chưa có dữ liệu phân bổ cho KPI này." />
            )}
        </Modal>
    );
};

export default ViewAllocationModal;