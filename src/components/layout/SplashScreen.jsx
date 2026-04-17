import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext'; // 👈 استيراد السياق

const SplashScreen = ({ children }) => {
  const { user } = useContext(AuthContext); // 👈 مراقبة حالة المستخدم
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // 🚀 اللوجيك الجديد: الشاشة تعمل *فقط* إذا كان هناك مستخدم مسجل الدخول، ولم يشاهدها في هذه الجلسة
    if (user && !sessionStorage.getItem('dokkany_splash_seen')) {
      
      // 1. تسجيل الرؤية *فوراً* لمنع ظهورها لو عمل المستخدم ريفريش بسرعة قبل انتهاء الأنميشن
      sessionStorage.setItem('dokkany_splash_seen', 'true');
      
      // 2. إظهار الشاشة
      setShowSplash(true);

      // 3. إخفاء الشاشة بعد 2.5 ثانية
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [user]); // 👈 ربط الـ useEffect بحالة المستخدم

  return (
    <>
      {children}

      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-indigo-600 dark:bg-indigo-500 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 mb-6">
                <Store className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
                دكاني
              </h1>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2 tracking-widest uppercase">
                الإدارة الذكية
              </p>

              <div className="mt-10 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                    className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SplashScreen;