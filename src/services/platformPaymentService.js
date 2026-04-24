import api from './api';

const platformPaymentService = {
  // ==========================================
  // 💼 مسارات المالك
  // ==========================================

  // 1. رفع طلب التجديد (مع صورة)
  submitRequest: async (formData) => {
    try {
      const response = await api.post('/payments/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في إرسال طلب التجديد'
      );
    }
  },

  // 2. جلب سجل مدفوعات المالك
  getHistory: async () => {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في جلب سجل المدفوعات'
      );
    }
  },

  // ==========================================
  // 👑 مسارات الأدمن (سنحتاجها لاحقاً في لوحتك)
  // ==========================================

  getPending: async () => {
    try {
      const response = await api.get('/payments/pending');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في جلب الطلبات المعلقة'
      );
    }
  },

  reviewRequest: async (id, reviewData) => {
    try {
      const response = await api.put(`/payments/${id}/review`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في مراجعة الطلب');
    }
  },

  clearBranchHistory: async (branchId) => {
    try {
      const response = await api.delete(`/payments/branches/${branchId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في تنظيف سجل الفرع'
      );
    }
  },

  getAdminHistory: async () => {
    try {
      const response = await api.get('/payments/admin/history');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في جلب سجل المدفوعات للأدمن'
      );
    }
  },

  clearAdminHistory: async () => {
    try {
      const response = await api.delete('/payments/admin/history');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في تنظيف سجل المدفوعات للأدمن'
      );
    }
  },
};

export default platformPaymentService;
