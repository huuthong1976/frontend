// src/components/hrm/EmployeeForm.js

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Upload, notification, Row, Col, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from 'utils/api';
import moment from 'moment';

const { Option } = Select;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const EmployeeForm = ({ onSuccess, onClose, employee }) => {
    const [form] = Form.useForm();
    const [ setFileList] = useState([]);
    const [dropdownData, setDropdownData] = useState({ companies: [], departments: [], positions: [], managers: [] });
    const [loading, setLoading] = useState(false);
    
    const companyId = Form.useWatch('company_name', form);

    // CẢI TIẾN: Tải dữ liệu cho các dropdown
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const res = await api.get('/employees/data-for-form');
                setDropdownData(res.data);
            } catch (err) {
                notification.error({ message: "Không thể tải dữ liệu cho form." });
            }
        };
        fetchDropdowns();
    }, []);
    
    // CẢI TIẾN: Set giá trị ban đầu cho form khi ở chế độ "sửa"
    useEffect(() => {
        if (employee) {
            form.setFieldsValue({
                ...employee,
                dob: employee.dob ? moment(employee.dob) : null,
                start_date: employee.start_date ? moment(employee.start_date) : null,
            });
            if (employee.avatar_url) {
                setFileList([{
                    uid: '-1',
                    name: 'avatar.png',
                    status: 'done',
                    url: `${API_BASE_URL}${employee.avatar_url}`,
                }]);
            }
        } else {
            form.resetFields();
        }
    }, [employee, form]);

    // CẢI TIẾN: Xử lý logic submit bằng onFinish của antd Form
    const onFinish = async (values) => {
        setLoading(true);
        const submissionForm = new FormData();
        
        for (const key in values) {
            if (key === 'avatar' && values.avatar?.file) {
                 submissionForm.append('avatar_file', values.avatar.file.originFileObj);
            } else if (values[key] !== undefined && values[key] !== null) {
                // Định dạng lại ngày tháng trước khi gửi
                if (['dob', 'start_date'].includes(key) && values[key]) {
                    submissionForm.append(key, moment(values[key]).format('DD-MM-YYYY'));
                } else {
                    submissionForm.append(key, values[key]);
                }
            }
        }

        try {
            if (employee) {
                await api.put(`/employees/${employee.id}`, submissionForm, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/employees', submissionForm, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            notification.success({ message: 'Lưu nhân sự thành công!' });
            onSuccess(); // Gọi callback để đóng modal và tải lại dữ liệu
        } catch (err) {
            notification.error({ message: err.response?.data?.error || "Lỗi khi lưu nhân sự." });
        } finally {
            setLoading(false);
        }
    };
    
    const filteredDepartments = dropdownData.departments.filter(dept => dept.company_id === companyId);

   // Cấu trúc JSX mới cho EmployeeForm
return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'Đang làm việc' }}>
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                    <Input />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="employee_code" label="Mã nhân viên" rules={[{ required: true, message: 'Vui lòng nhập mã NV!' }]}>
                    <Input />
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
                    <Input />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="phone" label="Số điện thoại">
                    <Input />
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="dob" label="Ngày sinh">
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="start_date" label="Ngày vào làm">
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
            </Col>
        </Row>
        
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="company_id" label="Đơn vị" rules={[{ required: true, message: 'Vui lòng chọn đơn vị!' }]}>
                    <Select placeholder="Chọn đơn vị">
                        {dropdownData.companies.map(c => <Option key={c.id} value={c.id}>{c.company_name}</Option>)}
                    </Select>
                </Form.Item>
            </Col>
            <Col span={12}>
                 <Form.Item name="department_id" label="Phòng ban">
                    <Select placeholder="Chọn phòng ban" disabled={!companyId}>
                        {filteredDepartments.map(d => <Option key={d.id} value={d.id}>{d.department_name}</Option>)}
                    </Select>
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={16}>
            <Col span={12}>
                 <Form.Item name="position_id" label="Chức vụ">
                    <Select placeholder="Chọn chức vụ">
                        {dropdownData.positions.map(p => <Option key={p.id} value={p.id}>{p.position_name}</Option>)}
                    </Select>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="status" label="Trạng thái">
                    <Select>
                        <Option value="Đang làm việc">Đang làm việc</Option>
                        <Option value="Đã nghỉ việc">Đã nghỉ việc</Option>
                    </Select>
                </Form.Item>
            </Col>
        </Row>

        <Form.Item name="avatar" label="Ảnh đại diện" valuePropName="fileList">
             <Upload 
                listType="picture" 
                maxCount={1} 
                beforeUpload={() => false} // Ngăn tự động upload
             >
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </Upload>
        </Form.Item>
        
        {/* ... các trường chỉ dành cho Admin có thể đặt ở đây ... */}

        <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
                <Button onClick={onClose}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading}>Lưu</Button>
            </Space>
        </Form.Item>
    </Form>
);
};

export default EmployeeForm;
