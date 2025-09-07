import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './Project.css';

const ProjectDashboard = () => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({ project_name: '', project_code: '', description: '' });

    const isManager = user && (user.role === 'Admin' || user.role === 'TruongDonVi');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = () => {
        axios.get('/api/projects')
            .then(res => setProjects(res.data))
            .catch(err => console.error("Lỗi tải dự án:", err));
    };

    const handleInputChange = (e) => {
        setNewProject({ ...newProject, [e.target.name]: e.target.value });
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/projects', newProject);
            alert('Tạo dự án thành công!');
            setShowModal(false);
            fetchProjects();
        } catch (error) {
            alert('Lỗi khi tạo dự án.');
        }
    };

    return (
        <div className="project-container">
            <h1>Danh sách Dự án</h1>
            {isManager && <button onClick={() => setShowModal(true)} className="create-btn">Tạo Dự án mới</button>}

            <div className="project-grid">
                {projects.map(p => (
                    <Link to={`/projects/${p.id}`} key={p.id} className="project-card">
                        <h3>{p.project_name}</h3>
                        <p><strong>Mã dự án:</strong> {p.project_code}</p>
                        <p><strong>Quản lý:</strong> {p.manager_name}</p>
                        <span className={`status-badge status-${p.status.replace(/\s/g, '-')}`}>{p.status}</span>
                    </Link>
                ))}
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h2>Tạo Dự án mới</h2>
                        <form onSubmit={handleCreateProject}>
                            <input type="text" name="project_name" placeholder="Tên dự án" onChange={handleInputChange} required />
                            <input type="text" name="project_code" placeholder="Mã dự án" onChange={handleInputChange} />
                            <textarea name="description" placeholder="Mô tả dự án" onChange={handleInputChange}></textarea>
                            <div className="modal-actions">
                                <button type="submit">Tạo</button>
                                <button type="button" onClick={() => setShowModal(false)}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDashboard;