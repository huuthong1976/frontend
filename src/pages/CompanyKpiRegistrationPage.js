import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Card, Select, Table, Alert, Typography, Button, Space, Modal, Form, 
  InputNumber, message, Tooltip, TreeSelect, Popconfirm, Input 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { 
  getCompanies, 
  getUnitKpiRegistrations, 
  createUnitKpiRegistration, 
  updateUnitKpiRegistration, 
  deleteUnitKpiRegistration,
  bulkCreateUnitKpiRegistrations, 
  getKpiLibrary,
} from '../services/api.service';
import AllocationModal from './AllocationModal';
import ViewAllocationModal from './ViewAllocationModal';

const { Title } = Typography;

/** Chuẩn hoá dữ liệu đơn vị về dạng ổn định để render Select */
const normalizeCompanies = (list = []) =>
  list.map((c) => ({
    id: String(c.id ?? c.company_id),
    name:
      c.name ??
      c.company_name ??
      c.company ??
      `${c.company_code ? `${c.company_code} - ` : ''}${c.name || ''}`,
  }));

// CUSTOM HOOK QUẢN LÝ DỮ LIỆU
const useCompanyKpi = (initialCompanyId) => {
  const [data, setData] = useState({ companies: [], registeredKpis: [], kpiLibrary: [] });
  const [filters, setFilters] = useState({
    companyId: initialCompanyId ? String(initialCompanyId) : null,
    year: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshData = useCallback(async () => {
    if (!filters.companyId || !filters.year) {
      setData(prev => ({ ...prev, registeredKpis: [] }));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [registeredData, libraryData] = await Promise.all([
        getUnitKpiRegistrations(filters.companyId, filters.year), // ✅ backend trả về tree
        getKpiLibrary({ company_id: filters.companyId })
      ]);
      setData(prev => ({ ...prev, registeredKpis: registeredData || [], kpiLibrary: libraryData || [] }));
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể tải dữ liệu KPI.');
    } finally {
      setLoading(false);
    }
  }, [filters.companyId, filters.year]);

  useEffect(() => {
    const fetchInitialCompanies = async () => {
      try {
        const companyData = await getCompanies();
        const normalized = normalizeCompanies(companyData || []);
        setData(prev => ({ ...prev, companies: normalized }));

        // Nếu không có initial id, chọn mặc định là đơn vị đầu tiên
        if (!initialCompanyId && normalized.length > 0) {
          setFilters(prev => ({ ...prev, companyId: normalized[0].id }));
        }
      } catch (err) {
        setError('Không thể tải danh sách đơn vị.');
      }
    };
    fetchInitialCompanies();
  }, [initialCompanyId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return { ...data, filters, setFilters, loading, error, refreshData };
};

const CompanyKpiRegistrationPage = () => {
  const { user } = useAuth();
  const {
    companies,
    registeredKpis,
    kpiLibrary,
    filters,
    setFilters,
    loading,
    error,
    refreshData
  } = useCompanyKpi(user?.company_id ? String(user.company_id) : null);
  
  // ✅ STATE
  const [modal, setModal] = useState({ visible: false, data: null });
  const [bulkModal, setBulkModal] = useState({ visible: false, kpis: [] });
  const [allocationModal, setAllocationModal] = useState({ visible: false, kpi: null });
  const [viewAllocationModal, setViewAllocationModal] = useState({ visible: false, kpi: null });
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();

  // ✅ Cây KPI đã đăng ký
  const kpiRegistrationTreeForSelect = useMemo(() => {
    // Hàm đệ quy để lọc bỏ KPI đang được chỉnh sửa
    const filterOutCurrentKpi = (nodes, currentId) => {
        if (!currentId) return nodes; // Nếu là chế độ "Thêm mới", không cần lọc

        return nodes.filter(node => node.id !== currentId).map(node => {
            if (node.children && node.children.length > 0) {
                return { ...node, children: filterOutCurrentKpi(node.children, currentId) };
            }
            return node;
        });
    };

    // Hàm đệ quy để map dữ liệu cho TreeSelect
    const mapNodes = (nodes) => nodes.map(node => ({
        value: node.id,
        // SỬA LỖI: Truy cập đúng vào kpiDetail.kpi_name
        title: node.kpiDetail?.kpi_name || 'KPI không tên', 
        children: node.children?.length ? mapNodes(node.children) : [],
    }));

    // Lấy ID của KPI đang được sửa từ state `modal`
    const kpiBeingEditedId = modal.data?.id; 
    const filteredTree = filterOutCurrentKpi(registeredKpis, kpiBeingEditedId);
    
    return mapNodes(filteredTree);

}, [registeredKpis, modal.data]);

  // ✅ Cây KPI thư viện
  const kpiLibraryTreeForSelect = useMemo(() => {
    const buildTree = (flatList, parentIdKey) => {
      const nodeMap = new Map();
      const tree = [];
      flatList.forEach(node => nodeMap.set(node.id, { ...node, children: [] }));
      nodeMap.forEach(node => {
        const parentId = node[parentIdKey];
        if (parentId && nodeMap.has(parentId)) {
          nodeMap.get(parentId).children.push(node);
        } else {
          tree.push(node);
        }
      });
      return tree;
    };
    const libraryAsTree = buildTree(kpiLibrary, 'parent_id');
    const mapNodes = (nodes) => nodes.map(node => ({
      value: node.id,
      title: node.kpi_name,
      children: node.children?.length ? mapNodes(node.children) : [],
    }));
    return mapNodes(libraryAsTree);
  }, [kpiLibrary]);

  const handleOpenModal = (data = null) => {
    setModal({ visible: true, data });
    form.setFieldsValue(data || { parent_registration_id: null, kpi_id: null, target_value: null, weight: null });
  };

  const handleCancelModal = () => setModal({ visible: false, data: null });
  
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, year: filters.year, company_id: filters.companyId };
      if (modal.data?.id) {
        await updateUnitKpiRegistration(modal.data.id, payload);
      } else {
        await createUnitKpiRegistration(payload);
      }
      message.success('Lưu thành công!');
      handleCancelModal();
      refreshData();
    } catch (err) {
      message.error(err.response?.data?.error || 'Lưu thất bại!');
    }
  };

  
  const handleDelete = async (id) => {
    try {
      await deleteUnitKpiRegistration(id);
      message.success('Xóa thành công!');
      refreshData();
    } catch (err) {
      message.error(err.response?.data?.error || 'Xóa thất bại!');
    }
  };
  
  const handleLibraryKpiSelect = (value, node) => {
    if (!value || !node.children || node.children.length === 0) return;
    Modal.confirm({
      title: 'Đăng ký hàng loạt?',
      content: `"${node.title}" là KPI cha. Bạn có muốn đăng ký tất cả KPI con và cháu của nó không?`,
      okText: 'Đăng ký tất cả',
      cancelText: 'Chỉ đăng ký KPI này',
      onOk: () => {
        const flattenTree = (n) => [n, ...(n.children || []).flatMap(flattenTree)];
        const kpiListToRegister = flattenTree(node).map(item => ({
          kpi_id: item.value, 
          kpi_name: item.title, 
          target_value: undefined, 
          weight: undefined 
        }));
        setBulkModal({ visible: true, kpis: kpiListToRegister });
        bulkForm.setFieldsValue({ kpis: kpiListToRegister });
        form.setFieldsValue({ kpi_id: null });
      },
    });
  };
  
  const handleBulkSave = async () => {
    try {
      const values = await bulkForm.validateFields();
      const payload = values.kpis.map(kpi => ({ ...kpi, year: filters.year, company_id: filters.companyId }));
      await bulkCreateUnitKpiRegistrations(payload);
      message.success('Đăng ký hàng loạt thành công!');
      setBulkModal({ visible: false, kpis: [] });
      refreshData();
    } catch (err) {
      message.error(err.response?.data?.error || 'Lưu thất bại!');
    }
  };
  
  const columns = [
    { title: 'Tên KPI', dataIndex: ['kpiDetail', 'kpi_name'], key: 'kpi_name', width: 500 },
    { title: 'Chỉ tiêu năm', dataIndex: 'target_value', key: 'target_value', align: 'right', width: 150, render: (text) => text != null ? parseFloat(text).toLocaleString('en-US') : '' },
    { title: 'Trọng số (%)', dataIndex: 'weight', key: 'weight', align: 'right', width: 120},
    {
      title: 'Hành động', key: 'action', align: 'center', width: 220,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem phân bổ"><Button icon={<EyeOutlined />} onClick={() => setViewAllocationModal({ visible: true, kpi: record })} /></Tooltip>
          <Tooltip title="Phân bổ chỉ tiêu"><Button icon={<BarChartOutlined />} onClick={() => setAllocationModal({ visible: true, kpi: record })} /></Tooltip>
          <Tooltip title="Chỉnh sửa"><Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} /></Tooltip>
          <Popconfirm title="Xóa KPI này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Tooltip title="Xóa"><Button icon={<DeleteOutlined />} danger /></Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Title level={3}>Đăng ký Mục tiêu KPI Đơn vị</Title>
      <Card>
        <Space>
          <Select 
            style={{ width: 250 }} 
            placeholder="Chọn đơn vị" 
            value={filters.companyId} 
            onChange={value => setFilters(prev => ({ ...prev, companyId: String(value) }))} 
            disabled={!!(user && user.role !== 'Admin' && user.role === 'TruongDonVi' )} 
            loading={companies.length === 0}
            // sử dụng options để đảm bảo label hiển thị đúng tên
            options={companies.map(c => ({ value: c.id, label: c.name }))}
            optionFilterProp="label"
          />
          <Select 
            style={{ width: 120 }} 
            value={filters.year} 
            onChange={value => setFilters(prev => ({ ...prev, year: value }))}
          >
            {[...Array(5).keys()].map(i => 
              <Select.Option key={i} value={new Date().getFullYear() - 2 + i}>
                {new Date().getFullYear() - 2 + i}
              </Select.Option>
            )}
          </Select>
        </Space>
      </Card>
      <Card 
        title="Danh sách KPI đã đăng ký" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Đăng ký KPI mới</Button>}
      >
        {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Table 
          columns={columns} 
          dataSource={registeredKpis} 
          loading={loading} 
          rowKey="id" 
          bordered 
          pagination={false}
          expandable={{ defaultExpandAllRows: true }}  // ✅ bật tree view
        />
      </Card>

      {/* Modal đơn lẻ */}
      <Modal 
        title={modal.data ? "Chỉnh sửa KPI" : "Đăng ký KPI mới"} 
        open={modal.visible} 
        onOk={handleSave} 
        onCancel={handleCancelModal} 
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={modal.data}>
          <Form.Item name="parent_registration_id" label="Thuộc KPI Cha (để trống nếu là KPI gốc)">
            <TreeSelect 
              treeData={kpiRegistrationTreeForSelect} 
              style={{ width: '100%' }} 
              allowClear 
              placeholder="Chọn KPI cha" 
              treeDefaultExpandAll 
              treeNodeFilterProp="title" 
            />
          </Form.Item>
          <Form.Item 
            name="kpi_id" 
            label="Chỉ tiêu từ thư viện" 
            rules={[{ required: true, message: 'Vui lòng chọn chỉ tiêu!' }]}
          >
            <TreeSelect
              onSelect={(value, node) => handleLibraryKpiSelect(value, node)} // ✅ sửa chỗ này
              treeData={kpiLibraryTreeForSelect}
              style={{ width: '100%' }}
              showSearch
              allowClear
              treeDefaultExpandAll
              placeholder="Chọn KPI từ thư viện"
              treeNodeFilterProp="title"
            />
          </Form.Item>
          <Form.Item 
            name="target_value" 
            label="Mục tiêu năm" 
            rules={[{ required: true, message: 'Vui lòng nhập mục tiêu!' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Nhập mục tiêu" 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
              parser={value => value.replace(/\B(?=(\d{3})+(?!\d))/g, '')} 
            />
          </Form.Item>
          <Form.Item 
            name="weight" 
            label="Trọng số (%)" 
            rules={[{ required: true, message: 'Vui lòng nhập trọng số!' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={0} 
              max={100} 
              placeholder="Nhập trọng số"
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Modal bulk */}
      <Modal 
        title="Đăng ký hàng loạt KPI" 
        open={bulkModal.visible} 
        onOk={handleBulkSave} 
        onCancel={() => setBulkModal({ visible: false, kpis: [] })} 
        width={800} 
        destroyOnClose
      >
        <Form form={bulkForm} layout="vertical">
          <Form.List name="kpis">
            {(fields) => (
              <Table 
                dataSource={fields} 
                pagination={false} 
                bordered 
                size="small" 
                rowKey="key" 
                columns={[
                  { title: 'Tên KPI', render: (_, field) => (
                    <Form.Item name={[field.name, 'kpi_name']} noStyle>
                      <Input readOnly bordered={false} />
                    </Form.Item>
                  ) },
                  { title: 'Mục tiêu năm', width: 200, render: (_, field) => (
                    <Form.Item name={[field.name, 'target_value']} rules={[{ required: true, message: 'Bắt buộc!' }]} noStyle>
                      <InputNumber 
                        style={{ width: '100%' }} 
                        placeholder="Nhập mục tiêu" 
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                        parser={value => value.replace(/\B(?=(\d{3})+(?!\d))/g, '')} 
                      />
                    </Form.Item>
                  ) },
                  { title: 'Trọng số (%)', width: 150, render: (_, field) => (
                    <Form.Item name={[field.name, 'weight']} rules={[{ required: true, message: 'Bắt buộc!' }]} noStyle>
                      <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="Nhập trọng số" />
                    </Form.Item>
                  ) }
                ]}
              />
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal phân bổ */}
      {allocationModal.kpi && (
        <AllocationModal 
          visible={allocationModal.visible} 
          onCancel={() => setAllocationModal({ visible: false, kpi: null })} 
          kpi={allocationModal.kpi} 
          onAllocationSuccess={() => { setAllocationModal({ visible: false, kpi: null }); refreshData(); }}
        />
      )}

      {/* Modal xem phân bổ */}
      {viewAllocationModal.kpi && (
        <ViewAllocationModal 
          visible={viewAllocationModal.visible} 
          onCancel={() => setViewAllocationModal({ visible: false, kpi: null })} 
          kpi={viewAllocationModal.kpi}
        />
      )}
    </Space>
  );
};

export default CompanyKpiRegistrationPage;
