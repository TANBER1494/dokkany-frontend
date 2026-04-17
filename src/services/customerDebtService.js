import api from './api';

const customerDebtService = {
  // 1. جلب قائمة الزبائن ومديونياتهم
  getCustomers: async () => {
    try {
      const response = await api.get('/customer-debts/customers');
      return response.data.customers;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في جلب قائمة الزبائن');
    }
  },

  // 2. فتح حساب زبون جديد مع أول دين
  addCustomerWithDebt: async (customerData) => {
    try {
      const response = await api.post('/customer-debts/customers', customerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في فتح حساب الزبون');
    }
  },

  // 3. تسجيل حركة (سحب بضاعة أو سداد فلوس)
  recordTransaction: async (transactionData) => {
    try {
      const response = await api.post('/customer-debts/transactions', transactionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في تسجيل الحركة');
    }
  },

  // 4. جلب كشف حساب تفصيلي للزبون
  getCustomerStatement: async (customerId) => {
    try {
      const response = await api.get(`/customer-debts/customers/${customerId}/statement`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في جلب كشف الحساب');
    }
  },// 🔄 تعديل بيانات الزبون
  updateCustomer: async (customerId, updatedData) => {
    try {
      const response = await api.put(`/customer-debts/customers/${customerId}`, updatedData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في تحديث بيانات الزبون');
    } },

  // 🗑️ حذف الزبون من الدفتر
  deleteCustomer: async (customerId) => {
    try {
      const response = await api.delete(`/customer-debts/customers/${customerId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في حذف الزبون');
    } }
};

export default customerDebtService;