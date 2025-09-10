// CreateUserPage.js (phiên bản đã chỉnh sửa)

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, DatePicker, message, Row, Col } from 'antd';
// THAY ĐỔI 1: Import apiService thay vì api và đường dẫn có thể cần điều chỉnh
import { apiService } from '../../services/apiService';

//const { Option } = Select;

const CreateUserPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // THAY ĐỔI 2: Gọi các hàm lấy dữ liệu từ apiService
                // Logic không đổi, chỉ thay đổi nơi gọi hàm
                const [companiesRes, positionsRes] = await Promise.all([
                    apiService.getCompanies(),
                    apiService.getPositions()
                ]);
                setCompanies(companiesRes); // Dữ liệu trả về đã được xử lý trong service
                setPositions(positionsRes);
            } catch (error) {
                message.error('Không thể tải dữ liệu công ty hoặc chức vụ!');
            }
        };
        fetchData();
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        const formattedValues = {
            ...values,
            start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        };

        try {
            // THAY ĐỔI 3: Gọi hàm createUser từ apiService
            await apiService.createUser(formattedValues);
            message.success('Tạo người dùng mới thành công!');
            form.resetFields();
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Đã xảy ra lỗi!';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // Phần JSX (giao diện) bên dưới không cần thay đổi gì
    return (
        <Card title="Thêm người dùng mới">
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                            <Input placeholder="Ví dụ: Nguyễn Văn An" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="employee_code" label="Mã nhân viên" rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên!' }]}>
                            <Input placeholder="Ví dụ: NV001" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
                            <Input placeholder="Ví dụ: an.nv@company.com" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                            <Input.Password placeholder="Nhập mật khẩu ban đầu" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="company_id" label="Công ty" rules={[{ required: true, message: 'Vui lòng chọn công ty!' }]}>
                            <Select placeholder="Chọn công ty"
                           options={companies.map(c => ({ value: c.id, label: c.name || c.company_name || c.title }))}
                            />
                                                          
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="id" label="Chức vụ" rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}>
                        <Select
                            placeholder="Chọn chức vụ"
                            options={positions.map(p => ({
                            value: p.id,
                            label: p.position_name
                            }))}
                        />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                     <Col span={12}>
                         <Form.Item name="start_date" label="Ngày vào làm">
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày"/>
                        </Form.Item>
                     </Col>
                </Row>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Thêm người dùng
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CreateUserPage;