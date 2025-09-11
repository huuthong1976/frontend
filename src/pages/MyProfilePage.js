import React, { useEffect, useState, useCallback } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Modal,
  message,
  Card,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import api from 'utils/api'; // Sử dụng file cấu hình axios chung

const { Option } = Select;

/* ========== Helpers ========== */
const normalizeGender = (g) => {
  if (!g) return undefined;
  const s = String(g).toLowerCase();
  if (['male', 'nam', 'm', '1'].includes(s)) return 'Nam';
  if (['female', 'nữ', 'nu', 'f', '0'].includes(s)) return 'Nữ';
  return 'Khác';
};

/* ========== Modal Đổi mật khẩu ========== */
/* ========== Modal Đổi mật khẩu (Đã điều chỉnh) ========== */
const ChangePasswordModal = ({ open, onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  
  // ✅ 1. Thêm state để lưu trữ độ mạnh mật khẩu
  const [passwordStrength, setPasswordStrength] = useState({ level: 'none', text: '', color: '' });

  // ✅ 2. Thêm hàm tiện ích để kiểm tra độ mạnh mật khẩu
  const checkPasswordStrength = (password) => {
    if (!password) return { level: 'none', text: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', text: 'Yếu', color: 'red' };
    if (score <= 4) return { level: 'medium', text: 'Trung bình', color: 'orange' };
    return { level: 'strong', text: 'Mạnh', color: 'green' };
  };
  
  const handleValuesChange = (changedValues, allValues) => {
    // Cập nhật chỉ báo mỗi khi người dùng gõ vào ô mật khẩu mới
    if (changedValues.new_password !== undefined) {
      setPasswordStrength(checkPasswordStrength(changedValues.new_password));
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      await api.put('/users/me/password', {
        currentPassword: values.current_password,
        newPassword: values.new_password,
      });
      message.success('Đổi mật khẩu thành công!');
      form.resetFields();
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.msg || 'Đổi mật khẩu thất bại!';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Modal
      title="Đổi mật khẩu"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Cập nhật"
      cancelText="Hủy"
      destroyOnClose
    >
      {/* ✅ 3. Thêm prop onValuesChange vào Form */}
      <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={handleValuesChange}>
        <Form.Item
          label="Mật khẩu hiện tại"
          name="current_password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Mật khẩu mới"
          name="new_password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
          ]}
          // ✅ 4. Thêm phần hiển thị chỉ báo độ mạnh
          help={passwordStrength.level !== 'none' && (
            <Typography.Text style={{ color: passwordStrength.color }}>
              Độ mạnh: {passwordStrength.text}
            </Typography.Text>
          )}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirm_password"
          dependencies={['new_password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Xác nhận mật khẩu không khớp'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

/* ========== Trang Hồ sơ ========== */
const MyProfilePage = () => {
  const [form] = Form.useForm();
  const [pwdOpen, setPwdOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      // Sửa lại để gọi đúng endpoint với tiền tố '/users'
      // Full path sẽ là: /api (từ baseURL) + /users (tiền tố) + /my-profile (route)
      const res = await api.get('/users/me');
      
      const profileData = res.data;

      form.setFieldsValue({
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone_number,
        gender: normalizeGender(profileData.gender),
        dob: profileData.date_of_birth ? dayjs(profileData.date_of_birth) : null,
        avatar_url: profileData.avatar_url,
        employee_code: profileData.employee_code,
        company_name: profileData.company_name,
        department_name: profileData.department_name,
        position_name: profileData.position_name,
        join_date: profileData.start_date ? dayjs(profileData.start_date) : null,
      });

    } catch (e) {
      console.error("Lỗi tải hồ sơ:", e);
      message.error('Không tải được hồ sơ cá nhân.');
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSave = async (vals) => {
    try {
      setSaving(true);
      const payload = {
        full_name: vals.full_name,
        phone_number: vals.phone,
        gender: vals.gender,
        date_of_birth: vals.dob ? vals.dob.format('YYYY-MM-DD') : null,
        avatar_url: vals.avatar_url,
      };

      // Sửa lại để gọi đúng endpoint với tiền tố '/users'
      await api.put('/users/profile', payload);

      message.success('Lưu hồ sơ thành công!');
      fetchProfile();
    } catch (e) {
      const msg = e?.response?.data?.error || 'Lưu hồ sơ thất bại!';
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="Hồ sơ cá nhân"
      extra={
        <Button type="primary" onClick={() => form.submit()} loading={saving}>
          Lưu hồ sơ
        </Button>
      }
      loading={loading}
    >
      <Row gutter={24}>
        <Col span={24}>
          <Button onClick={() => setPwdOpen(true)} style={{ marginBottom: 16 }}>
            Đổi mật khẩu
          </Button>
        </Col>
      </Row>

      <Form form={form} layout="vertical" onFinish={onSave}>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item label="Họ và tên" name="full_name" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
              <Input placeholder="Họ và tên" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Giới tính" name="gender">
              <Select placeholder="Chọn giới tính" allowClear>
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Email" name="email">
              <Input placeholder="Email" disabled />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Số điện thoại" name="phone">
              <Input placeholder="Số điện thoại" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Ngày sinh" name="dob">
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Avatar URL" name="avatar_url">
              <Input placeholder="https://…" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xs={24} md={6}><Form.Item label="Mã nhân viên" name="employee_code"><Input disabled /></Form.Item></Col>
          <Col xs={24} md={6}><Form.Item label="Đơn vị" name="company_name"><Input disabled /></Form.Item></Col>
          <Col xs={24} md={6}><Form.Item label="Phòng ban" name="department_name"><Input disabled /></Form.Item></Col>
          <Col xs={24} md={6}><Form.Item label="Chức vụ" name="position_name"><Input disabled /></Form.Item></Col>
          <Col xs={24} md={6}><Form.Item label="Ngày vào làm" name="join_date"><DatePicker style={{ width: '100%' }} disabled /></Form.Item></Col>
        </Row>
      </Form>

      <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} />
    </Card>
  );
};

export default MyProfilePage;
