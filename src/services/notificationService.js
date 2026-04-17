import api from './api';

const notificationService = {
  // جلب آخر الإشعارات للمستخدم الحالي
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل جلب الإشعارات');
    }
  },

  // تحديد إشعار واحد كمقروء
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw new Error('فشل تحديث حالة الإشعار');
    }
  },

  // تحديد كل الإشعارات كمقروءة
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw new Error('فشل تحديث الإشعارات');
    }
  },

  // حذف إشعار واحد
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('فشل حذف الإشعار');
    }
  },

  // حذف كل الإشعارات المقروءة
  deleteAllRead: async () => {
    try {
      const response = await api.delete('/notifications/read');
      return response.data;
    } catch (error) {
      throw new Error('فشل تنظيف الإشعارات');
    }
  },
};

export default notificationService;
