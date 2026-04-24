import React, { useState } from 'react';
import { 
  ShieldCheck, KeyRound, Lock, 
  CheckCircle2, Loader2, Save,
  Fingerprint, Smartphone, Bell, 
  UserCircle, X, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';

const AdminSettings = () => {
  const [activeModal, setActiveModal] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const closeModal = () => {
    setActiveModal(null);
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast.error('كلمة المرور الجديدة غير متطابقة مع التأكيد');
    }

    if (passwordData.new_password.length < 6) {
      return toast.error('كلمة المرور يجب ألا تقل عن 6 أحرف');
    }

    try {
      setIsSubmitting(true);
      await adminService.updateAdminPassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });

      toast.success('تم تحديث كلمة المرور الخاصة بك بنجاح');
      closeModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 مكون البطاقة (Widget) المدمج والداعم للوضع الليلي
  const SettingsCard = ({ title, description, icon: Icon, buttonText, onClick, badge }) => (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col h-full group">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        {badge && (
          <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100 dark:border-amber-800/30">
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-black text-slate-800 dark:text-white text-base sm:text-lg mb-1.5 sm:mb-2">{title}</h3>
      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-4 sm:mb-6 flex-1">
        {description}
      </p>
      <button 
        onClick={onClick}
        disabled={!onClick}
        className={`w-full py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
          onClick 
            ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white border border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-600' 
            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60 border border-slate-100 dark:border-slate-800/50'
        }`}
      >
        {buttonText}
        {onClick && <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-10 sm:pb-12" dir="rtl">
      
      {/* 🚀 رأس الصفحة (Responsive) */}
      <div className="flex flex-col gap-1.5 sm:gap-2 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">الإعدادات المتقدمة</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm">إدارة الحماية، التفضيلات، والملف الشخصي الخاص بك</p>
      </div>

      {/* 🚀 شبكة الإعدادات القابلة للتوسع (Grid System) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        <SettingsCard 
          title="أمان الحساب"
          description="تحديث كلمة المرور الخاصة بك لضمان حماية النظام المركزي من أي وصول غير مصرح به."
          icon={ShieldCheck}
          buttonText="تغيير كلمة المرور"
          onClick={() => setActiveModal('PASSWORD')}
        />

        <SettingsCard 
          title="الملف الشخصي"
          description="تحديث اسم العرض، ورقم الهاتف الخاص بالمدير العام للتواصل وحالات الطوارئ."
          icon={UserCircle}
          buttonText="تحديث البيانات"
          badge="قريباً"
        />

        <SettingsCard 
          title="إشعارات النظام"
          description="التحكم في التنبيهات اللحظية لطلبات الدفع، الفروع الجديدة، وحالات النظام الحرجة."
          icon={Bell}
          buttonText="إدارة التنبيهات"
          badge="قريباً"
        />

        <SettingsCard 
          title="الجلسات النشطة"
          description="مراقبة الأجهزة المتصلة بحسابك حالياً وإنهاء الجلسات المشبوهة بضغطة زر."
          icon={Smartphone}
          buttonText="مراجعة الأجهزة"
          badge="مستقبلاً"
        />

      </div>

      {/* 🚀 نظام النوافذ المنبثقة (Modals System - Responsive & Dark Mode) */}
      <AnimatePresence>
        {activeModal === 'PASSWORD' && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && closeModal()}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 50 }}
              className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800"
            >
              <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-white text-base sm:text-lg">تغيير كلمة المرور</h3>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">يرجى استخدام كلمة مرور قوية</p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar">
                <form id="password-form" onSubmit={handleUpdatePassword} className="space-y-4 sm:space-y-5">
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300">كلمة المرور الحالية</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      <input 
                        type="password"
                        name="current_password"
                        required
                        placeholder="أدخل كلمة المرور الحالية"
                        className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-bold text-sm sm:text-base text-slate-800 dark:text-white"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      <input 
                        type="password"
                        name="new_password"
                        required
                        placeholder="6 أحرف أو أرقام على الأقل"
                        className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-bold text-sm sm:text-base text-slate-800 dark:text-white"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300">تأكيد كلمة المرور</label>
                    <div className="relative">
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      <input 
                        type="password"
                        name="confirm_password"
                        required
                        placeholder="أعد كتابة كلمة المرور الجديدة"
                        className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-bold text-sm sm:text-base text-slate-800 dark:text-white"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                </form>
              </div>

              <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 flex gap-2 sm:gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 py-3 sm:py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs sm:text-sm disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  form="password-form"
                  disabled={isSubmitting}
                  className="flex-[2] py-3 sm:py-3.5 bg-blue-600 dark:bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  تحديث وحفظ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminSettings;