import { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Store, Moon, Sun } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { showAlert } from '../../utils/alert';
import NotificationBell from '../../components/layout/NotificationBell';
import logoImg from '../../assets/images/logo.png';
const CashierLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    showAlert
      .error('تسجيل الخروج', 'هل أنت متأكد من رغبتك في الخروج من النظام؟')
      .then((result) => {
        if (result.isConfirmed) {
          logout();
          navigate('/login');
        }
      });
  };

  const pageTransitionVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const isDashboard =
    location.pathname === '/cashier' || location.pathname === '/cashier/';

  return (
    /* 🚀 الحل الجذري: منع سكرول المتصفح الخارجي وتثبيت الارتفاع */
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 arabic-direct">
      {/* هيدر ثابت (shrink-0) لضمان عدم اختفائه */}
      <AnimatePresence>
        {isDashboard && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 h-20 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-50 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              {/* 🚀 اللوجو الجديد بدلاً من الأيقونة المربعة (Store) */}
              <img
                src={logoImg}
                alt="لوجو دكاني"
                className="w-17 h-14 sm:w-12 sm:h-12 object-contain drop-shadow-md transition-transform hover:scale-105"
              />

              <div></div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <NotificationBell />

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

              <button
                onClick={handleLogout}
                className="p-2.5 sm:px-4 sm:py-2.5 flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl font-bold transition-all active:scale-95 border border-rose-100 dark:border-rose-500/20"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">خروج</span>
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* 📦 منطقة العمل: هي المسؤولة الوحيدة عن التمرير (overflow-y-auto) */}
      <main className="flex-1 overflow-y-auto w-full custom-scrollbar p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full min-h-full flex flex-col">
          {/* الحاوية الزجاجية - تأخذ الطول الذي يحتاجه المحتوى (min-h-full) */}
          <div className="flex-1 w-full rounded-[24px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 sm:p-8 shadow-sm transition-colors relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageTransitionVariants}
                className="w-full h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CashierLayout;
