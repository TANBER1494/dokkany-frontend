import api from './api';

const shiftService = {
  // 🔍 1. جلب آخر وردية مغلقة (للاستلام الإجباري المُرحل)
  getLastClosedShift: async () => {
    try {
      const response = await api.get('/shifts/last-closed');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في التحقق من الورديات السابقة'
      );
    }
  },

  // 🔓 2. فتح وردية جديدة
  openShift: async (shiftData) => {
    try {
      const response = await api.post('/shifts', shiftData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في فتح الوردية');
    }
  },

  // 🟢 3. جلب الوردية المفتوحة حالياً
  getActiveShift: async () => {
    try {
      const response = await api.get('/shifts/active');
      return response.data.shift;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || 'خطأ في جلب الوردية');
    }
  },

  // 🔒 4. إغلاق الوردية (الجرد الأعمى)
  closeShift: async (shiftId, closeData) => {
    try {
      const response = await api.put(`/shifts/${shiftId}/close`, closeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في إغلاق الوردية');
    }
  },

  // 📚 5. جلب أرشيف الورديات
  getShiftsHistory: async () => {
    try {
      const response = await api.get('/shifts');
      return response.data; // { count, shifts }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في جلب سجل الورديات'
      );
    }
  },
  // ✋ 5. تأكيد استلام الوردية الشبحية (تسجيل الحضور الفعلي)
  acknowledgeShift: async (acknowledgeData) => {
    try {
      const response = await api.put('/shifts/active/acknowledge', acknowledgeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في استلام الوردية');
    }
  },
  getShiftTimeline: async (shiftId) => {
    const response = await api.get(`/shifts/${shiftId}/timeline`);
    return response.data;
  },
};

export default shiftService;
