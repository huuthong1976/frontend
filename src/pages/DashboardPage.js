import React, { useState } from 'react';
import { Row, Col, Typography, Select, Spin, Alert } from 'antd';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext';

import MetricWidget from './MetricWidget';
import KpiByDeptChart from './KpiByDeptChart';
import PendingTasks from './PendingTasks';

const { Title } = Typography;
const { Option } = Select;

const ALLOWED_ROLES = ['Admin','TongGiamDoc','TruongDonVi','Truongphong','PhoDV','Phophong'];

function getNormalizedRole(user) {
  let r = user?.role ?? user?.Role ?? null;
  if (!r) {
    try {
      const t = localStorage.getItem('token');
      if (t) {
        const payload = JSON.parse(atob((t.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')));
        r = payload?.role || null;
      }
    } catch {}
  }
  return typeof r === 'string' ? r.trim() : null;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const role = getNormalizedRole(user);

  const [filters, setFilters] = useState({});
  const { summary, loading, error } = useDashboardData(filters);

  if (!role) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" tip="Đang kiểm tra quyền..." /></div>;
  }
  const canView = ALLOWED_ROLES.map(s => s.toLowerCase()).includes(role.toLowerCase());
  if (!canView) {
    return (
      <Alert
        showIcon
        type="warning"
        message="Không có quyền truy cập"
        description={`Tài khoản (${role}) không có quyền xem bảng điều khiển.`}
        style={{ margin: 24 }}
      />
    );
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (error)   return <Alert showIcon type="error" message="Lỗi" description={error} style={{ margin: 24 }} />;

  const metrics = summary?.metrics || {};
  const companies = summary?.companies || [];
  const pendingTasks = summary?.pendingKpiTasks || [];
  const kpiByDepartment = summary?.kpiByDepartment || [];

  const cards = [
    { key: 'employees',      title: 'Tổng số nhân viên',    value: metrics.employees ?? 0,      iconType: 'user'    },
    { key: 'departments',    title: 'Số phòng ban',         value: metrics.departments ?? 0,    iconType: 'kpi'     },
    { key: 'kpiPlans',       title: 'Kế hoạch KPI (tháng)', value: metrics.kpiPlans ?? 0,       iconType: 'task'    },
    { key: 'unitKpiResults', title: 'KQ KPI đơn vị (tháng)',value: metrics.unitKpiResults ?? 0, iconType: 'payroll' },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={3}>Bảng điều khiển Tổng quan</Title></Col>
        <Col>
          {companies.length > 0 && (
            <Select defaultValue="all" style={{ width: 220 }} onChange={(v) => setFilters({ companyId: v })}>
              <Option value="all">Toàn hệ thống</Option>
              {companies.map((c) => (<Option key={c.id} value={c.id}>{c.name}</Option>))}
            </Select>
          )}
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {cards.map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.key}>
            <MetricWidget title={c.title} value={c.value} iconType={c.iconType} />
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          {kpiByDepartment.length > 0
            ? <KpiByDeptChart data={kpiByDepartment} />
            : <Alert showIcon type="info" message="Chưa có dữ liệu biểu đồ theo phòng ban" />}
        </Col>
        <Col xs={24} lg={8}>
          <PendingTasks tasks={pendingTasks} title="Kế hoạch KPI cần duyệt" />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
