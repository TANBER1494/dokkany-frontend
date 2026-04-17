import { useState, useContext, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, LogOut, CreditCard, Menu, X, 
  LayoutDashboard, Users, Settings, Bell, Building2,
  ChevronLeft, LayoutGrid
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import NotificationBell from '../../components/layout/NotificationBell';

const AdminLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'لوحة التحكم', icon: LayoutDashboard, path: '/admin/payments' },
    { name: 'إدارة الملاك', icon: Users, path: '/admin/users' },
    { name: 'إدارة الفروع', icon: Building2, path: '/admin/branches' },
    { name: 'الإعدادات', icon: Settings, path: '/admin/settings' },
  ];

  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '100%', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-cairo" dir="rtl">
      {/* 📱 Overlay للموبايل */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 🏰 القائمة الجانبية (Sidebar) */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={!isMobile || isSidebarOpen ? "open" : "closed"}
        className={`fixed lg:relative inset-y-0 right-0 w-72 bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl lg:shadow-none`}
      >
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <ShieldAlert className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">دكاني</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">لوحة الإدارة العليا</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-[15px]">{item.name}</span>
                {isActive && (
                  <motion.div layoutId="activeNav" className="mr-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-[15px]">تسجيل الخروج</span>
          </button>
        </div>
      </motion.aside>

      {/* ☁️ المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-black text-slate-800">أهلاً بك، {user?.name?.split(' ')[0]} </h2>
              <p className="text-xs text-slate-400 font-bold mt-0.5">نظام الإدارة المركزية متاح للتحكم</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-3 pr-2 group cursor-pointer">
              <div className="text-left hidden md:block">
                <p className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors">المدير العام</p>
                <p className="text-[10px] text-slate-400 font-bold tracking-tight">SUPER ADMIN</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-lg shadow-slate-200 border-2 border-white ring-1 ring-slate-100">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;