import api from './api';

const adminService = {
  // جلب جميع الملاك
  getAllOwners: async () => {
    try {
      const response = await api.get('/admin/owners');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في جلب بيانات الملاك');
    }
  },

  // جلب جميع الفروع
  getAllBranches: async () => {
    try {
      const response = await api.get('/admin/branches');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في جلب بيانات الفروع');
    }
  },

  // إعادة تعيين كلمة مرور أي مالك (عن طريق الأدمن)
  resetOwnerPassword: async (phone, newPassword) => {
    try {
      const response = await api.put('/admin/reset-user-password', {
        phone,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في تغيير كلمة المرور');
    }
  },

  // تغيير كلمة مرور الأدمن نفسه
  updateAdminPassword: async (passwordData) => {
    try {
      const response = await api.put('/admin/password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في تحديث كلمة المرور');
    }
  }
};

export default adminService;