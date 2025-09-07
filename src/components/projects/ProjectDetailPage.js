// src/components/projects/ProjectDetailPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext); // Lỗi: 'user' is assigned a value but never used
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProjectDetails = useCallback(async () => {
        setLoading(true);
        try {
            const projectRes = await axios.get(`${API_BASE_URL}/api/projects/${id}`);
            setProject(projectRes.data);

            const tasksRes = await axios.get(`${API_BASE_URL}/api/projects/${id}/tasks`);
            setTasks(tasksRes.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải chi tiết dự án.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        // Có thể sử dụng biến 'user' ở đây để lọc hoặc kiểm tra quyền truy cập dự án
        // Ví dụ: if (!user || !user.id) { setError('Bạn cần đăng nhập để xem dự án.'); return; }
        fetchProjectDetails();
    }, [fetchProjectDetails, user]); // Thêm 'user' vào dependency array

    if (loading) return <p>Đang tải chi tiết dự án...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!project) return <p>Không tìm thấy dự án.</p>;

    return (
        <div className="project-detail-page-container">
            <h2>{project.project_name}</h2>
            <p>Mã dự án: {project.project_code}</p>
            <p>Mô tả: {project.description}</p>
            <p>Ngày bắt đầu: {new Date(project.start_date).toLocaleDateString()}</p>
            <p>Ngày kết thúc: {new Date(project.end_date).toLocaleDateString()}</p>
            <p>Quản lý: {project.manager_name}</p>
            <p>Trạng thái: {project.status}</p>

            <h3>Các công việc trong dự án</h3>
            {tasks.length === 0 ? (
                <p>Chưa có công việc nào trong dự án này.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Tên công việc</th>
                            <th>Người thực hiện</th>
                            <th>Hạn chót</th>
                            <th>Ưu tiên</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td>{task.task_name}</td>
                                <td>{task.assignee_name || 'Chưa phân công'}</td>
                                <td>{new Date(task.due_date).toLocaleDateString()}</td>
                                <td>{task.priority}</td>
                                <td>{task.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ProjectDetailPage;