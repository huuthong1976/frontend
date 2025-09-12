// src/pages/PendingTasks.jsx  (hoặc src/components/dashboard/PendingTasks.jsx)
import React from 'react';
import PropTypes from 'prop-types';
import { Card, List, Button, Typography, Tag, Empty } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const PendingTasks = ({ tasks, title }) => {
  return (
    <Card title={<Title level={5}>{title}</Title>} style={{ height: '100%' }}>
      {(!tasks || tasks.length === 0) ? (
        <Empty description="Không có công việc nào" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={tasks}
          // đảm bảo mỗi item có key ổn định để hết lỗi react/jsx-key
          rowKey={(item) => item.id ?? `${item.employee_id}-${item.month}-${item.year}`}
          renderItem={(item) => (
            <List.Item
              actions={[
                // thêm key cho phần tử trong mảng actions
                <Link
                  key="view"
                  to={`/kpi/plan/${item.employee_id}/${item.month}/${item.year}`}
                >
                  <Button type="link">Xem</Button>
                </Link>,
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{item.full_name}</Text>}
                description={<Tag>{item.status}</Tag>}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

PendingTasks.propTypes = {
  title: PropTypes.string,
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      employee_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      month: PropTypes.number.isRequired,
      year: PropTypes.number.isRequired,
      full_name: PropTypes.string,
      status: PropTypes.string,
    })
  ),
};

PendingTasks.defaultProps = {
  title: 'Công việc chờ xử lý',
  tasks: [],
};

export default PendingTasks;
