// src/pages/ProfilePage.js
import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, notification, DatePicker, Row, Col, Card } from 'antd';
import api from 'utils/api'; // Giả sử đã có file api để gọi backend
import moment from 'moment';
import './ProfilePage.css';

const { Option } = Select;

const ProfilePage = () => {
    const [form] = Form.useForm();
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Giả sử API endpoint để lấy thông tin cá nhân là '/profile'
                const res = await api.get('/employees/profile');
                const { employee, companies, departments, positions } = res.data;

                setCompanies(companies);
                setDepartments(departments);
                setPositions(positions);

                if (employee) {
                    setEmployeeData(employee);
                    form.setFieldsValue({
                        ...employee,
                        dob: employee.dob ? moment(employee.dob) : null,
                        start_date: employee.start_date ? moment(employee.start_date) : null,
                    });
                }
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu hồ sơ:", err);
                setLoading(false);
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tải dữ liệu hồ sơ cá nhân. Vui lòng thử lại sau.',
                });
            }
        };

        fetchProfileData();
    }, [form]);

    const onFinish = async (values) => {
        try {
            const updatedValues = {
                ...values,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
                start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
            };

            // Giả sử API endpoint để cập nhật thông tin cá nhân là '/profile'
            await api.put('/profile', updatedValues);

            notification.success({
                message: 'Thành công',
                description: 'Cập nhật thông tin cá nhân thành công.',
            });
        } catch (err) {
            console.error("Lỗi khi cập nhật hồ sơ:", err);
            notification.error({
                message: 'Lỗi',
                description: err.response?.data?.msg || 'Đã xảy ra lỗi khi cập nhật hồ sơ.',
            });
        }
    };

    if (loading) {
        return <div className="loading-state">Đang tải...</div>;
    }

    if (!employeeData) {
        return <div className="error-state">Không tìm thấy dữ liệu hồ sơ.</div>;
    }

    return (
        <div className="profile-page-container">
            <Card title="Hồ sơ cá nhân">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={employeeData}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="employee_code" label="Mã nhân viên">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="company_id" label="Đơn vị">
                                <Select disabled>
                                    {companies.map(c => (
                                        <Option key={c.id} value={c.id}>{c.company_name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="position_id" label="Chức vụ">
                                <Select disabled>
                                    {positions.map(p => (
                                        <Option key={p.id} value={p.id}>{p.position_name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="total_salary" label="Lương tổng theo quyết định">
                                <Input prefix="VND" disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="base_salary_for_insurance" label="Lương đóng BHXH">
                                <Input prefix="VND" disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="dob" label="Ngày sinh">
                                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="phone" label="Số điện thoại">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Cập nhật thông tin
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ProfilePage;