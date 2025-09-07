import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Workflow.css';

const ApprovalInboxPage = () => {
    const [inbox, setInbox] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionState, setActionState] = useState({ id: null, action: '', comment: '' });

    useEffect(() => {
        fetchInbox();
    }, []);

    const fetchInbox = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/workflows/inbox');
            setInbox(res.data);
        } catch (error) {
            console.error("Lỗi tải hộp thư duyệt:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (proposalId, action) => {
        if (action === 'reject' && !actionState.comment) {
            alert('Vui lòng nhập lý do từ chối.');
            return;
        }
        try {
            await axios.post(`/api/workflows/proposals/${proposalId}/action`, {
                action: action,
                comment: actionState.comment
            });
            alert('Xử lý thành công!');
            setActionState({ id: null, action: '', comment: '' });
            fetchInbox();
        } catch (error) {
            alert(error.response?.data?.msg || 'Có lỗi xảy ra.');
        }
    };

    return (
        <div className="workflow-container">
            <h1>Hộp thư chờ duyệt</h1>
            {loading && <p>Đang tải...</p>}
            {!loading && inbox.length === 0 && <p>Bạn không có đề xuất nào cần duyệt.</p>}
            
            <div className="inbox-list">
                {inbox.map(p => (
                    <div key={p.id} className="proposal-card">
                        <h3>{p.title}</h3>
                        <p><strong>Người đề xuất:</strong> {p.proposer_name}</p>
                        <p><strong>Số tiền:</strong> {Number(p.amount).toLocaleString('vi-VN')} VNĐ</p>
                        <p><strong>Lý do:</strong> {p.reason}</p>
                        <hr/>
                        <div className="action-area">
                            <button className="approve-btn" onClick={() => handleAction(p.id, 'approve')}>Duyệt</button>
                            <div className="reject-section">
                                <input 
                                    type="text" 
                                    placeholder="Lý do từ chối (nếu có)"
                                    onChange={(e) => setActionState({ id: p.id, comment: e.target.value })}
                                />
                                <button className="reject-btn" onClick={() => handleAction(p.id, 'reject')}>Từ chối</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ApprovalInboxPage;
