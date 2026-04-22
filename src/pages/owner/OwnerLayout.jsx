import { useState, useContext, useEffect } from 'react';
import { requestForToken, onMessageListener } from '../../firebase';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PackageSearch,
  Settings,
  LogOut,
  Store,
  History,
  CreditCard,
  Moon,
  Sun,
  Building2,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { showAlert } from '../../utils/alert';
import NotificationBell from '../../components/layout/NotificationBell';
import '../../components/layout/OwnerLayout.css';
import api from '../../services/api'

const OwnerLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: 'الرئيسية',
      path: '/owner/dashboard',
      icon: <LayoutDashboard size={18} />,
      c1: '#5eb6fd',
      c2: '#0576d3',
    },
    {
      name: 'الورديات',
      path: '/owner/shifts',
      icon: <History size={18} />,
      c1: '#fbbf24',
      c2: '#f59e0b',
    },
    {
      name: 'الفروع',
      path: '/owner/branches',
      icon: <Store size={18} />,
      c1: '#a855f7',
      c2: '#7c3aed',
    },
    {
      name: 'المخزن',
      path: '/owner/inventory',
      icon: <PackageSearch size={18} />,
      c1: '#10b981',
      c2: '#059669',
    },
    {
      name: 'الاشتراكات',
      path: '/owner/billing',
      icon: <CreditCard size={18} />,
      c1: '#f43f5e',
      c2: '#e11d48',
    },
    {
      name: 'الإعدادات',
      path: '/owner/settings',
      icon: <Settings size={18} />,
      c1: '#64748b',
      c2: '#475569',
    },
  ];

  const handleLogout = () => {
    showAlert.success('إلى اللقاء', 'تم تسجيل الخروج من الحساب ').then(() => {
      logout();
      navigate('/login');
    });
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);


 useEffect(() => {
    // طلب الصلاحية واستخراج التوكن
    requestForToken().then((token) => {
      if (token) {
        console.log("🔥 THE FIREBASE TOKEN IS: ", token);
        
        api.put('/auth/fcm-token', { fcm_token: token })
          .then(() => console.log('✅ تم حفظ توكن الإشعارات في قاعدة البيانات'))
          .catch(err => console.error('❌ فشل حفظ التوكن في السيرفر', err));
      }
    });

    // الاستماع للإشعارات في حالة كان التطبيق مفتوحاً
    onMessageListener()
      .then((payload) => {
        console.log("استلمت إشعار والتطبيق مفتوح: ", payload);
        showAlert.success(payload.notification.title, payload.notification.body);
      })
      .catch((err) => console.log('failed: ', err));
  }, []);


  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 floating-nav">
      <header className="shrink-0 z-[100] w-[95%] lg:w-[92%] mx-auto bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 px-4 py-3 rounded-[30px] shadow-2xl flex items-center justify-between mt-4">
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
          <Link to="/owner/dashboard" className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
              <Building2 size={20} />
            </div>
            <h1 className="font-black text-lg tracking-tighter dark:text-white hidden sm:block">
            </h1>
          </Link>
        </div>

        <div
          className={`magic-menu-wrapper ${isMobileMenuOpen ? 'mobile-active' : ''}`}
        >
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

            {/* 🚀 زر تسجيل الخروج (يظهر في الموبايل فقط كعنصر سحري من القائمة) */}
            <li
              className="hidden max-[1180px]:flex"
              style={{ '--i': '#f43f5e', '--j': '#e11d48' }}
            >
              <a
                onClick={handleLogout}
                className="cursor-pointer w-full h-full flex items-center justify-center"
              >
                {/* تم إجبار الأيقونة والنص على اللون الأحمر الدائم مع دعم الوضع الليلي */}
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

        <div className="flex items-center gap-2 sm:gap-4 shrink-0 pr-2">
          <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 transition-all"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationBell />
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1"></div>

          <div className="flex items-center gap-2.5 cursor-pointer group">
            {/* قسم البروفايل للديسكتوب */}
            <div className="text-left hidden lg:block">
              <p className="text-[13px] font-black text-slate-800 dark:text-white leading-none">
                {user?.name || 'المالك'}
              </p>
            </div>

            <div
              onClick={() => navigate('/owner/settings')}
              className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm ring-2 ring-white dark:ring-slate-800"
            >
              {user?.name ? user.name.charAt(0) : 'م'}
            </div>
          </div>
        </div>
      </header>

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

export default OwnerLayout;
