import api from './api';

// ==========================================
// 🏢 خدمة إدارة الفروع (المحدثة)
// ==========================================

const branchService = {
  /**
   * جلب جميع الفروع الخاصة بالمؤسسة
   */
  getBranches: async () => {
    try {
      const response = await api.get('/branches');
      return response.data; // { count, branches }
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء جلب الفروع';
      throw new Error(message);
    }
  },

  /**
   * إضافة فرع جديد للمؤسسة
   * @param {Object} branchData - { name, location, shift_start_time, shift_duration_hours }
   */
  addBranch: async (branchData) => {
    try {
      const response = await api.post('/branches', branchData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء إضافة الفرع';
      throw new Error(message);
    }
  },

  /**
   * تعديل إعدادات الفرع (مثل مواعيد الوردية أو الموقع)
   * @param {String} branchId - معرف الفرع
   * @param {Object} updateData - البيانات المراد تحديثها
   */
  updateBranch: async (branchId, updateData) => {
    try {
      const response = await api.put(`/branches/${branchId}`, updateData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء تحديث إعدادات الفرع';
      throw new Error(message);
    }
  },

  /**
   * إيقاف/حذف الفرع (إدارياً)
   * @param {String} branchId - معرف الفرع المراد إيقافه
   */
  deleteBranch: async (branchId) => {
    try {
      // 🚀 استدعاء مسار الحذف الذي أضفناه في الباك إند
      const response = await api.delete(`/branches/${branchId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء محاولة إيقاف الفرع';
      throw new Error(message);
    }
  },

  /**
   * إعادة تنشيط الفرع
   */
  reactivateBranch: async (branchId) => {
    try {
      const response = await api.put(`/branches/${branchId}/reactivate`); // سنضيف المسار في الباك
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل التنشيط');
    }
  },

  /**
   * حذف نهائي
   */
  hardDeleteBranch: async (branchId) => {
    try {
      const response = await api.delete(`/branches/${branchId}/hard-delete`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل الحذف النهائي');
    }
  }
};



export default branchService;