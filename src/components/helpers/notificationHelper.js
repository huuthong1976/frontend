const db = require('../config/db');

/**
 * Tạo một thông báo mới cho người dùng.
 * @param {number} userId - ID của người nhận.
 * @param {string} content - Nội dung thông báo.
 * @param {string} link - Đường dẫn tương đối (VD: /inbox).
 */
const createNotification = async (userId, content, link) => {
    try {
        if (!userId) return; // Không gửi nếu không có người nhận
        await db.query(
            'INSERT INTO notifications (user_id, content, link) VALUES (?, ?, ?)',
            [userId, content, link]
        );
        // Trong tương lai, bạn có thể tích hợp gửi email/push notification ở đây.
    } catch (error) {
        console.error('Lỗi khi tạo thông báo:', error);
    }
};

module.exports = { createNotification };