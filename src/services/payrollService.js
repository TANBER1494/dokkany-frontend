import api from './api';

const payrollService = {
  /**
   * حساب تصفية راتب العامل (أيام العمل - السلفيات)
   */
  getEmployeeSettlement: async (employeeId, month, year) => {
    try {
      const response = await api.get(`/payroll/settlement?employee_id=${employeeId}&month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في حساب تصفية الراتب');
    }
  }
};

export default payrollService;