import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import api from "../utils/api"; // axios instance có baseURL '/api'

export default function ChangePasswordModal({ open, onClose }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async ({ currentPassword, newPassword }) => {
    setSubmitting(true);
    try {
      await api.put("/users/me/password", { currentPassword, newPassword });
      message.success("Đổi mật khẩu thành công!");
      form.resetFields();
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.message ||
        "Đổi mật khẩu thất bại.";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Đổi mật khẩu"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose?.();
      }}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu hiện tại" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 8, message: "Mật khẩu mới tối thiểu 8 ký tự." },
          ]}
        >
          <Input.Password placeholder="Mật khẩu mới (≥ 8 ký tự)" />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Xác nhận mật khẩu mới"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng nhập lại mật khẩu mới!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                return !value || getFieldValue("newPassword") === value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Mật khẩu nhập lại không khớp!"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu mới" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={submitting}>
          Lưu thay đổi
        </Button>
      </Form>
    </Modal>
  );
}
ChangePasswordModal.propTypes = {};