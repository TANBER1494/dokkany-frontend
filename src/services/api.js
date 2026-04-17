import axios from 'axios';

// إعداد الرابط الأساسي للباك إند
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// متغيرات لمنع تداخل الطلبات أثناء تجديد التوكن
let isRefreshing = false;
let failedQueue = [];

// دالة لمعالجة الطلبات المتوقفة أثناء عملية التجديد
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==========================================
// 🛡️ 1. Interceptor للطلبات الخارجة (إضافة التوكن)
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dokkany_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// ♻️ 2. Interceptor للردود (التجديد الصامت)
// ==========================================
api.interceptors.response.use(
  (response) => response, // إذا كان الرد ناجحاً، يمر بسلام
  async (error) => {
    const originalRequest = error.config;

    // إذا كان الخطأ 401 (غير مصرح) ولم نقم بمحاولة تجديد سابقة لنفس الطلب
    if (error.response?.status === 401 && !originalRequest._retry) {
      // نمنع محاولة تجديد التوكن إذا كان الخطأ قادماً من مسارات تسجيل الدخول أو التجديد نفسه
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      // إذا كانت عملية التجديد جارية بالفعل لطلب آخر، نضع هذا الطلب في طابور الانتظار
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

     // 🚀 نبدأ عملية التجديد الصامتة
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('dokkany_refresh_token');

      // 🛡️ حماية إضافية: التأكد من أن التوكن موجود وليس كلمة undefined
      if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // نطلب توكن جديد من الباك إند
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
        
        // حفظ المفاتيح الجديدة السليمة
        localStorage.setItem('dokkany_token', data.token);
        localStorage.setItem('dokkany_refresh_token', data.refresh_token);
        
        // إعداد الهيدر للطلبات القادمة
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
        
        // إطلاق سراح الطلبات المتوقفة في الطابور
        processQueue(null, data.token);
        
        // إعادة إرسال الطلب الأصلي الذي فشل
        return api(originalRequest);
        
      } catch (refreshError) {
        // إذا فشل التجديد (مثلاً الـ Refresh Token انتهت صلاحيته بعد 30 يوم أو سُرق)
        processQueue(refreshError, null);
        localStorage.clear(); // تنظيف المتصفح
        window.location.href = '/login'; // طرد المستخدم لتسجيل الدخول من جديد
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // لأي أخطاء أخرى، نمررها كما هي للفرونت إند للتعامل معها
    return Promise.reject(error);
  }
);

export default api;