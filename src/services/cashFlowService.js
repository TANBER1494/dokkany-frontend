import api from './api';

const cashFlowService = {
  addCashFlow: async (cashFlowData) => {
    // ... الكود الحالي كما هو
    try {
      const response = await api.post('/cash-flows', cashFlowData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في تسجيل الحركة المالية');
    }
  },

  getShiftCashFlows: async (shiftId) => {
    // ... الكود الحالي كما هو
    try {
      const response = await api.get(`/cash-flows/shift/${shiftId}`);
      return response.data.cashFlows;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في جلب السجل المالي');
    }
  },

  // 🚀 [الدالة المفقودة] التراجع عن حركة مالية
  deleteCashFlow: async (id) => {
    try {
      const response = await api.delete(`/cash-flows/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في التراجع عن الحركة');
    }
  }
};

export default cashFlowService;