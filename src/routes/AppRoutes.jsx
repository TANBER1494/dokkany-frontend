import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import logoImg from '../assets/images/logo.png'; 

// 🚀 استدعاء الشاشات بنظام Lazy Loading لسرعة الأداء
const Login = lazy(() => import('../pages/auth/Login'));
const RegisterOwner = lazy(() => import('../pages/auth/RegisterOwner'));
const OwnerLayout = lazy(() => import('../pages/owner/OwnerLayout'));
const Employees = lazy(() => import('../pages/owner/Branches')); 
const Branches = lazy(() => import('../pages/owner/Branches'));
const BranchEmployees = lazy(() => import('../pages/owner/BranchEmployees'));
const CashierLayout = lazy(() => import('../pages/cashier/CashierLayout'));
const CashierDashboard = lazy(
  () => import('../pages/cashier/CashierDashboard')
);
const VendorsManager = lazy(() => import('../pages/cashier/VendorsManager'));
const ExpensesManager = lazy(() => import('../pages/cashier/ExpensesManager'));
// 📓 تمت إضافة شاشة كشكول الزباين
const CustomerDebtsManager = lazy(
  () => import('../pages/cashier/CustomerDebtsManager')
);
const ShiftManager = lazy(() => import('../pages/cashier/ShiftManager'));
const ShiftsMonitor = lazy(() => import('../pages/owner/ShiftsMonitor'));
const BranchPortal = lazy(() => import('../pages/owner/BranchPortal'));
const InventoryManager = lazy(() => import('../pages/owner/InventoryManager'));

const OwnerDashboard = lazy(() => import('../pages/owner/OwnerDashboard'));
const SubscriptionsManager = lazy(() => import('../pages/owner/SubscriptionsManager'));
const OwnerSettings = lazy(() => import('../pages/owner/OwnerSettings'));

// 👑 شاشات الإدارة العليا (Super Admin)
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminBranches = lazy(() => import('../pages/admin/AdminBranches'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));


// 🚀 1. شاشة الـ SplashScreen مع دعم كامل للوضع الليلي
const SplashScreen = ({ onStart }) => {
  // 🚨 تم حذف السطر الكارثي الذي كان هنا (const logoImg = ...)

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[100000] flex flex-col items-center justify-between p-6 sm:p-10 animate-fade-in overflow-hidden arabic-direct transition-colors">
      
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mt-10">
        <div className="w-full aspect-square max-h-[250px] relative flex items-center justify-center mb-10">
           {/* 🚀 اللوجو بالحجم الصارم ويقرأ من الاستيراد الرسمي */}
           <img 
             src={logoImg} 
             alt="دكاني" 
             style={{ width: '180px', height: 'auto', display: 'block' }} 
             className="object-contain animate-float drop-shadow-xl shrink-0" 
           />
        </div>

        <div className="flex items-center gap-2 mb-8">
          <span className="w-6 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
          <span className="w-6 h-1.5 bg-[#3b59ff] rounded-full"></span>
          <span className="w-6 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
        </div>

        <h1 className="text-[32px] sm:text-[36px] leading-[1.3] font-black text-slate-900 dark:text-white text-center tracking-tight mb-4 transition-colors">
          أدر مبيعاتك بذكاء <br/> مع تطبيق دكاني  
        </h1>
      </div>

      <div className="w-full max-w-sm pb-8">
        <button
          onClick={onStart}
          className="w-full py-4 sm:py-5 bg-[#3b59ff] hover:bg-blue-700 text-white text-lg sm:text-xl font-bold rounded-full shadow-xl shadow-blue-500/20 transition-all active:scale-95"
        >
          ابدأ الآن 
        </button>
      </div>
    </div>
  );
};

// 🚀 2. اللوجيك الذكي داخل AppRoutes
const AppRoutes = () => {
  const TWELVE_HOURS = 12 * 60 * 60 * 1000; // تعريف الـ 12 ساعة بالملي ثانية

  const [showSplash, setShowSplash] = useState(() => {
    const lastSeen = localStorage.getItem('dokkany_last_splash');
    const now = Date.now();

    // 🚀 تظهر الشاشة في حالتين:
    // 1. لا يوجد سجل (بعد الدخول مباشرة أو أول مرة)
    // 2. أو مر أكثر من 12 ساعة على آخر مرة رآها فيها
    if (!lastSeen || (now - parseInt(lastSeen)) > TWELVE_HOURS) {
      return true;
    }
    return false;
  });

  const handleStart = () => {
    // 🚀 حفظ وقت الظهور الحالي بالملي ثانية
    localStorage.setItem('dokkany_last_splash', Date.now().toString());
    setShowSplash(false);
  };

  // عرض الشاشة إذا لم يتم مشاهدتها
  if (showSplash) {
    return <SplashScreen onStart={handleStart} />;
  }

  // إذا تم مشاهدتها مسبقاً (سواء عمل ريفريش أو غيره)، نعرض الـ Routes مباشرة
  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] items-center justify-center text-indigo-600 font-bold text-xl bg-slate-50 dark:bg-slate-950 w-full transition-colors">
          جاري التحميل...
        </div>
      }
    >
      <div className="animate-fade-in-rapid h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterOwner />} />

          {/* 🚀 مسارات المالك المجمعة تحت OwnerLayout */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OwnerDashboard />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="branches" element={<Branches />} />
            <Route path="branches/:branchId" element={<BranchPortal />} />
            <Route path="shifts" element={<ShiftsMonitor />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="inventory" element={<InventoryManager />} />
            <Route path="billing" element={<SubscriptionsManager />} />

            {/* 🏢 قسم الفروع الشامل */}
            <Route path="branches" element={<Branches />} />
            <Route
              path="branches/:branchId/employees"
              element={<BranchEmployees />}
            />
            <Route
              path="branches/:branchId/vendors"
              element={
                <div className="text-center p-10 font-bold text-2xl">
                  إدارة موردي الفرع (سنبنيها الآن 🚀)
                </div>
              }
            />

            <Route
              path="shifts"
              element={
                <div className="text-center p-10 font-bold text-2xl">
                  الورديات والتقارير
                </div>
              }
            />
            <Route
              path="inventory"
              element={
                <div className="text-center p-10 font-bold text-2xl">
                  المخزن العام
                </div>
              }
            />
            <Route path="settings" element={<OwnerSettings />} />
          </Route>

          {/* 👑 مسارات لوحة الإدارة (SUPER_ADMIN) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* الشاشة الافتراضية حالياً هي مراجعة المدفوعات */}
            <Route index element={<AdminDashboard />} />
            <Route path="payments" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="branches" element={<AdminBranches />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 💰 مسارات الكاشير المجمعة تحت CashierLayout */}
          <Route
            path="/cashier"
            element={
              <ProtectedRoute allowedRoles={['CASHIER']}>
                <CashierLayout />
              </ProtectedRoute>
            }
          >
            {/* 🚀 الشاشة الافتراضية للكاشير (استلام الوردية أو الكروت الذكية) */}
            <Route index element={<CashierDashboard />} />
            <Route path="expenses" element={<ExpensesManager />} />
            <Route path="vendors" element={<VendorsManager />} />

            {/* 📓 مسار كشكول الزباين الجديد تم إضافته هنا */}
            <Route path="customer-debts" element={<CustomerDebtsManager />} />

            {/* 🔒 مسار إدارة الوردية (الجرد والأرشيف) */}
            <Route path="shift" element={<ShiftManager />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="*"
            element={
              <div className="p-10 text-center text-2xl font-bold text-red-500 mt-20">
                🚫 404
              </div>
            }
          />
        </Routes>
      </div>
    </Suspense>
  );
};

export default AppRoutes;
