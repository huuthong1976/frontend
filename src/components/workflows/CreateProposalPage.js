import React, { useState } from 'react';
import axios from 'axios';
import './Workflow.css';

const CreateProposalPage = () => {
    const [formData, setFormData] = useState({ title: '', amount: '', reason: '' });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/workflows/proposals', formData);
            alert(res.data.msg);
            setFormData({ title: '', amount: '', reason: '' }); // Reset form
        } catch (error) {
            alert(error.response?.data?.error || 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="workflow-container">
            <h1>Tạo Đề xuất Kinh phí</h1>
            <div className="proposal-form-container">
                <form onSubmit={handleSubmit}>
                    <label>Tiêu đề đề xuất</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                    
                    <label>Số tiền (VNĐ)</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required />

                    <label>Lý do đề xuất</label>
                    <textarea name="reason" value={formData.reason} onChange={handleInputChange} rows="5" required></textarea>

                    <button type="submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Gửi Đề xuất'}</button>
                </form>
            </div>
        </div>
    );
};

export default CreateProposalPage;
