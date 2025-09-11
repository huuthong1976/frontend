import React, { useState, useMemo, useEffect } from 'react';
import { Modal, InputNumber, Button, notification } from 'antd';
// ❗ Dùng axios instance có interceptor gắn token
import api from 'utils/api'; // giữ nguyên đường dẫn theo project của bạn

const EPS = 0.005;

const AllocationModal = ({ kpi, visible, onCancel, onAllocationSuccess }) => {
  const [monthlyValues, setMonthlyValues] = useState({});

  useEffect(() => {
    // Nếu KPI đã có dữ liệu phân bổ trước đó thì fill vào form
    if (kpi && Array.isArray(kpi.monthlyAllocations) && kpi.monthlyAllocations.length > 0) {
      const initial = {};
      kpi.monthlyAllocations.forEach((item) => {
        initial[item.month] = Number(item.target_value || 0);
      });
      setMonthlyValues(initial);
    } else {
      setMonthlyValues({});
    }
  }, [kpi]);

  const handleMonthChange = (month, value) => {
    setMonthlyValues((prev) => ({ ...prev, [month]: value }));
  };

  const totalAllocated = useMemo(() => {
    return Object.values(monthlyValues).reduce(
      (sum, v) => sum + (Number(v) || 0),
      0
    );
  }, [monthlyValues]);

  const handleSave = async () => {
    const yearlyTarget = Number(kpi?.target_value || 0);

    // Kiểm tra sai số nhỏ khi so sánh số thực
    if (Math.abs(totalAllocated - yearlyTarget) > EPS) {
      notification.error({
        message: 'Lỗi phân bổ',
        description: `Tổng đã phân bổ (${totalAllocated.toLocaleString('vi-VN')}) phải bằng Chỉ tiêu năm (${yearlyTarget.toLocaleString('vi-VN')}).`,
      });
      return;
    }

    // Tạo payload đủ 12 tháng
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const payload = {
      monthlyTargets: months.map((m) => ({
        month: m,
        year: Number(kpi?.year),                // năm của KPI
        target: Number(monthlyValues[m] || 0),  // chỉ tiêu tháng
      })),
    };

    try {
      // ✅ Gọi qua axios instance `api` (tự gắn token) & path tương đối
      await api.post(`/company-kpi/${kpi.id}/allocate`, payload);

      notification.success({ message: 'Lưu phân bổ thành công!' });
      onAllocationSuccess();
    } catch (error) {
      notification.error({
        message: 'Lưu phân bổ thất bại!',
        description: error?.response?.data?.error || 'Lỗi từ máy chủ.',
      });
    }
  };

  const monthsArray = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Modal
      title={`Phân bổ chỉ tiêu cho: ${kpi?.kpiDetail?.kpi_name || 'KPI'}`}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Lưu phân bổ
        </Button>,
      ]}
    >
      {/* Header tổng quan */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginBottom: 24,
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ color: 'gray' }}>Chỉ tiêu năm</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>
            {Number(kpi?.target_value || 0).toLocaleString('vi-VN')}
          </div>
        </div>
        <div>
          <div style={{ color: 'gray' }}>Tổng đã phân bổ</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color:
                Math.abs(totalAllocated - Number(kpi?.target_value || 0)) <= EPS
                  ? 'green'
                  : 'red',
            }}
          >
            {totalAllocated.toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      {/* Lưới nhập 12 tháng */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {monthsArray.map((month) => (
          <div key={month}>
            <label>Tháng {month}</label>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập chỉ tiêu"
              value={monthlyValues[month]}
              onChange={(value) => handleMonthChange(month, value)}
              step="0.01"
              min={0}
              stringMode
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default AllocationModal;
