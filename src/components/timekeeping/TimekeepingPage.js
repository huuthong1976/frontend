import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Timekeeping.css';
import moment from 'moment';
import api from '../utils/api'

const API_URL = 'http://localhost:5000/api/timekeeping';
// Giả định API này tồn tại và trả về danh sách nhân viên và công ty


// --- Component nhỏ: Biểu tượng loading cho Timer ---
const TimerLoading = () => (
    <div className="timer-display loading-shimmer"></div>
);

// --- Component nhỏ: Đồng hồ đếm giờ ---
const Timer = ({ startTime }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const startMoment = moment(startTime);
        setElapsed(moment.duration(moment().diff(startMoment)).asMilliseconds());

        const interval = setInterval(() => {
            setElapsed(moment.duration(moment().diff(startMoment)).asMilliseconds());
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        if (totalSeconds < 0) return '00:00:00';
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    return <div className="timer-display">{formatTime(elapsed)}</div>;
};

// --- Component chính ---
const TimekeepingPage = () => {
    const { user } = useAuth();
    
    const [todayRecord, setTodayRecord] = useState(null);
    const [timesheet, setTimesheet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isChecking, setIsChecking] = useState(false);

    // --- State cho bộ lọc Lịch sử chấm công (cho Admin/Tổng Giám đốc) ---
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterEmployee, setFilterEmployee] = useState(''); 
    const [filterCompany, setFilterCompany] = useState(''); 

    const [allEmployees, setAllEmployees] = useState([]); 
    const [companies, setCompanies] = useState([]); 

    // --- State điều khiển hiển thị lịch sử toàn tập đoàn ---
    const [showAllTimesheets, setShowAllTimesheets] = useState(false); // MẶC ĐỊNH LÀ FALSE

    // --- Logic phân quyền hiển thị thông tin nâng cao và bộ lọc ---
    const canViewAdvancedInfo = user && (user.role === 'Admin' || user.role === 'TongGiamDoc' || user.role === 'TruongDonVi');
    const canAccessAllTimesheetsFeature = user && (user.role === 'Admin' || user.role === 'TongGiamDoc');

    const getDeviceType = () => {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
        return "Desktop";
    };

    // Hàm fetch dữ liệu cho các dropdown bộ lọc (nhân viên, công ty)
    const fetchFilterDropdowns = useCallback(async () => {
        if (canAccessAllTimesheetsFeature) {
            try {
                // Giả định API trả về mảng các đối tượng {id, full_name, employee_code, ...}
                const employeesRes = await api.get('/employees'); 
                console.log('API response for employees:', employeesRes.data); 
                (() => { const _d = employeesRes?.data; const _arr = Array.isArray(_d?.results) ? _d.results : Array.isArray(_d) ? _d : []; setAllEmployees(_arr); })();

                // Giả định API trả về mảng các đối tượng {id, company_name, ...}
                const companiesRes = await api.get('/companies'); 
                (() => { const _d = companiesRes?.data; const _arr = Array.isArray(_d?.results) ? _d.results : Array.isArray(_d) ? _d : []; setCompanies(_arr); })();
            } catch (error) {
                console.error("Lỗi tải dữ liệu dropdown lọc:", error);
            }
        }
    }, [canAccessAllTimesheetsFeature]);

    // Hàm fetch lịch sử chấm công
    const fetchTimesheetHistory = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            if (showAllTimesheets && canAccessAllTimesheetsFeature) {
                // Gọi API lấy tất cả chấm công với bộ lọc
                res = await api.get(`${API_URL}/all-timesheets`, {
                    params: {
                        year: filterYear,
                        month: filterMonth,
                        employeeId: filterEmployee,
                        companyId: filterCompany,
                    }
                });
                setTodayRecord(null); // Không hiển thị widget chấm công cá nhân khi xem toàn bộ
            } else { 
                // Gọi API lấy chấm công của bản thân
                res = await api.get(`${API_URL}/my-timesheet`, {
                    params: { year: filterYear, month: filterMonth }
                });
                // Cập nhật todayRecord chỉ khi đang xem lịch sử cá nhân
                const todayStr = moment().format('YYYY-MM-DD');
                const record = res.data.find(r => moment(r.work_date).format('YYYY-MM-DD') === todayStr);
                setTodayRecord(record || null);
            }
            (() => { const _p = res?.data; const _list = Array.isArray(_p) ? _p : Array.isArray(_p?.results) ? _p.results : []; setTimesheet(_list); })(); // Cập nhật dữ liệu bảng lịch sử

        } catch (error) {
            console.error("Lỗi tải lịch sử chấm công:", error.response?.data?.msg || error);
            alert("Không thể tải lịch sử chấm công.");
        } finally {
            setLoading(false);
        }
    }, [filterMonth, filterYear, filterEmployee, filterCompany, showAllTimesheets, canAccessAllTimesheetsFeature]);


    // Fetch data cho dropdown lọc và lịch sử chấm công khi component mount hoặc bộ lọc thay đổi
    useEffect(() => {
        fetchFilterDropdowns();
    }, [fetchFilterDropdowns]);

    // Gọi fetchTimesheetHistory mỗi khi các bộ lọc hoặc chế độ xem thay đổi
    useEffect(() => {
        fetchTimesheetHistory();
    }, [fetchTimesheetHistory, showAllTimesheets, filterMonth, filterYear, filterEmployee, filterCompany]); // Thêm showAllTimesheets vào dependencies

    // Hàm xử lý Check In
    const handleCheckIn = async () => {
        setIsChecking(true);
        const now = moment();
        const currentHour = now.hour();

        if (currentHour >= 17) {
            alert("Không thể check-in sau 17:00.");
            setIsChecking(false);
            return;
        }

        try {
            const device_info = getDeviceType();
            const res = await api.post(`${API_URL}/checkin`, { device_info });
            alert(res.data.msg);
            await fetchTimesheetHistory(); // Cập nhật lại dữ liệu sau khi check-in
        } catch (error) {
            alert(error.response?.data?.msg || 'Có lỗi xảy ra khi check-in.');
            console.error('Lỗi check-in:', error);
        } finally {
            setIsChecking(false);
        }
    };

    // Hàm xử lý Check Out
    const handleCheckOut = async () => {
        setIsChecking(true);
        if (!todayRecord || !todayRecord.id) {
            alert('Không tìm thấy bản ghi chấm công để check-out.');
            setIsChecking(false);
            return;
        }

        try {
            const device_info = getDeviceType();
            const res = await api.put(`${API_URL}/checkout/${todayRecord.id}`, { device_info });
            alert(res.data.msg);
            await fetchTimesheetHistory(); // Cập nhật lại dữ liệu sau khi check-out
        } catch (error) {
            alert(error.response?.data?.msg || 'Có lỗi xảy ra khi check-out.');
            console.error('Lỗi check-out:', error);
        } finally {
            setIsChecking(false);
        }
    };

    // Xác định trạng thái để hiển thị nút và đồng hồ
    let status = 'not_started';
    if (loading || isChecking) {
        status = 'loading';
    } else if (todayRecord?.check_in_time && !todayRecord?.check_out_time) {
        status = 'working';
    } else if (todayRecord?.check_out_time) {
        status = 'finished';
    }

    // Xác định số cột cho bảng lịch sử
    const colSpan = (showAllTimesheets ? 4 : 0) + (canViewAdvancedInfo ? 3 : 0) + 5; // 5 cột cơ bản + 4 (Admin/TGĐ) + 3 (Advanced Info)

    return (
        <div className="page-container">
            <h1 className="page-title">Chấm công</h1>

            {/* Phần Widget chấm công cá nhân - LUÔN HIỂN THỊ */}
            <div className="widget-container">
                <div className={`time-widget status--${status}`}>
                    <div className="widget-header">
                        <span className="widget-date">{moment().format('dddd, DD/MM/YYYY')}</span>
                        <div className={`status-indicator status-indicator--${status}`}>
                            {status === 'working' && 'Đang làm việc'}
                            {status === 'finished' && 'Đã hoàn thành'}
                            {status === 'not_started' && 'Chưa chấm công'}
                            {status === 'loading' && 'Đang xử lý...'}
                        </div>
                    </div>
                    <div className="widget-body">
                        {status === 'working' ? (
                            <Timer startTime={todayRecord.check_in_time} />
                        ) : status === 'loading' ? (
                            <TimerLoading />
                        ) : (
                            <div className="timer-display--placeholder">00:00:00</div>
                        )}
                        
                        {status === 'not_started' && (
                            <button className="action-button checkin" onClick={handleCheckIn} disabled={isChecking}>
                                <i className="fas fa-play-circle"></i> Bắt đầu làm việc
                            </button>
                        )}
                        {status === 'working' && (
                            <button className="action-button checkout" onClick={handleCheckOut} disabled={isChecking}>
                                <i className="fas fa-stop-circle"></i> Kết thúc làm việc
                            </button>
                        )}
                        {status === 'finished' && (
                            <div className="completion-message">
                                <i className="fas fa-check-circle"></i> Bạn đã hoàn thành chấm công hôm nay.
                            </div>
                        )}
                        {status === 'loading' && (
                            <div className="action-message">Đang xử lý yêu cầu...</div>
                        )}
                    </div>
                    <div className="widget-footer">
                        <div className="time-record">
                            <span>Check-in:</span>
                            <strong>{todayRecord?.check_in_time ? moment(todayRecord.check_in_time).format('HH:mm:ss') : '--:--'}</strong>
                        </div>
                        <div className="time-record">
                            <span>Check-out:</span>
                            <strong>{todayRecord?.check_out_time ? moment(todayRecord.check_out_time).format('HH:mm:ss') : '--:--'}</strong>
                        </div>
                        {todayRecord?.working_hours !== null && todayRecord?.working_hours !== undefined && (
                            <div className="time-record">
                                <span>Tổng giờ:</span>
                                <strong>{`${(todayRecord?.work_hours ?? todayRecord?.working_hours)} giờ`}</strong>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Nút xem lịch sử toàn tập đoàn */}
            {canAccessAllTimesheetsFeature && (
                <div className="history-toggle-section">
                    <button 
                        className="btn btn--primary" 
                        onClick={() => setShowAllTimesheets(!showAllTimesheets)}
                    >
                        <i className={`fas fa-${showAllTimesheets ? 'user' : 'users'}`}></i> 
                        {showAllTimesheets ? 'Xem lịch sử cá nhân' : 'Xem lịch sử toàn tập đoàn'}
                    </button>
                </div>
            )}

            <div className="history-section">
                <div className="history-header">
                    <h2>Lịch sử chấm công {showAllTimesheets ? '(Toàn Tập đoàn)' : ''}</h2>
                    <div className="history-filters">
                        {/* Dropdown lọc Nhân viên (chỉ hiển thị khi xem toàn tập đoàn) */}
                        {showAllTimesheets && (
                            <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
                                <option value="">Tất cả nhân viên</option>
                                {(allEmployees || []).map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code})</option>
                                ))}
                            </select>
                        )}
                        {/* Dropdown lọc Đơn vị (chỉ hiển thị khi xem toàn tập đoàn) */}
                        {showAllTimesheets && (
                            <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
                                <option value="">Tất cả đơn vị</option>
                                {(companies || []).map(comp => (
                                    <option key={comp.id} value={comp.id}>{comp.company_name}</option>
                                ))}
                            </select>
                        )}
                        {/* Dropdown lọc Tháng */}
                        <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
                            {[...Array(12).keys()].map(i => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
                        </select>
                        {/* Dropdown lọc Năm */}
                        <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
                            {[...Array(5).keys()].map(i => <option key={moment().year() - 2 + i} value={moment().year() - 2 + i}>{moment().year() - 2 + i}</option>)}
                        </select>
                    </div>
                </div>
                <div className="table-wrapper">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Số giờ làm</th>
                                <th>Trạng thái</th>
                                {showAllTimesheets && ( 
                                    <>
                                        <th>Mã NV</th>
                                        <th>Tên NV</th>
                                        <th>Đơn vị</th>
                                        <th>Phòng ban</th>
                                    </>
                                )}
                                {canViewAdvancedInfo && (
                                    <>
                                        <th>Loại Thiết bị</th>
                                        <th>Người chấm công</th>
                                        <th>Địa chỉ IP</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={colSpan} className="table-state-cell">Đang tải...</td></tr>
                            ) : timesheet.length > 0 ? (
                                timesheet.map(record => (
                                    <tr key={record.id}>
                                        <td>{moment(record.work_date).format('DD/MM/YYYY')}</td>
                                        <td>{record.check_in_time ? moment(record.check_in_time).format('HH:mm:ss') : '---'}</td>
                                        <td>{record.check_out_time ? moment(record.check_out_time).format('HH:mm:ss') : '---'}</td>
                                        <td>{((record?.work_hours ?? record?.working_hours) ?? 'N/A')}</td>
                                        <td>{record.status}</td>
                                        {showAllTimesheets && (
                                            <>
                                                <td>{record.employee_code}</td>
                                                <td>{record.employee_name}</td>
                                                <td>{record.company_name || 'N/A'}</td>
                                                <td>{record.department_name || 'N/A'}</td>
                                            </>
                                        )}
                                        {canViewAdvancedInfo && (
                                            <>
                                                <td>
                                                    <div className="device-info">
                                                        {record.device_info === 'Desktop' && <i className="fas fa-desktop" title="Desktop"></i>}
                                                        {record.device_info === 'Mobile' && <i className="fas fa-mobile-alt" title="Mobile"></i>}
                                                        {record.device_info === 'Tablet' && <i className="fas fa-tablet-alt" title="Tablet"></i>}
                                                        <span>{record.device_info}</span>
                                                    </div>
                                                </td>
                                                <td>{record.device_user}</td>
                                                <td>{record.ip_address}</td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={colSpan} className="table-state-cell">Không có dữ liệu chấm công.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TimekeepingPage;
