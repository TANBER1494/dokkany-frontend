import api from './api';

const dashboardService = {
  // 👑 جلب بيانات اللوحة الشاملة للمالك
  getMasterDashboard: async () => {
    try {
      const response = await api.get('/dashboard/master');
      return response.data; // سيرجع { grand_totals, branches }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في جلب بيانات اللوحة الرئيسية');
    }
  }
};

export default dashboardService;