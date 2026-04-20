import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MonitorSmartphone, Lock, Phone, ShieldCheck, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { showAlert } from '../../utils/alert';
import posAccountService from '../../services/posAccountService';

const BranchPosSettings = ({ branchId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });

  const fetchPosAccount = async () => {
    try {
      setIsLoading(true);
      const data = await posAccountService.getPosAccount(branchId);
      if (data.has_account) {
        setHasAccount(true);
        setFormData({
          name: data.account.name,
          phone: data.account.phone,
          password: '' 
        });
      }
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosAccount();
  }, [branchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone) return showAlert.error('تنبيه', 'يجب إدخال رقم هاتف لجهاز الكاشير');
    if (!hasAccount && !formData.password) return showAlert.error('تنبيه', 'يجب إدخال كلمة مرور لأول مرة');

    try {
      setIsSubmitting(true);
      await posAccountService.upsertPosAccount(branchId, formData);
      showAlert.success('تم الحفظ', 'تم تحديث بيانات دخول نقطة البيع بنجاح');
      setFormData(prev => ({ ...prev, password: '' })); 
      fetchPosAccount();
    } catch (error) {
      showAlert.error('خطأ في الحفظ', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-4 sm:py-8 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-[32px] shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 sm:p-10 relative overflow-hidden transition-colors"
      >
        <div className={`absolute top-0 left-0 w-full h-2 transition-colors ${hasAccount ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'}`}></div>
        
        <div className="text-center mb-8">
          <div className={`mx-auto w-20 h-20 rounded-[24px] flex items-center justify-center mb-4 transition-colors ${hasAccount ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400'}`}>
            <MonitorSmartphone className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">حساب الكاشير الموحد</h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
           دا الحساب الموحد اللي هيستخدمة عامل الكاشير في الفرع
          </p>

          {hasAccount ? (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-black transition-colors">
              <ShieldCheck className="w-4 h-4" /> الحساب مُفعل ومحمي
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-lg text-xs font-black transition-colors">
              <AlertTriangle className="w-4 h-4" /> يتطلب الإعداد لأول مرة
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1">اسم الجهاز </label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500 font-bold text-slate-800 dark:text-slate-200 transition-all" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1">رقم هاتف الدخول للفرع (إجباري)</label>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input 
                type="tel" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                placeholder="مثال: 01012345678" 
                className="w-full pr-12 pl-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500 font-black text-left tracking-widest text-slate-800 dark:text-slate-200 transition-all" 
                dir="ltr" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1">كلمة المرور الرئيسية (للكاشير)</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                placeholder={hasAccount ? "اتركه فارغاً إذا لم ترغب بتغييره" : "أدخل كلمة مرور قوية لتأمين الجهاز"} 
                className="w-full pr-12 pl-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500 font-black text-center tracking-[0.5em] text-lg text-slate-800 dark:text-slate-200 placeholder:tracking-normal placeholder:text-sm placeholder:font-bold transition-all" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full mt-8 py-4 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 dark:shadow-none active:scale-95 transition-all flex justify-center items-center gap-2 text-base"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            {hasAccount ? 'تحديث بيانات الدخول' : 'إنشاء وتفعيل الحساب'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default BranchPosSettings;