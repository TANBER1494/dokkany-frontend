import api from './api';

const inventoryService = {
  /**
   * إرسال الجرد الفعلي للمحل ليقوم الباك إند بحساب الميزانية
   * @param {Object} inventoryData - يحتوي على (branch_id, counted_items, customer_debts, fixed_expenses, notes)
   */
  performInventory: async (inventoryData) => {
    try {
      const response = await api.post('/inventory', inventoryData);
      return response.data; // سيرجع { message, summary }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل تنفيذ الجرد واعتماده');
    }
  },

  /**
   * جلب أرشيف الجرد السابق للمقارنة
   * @param {String} branchId 
   */
  getInventoryHistory: async (branchId) => {
    try {
      const response = await api.get(`/inventory?branch_id=${branchId}`);
      return response.data; // سيرجع مصفوفة الأرشيف
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل جلب سجل الجرد');
    }
  }
};

export default inventoryService;