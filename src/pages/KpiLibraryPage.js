// src/pages/KpiLibraryPage.js
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Card,
  Table,
  notification,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
  Popconfirm,
  Select,
  Row,
  Col,
  TreeSelect,
  Empty,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  createKpiInLibrary,
  updateKpiInLibrary,
  deleteKpiInLibrary,
  getKpiAspects,
  getCompanies,
} from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import api from 'utils/api';

const { Title } = Typography;
const { Option } = Select;
// Build tree from flat list
const buildTree = (items, parentId = null) =>
  (items || [])
    .filter((item) => item.parent_id === parentId)
    .map((item) => {
      const children = buildTree(items, item.id);
      const node = {
        ...item,
        title: item.kpi_name, // for TreeSelect
        value: item.id,       // for TreeSelect
        key: item.id,         // for Table
      };
      if (children.length > 0) node.children = children;
      return node;
    });

const KpiLibraryPage = () => {
  const { user } = useAuth();
  const [kpiList, setKpiList] = useState([]); // flat list from API
  const [aspects, setAspects] = useState([]);

  // ---- ĐƠN VỊ ----
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(user?.company_id || null);

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ visible: false, data: null });
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);

  // ---- Fetch data ----
  const fetchData = useCallback(async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/kpi-library/tree`, { params: { company_id: selectedCompany }});
      const aspectsData = await getKpiAspects();
      setKpiList(data || []);
      setAspects(aspectsData || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu từ server.');
    } finally {
      setLoading(false);
    }
  }, [selectedCompany]);

  // --- Chuẩn hoá dữ liệu đơn vị về { id: string, name: string }
  const normalizeCompanies = (list = []) =>
    list.map((c) => ({
      id: String(c.id ?? c.company_id),
      name:
        c.name ??
        c.company_name ??
        c.company ??
        `${c.company_code ? `${c.company_code} - ` : ''}${c.name || ''}`,
    }));

  // --- Tải danh sách đơn vị & đặt selectedCompany mặc định
  useEffect(() => {
  (async () => {
    try {
      const { data } = await api.get('/api/companies');
      const rows = Array.isArray(data) ? data : (data?.rows || []);
      const list = normalizeCompanies(rows);
      setCompanies(list);

      // đặt mặc định: ưu tiên user.company_id, nếu không có thì lấy id đầu tiên
      setSelectedCompany(prev => prev || user?.company_id || list[0]?.id || null);
    } catch (e) {
      message.error('Không thể tải danh sách đơn vị.');
    }
  })();
}, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Memos placed BEFORE any usage (fix TDZ) ----
  // map: aspect id -> name
  const aspectNameById = useMemo(() => {
    const m = new Map();
    (aspects || []).forEach((a) => m.set(String(a.id), a.name));
    return m;
  }, [aspects]);

  // add effective perspective by inheriting from nearest ancestor
  const kpiListWithEffective = useMemo(() => {
    if (!Array.isArray(kpiList) || !kpiList.length) return [];
    const byId = new Map(kpiList.map((n) => [n.id, n]));

    const getAncestorAspect = (node) => {
      let p = node;
      while (p?.parent_id) {
        p = byId.get(p.parent_id);
        if (!p) break;
        if (p.perspective_name || p.perspective_id != null) {
          const name = p.perspective_name || aspectNameById.get(String(p.perspective_id)) || null;
          return { id: p.perspective_id ?? null, name };
        }
      }
      return { id: null, name: null };
    };

    return kpiList.map((n) => {
      const ownName =
        n.perspective_name ||
        (n.perspective_id != null ? aspectNameById.get(String(n.perspective_id)) || null : null);

      if (ownName) {
        return {
          ...n,
          _effective_perspective_id: n.perspective_id ?? null,
          _effective_perspective_name: ownName,
        };
      }
      const inh = getAncestorAspect(n);
      return {
        ...n,
        _effective_perspective_id: n.perspective_id ?? inh.id,
        _effective_perspective_name: inh.name,
      };
    });
  }, [kpiList, aspectNameById]);

  // tree must be built from the *effective* list
  const kpiTreeData = useMemo(() => buildTree(kpiListWithEffective), [kpiListWithEffective]);

  // ---- Handlers ----
  const handleOpenModal = (data = null) => {
    setModal({ visible: true, data });
    form.setFieldsValue(
      data
        ? {
            ...data,
            parent_id: data.parent_id || null,
            unit: data.unit || '',
            direction: data.direction || 'cao hơn tốt hơn',
          }
        : { parent_id: null, unit: '', direction: 'cao hơn tốt hơn' }
    );
  };

  const handleCancelModal = () => {
    setModal({ visible: false, data: null });
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        company_id: selectedCompany,
        parent_id: values.parent_id ? parseInt(values.parent_id, 10) : null,
        unit: values.unit?.trim() || '',
        direction: values.direction || 'cao hơn tốt hơn',
      };
      if (modal.data?.id) {
        await updateKpiInLibrary(modal.data.id, payload);
      } else {
        await createKpiInLibrary(payload);
      }
      message.success('Lưu thành công!');
      handleCancelModal();
      fetchData();
    } catch (err) {
      const errorMessage = err?.response?.data?.error || 'Lưu thất bại!';
      message.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    try {
      // search in tree (not flat) to ensure we detect children properly
      const findInTree = (nodes, targetId) => {
        for (const node of nodes) {
          if (node.id === targetId) return node;
          if (node.children) {
            const found = findInTree(node.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };
      const kpiNode = findInTree(kpiTreeData, id);
      if (kpiNode && kpiNode.children && kpiNode.children.length > 0) {
        message.error('Không thể xóa KPI cha. Vui lòng xóa các KPI con trước.');
        return;
      }
      await deleteKpiInLibrary(id);
      message.success('Xóa thành công!');
      fetchData();
    } catch {
      message.error('Xóa thất bại!');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/api/kpi-library/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const cd = response.headers['content-disposition'];
      let fileName = 'kpi_library.xlsx';
      if (cd) {
        const m = cd.match(/filename="(.+)"/);
        if (m && m[1]) fileName = m[1];
      }
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi khi xuất file:', error);
      notification.error({ message: 'Xuất file thất bại!' });
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/api/kpi-library/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      notification.success({ message: 'Nhập file thành công!' });
      fetchData();
    } catch (error) {
      console.error('Lỗi khi nhập file:', error);
      notification.error({
        message: 'Nhập file thất bại!',
        description: error?.response?.data?.error || 'Vui lòng thử lại.',
      });
    } finally {
      event.target.value = null;
    }
  };

  // ---- Columns (render using effective perspective) ----
  const columns = useMemo(
    () => [
      { title: 'Tên KPI', dataIndex: 'kpi_name', key: 'kpi_name', width: '50%' },
      {
        title: 'Khía cạnh',
        key: 'perspective',
        render: (_, record) => record.perspective_name || 'Chưa phân loại',
      },
      {
        title: 'Hành động',
        key: 'action',
        align: 'center',
        render: (_, record) => (
          <Space>
            <Tooltip title="Chỉnh sửa">
              <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
            </Tooltip>
            <Popconfirm
              title="Bạn có chắc muốn xóa?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa">
                <Button icon={<DeleteOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete,handleOpenModal]
  );

  // ---- Render ----
  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Title level={3}>Thư viện KPI</Title>

      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Typography.Text strong>Chọn đơn vị:</Typography.Text>
              <Select
                style={{ width: 250 }}
                placeholder="Chọn một đơn vị"
                value={selectedCompany}
                onChange={setSelectedCompany}
                disabled={!!(user && user.role !== 'Admin')}
                // label = tên đơn vị, value = id (string)
                options={(companies || []).map((c) => ({ value: c.id, label: c.name }))}
                optionFilterProp="label"
                notFoundContent={<Empty description="Không có đơn vị" />}
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<UploadOutlined />} onClick={handleImportClick}>
                Nhập Excel
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={!selectedCompany}>
                Xuất Excel
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} disabled={!selectedCompany}>
                Thêm KPI mới
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".xlsx,.xls"
              />
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={kpiList}
          loading={loading}
          rowKey="id"
          bordered
          pagination={false}
        />
      </Card>

      <Modal
        title={modal.data ? 'Chỉnh sửa KPI' : 'Thêm KPI mới'}
        open={modal.visible}
        onOk={handleSave}
        onCancel={handleCancelModal}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={
            modal.data
              ? {
                  ...modal.data,
                  parent_id: modal.data.parent_id || null,
                  unit: modal.data.unit || '',
                  direction: modal.data.direction || 'cao hơn tốt hơn',
                }
              : { parent_id: null, unit: '', direction: 'cao hơn tốt hơn' }
          }
        >
          {/* KPI cha */}
          <Form.Item name="parent_id" label="Thuộc KPI Cha (Để trống nếu là KPI gốc)">
            <TreeSelect
              treeData={kpiTreeData}
              fieldNames={{ label: 'kpi_name', value: 'id', children: 'children' }}
              style={{ width: '100%' }}
              allowClear
              showSearch
              placeholder="Chọn KPI cha"
              treeDefaultExpandAll
              treeNodeFilterProp="kpi_name"
              filterTreeNode={(input, node) =>
                (node?.kpi_name ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          {/* Khía cạnh (không bắt buộc — cho phép thừa kế) */}
          <Form.Item name="perspective_id" label="Khía cạnh" rules={[]}>
            <Select placeholder="Chọn khía cạnh cho KPI" allowClear>
              {(aspects || []).map((aspect) => (
                <Option key={aspect.id} value={aspect.id}>
                  {aspect.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Tên KPI */}
          <Form.Item name="kpi_name" label="Tên KPI" rules={[{ required: true, message: 'Vui lòng nhập tên KPI!' }]}>
            <Input.TextArea rows={3} placeholder="Ví dụ: Tăng trưởng doanh thu" />
          </Form.Item>

          {/* Đơn vị tính */}
          <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true, message: 'Vui lòng nhập đơn vị tính!' }]}>
            <Input placeholder="Ví dụ: %, VNĐ, Sản phẩm" />
          </Form.Item>

          {/* Xu hướng */}
          <Form.Item name="direction" label="Xu hướng" rules={[{ required: true, message: 'Vui lòng chọn xu hướng!' }]}>
            <Select placeholder="Chọn xu hướng của KPI">
              <Option value="cao hơn tốt hơn">Cao hơn tốt hơn</Option>
              <Option value="thấp hơn tốt hơn">Thấp hơn tốt hơn</Option>
              <Option value="bằng nhau tốt hơn">Bằng nhau tốt hơn</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default KpiLibraryPage;
