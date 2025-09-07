import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Recruitment.css';

const JobPostingsPage = () => {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        axios.get('/api/recruitment/jobs')
            .then(res => setJobs(res.data))
            .catch(err => console.error("Lỗi tải tin tuyển dụng:", err));
    }, []);

    return (
        <div className="recruitment-container">
            <h1>Quản lý Tuyển dụng</h1>
            {/* TODO: Thêm nút tạo tin tuyển dụng mới */}
            <div className="job-list">
                {jobs.map(job => (
                    <div key={job.id} className="job-card">
                        <h3>{job.title}</h3>
                        <p><strong>Phòng ban:</strong> {job.department_name || 'N/A'}</p>
                        <span className={`job-status status-${job.status.replace(/\s/g, '-')}`}>{job.status}</span>
                        <Link to={`/recruitment/pipeline/${job.id}`} className="view-pipeline-btn">Xem ứng viên</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobPostingsPage;