import api from './api';

const vendorService = {
  // 1. جلب موردين الفرع (تم الإصلاح هنا 🚀)
  getVendors: async (branchId) => {
    try {
      const response = await api.get(`/vendors?branch_id=${branchId}`);
      // الباك إند يرسل المصفوفة مباشرة في response.data
      return response.data; 
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في جلب الموردين');
    }
  },

  // 2. إضافة مورد جديد
  addVendor: async (vendorData) => {
    try {
      const response = await api.post('/vendors', vendorData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في إضافة المورد');
    }
  },

  // 3. تعديل بيانات المورد
  updateVendor: async (vendorId, vendorData) => {
    try {
      const response = await api.put(`/vendors/${vendorId}`, vendorData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'خطأ في تحديث بيانات المورد'
      );
    }
  },

 deleteVendor: async (id) => {
    try {
      const response = await api.delete(`/vendors/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في حذف المورد');
    }
  }
};

export default vendorService;