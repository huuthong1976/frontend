import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Training.css';

const MyTrainingPage = () => {
    const [enrollments, setEnrollments] = useState([]);

    useEffect(() => {
        axios.get('/api/training/my-enrollments')
            .then(res => setEnrollments(res.data))
            .catch(err => console.error("Lỗi tải lịch sử học tập:", err));
    }, []);

    return (
        <div className="training-container">
            <h1>Lịch sử Học tập & Phát triển của tôi</h1>
            <div className="training-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tên khóa học</th>
                            <th>Ngày đăng ký</th>
                            <th>Trạng thái</th>
                            <th>Kết quả</th>
                            <th>Ghi chú của QL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrollments.map(en => (
                            <tr key={en.id}>
                                <td>{en.course_name}</td>
                                <td>{new Date(en.enrollment_date).toLocaleDateString('vi-VN')}</td>
                                <td><span className={`training-status status-${en.status.replace(/\s/g, '-')}`}>{en.status}</span></td>
                                <td><span className={`training-result result-${en.result.replace(/\s/g, '-')}`}>{en.result}</span></td>
                                <td>{en.manager_notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyTrainingPage;
