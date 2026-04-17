import api from './api';

// ==========================================
// 🔐 خدمة المصادقة وتأسيس النظام
// ==========================================

const authService = {
  /**
   * تسجيل الدخول (للمالك والكاشير)
   * @param {Object} credentials - { phone, password }
   * @returns {Promise<Object>} - { message, token, user }
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data; 
    } catch (error) {
      // استخراج رسالة الخطأ الصارمة القادمة من الباك إند
      const message = error.response?.data?.message || 'حدث خطأ في الاتصال بالخادم';
      throw new Error(message);
    }
  },

  /**
   * تسجيل مالك جديد وإنشاء المؤسسة (تأسيس النظام)
   * @param {Object} userData - { owner_name, phone, password, organization_name, branch_name, branch_location }
   * @returns {Promise<Object>} - { message, token, user, branch }
   */
  registerOwner: async (userData) => {
    try {
      const response = await api.post('/auth/register-owner', userData);
      return response.data;
    } catch (error) {
      // استخراج رسالة الخطأ القادمة من الـ Controllers
      const message = error.response?.data?.message || 'حدث خطأ أثناء تأسيس النظام';
      throw new Error(message);
    }
  }
};

export default authService;