import api from './api'; // تأكد أن مسار ملف api.js صحيح لديك

const settingsService = {
  // 📥 جلب الإعدادات الحالية
  getSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء جلب الإعدادات');
    }
  },

  // 📱 تحديث رقم الهاتف
  updatePhone: async (new_phone) => {
    try {
      const response = await api.put('/settings/phone', { new_phone });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل تحديث رقم الهاتف');
    }
  },

  // 🔐 تحديث كلمة المرور
  updatePassword: async (passwordData) => {
    try {
      const response = await api.put('/settings/password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل تحديث كلمة المرور');
    }
  },

  // ⚙️ تحديث التفضيلات (المظهر، الإشعارات، القواعد)
  updatePreferences: async (preferencesData) => {
    try {
      const response = await api.put('/settings/preferences', preferencesData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل حفظ التفضيلات');
    }
  }
};

export default settingsService;