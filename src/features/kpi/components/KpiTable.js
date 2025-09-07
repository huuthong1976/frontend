// src/features/kpi/components/KpiTable.js

import React from 'react';
import { Table, Input, InputNumber, Typography } from 'antd';

const { Text } = Typography;

/**
 * Component KpiTable: Chỉ chịu trách nhiệm hiển thị bảng dữ liệu KPI.
 * @param {object[]} items - Mảng dữ liệu các mục KPI.
 * @param {function} onInputChange - Hàm callback được gọi khi giá trị trong ô thay đổi.
 * @param {object} permissions - Đối tượng chứa các quyền (canSelfAssess, canManagerAssess, ...).
 * @param {boolean} loading - Trạng thái loading của bảng.
 */
const KpiTable = ({ items, onInputChange, permissions, loading }) => {
    // Định nghĩa cấu trúc các cột cho bảng
    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            width: 60,
            align: 'center',
            // `render` được dùng để hiển thị số thứ tự thay vì dùng dữ liệu từ record
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Nội dung công việc',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            // Giả định nội dung công việc không thể chỉnh sửa sau khi đã nộp
            render: (text) => <Text>{text}</Text>,
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unit',
            key: 'unit',
            width: 120,
            render: (text) => <Text>{text}</Text>,
        },
        {
            title: 'Chỉ tiêu',
            dataIndex: 'target',
            key: 'target',
            width: 100,
            align: 'center',
            render: (text) => <Text>{text}</Text>,
        },
        {
            title: 'Trọng số (%)',
            dataIndex: 'weight',
            key: 'weight',
            width: 100,
            align: 'center',
            render: (text) => <Text>{text}%</Text>,
        },
        {
            title: 'Kết quả',
            dataIndex: 'result',
            key: 'result',
            width: 150,
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => onInputChange(record.id, 'result', e.target.value)}
                    // Chỉ cho phép nhân viên nhập kết quả khi ở giai đoạn tự chấm
                    disabled={!permissions.canSelfAssess}
                />
            ),
        },
        {
            title: 'Cá nhân tự chấm',
            dataIndex: 'self_score',
            key: 'self_score',
            width: 120,
            align: 'center',
            render: (text, record) => (
                <InputNumber
                    value={text}
                    onChange={(value) => onInputChange(record.id, 'self_score', value)}
                    disabled={!permissions.canSelfAssess}
                    min={0}
                    max={100} // Giả sử thang điểm 100
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Trưởng ĐV chấm',
            dataIndex: 'manager_score',
            key: 'manager_score',
            width: 120,
            align: 'center',
            render: (text, record) => (
                <InputNumber
                    value={text}
                    onChange={(value) => onInputChange(record.id, 'manager_score', value)}
                    disabled={!permissions.canManagerAssess}
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'TGĐ chấm',
            dataIndex: 'director_score',
            key: 'director_score',
            width: 120,
            align: 'center',
            render: (text, record) => (
                <InputNumber
                    value={text}
                    onChange={(value) => onInputChange(record.id, 'director_score', value)}
                    disabled={!permissions.canDirectorAssess}
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                />
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={items}
            rowKey="id"
            pagination={false}
            bordered
            loading={loading}
            scroll={{ x: 1400 }} // Cho phép cuộn ngang nếu bảng quá rộng
        />
    );
};

export default KpiTable;