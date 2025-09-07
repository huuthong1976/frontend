// src/components/training/CourseCatalogPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext'; // Lỗi: 'user' is assigned a value but never used

const API_BASE_URL = 'http://localhost:5000';

const CourseCatalogPage = () => {
    const { user } = useContext(AuthContext); // Lỗi: 'user' is assigned a value but never used
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            // API có thể cần user.company_id để lọc các khóa học của công ty đó
            const res = await axios.get(`${API_BASE_URL}/api/courses`);
            setCourses(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải danh mục khóa học.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleEnroll = async (courseId) => {
        if (!user || !user.id) {
            alert('Vui lòng đăng nhập để đăng ký khóa học.');
            return;
        }
        if (window.confirm('Bạn có chắc muốn đăng ký khóa học này?')) {
            try {
                await axios.post(`${API_BASE_URL}/api/employee-enrollments`, {
                    employee_id: user.id,
                    course_id: courseId
                });
                alert('Đăng ký khóa học thành công!');
                // Có thể cập nhật trạng thái đăng ký của khóa học nếu cần
            } catch (err) {
                alert(err.response?.data?.error || 'Lỗi khi đăng ký khóa học.');
            }
        }
    };

    return (
        <div className="course-catalog-page-container">
            <h2>Danh mục Khóa học</h2>

            {loading ? (
                <p>Đang tải danh mục khóa học...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : courses.length === 0 ? (
                <p>Hiện không có khóa học nào trong danh mục.</p>
            ) : (
                <div className="course-list-grid">
                    {courses.map(course => (
                        <div key={course.id} className="course-card">
                            <h3>{course.course_name}</h3>
                            <p>Mã khóa học: {course.course_code}</p>
                            <p>Mô tả: {course.description}</p>
                            <p>Loại: {course.type}</p>
                            <p>Thời lượng: {course.duration_hours} giờ</p>
                            <p>Trạng thái: {course.status}</p>
                            <button onClick={() => handleEnroll(course.id)} className="action-btn">Đăng ký</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseCatalogPage;