import api from './api';

const ownerReportService = {
  // 1. جلب الوردية الحية لفرع معين
  getLiveShift: async (branchId) => {
    try {
      const response = await api.get(`/shifts/active?branch_id=${branchId}`);
      return response.data.shift;
    } catch (error) {
      if (error.response && error.response.status === 404) return null;
      throw new Error(
        error.response?.data?.message || 'خطأ في جلب الوردية الحية'
      );
    }
  },

  // 2. جلب أرشيف الورديات لفرع معين
  getShiftsHistory: async (branchId) => {
    try {
      const response = await api.get(`/shifts?branch_id=${branchId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في جلب سجل الورديات'
      );
    }
  },

  // 3. التفتيش العميق: جلب تفاصيل المصروفات لوردية معينة
  getShiftCashFlows: async (shiftId, branchId) => {
    try {
      const response = await api.get(
        `/cash-flows/shift/${shiftId}?branch_id=${branchId}`
      );
      return response.data.cashFlows;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في جلب تفاصيل الوردية'
      );
    }
  }, // 3. التفتيش العميق الشامل (Timeline) للوردية
  getShiftTimeline: async (shiftId, branchId) => {
    try {
      const response = await api.get(
        `/shifts/${shiftId}/timeline?branch_id=${branchId}`
      );
      return response.data.timeline;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في جلب تفاصيل الوردية'
      );
    }
  },
  // 4. جلب الموردين لفرع معين
  getBranchVendors: async (branchId) => {
    try {
      const response = await api.get(`/vendors?branch_id=${branchId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل جلب قائمة الموردين');
    }
  },

  // 5. جلب كشف حساب مورد للمراقبة
  getVendorStatement: async (vendorId, branchId) => {
    try {
      const response = await api.get(`/vendor-invoices/statement?vendor_id=${vendorId}&branch_id=${branchId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل جلب كشف حساب المورد');
    }
  },
// 6. جلب زبائن فرع معين (للمراقبة)
  getBranchCustomers: async (branchId) => {
    try {
      // 🎯 التعديل 1: إضافة مسار /customers للرابط
      const response = await api.get(`/customer-debts/customers?branch_id=${branchId}`);
      // 🎯 التعديل 2: استخراج المصفوفة من الكائن
      return response.data.customers; 
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل جلب كشكول الزباين');
    }
  },

  // 7. جلب كشف حساب زبون (للتدقيق)
  getCustomerStatement: async (customerId, branchId) => {
    try {
      // 🎯 التعديل 3: إضافة مسار /customers للرابط ليتطابق مع الباك إند
      const response = await api.get(`/customer-debts/customers/${customerId}/statement?branch_id=${branchId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل جلب كشف حساب الزبون');
    }
  }
};

export default ownerReportService;
