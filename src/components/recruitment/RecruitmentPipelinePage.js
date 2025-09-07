// src/components/recruitment/RecruitmentPipelinePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const RecruitmentPipelinePage = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null); // Lỗi: 'setJob' is assigned a value but never used
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchJobAndCandidates = useCallback(async () => {
        setLoading(true);
        try {
            const jobRes = await axios.get(`${API_BASE_URL}/api/job-postings/${jobId}`);
            setJob(jobRes.data);

            const candidatesRes = await axios.get(`${API_BASE_URL}/api/job-postings/${jobId}/candidates`);
            setCandidates(candidatesRes.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải dữ liệu tuyển dụng.');
        } finally {
            setLoading(false);
        }
    }, [jobId]); // Thêm jobId vào dependency array

    useEffect(() => {
        fetchJobAndCandidates();
    }, [fetchJobAndCandidates]);

    if (loading) return <p>Đang tải dữ liệu tuyển dụng...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!job) return <p>Không tìm thấy tin tuyển dụng.</p>;

    return (
        <div className="recruitment-pipeline-page-container">
            <h2>Quy trình tuyển dụng: {job.title}</h2>

            <div className="pipeline-stages">
                {['Mới ứng tuyển', 'Sơ loại', 'Phỏng vấn', 'Nhận việc', 'Từ chối'].map(stage => (
                    <div key={stage} className="pipeline-stage">
                        <h3>{stage}</h3>
                        {candidates.filter(c => c.status === stage).map(candidate => (
                            <div key={candidate.id} className="candidate-card">
                                <h4>{candidate.full_name}</h4>
                                <p>Email: {candidate.email}</p>
                                <p>Điện thoại: {candidate.phone}</p>
                                <p>Ứng tuyển lúc: {new Date(candidate.applied_at).toLocaleDateString()}</p>
                                {/* Thêm các chi tiết khác hoặc nút hành động */}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecruitmentPipelinePage;