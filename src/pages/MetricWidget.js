
import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { UserOutlined, RiseOutlined, DollarCircleOutlined, SolutionOutlined } from '@ant-design/icons';

const { Text } = Typography;

const iconMap = {
    user: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
    kpi: <RiseOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
    payroll: <DollarCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />,
    task: <SolutionOutlined style={{ fontSize: 24, color: '#f5222d' }} />,
};

const MetricWidget = ({ title, value, isCurrency = false, iconType }) => {
    const formatCurrency = (val) => {
        if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} tỷ`;
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)} tr`;
        return val?.toLocaleString('vi-VN');
    };

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Text type="secondary">{title.toUpperCase()}</Text>
                    <Statistic 
                        value={value} 
                        precision={0}
                        formatter={isCurrency ? formatCurrency : undefined}
                        valueStyle={{ fontSize: 28, fontWeight: 500 }}
                    />
                </div>
                {iconMap[iconType]}
            </div>
        </Card>
    );
};

export default MetricWidget;