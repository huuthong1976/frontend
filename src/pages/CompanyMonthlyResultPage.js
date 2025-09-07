import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, Table, Typography, Button, Space, message, Select, InputNumber, Row, Col, Statistic, Spin, Empty } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { getCompanies, getUnitKpiResults, saveUnitKpiResults } from '../services/api.service';

const { Title } = Typography;

/**
 * Tính điểm cho toàn bộ KPI (dạng phẳng), dựng lại cây và tổng hợp điểm từ dưới lên.
 * Quy tắc % hoàn thành:
 * - target = 0:
 *    - actual = 0  -> 100%
 *    - actual > 0:
 *        - "cao hơn tốt hơn" -> 200% (coi là vượt trội khi không có kế hoạch)
 *        - "thấp hơn tốt hơn" -> 0%
 * - target > 0: công thức chuẩn:
 *    - "cao hơn tốt hơn": actual / target * 100
 *    - "thấp hơn tốt hơn": (2 - actual/target) * 100
 * - Giới hạn [0%, 200%]
 */
const calculateKpis = (kpis) => {
  if (!Array.isArray(kpis)) return [];

  const kpiMap = new Map(kpis.map(kpi => [kpi.id, { ...kpi, children: [] }]));

  // dựng cây
  kpis.forEach(kpi => {
    if (kpi.parent_registration_id && kpiMap.has(kpi.parent_registration_id)) {
      const parent = kpiMap.get(kpi.parent_registration_id);
      if (parent) parent.children.push(kpiMap.get(kpi.id));
    }
  });

  // tính % và điểm
  kpiMap.forEach(kpi => {
    const actual = Number(kpi.actual_value) || 0;
    const target = Number(kpi.target_month) || 0;
    const weight = Number(kpi.weight) || 0;
    const direction = (kpi.direction || '').toLowerCase(); // 'cao hơn tốt hơn' | 'thấp hơn tốt hơn'

    let completion_rate = 0;

    if (target === 0) {
      if (actual === 0) {
        completion_rate = 100;
      } else if (direction.includes('thấp')) {
        // Thấp hơn tốt hơn: có phát sinh dương ngoài kế hoạch -> 0; nếu <=0 -> 200
        completion_rate = actual <= 0 ? 200 : 0;
      } else {
        // Cao hơn tốt hơn: dương -> 200; âm/0 -> 0
        completion_rate = actual > 0 ? 200 : 0;
      }
    } else {
      if (direction.includes('thấp')) {
        completion_rate = (2 - (actual / target)) * 100;
      } else {
        completion_rate = (actual / target) * 100;
      }
    }

    completion_rate = Math.max(0, Math.min(200, completion_rate)); // clamp [0, 200]

    kpi.completion_rate = completion_rate;
    kpi.score = (completion_rate / 100) * weight;
    kpi.is_parent = (kpi.children || []).length > 0;
  });

  // tổng điểm cha = tổng điểm con
  const aggregateScores = (node) => {
    if (node.children && node.children.length > 0) {
      node.children.forEach(aggregateScores);
      node.score = node.children.reduce((sum, child) => sum + (child.score || 0), 0);
    }
  };

  const rootKpis = Array.from(kpiMap.values()).filter(kpi => !kpi.parent_registration_id);
  rootKpis.forEach(aggregateScores);

  return Array.from(kpiMap.values());
};

/** Tổng điểm = tổng điểm các KPI lá */
const calculateFinalSummaryScore = (kpis) => {
  const leafKpis = (kpis || []).filter(k => !k.is_parent);
  return leafKpis.reduce((sum, k) => sum + (Number(k.score) || 0), 0);
};

const CompanyMonthlyResultPage = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [summaryScore, setSummaryScore] = useState(0);
  const [filters, setFilters] = useState({
    companyId: user?.company_id ?? null,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const debounceTimer = useRef(null);

  const fetchData = useCallback(async () => {
    if (!filters.companyId) return;
    setLoading(true);
    try {
      const response = await getUnitKpiResults(filters);
      const flatKpiList = (response.detailedResults || []);

      const calculatedData = calculateKpis(flatKpiList);
      setDataSource(calculatedData);

      const finalScore = calculateFinalSummaryScore(calculatedData);
      setSummaryScore(finalScore);
    } catch (error) {
      message.error('Không thể tải dữ liệu kết quả KPI.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Tải danh sách đơn vị – hiển thị đúng tên (company_name | name) & chọn mặc định hợp lý
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyData = await getCompanies();
        setCompanies(companyData || []);

        // Non-Admin: luôn neo theo công ty của user
        if (user?.company_id) {
          setFilters(prev => ({ ...prev, companyId: user.company_id }));
        } else if (companyData?.length > 0 && !filters.companyId) {
          setFilters(prev => ({ ...prev, companyId: companyData[0].id }));
        }
      } catch {
        message.error('Không thể tải danh sách đơn vị.');
      }
    };
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleActualValueChange = (kpiId, newValue) => {
    const updatedDataSource = dataSource.map(kpi =>
      kpi.id === kpiId ? { ...kpi, actual_value: newValue } : kpi
    );
    setDataSource(updatedDataSource);

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const recalculatedData = calculateKpis(updatedDataSource);
      const finalScore = calculateFinalSummaryScore(recalculatedData);
      setDataSource(recalculatedData);
      setSummaryScore(finalScore);
    }, 500);
  };

  /***
   * FIX QUAN TRỌNG: gửi đúng payload cho BE
   * - Chỉ gửi KPI lá
   * - Mỗi phần tử: { registration_id, actual_value }
   * - Kèm companyId/year/month
   */
  const handleSaveResults = async () => {
    if (!filters.companyId) {
      message.warning('Vui lòng chọn đơn vị.');
      return;
    }

    const leafResults = (dataSource || [])
      .filter(k => !k.is_parent)
      .map(k => ({
        registration_id: k.id,                         // id ở màn này chính là mã đăng ký
        actual_value: Number(k.actual_value) || 0,     // default 0 nếu bỏ trống
      }));

    setSaving(true);
    try {
      await saveUnitKpiResults({
        company_id: filters.companyId,
        year: filters.year,
        month: filters.month,
        results: leafResults,
      });
      message.success('Lưu kết quả thành công!');
      await fetchData();
    } catch (error) {
      const errMsg = error?.response?.data?.error || 'Lưu kết quả thất bại.';
      message.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'Tên KPI', dataIndex: 'kpi_name', key: 'kpi_name' },
    { title: 'Chỉ tiêu tháng', dataIndex: 'target_month', key: 'target_month', align: 'right', width: 150, render: val => val ? parseFloat(val).toLocaleString('vi-VN') : 0 },
    {
      title: 'Kết quả thực tế', dataIndex: 'actual_value', key: 'actual_value', align: 'right', width: 150,
      render: (text, record) => (
        <InputNumber
          style={{ width: '100%' }}
          value={text}
          onChange={(value) => handleActualValueChange(record.id, value)}
          disabled={saving || record.is_parent}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/,/g, '')}
        />
      )
    },
    { title: '% Hoàn thành', dataIndex: 'completion_rate', key: 'completion_rate', align: 'right', width: 120, render: val => `${parseFloat(val || 0).toFixed(2)}%` },
    { title: 'Điểm trọng số', dataIndex: 'score', key: 'score', align: 'right', width: 120, render: val => parseFloat(val || 0).toFixed(2) },
  ];

  // Dựng dữ liệu tree theo khía cạnh
  const tableTreeData = useMemo(() => {
    const kpiMap = new Map(dataSource.map(kpi => [kpi.id, { ...kpi, children: [] }]));
    const aspectMap = new Map();

    dataSource.forEach(kpi => {
      const parentId = kpi.parent_registration_id;
      if (parentId && kpiMap.has(parentId)) {
        kpiMap.get(parentId).children.push(kpiMap.get(kpi.id));
      } else {
        const aspectName = kpi.aspectName || 'Chưa phân loại';
        if (!aspectMap.has(aspectName)) {
          aspectMap.set(aspectName, []);
        }
        aspectMap.get(aspectName).push(kpiMap.get(kpi.id));
      }
    });

    return Array.from(aspectMap.entries()).map(([aspectName, kpis], index) => ({
      key: `aspect-${aspectName || index}`,
      kpi_name: aspectName || 'Chưa phân loại',
      isAspect: true,
      children: kpis,
    }));
  }, [dataSource]);

  const renderContent = () => {
    if (loading) return <Spin />;
    if (dataSource.length === 0) return <Empty description="Không có dữ liệu KPI cho bộ lọc đã chọn." />;
    return (
      <Table
        columns={columns}
        dataSource={tableTreeData}
        rowKey="key"
        bordered
        pagination={false}
        expandable={{ defaultExpandAllRows: true }}
        rowClassName={record => record.isAspect ? 'aspect-row' : ''}
        summary={() => (
          <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
            <Table.Summary.Cell index={0} colSpan={4}>Tổng điểm</Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right">{summaryScore.toFixed(2)}</Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>Đánh giá Kết quả KPI Đơn vị</Title>

      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col flex="auto">
            <Space wrap>
              <Select
                style={{ width: 260 }}
                placeholder="Chọn đơn vị"
                value={filters.companyId}
                onChange={(value) => setFilters(prev => ({ ...prev, companyId: value }))}
                disabled={!!(user && user.role !== 'Admin')}
                options={companies.map(c => ({
                  value: c.id,
                  label: c.company_name || c.name,
                }))}
                optionFilterProp="label"
                showSearch
              />
              <Select
                style={{ width: 120 }}
                value={filters.year}
                onChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
                options={[...Array(5).keys()].map(i => {
                  const y = new Date().getFullYear() - 2 + i;
                  return { value: y, label: y };
                })}
              />
              <Select
                style={{ width: 120 }}
                value={filters.month}
                onChange={(value) => setFilters(prev => ({ ...prev, month: value }))}
                options={[...Array(12).keys()].map(i => ({ value: i + 1, label: `Tháng ${i + 1}` }))}
              />
            </Space>
          </Col>
          <Col>
            <Statistic title="Tổng điểm KPI tháng" value={summaryScore} precision={2} suffix="/ 100" />
          </Col>
        </Row>
      </Card>

      <Card>
        {renderContent()}
      </Card>

      <div style={{ position: 'fixed', bottom: 0, left: 200, right: 0, padding: '16px 24px', background: '#fff', boxShadow: '0 -2px 8px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSaveResults}
          loading={saving}
          disabled={dataSource.length === 0 || loading}
        >
          Lưu Toàn bộ Kết quả
        </Button>
      </div>
    </div>
  );
};

export default CompanyMonthlyResultPage;
