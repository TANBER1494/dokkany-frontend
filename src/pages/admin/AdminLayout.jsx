import { useState, useContext, useEffect } from 'react';
import { requestForToken, onMessageListener } from '../../firebase';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  LogOut,
  Moon,
  Sun,
  ShieldAlert
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { showAlert } from '../../utils/alert';
import NotificationBell from '../../components/layout/NotificationBell';
// نستخدم نفس ملف الـ CSS الخاص بالمالك لاحتوائه على كود الـ Magic Menu والـ Hamburger
import '../../components/layout/OwnerLayout.css'; 
import api from '../../services/api';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🚀 روابط لوحة الإدارة العليا بنفس ألوان المالك الجذابة
  const navItems = [
    {
      name: 'لوحة التحكم',
      path: '/admin/payments',
      icon: <LayoutDashboard size={18} />,
      c1: '#5eb6fd',
      c2: '#0576d3',
    },
    {
      name: 'إدارة الملاك',
      path: '/admin/users',
      icon: <Users size={18} />,
      c1: '#fbbf24',
      c2: '#f59e0b',
    },
    {
      name: 'إدارة الفروع',
      path: '/admin/branches',
      icon: <Building2 size={18} />,
      c1: '#a855f7',
      c2: '#7c3aed',
    },
    {
      name: 'الإعدادات',
      path: '/admin/settings',
      icon: <Settings size={18} />,
      c1: '#64748b',
      c2: '#475569',
    },
  ];

  const handleLogout = () => {
    showAlert.success('إلى اللقاء', 'تم تسجيل الخروج من لوحة الإدارة').then(() => {
      logout();
      navigate('/login');
    });
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // 🔔 تهيئة الإشعارات للمدير العام (لكي يستقبل طلبات التجديد لحظياً)
  useEffect(() => {
    requestForToken().then((token) => {
      if (token) {
        api.put('/auth/fcm-token', { fcm_token: token })
          .then(() => console.log('✅ تم حفظ توكن إشعارات الأدمن'))
          .catch(err => console.error('❌ فشل حفظ التوكن', err));
      }
    });

    onMessageListener()
      .then((payload) => {
        showAlert.success(payload.notification.title, payload.notification.body);
      })
      .catch((err) => console.log('failed: ', err));
  }, []);

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 floating-nav" dir="rtl">
      {/* 🚀 الـ Header العائم (الماجيك مانيو) */}
      <header className="shrink-0 z-[100] w-[95%] lg:w-[92%] mx-auto bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 px-4 py-3 rounded-[30px] shadow-2xl flex items-center justify-between mt-4">
        
        {/* الجزء الأيمن (اللوجو والهمبرجر) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="max-[1180px]:block hidden ml-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          <Link to="/admin/payments" className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl text-white shadow-lg">
              <ShieldAlert size={20} />
            </div>
            {/* يمكن إضافة نص هنا إذا أردت، مثل: الإدارة العليا */}
          </Link>
        </div>

        {/* الجزء الأوسط (القائمة السحرية) */}
        <div className={`magic-menu-wrapper ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <ul className="magic-menu">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li
                  key={item.path}
                  className={isActive ? 'active' : ''}
                  style={{ '--i': item.c1, '--j': item.c2 }}
                >
                  <Link to={item.path}>
                    <span className="icon">{item.icon}</span>
                    <span className="title">{item.name}</span>
                  </Link>
                </li>
              );
            })}

            {/* زر تسجيل الخروج للموبايل */}
            <li
              className="hidden max-[1180px]:flex"
              style={{ '--i': '#f43f5e', '--j': '#e11d48' }}
            >
              <a
                onClick={handleLogout}
                className="cursor-pointer w-full h-full flex items-center justify-center"
              >
                <span className="icon !text-rose-500 dark:!text-rose-400 group-hover:!text-white">
                  <LogOut size={18} />
                </span>
                <span className="title !text-rose-500 dark:!text-rose-400 group-hover:!text-white">
                  تسجيل خروج
                </span>
              </a>
            </li>
          </ul>
        </div>

        {/* الجزء الأيسر (الإعدادات الشخصية والإشعارات) */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 pr-2">
          {/* زر الوضع الليلي والإشعارات */}
          <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 transition-all"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationBell />
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1"></div>

          {/* بيانات البروفايل */}
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="text-left hidden lg:block">
              <p className="text-[13px] font-black text-slate-800 dark:text-white leading-none text-right">
                {user?.name?.split(' ')[0] || 'المدير'}
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold tracking-tight">SUPER ADMIN</p>
            </div>

            <div
              onClick={handleLogout} // يمكن جعله يفتح الإعدادات أو يسجل الخروج
              className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white font-black text-sm ring-2 ring-white dark:ring-slate-700 shadow-lg"
              title="تسجيل الخروج"
            >
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
          </div>
        </div>
      </header>

      {/* ☁️ المحتوى الرئيسي */}
      <main className="flex-1 overflow-y-auto w-full custom-scrollbar mt-4">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:px-8 lg:pb-8 min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Overlay للموبايل */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] max-[1180px]:block hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;