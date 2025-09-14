// src/features/payroll/PayslipModal.js
import React, { useMemo, useState } from 'react';
import { Modal, Button, Tooltip, message } from 'antd';
import {
  FaFilePdf, FaFileExcel, FaEnvelope,
  FaArrowUp, FaArrowDown, FaMoneyCheckAlt, FaUser, FaBriefcase, FaCalendarAlt, FaChartLine, FaComment
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './PayslipModal.css';

// Utils
const toNumber = (v) => Number(v) || 0;
const formatNumber = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

export default function PayslipModal({ visible, employee, onClose, data }) {
  const [loading, setLoading] = useState(false);

  // KHÔNG early-return trước khi gọi hook
  const safe = data || {};

  // destructure dữ liệu truyền vào (từ safe)
  const {
    employee_id, employee_code, full_name,
    position_name, role, company_name, luong_quyet_dinh,
    tongThuNhap, tongTru, net_salary, month, year,

    // thu nhập
    luong_kpi, bonus, allowances, other_additions,

    // khấu trừ
    bhxh_deduction, bhyt_deduction, bhtn_deduction, bhtnld_deduction,
    union_fee, personal_income_tax, other_deductions,

    // 3P
    p1_salary, p2_salary, p3_salary,

    // ngày công
    actual_workdays, holiday_days, overtime_200_days, overtime_300_days
  } = safe;

  const totalInsurance =
    toNumber(bhxh_deduction) + toNumber(bhyt_deduction) + toNumber(bhtn_deduction) + toNumber(bhtnld_deduction);

  // các bảng dữ liệu hiển thị & dùng khi export (luôn gọi theo cùng thứ tự)
  const rowsIncome = useMemo(
    () => [
      ['Lương KPI', toNumber(luong_kpi)],
      ['Thưởng', toNumber(bonus)],
      ['Phụ cấp', toNumber(allowances)],
      ['Cộng khác', toNumber(other_additions)],
    ],
    [luong_kpi, bonus, allowances, other_additions]
  );

  const rowsDeduct = useMemo(
    () => [
      ['BHXH, BHYT, BHTN…', totalInsurance],
      ['Thuế TNCN', toNumber(personal_income_tax)],
      ['Phí công đoàn', toNumber(union_fee)],
      ['Trừ khác', toNumber(other_deductions)],
    ],
    [totalInsurance, personal_income_tax, union_fee, other_deductions]
  );

  const rows3P = useMemo(
    () => [
      ['Lương P1 (Vị trí)', toNumber(p1_salary)],
      ['Lương P2 (Năng lực)', toNumber(p2_salary)],
      ['Lương P3 (Hiệu suất)', toNumber(p3_salary)],
    ],
    [p1_salary, p2_salary, p3_salary]
  );

  const rowsWorking = useMemo(
    () => [
      ['Ngày công thực tế', toNumber(actual_workdays)],
      ['Ngày lễ', toNumber(holiday_days)],
      ['Công 200%', toNumber(overtime_200_days)],
      ['Công 300%', toNumber(overtime_300_days)],
    ],
    [actual_workdays, holiday_days, overtime_200_days, overtime_300_days]
  );

  const fileStem = useMemo(() => {
    const name = (full_name || 'NhanVien').replace(/\s+/g, '_');
    const mm = month || '--';
    const yy = year || '----';
    return `Bang_luong_chi_tiet_${name}_${mm}-${yy}`;
  }, [full_name, month, year]);

  // Export Excel
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const sheetIncome = XLSX.utils.aoa_to_sheet([['Chi tiết thu nhập', ''], ...rowsIncome]);
      XLSX.utils.book_append_sheet(wb, sheetIncome, 'ThuNhap');

      const sheetDeduct = XLSX.utils.aoa_to_sheet([['Chi tiết khấu trừ', ''], ...rowsDeduct]);
      XLSX.utils.book_append_sheet(wb, sheetDeduct, 'KhauTru');

      const sheet3P = XLSX.utils.aoa_to_sheet([['Lương 3P', ''], ...rows3P]);
      XLSX.utils.book_append_sheet(wb, sheet3P, 'Luong3P');

      const sheetWork = XLSX.utils.aoa_to_sheet([['Dữ liệu ngày công', ''], ...rowsWorking]);
      XLSX.utils.book_append_sheet(wb, sheetWork, 'NgayCong');

      XLSX.writeFile(wb, `${fileStem}.xlsx`);
    } catch (e) {
      console.error(e);
      message.error('Xuất Excel thất bại.');
    }
  };

  // Export PDF
// Export PDF
const handleExportPDF = async () => {
  try {
    const doc = new jsPDF();

    // --- PHẦN HỖ TRỢ TIẾNG VIỆT (Đã có sẵn) ---
    const fontResponse = await fetch('/fonts/Roboto_Condensed-BoldItalic.ttf');
    if (!fontResponse.ok) throw new Error(`Không thể tải font: ${fontResponse.statusText}`);
    const fontBlob = await fontResponse.blob();
    const toBase64 = (blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
    const fontDataUrl = await toBase64(fontBlob);
    const fontBase64 = fontDataUrl.split(',')[1];
    doc.addFileToVFS('Roboto_Condensed-BoldItalic.ttf', fontBase64);
    doc.addFont('Roboto_Condensed-BoldItalic.ttf', 'Roboto', 'normal', 'bold');
    
    doc.setFont('Roboto');
    // --- KẾT THÚC PHẦN FONT ---

    // --- BẮT ĐẦU PHẦN NỘI DUNG PDF ĐÃ CẢI TIẾN ---
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let currentY = 20; // Vị trí Y hiện tại trên tài liệu

    // 1. TIÊU ĐỀ - Canh giữa
    doc.setFontSize(16);
    doc.setFont('Roboto', 'bold');
    const title = `PHIẾU LƯƠNG THÁNG ${month}/${year}`;
    doc.text(title, pageWidth / 2, currentY, { align: 'center' });
    currentY += 7;

    doc.setFontSize(11);
    doc.setFont('Roboto', 'normal');
    doc.text(company_name || '', pageWidth / 2, currentY, { align: 'center' });
    currentY += 12;

    // 2. THÔNG TIN NHÂN VIÊN
    doc.setFontSize(11);
    doc.setFont('Roboto', 'bold');
    doc.text('Nhân viên:', margin, currentY);
    doc.setFont('Roboto', 'bold');
    doc.text(`${full_name} (${employee_code})`, 45, currentY);
    currentY += 7;

    doc.setFont('Roboto', 'bold');
    doc.text('Chức vụ:', margin, currentY);
    doc.setFont('Roboto', 'bold');
    doc.text(position_name || role || '', 45, currentY);
    currentY += 7;

    doc.setFont('Roboto', 'bold');
    doc.text('Lương quyết định:', margin, currentY);
    doc.setFont('Roboto', 'bold');
    doc.text(`${formatNumber(luong_quyet_dinh)} VNĐ`, 45, currentY);
    currentY += 15;

    // 3. CÁC THẺ TÓM TẮT
    const cardWidth = (pageWidth - margin * 2 - 10) / 3;
    const cardHeight = 20;
    const cardStartY = currentY;

    // Card Tổng Thu Nhập
    doc.setDrawColor(224, 224, 224); // màu viền xám nhạt
    doc.setFillColor(240, 255, 240); // màu nền xanh lá nhạt
    doc.roundedRect(margin, cardStartY, cardWidth, cardHeight, 3, 3, 'FD');
    doc.setFont('Roboto', 'bold');
    doc.text('Tổng Thu Nhập', margin + 10, cardStartY + 8);
    doc.setFont('Roboto', 'normal');
    doc.text(`${formatNumber(tongThuNhap)} VNĐ`, margin + 10, cardStartY + 15);

    // Card Tổng Khấu Trừ
    const card2X = margin + cardWidth + 5;
    doc.setFillColor(255, 240, 240); // màu nền đỏ nhạt
    doc.roundedRect(card2X, cardStartY, cardWidth, cardHeight, 3, 3, 'FD');
    doc.setFont('Roboto', 'bold');
    doc.text('Tổng Khấu Trừ', card2X + 10, cardStartY + 8);
    doc.setFont('Roboto', 'normal');
    doc.text(`${formatNumber(tongTru)} VNĐ`, card2X + 10, cardStartY + 15);

    // Card Lương Thực Nhận
    const card3X = card2X + cardWidth + 5;
    doc.setFillColor(230, 247, 255); // màu nền xanh dương nhạt
    doc.roundedRect(card3X, cardStartY, cardWidth, cardHeight, 3, 3, 'FD');
    doc.setFont('Roboto', 'bold');
    doc.text('Lương Thực Nhận (Net)', card3X + 10, cardStartY + 8);
    doc.setFont('Roboto', 'normal');
    doc.text(`${formatNumber(net_salary)} VNĐ`, card3X + 10, cardStartY + 15);
    
    currentY += cardHeight + 15;

    // 4. CÁC BẢNG CHI TIẾT - Bố cục 2 cột
    const tableOptions = {
      styles: { font: 'Roboto', fontSize: 10 },
      headStyles: { font: 'Roboto', fontStyle: 'bold', fillColor: [230, 230, 230], textColor: [0, 0, 0] },
      columnStyles: { 1: { halign: 'right' } },
      didDrawPage: (data) => {
        // Cập nhật Y sau khi vẽ bảng
        currentY = data.cursor.y;
      }
    };

    const tableStartY = currentY;
    const columnGap = pageWidth / 2 + 5;
    
    // -- CỘT TRÁI --
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.text('Chi Tiết Thu Nhập', margin, tableStartY);
    doc.autoTable({
      ...tableOptions,
      startY: tableStartY + 4,
      margin: { left: margin, right: columnGap },
      body: rowsIncome.map(row => [row[0], formatNumber(row[1])]),
    });

    const leftColFinalY = currentY;
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.text('Chi Tiết Khấu Trừ', margin, leftColFinalY + 10);
    doc.autoTable({
        ...tableOptions,
        startY: leftColFinalY + 14,
        margin: { left: margin, right: columnGap },
        body: rowsDeduct.map(row => [row[0], formatNumber(row[1])]),
    });

    // -- CỘT PHẢI --
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.text('Lương 3P', columnGap, tableStartY);
    doc.autoTable({
      ...tableOptions,
      startY: tableStartY + 4,
      margin: { left: columnGap, right: margin },
      body: rows3P.map(row => [row[0], formatNumber(row[1])]),
    });

    const rightColFinalY = currentY;
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.text('Dữ Liệu Ngày Công', columnGap, rightColFinalY + 10);
    doc.autoTable({
        ...tableOptions,
        columnStyles: { 1: { halign: 'center' } }, // Căn giữa cho cột "Số ngày"
        startY: rightColFinalY + 14,
        margin: { left: columnGap, right: margin },
        body: rowsWorking.map(row => [row[0], formatNumber(row[1])]),
    });

    // 5. LƯU FILE
    doc.save(`${fileStem}.pdf`);

  } catch (e) {
    console.error("Lỗi chi tiết khi xuất PDF:", e); 
    message.error('Xuất PDF thất bại. Vui lòng kiểm tra Console để biết chi tiết.');
  }
};
  // Gửi Email (ví dụ endpoint minh hoạ)
  const handleSendEmail = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payroll/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          employeeId: employee_id || safe.id,
          month,
          year,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Gửi email thất bại');
      message.success('Đã gửi email bảng lương.');
    } catch (e) {
      console.error(e);
      message.error(e.message || 'Gửi email thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Share Zalo (share link đơn giản)
  const handleShareZalo = () => {
    try {
      const shareUrl = window.location.href;
      const title = `Bảng lương - ${full_name || ''} (${month || '--'}/${year || '----'})`;
      const zaloUrl = `https://zalo.me/share/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
      window.open(zaloUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error(e);
      message.error('Chia sẻ Zalo thất bại.');
    }
  };

  // Cho phép modal vẫn render (với dữ liệu trống) để bảo toàn thứ tự hook
  const isEmpty = !data;
  const headerTitle = `Chi tiết lương - ${employee?.full_name || ""} (${month}/${year})`;
  return (
    <Modal
    open={visible}                // antd v5 dùng "open" (không dùng "visible")
    title={headerTitle}
    onCancel={() => onClose?.()}  // đảm bảo gọi callback đóng
    footer={null}
    closable
    maskClosable
    keyboard                     // cho phép đóng bằng Esc
    destroyOnClose               // đúng prop antd v5 (thay cho destroyOnHidden)
    width={900}
      
    >
      {isEmpty ? (
        <div style={{ padding: 8, color: '#888' }}>Chưa có dữ liệu để hiển thị.</div>
      ) : (
        <>
          <div className="payslip-header">
            <h3>PHIẾU LƯƠNG THÁNG {month}/{year}</h3>
            <p>{company_name || ''}</p>
          </div>

          <div className="employee-details">
            <div><FaUser /> <strong>Nhân viên:</strong> {full_name} ({employee_code})</div>
            <div><FaBriefcase /> <strong>Chức vụ:</strong> {position_name || role || ''}</div>
            <div><strong>Lương quyết định:</strong> <span className="salary-highlight">{formatNumber(luong_quyet_dinh)} VNĐ</span></div>
          </div>

          <div className="summary-cards">
            <div className="card income">
              <FaArrowUp className="card-icon" />
              <div className="card-content">
                <span className="card-title">Tổng Thu Nhập</span>
                <span className="card-value">{formatNumber(tongThuNhap)} VNĐ</span>
              </div>
            </div>
            <div className="card deduction">
              <FaArrowDown className="card-icon" />
              <div className="card-content">
                <span className="card-title">Tổng Khấu Trừ</span>
                <span className="card-value">{formatNumber(tongTru)} VNĐ</span>
              </div>
            </div>
            <div className="card net-salary">
              <FaMoneyCheckAlt className="card-icon" />
              <div className="card-content">
                <span className="card-title">Lương Thực Nhận (Net)</span>
                <span className="card-value-net">{formatNumber(net_salary)} VNĐ</span>
              </div>
            </div>
          </div>

          <div className="details-grid">
            <div className="details-column">
              <h5 className="section-title">Chi Tiết Thu Nhập</h5>
              <ul>
                <li><span>Lương KPI:</span> <span>{formatNumber(luong_kpi)}</span></li>
                <li><span>Thưởng:</span> <span>{formatNumber(bonus)}</span></li>
                <li><span>Phụ cấp:</span> <span>{formatNumber(allowances)}</span></li>
                <li><span>Cộng khác:</span> <span>{formatNumber(other_additions)}</span></li>
              </ul>

              <h5 className="section-title">Chi Tiết Khấu Trừ</h5>
              <ul>
                <li><span>Bảo hiểm (BHXH, BHYT, BHTN...):</span> <span>{formatNumber(totalInsurance)}</span></li>
                <li><span>Thuế TNCN:</span> <span>{formatNumber(personal_income_tax)}</span></li>
                <li><span>Phí công đoàn:</span> <span>{formatNumber(union_fee)}</span></li>
                <li><span>Trừ khác:</span> <span>{formatNumber(other_deductions)}</span></li>
              </ul>
            </div>

            <div className="details-column">
              <h5 className="section-title"><FaChartLine /> Lương 3P</h5>
              <ul>
                <li><span>Lương P1 (Vị trí):</span> <span>{formatNumber(p1_salary)}</span></li>
                <li><span>Lương P2 (Năng lực):</span> <span>{formatNumber(p2_salary)}</span></li>
                <li><span>Lương P3 (Hiệu suất):</span> <span>{formatNumber(p3_salary)}</span></li>
              </ul>

              <h5 className="section-title"><FaCalendarAlt /> Dữ Liệu Ngày Công</h5>
              <ul>
                <li><span>Ngày công thực tế:</span> <span>{formatNumber(actual_workdays)}</span></li>
                <li><span>Ngày lễ:</span> <span>{formatNumber(holiday_days)}</span></li>
                <li><span>Công 200%:</span> <span>{formatNumber(overtime_200_days)}</span></li>
                <li><span>Công 300%:</span> <span>{formatNumber(overtime_300_days)}</span></li>
              </ul>
            </div>
          </div>

          <div className="modal-actions">
            <Tooltip title="Tải phiếu lương dạng PDF">
              <Button icon={<FaFilePdf />} onClick={handleExportPDF}>Xuất PDF</Button>
            </Tooltip>
            <Tooltip title="Tải file Excel chi tiết">
              <Button icon={<FaFileExcel />} onClick={handleExportExcel}>Xuất Excel</Button>
            </Tooltip>
            <Tooltip title="Gửi thông báo lương qua Zalo">
              <Button icon={<FaComment />} onClick={handleShareZalo}>Gửi Zalo</Button>
            </Tooltip>
            <Tooltip title="Gửi phiếu lương qua Email">
              <Button icon={<FaEnvelope />} loading={loading} onClick={handleSendEmail}>Gửi Email</Button>
            </Tooltip>
          </div>
        </>
      )}
    </Modal>
  );
}
