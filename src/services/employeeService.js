import api from './api';

const employeeService = {
  /**
   * جلب العمال (يمكن تمرير branchId لفلترة عمال فرع محدد)
   * حسب ملف employeeRoutes.js: GET /api/employees?branch_id=...
   */
  getEmployees: async (branchId = null) => {
    try {
      // بناء الرابط الذكي (إذا تم تمرير فرع، نضيفه كـ Query Parameter)
      const url = branchId ? `/employees?branch_id=${branchId}` : '/employees';
      const response = await api.get(url);
      return response.data; // { employees: [...] }
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء جلب بيانات العمال';
      throw new Error(message);
    }
  },

  /**
   * إضافة عامل جديد (كاشير أو عامل أرضية)
   * حسب ملف employeeRoutes.js: POST /api/employees
   */
  addEmployee: async (employeeData) => {
    try {
      const response = await api.post('/employees', employeeData);
      return response.data; // { message, employee }
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء إضافة العامل';
      throw new Error(message);
    }
  },
// أضف هذه الدالة داخل كائن employeeService في ملف src/services/employeeService.js

  /**
   * تعديل بيانات موظف
   * حسب ملف employeeRoutes.js: PUT /api/employees/:id
   */
  updateEmployee: async (employeeId, updateData) => {
    try {
      const response = await api.put(`/employees/${employeeId}`, updateData);
      return response.data; // { message, employee }
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء تحديث بيانات الموظف';
      throw new Error(message);
    }
  },
  /**
   * حذف عامل (Soft Delete)
   * حسب ملف employeeRoutes.js: DELETE /api/employees/:id
   */
  deleteEmployee: async (employeeId, branchId) => {
    try {
      // 🛡️ نمرر branch_id في الـ Body أو Query لكي ينجح فحص الـ Subscription Middleware
      const response = await api.delete(`/employees/${employeeId}?branch_id=${branchId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء إزالة العامل';
      throw new Error(message);
    }
  }
};

export default employeeService;