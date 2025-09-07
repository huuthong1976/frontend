/* =================================================================== */
/* FILE: kpi-frontend/src/components/timekeeping/TimekeepingPage.js    */
/* =================================================================== */
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './TimekeepingPage.css';

const API_URL = 'http://localhost:5000/api/timekeeping';

const TimekeepingPage = () => {
    const { user } = useContext(AuthContext);
    const [todayStatus, setTodayStatus] = useState({ checkedIn: false, checkedOut: false });
    const [timesheet, setTimesheet] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const fetchMyTimesheet = async () => {
        try {
            const res = await axios.get(`${API_URL}/my-timesheet`, { params: { year: currentYear, month: currentMonth } });
            setTimesheet(res.data);
            const todayRecord = res.data.find(r => r.work_date.startsWith(new Date().toISOString().slice(0, 10)));
            if (todayRecord) {
                setTodayStatus({ checkedIn: !!todayRecord.check_in_time, checkedOut: !!todayRecord.check_out_time });
            }
        } catch (error) {
            console.error("Lỗi tải bảng chấm công:", error);
        }
    };

    useEffect(() => {
        fetchMyTimesheet();
    }, [currentMonth, currentYear]);

    const handleCheckIn = async () => {
        try {
            const res = await axios.post(`${API_URL}/checkin`);
            alert(res.data.msg);
            fetchMyTimesheet();
        } catch (error) {
            alert(error.response?.data?.msg || 'Có lỗi xảy ra');
        }
    };

    const handleCheckOut = async () => {
        try {
            const res = await axios.post(`${API_URL}/checkout`);
            alert(res.data.msg);
            fetchMyTimesheet();
        } catch (error) {
            alert(error.response?.data?.msg || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="timekeeping-container">
            <h1>Chấm công hàng ngày</h1>
            <div className="check-in-out-box">
                <h3>Hôm nay: {new Date().toLocaleDateString('vi-VN')}</h3>
                <div className="buttons">
                    <button onClick={handleCheckIn} disabled={todayStatus.checkedIn}>Check-in</button>
                    <button onClick={handleCheckOut} disabled={!todayStatus.checkedIn || todayStatus.checkedOut}>Check-out</button>
                </div>
            </div>

            <h2>Bảng chấm công tháng {currentMonth}/{currentYear}</h2>
            <div className="timesheet-table">
                <table>
                    <thead>
                        <tr>
                            <th>Ngày</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Số giờ làm</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timesheet.map(record => (
                            <tr key={record.id}>
                                <td>{new Date(record.work_date).toLocaleDateString('vi-VN')}</td>
                                <td>{record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString('vi-VN') : '---'}</td>
                                <td>{record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString('vi-VN') : '---'}</td>
                                <td>{record.work_hours}</td>
                                <td>{record.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimekeepingPage;
