/* ========================================================= */
/* FILE: src/pages/BscConfigPage.js (robust version)         */
/* ========================================================= */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card, Form, Button, message, Space, InputNumber, Typography,
  Row, Col, Alert, Spin, Select, Empty
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from 'utils/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function BscConfigPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [form] = Form.useForm();
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  const [perspectives, setPerspectives] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState(undefined);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [totalWeight, setTotalWeight] = useState(0);

  // --------- Load companies ----------
  const loadCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    try {
      const { data } = await api.get('/companies');
      const rows = Array.isArray(data) ? data : (data?.rows || []);
      setCompanies(rows);

      if (!isAdmin && user?.company_id) {
        setSelectedCompany(user.company_id);
      } else if (!selectedCompany && rows.length) {
        setSelectedCompany(rows[0].id);
      }
    } catch (err) {
      message.error(err?.response?.data?.error || 'Không thể tải danh sách đơn vị.');
      setCompanies([]);
    } finally {
      setCompaniesLoading(false);
    }
  }, [isAdmin, selectedCompany, user]);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);

  const companyOptions = useMemo(
    () => (companies || []).map(c => ({
      value: c.id,
      label: c.company_name || c.name || `Đơn vị #${c.id}`,
    })),
    [companies]
  );

  const yearOptions = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => cur - 3 + i)
      .map(y => ({ value: y, label: String(y) }));
  }, []);

  // --------- Load perspectives & weights (KHÔNG để chung 1 try/catch) ----------
  const loadWeights = useCallback(async () => {
    if (!selectedCompany) {
      setPerspectives([]);
      form.resetFields();
      setTotalWeight(0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1) Luôn ưu tiên lấy danh mục khía cạnh
      const { data: aspects } = await api.get('/kpi-aspects');
      const aspectRows = Array.isArray(aspects) ? aspects : [];

      // 2) Thử lấy tỷ trọng; nếu lỗi, không chặn
      let weightRows = [];
      try {
        const { data } = await api.get('/kpi-aspects/weights', {
          params: { company_id: selectedCompany, year: selectedYear },
        });
        weightRows = Array.isArray(data) ? data : [];
      } catch (werr) {
        // Chỉ cảnh báo, vẫn hiển thị danh mục khía cạnh
        const msg = werr?.response?.data?.error || 'Không tải được tỷ trọng — mặc định 0%.';
        message.warning(msg);
      }

      const rows = aspectRows.map(p => {
        const found = weightRows.find(w => Number(w.perspective_id) === Number(p.id));
        return { ...p, weight: found ? Number(found.weight_percentage) : 0 };
      });

      setPerspectives(rows);

      const initial = rows.reduce((acc, it) => {
        acc[`weight_${it.id}`] = it.weight;
        return acc;
      }, {});
      form.setFieldsValue(initial);
      setTotalWeight(Object.values(initial).reduce((s, v) => s + (Number(v) || 0), 0));
    } catch (err) {
      // Chỉ rơi vào đây khi DANH MỤC khía cạnh lỗi
      const msg = err?.response?.data?.error || 'Không thể tải danh mục khía cạnh.';
      setError(msg);
      message.error(msg);
      setPerspectives([]);
      form.resetFields();
      setTotalWeight(0);
    } finally {
      setLoading(false);
    }
  }, [form, selectedCompany, selectedYear]);

  useEffect(() => { loadWeights(); }, [loadWeights]);

  // --------- Save ----------
  const onFinish = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        company_id: selectedCompany,
        year: selectedYear,
        weights: perspectives.map(p => ({
          perspective_id: p.id,
          weight_percentage: parseFloat(values[`weight_${p.id}`] || 0),
        })),
      };
      await api.post('/kpi-aspects/weights', payload);
      message.success('Cập nhật tỷ trọng BSC thành công!');
    } catch (err) {
      message.error(err?.response?.data?.error || 'Cập nhật thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Title level={4}>Cấu hình Tỷ trọng Khía cạnh BSC</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={(_, all) => {
          const sum = Object.values(all).reduce((s, v) => s + (Number(v) || 0), 0);
          setTotalWeight(sum);
        }}
      >
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <Form.Item label="Đơn vị">
              <Select
                style={{ width: '100%' }}
                placeholder="-- Chọn Đơn vị --"
                value={selectedCompany}
                onChange={setSelectedCompany}
                options={companyOptions}
                loading={companiesLoading}
                disabled={!isAdmin}
                allowClear={isAdmin}
                showSearch
                optionFilterProp="label"
                notFoundContent={
                  companiesLoading ? <Spin size="small" /> :
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Năm">
              <Select
                style={{ width: '100%' }}
                value={selectedYear}
                onChange={setSelectedYear}
                options={yearOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        {selectedCompany && (
          <>
            {loading ? (
              <Spin tip="Đang tải dữ liệu..." />
            ) : error ? (
              <Alert type="error" showIcon message="Lỗi" description={error} />
            ) : (
              <>
                <Row gutter={16}>
                  {perspectives.map(p => (
                    <Col xs={24} sm={12} md={6} key={p.id}>
                      <Form.Item
                        name={`weight_${p.id}`}
                        label={p.name}
                        rules={[{ required: true, message: `Vui lòng nhập tỷ trọng cho ${p.name}` }]}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          formatter={(v) => `${v}%`}
                          parser={(v) => (v || '').replace('%', '')}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                  ))}
                </Row>

                <Form.Item>
                  <Space style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isSubmitting}
                      disabled={Math.round(totalWeight) !== 100}
                    >
                      Lưu cấu hình
                    </Button>

                    <Text type={Math.round(totalWeight) === 100 ? 'success' : 'danger'}>
                      <Space>
                        {Math.round(totalWeight) === 100 ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        Tổng tỷ trọng: {totalWeight.toFixed(2)}%
                      </Space>
                    </Text>
                  </Space>
                </Form.Item>
              </>
            )}
          </>
        )}
      </Form>
    </Card>
  );
}
