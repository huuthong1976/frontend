// src/components/dashboard/PendingTasks.js
import React from 'react';
import { Card, List, Button, Typography, Tag } from 'antd';
import { Link } from 'react-router-dom'; // Giả sử dùng React Router

const { Title, Text } = Typography;

const PendingTasks = ({ tasks, title }) => {
    return (
        <Card title={<Title level={5}>{title}</Title>} style={{ height: '100%' }}>
            <List
                itemLayout="horizontal"
                dataSource={tasks}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Link to={`/kpi/plan/${item.employee_id}/${item.month}/${item.year}`}>
                                <Button type="link">Xem</Button>
                            </Link>
                        ]}
                    >
                        <List.Item.Meta
                            title={<Text strong>{item.full_name}</Text>}
                            description={<Tag>{item.status}</Tag>}
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default PendingTasks;