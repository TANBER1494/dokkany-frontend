import api from './api';

const posAccountService = {
  getPosAccount: async (branchId) => {
    try {
      const response = await api.get(`/pos-accounts/${branchId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل جلب بيانات حساب الكاشير');
    }
  },

  upsertPosAccount: async (branchId, accountData) => {
    try {
      const response = await api.post(`/pos-accounts/${branchId}`, accountData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل حفظ حساب الكاشير');
    }
  }
};

export default posAccountService;