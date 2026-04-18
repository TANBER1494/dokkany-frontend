import { lazy, Suspense, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// 🚀 استدعاء الشاشات بنظام Lazy Loading
const Login = lazy(() => import('../pages/auth/Login'));
const RegisterOwner = lazy(() => import('../pages/auth/RegisterOwner'));
const OwnerLayout = lazy(() => import('../pages/owner/OwnerLayout'));
const OwnerDashboard = lazy(() => import('../pages/owner/OwnerDashboard'));
const Branches = lazy(() => import('../pages/owner/Branches'));
const BranchPortal = lazy(() => import('../pages/owner/BranchPortal'));
const BranchEmployees = lazy(() => import('../pages/owner/BranchEmployees'));
const ShiftsMonitor = lazy(() => import('../pages/owner/ShiftsMonitor'));
const InventoryManager = lazy(() => import('../pages/owner/InventoryManager'));
const SubscriptionsManager = lazy(() => import('../pages/owner/SubscriptionsManager'));
const OwnerSettings = lazy(() => import('../pages/owner/OwnerSettings'));

const CashierLayout = lazy(() => import('../pages/cashier/CashierLayout'));
const CashierDashboard = lazy(() => import('../pages/cashier/CashierDashboard'));
const VendorsManager = lazy(() => import('../pages/cashier/VendorsManager'));
const ExpensesManager = lazy(() => import('../pages/cashier/ExpensesManager'));
const CustomerDebtsManager = lazy(() => import('../pages/cashier/CustomerDebtsManager'));
const ShiftManager = lazy(() => import('../pages/cashier/ShiftManager'));

const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminBranches = lazy(() => import('../pages/admin/AdminBranches'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));

// 🧠 الموجه الذكي (Smart Dispatcher)
// هذا المكون يفحص حالة الجلسة عند الدخول على الرابط الأساسي ويوزع المستخدمين تلقائياً
const SmartRoot = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // الانتظار الصامت حتى تكتمل قراءة localStorage

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'SUPER_ADMIN': return <Navigate to="/admin" replace />;
    case 'OWNER': return <Navigate to="/owner/dashboard" replace />;
    case 'CASHIER': return <Navigate to="/cashier" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        /* 🎨 هذه هي الشاشة التي ستظهر لثانية واحدة أثناء تحميل الكود */
        <div className="flex h-[100dvh] items-center justify-center bg-white dark:bg-slate-950 w-full transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-bold animate-pulse">جاري تهيئة دكاني...</p>
          </div>
        </div>
      }
    >
      <div className="animate-fade-in-rapid h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
        <Routes>
          {/* 🎯 المسار الرئيسي يستخدم الموجه الذكي الآن */}
          <Route path="/" element={<SmartRoot />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterOwner />} />

          {/* 🏢 مسارات المالك */}
          <Route path="/owner" element={<ProtectedRoute allowedRoles={['OWNER']}><OwnerLayout /></ProtectedRoute>}>
            <Route index element={<OwnerDashboard />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="branches" element={<Branches />} />
            <Route path="branches/:branchId" element={<BranchPortal />} />
            <Route path="branches/:branchId/employees" element={<BranchEmployees />} />
            <Route path="shifts" element={<ShiftsMonitor />} />
            <Route path="inventory" element={<InventoryManager />} />
            <Route path="billing" element={<SubscriptionsManager />} />
            <Route path="settings" element={<OwnerSettings />} />
          </Route>

          {/* 👑 مسارات الإدارة العليا */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="payments" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="branches" element={<AdminBranches />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 💰 مسارات الكاشير */}
          <Route path="/cashier" element={<ProtectedRoute allowedRoles={['CASHIER']}><CashierLayout /></ProtectedRoute>}>
            <Route index element={<CashierDashboard />} />
            <Route path="expenses" element={<ExpensesManager />} />
            <Route path="vendors" element={<VendorsManager />} />
            <Route path="customer-debts" element={<CustomerDebtsManager />} />
            <Route path="shift" element={<ShiftManager />} />
          </Route>

          <Route path="*" element={<div className="p-10 text-center text-2xl font-bold text-red-500 mt-20">🚫 404 - الصفحة غير موجودة</div>} />
        </Routes>
      </div>
    </Suspense>
  );
};

export default AppRoutes;