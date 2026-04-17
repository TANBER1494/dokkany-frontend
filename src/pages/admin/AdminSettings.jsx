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
  // حالة التحكم في النوافذ المنبثقة
  const [activeModal, setActiveModal] = useState(null); // 'PASSWORD' | 'PHONE' | null
  const [isSubmitting, setIsSubmitting] = useState(false);

  // بيانات نموذج كلمة المرور
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

  // مكون فرعي لبطاقة الإعدادات للحفاظ على نظافة الكود (Clean Code)
  const SettingsCard = ({ title, description, icon: Icon, buttonText, onClick, badge }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-700 border border-slate-100">
          <Icon className="w-6 h-6" />
        </div>
        {badge && (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-black text-slate-800 text-lg mb-2">{title}</h3>
      <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6 flex-1">
        {description}
      </p>
      <button 
        onClick={onClick}
        disabled={!onClick}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
          onClick 
            ? 'bg-slate-50 text-slate-700 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900' 
            : 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
        }`}
      >
        {buttonText}
        {onClick && <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* رأس الصفحة */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-slate-800">الإعدادات المتقدمة</h1>
        <p className="text-slate-500 font-bold text-sm">إدارة الحماية، التفضيلات، والملف الشخصي الخاص بك</p>
      </div>

      {/* شبكة الإعدادات القابلة للتوسع (Grid System) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
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

      {/* نظام النوافذ المنبثقة (Modals System) */}
      <AnimatePresence>
        {activeModal === 'PASSWORD' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && closeModal()}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
                    <KeyRound className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">تغيير كلمة المرور</h3>
                    <p className="text-[11px] font-bold text-slate-500">يرجى استخدام كلمة مرور قوية</p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="password-form" onSubmit={handleUpdatePassword} className="space-y-5">
                  
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">كلمة المرور الحالية</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="password"
                        name="current_password"
                        required
                        placeholder="أدخل كلمة المرور الحالية"
                        className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-bold"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="password"
                        name="new_password"
                        required
                        placeholder="6 أحرف أو أرقام على الأقل"
                        className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-bold"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">تأكيد كلمة المرور</label>
                    <div className="relative">
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="password"
                        name="confirm_password"
                        required
                        placeholder="أعد كتابة كلمة المرور الجديدة"
                        className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-bold"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all text-sm disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  form="password-form"
                  disabled={isSubmitting}
                  className="flex-[2] py-3.5 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
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