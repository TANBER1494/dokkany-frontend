import api from './api';

const vendorInvoiceService = {
  addInvoice: async (formData) => {
    try {
      const response = await api.post('/vendor-invoices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في تسجيل الفاتورة');
    }
  },

  getVendorStatement: async (branchId, vendorId) => {
    try {
      const response = await api.get(
        `/vendor-invoices/statement?branch_id=${branchId}&vendor_id=${vendorId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في جلب كشف الحساب');
    }
  },

  deleteInvoice: async (invoiceId) => {
    try {
      const response = await api.delete(`/vendor-invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      // هنا نستقبل الرسالة الإدارية الصارمة من السيرفر (سواء المهلة انتهت أو مغلق)
      throw new Error(
        error.response?.data?.message || 'خطأ أثناء محاولة التراجع عن الفاتورة'
      );
    }
  },
  updateInvoice: async (invoiceId, formData) => {
    try {
      const response = await api.put(
        `/vendor-invoices/${invoiceId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في تحديث الفاتورة');
    }
  },
};

export default vendorInvoiceService;
