// File: src/features/payroll/payrollPdfExporter.js

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { message } from 'antd';

// Hàm định dạng số
const formatNumber = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

export const handlePrintPayrollList = async (employees, companyName, month, year) => {
  if (!employees || employees.length === 0) {
    message.warning('Không có dữ liệu lương để in.');
    return;
  }

  try {
    const doc = new jsPDF('landscape', 'pt', 'a4');

    // --- Tải và nhúng font Roboto (quan trọng để không lỗi tiếng Việt) ---
    const fontResponse = await fetch('/fonts/Roboto-Regular.ttf');
    if (!fontResponse.ok) throw new Error('Không thể tải font');
    const fontBlob = await fontResponse.blob();
    const toBase64 = (blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
    const fontDataUrl = await toBase64(fontBlob);
    const fontBase64 = fontDataUrl.split(',')[1];
    doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
    // --- Kết thúc phần font ---

    // --- TIÊU ĐỀ ---
    doc.setFontSize(16);
    doc.setFont('Roboto', 'normal');
    doc.text(`BẢNG THANH TOÁN LƯƠNG THÁNG ${month}/${year}`, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('Roboto', 'normal');
    doc.text(`Đơn vị: ${companyName}`, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });

    // --- BẢNG LƯƠNG ---
    const head = [
      ['STT', 'Mã NV', 'Họ và Tên', 'Chức Vụ', 'Lương KPI', 'Tổng Thu Nhập', 'Tổng Khấu Trừ', 'Thực Nhận', 'Ký Nhận']
    ];

    const body = employees.map((emp, index) => {
      const toNumber = (val) => Number(val || 0);

      // *** SỬA LỖI TÍNH TOÁN: Bổ sung BHTNLD vào tổng khấu trừ ***
      const totalDeductions = toNumber(emp.bhxh_deduction) +
                            toNumber(emp.bhyt_deduction) +
                            toNumber(emp.bhtn_deduction) +
                            toNumber(emp.bhtnld_deduction) + // <-- Khoản bị thiếu đã được thêm vào
                            toNumber(emp.personal_income_tax) +
                            toNumber(emp.union_fee) +
                            toNumber(emp.other_deductions);
      
      const totalIncome = toNumber(emp.luong_kpi) + toNumber(emp.bonus) + toNumber(emp.allowances) + toNumber(emp.other_additions);
      const netSalary = totalIncome - totalDeductions;
      
      return [
        index + 1,
        emp.employee_code,
        emp.full_name,
        emp.position_name,
        formatNumber(emp.luong_kpi),
        formatNumber(totalIncome),
        formatNumber(totalDeductions),
        formatNumber(netSalary),
        '' // Cột ký nhận để trống
      ];
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const columnWidths = { 0: 30, 1: 50, 2: 120, 3: 80, 4: 70, 5: 70, 6: 70, 7: 70, 8: 100 };
    const tableWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
    const margin = (pageWidth - tableWidth) / 2;

    doc.autoTable({
      head: head,
      body: body,
      startY: 80,
      theme: 'grid',
      margin: { left: margin, right: margin },
      styles: {
        font: 'Roboto',
        fontSize: 10,
        cellPadding: 4,
        overflow: 'linebreak',
        lineWidth: 0.5,
      },
      headStyles: {
        fontStyle: 'bold',
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: columnWidths[0] },
        1: { halign: 'center', cellWidth: columnWidths[1] },
        2: { cellWidth: columnWidths[2] },
        3: { cellWidth: columnWidths[3] },
        4: { halign: 'right', cellWidth: columnWidths[4] },
        5: { halign: 'right', cellWidth: columnWidths[5] },
        6: { halign: 'right', cellWidth: columnWidths[6] },
        7: { halign: 'right', cellWidth: columnWidths[7], fontStyle: 'bold' },
        8: { cellWidth: columnWidths[8] },
      }
    });

    // --- PHẦN CHỮ KÝ Ở CUỐI TRANG ---
    const finalY = doc.autoTable.previous.finalY;
    
    doc.setFontSize(11);
    doc.setFont('Roboto', 'normal');
    const signatureDate = `Khánh Hoà, ngày ..... tháng ${month} năm ${year}`;
    doc.text(signatureDate, pageWidth - margin - 130, finalY + 45, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('Roboto', 'normal');
    
    const signatureX1 = pageWidth * 0.15;
    const signatureX2 = pageWidth * 0.35;
    const signatureX3 = pageWidth * 0.55;
    const signatureX4 = pageWidth * 0.75;
    const signatureY = finalY + 70;

    doc.text('Tổng Giám Đốc', signatureX1, signatureY, { align: 'center' });
    doc.text('Kiểm soát', signatureX2, signatureY, { align: 'center' });
    doc.text('Kế Toán Trưởng', signatureX3, signatureY, { align: 'center' });
    doc.text('Người Lập', signatureX4, signatureY, { align: 'center' });
    
    // --- LƯU FILE ---
    const fileName = `Bang_Luong_${companyName.replace(/\s/g, '_')}_Thang_${month}-${year}.pdf`;
    doc.save(fileName);

  } catch (e) {
    console.error("Lỗi khi tạo PDF danh sách lương:", e);
    message.error('Xuất file PDF thất bại. Vui lòng kiểm tra console.');
  }
};