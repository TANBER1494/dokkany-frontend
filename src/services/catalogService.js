import api from './api';

const catalogService = {
  // ==========================================
  // 📂 إدارة الفئات (Categories)
  // ==========================================
  getCategories: async (branchId) => {
    try {
      const response = await api.get(`/categories?branch_id=${branchId}`);
      return response.data.categories;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل جلب الفئات');
    }
  },

  addCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data.category;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل إضافة الفئة');
    }
  },

  updateCategory: async (categoryId, updateData) => {
    try {
      const response = await api.put(`/categories/${categoryId}`, updateData);
      return response.data.category;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل تحديث الفئة');
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل حذف الفئة');
    }
  },

  // ==========================================
  // 📦 إدارة المنتجات (Products)
  // ==========================================
  getProducts: async (params) => {
    try {
      // params يمكن أن يحتوي على: branch_id, category_id, search, barcode
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/products?${queryString}`);
      return response.data.products;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل جلب المنتجات');
    }
  },

  addProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data.product;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل إضافة المنتج');
    }
  },

  updateProduct: async (productId, updateData) => {
    try {
      const response = await api.put(`/products/${productId}`, updateData);
      return response.data.product;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل تحديث المنتج');
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل حذف المنتج');
    }
  },// ==========================================
  // 📊 الاستيراد والتصدير (Excel)
  // ==========================================
  exportProductsTemplate: async (branchId) => {
    try {
      // 🚀 اللمسة السحرية: responseType: 'blob' لمنع تلف ملف الإكسيل
      const response = await api.get(`/products/export-template?branch_id=${branchId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error('فشل تحميل قالب الإكسيل');
    }
  },

  importProductsFromExcel: async (branchId, file) => {
    try {
      const formData = new FormData();
      formData.append('branch_id', branchId);
      formData.append('excel_file', file);
      
      const response = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل استيراد المنتجات');
    }
  },
};

export default catalogService;