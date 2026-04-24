import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, KeyRound, Phone, Building2, 
  Calendar, ShieldCheck, Loader2, ChevronLeft, 
  AlertCircle, Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';

const AdminUsers = () => {
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // جلب البيانات من الخادم
  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllOwners();
      setOwners(data.owners || []);
    } catch (error) {
      toast.error(error.message || 'فشل في تحميل قائمة الملاك');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // منطق البحث اللحظي المحسن
  const filteredOwners = useMemo(() => {
    return owners.filter(owner => 
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.phone.includes(searchTerm) ||
      owner.organization_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [owners, searchTerm]);

  // تنفيذ إعادة تعيين كلمة المرور
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');

    try {
      setIsResetting(true);
      await adminService.resetOwnerPassword(selectedOwner.phone, newPassword);
      toast.success(`تم تغيير كلمة مرور ${selectedOwner.name} بنجاح`);
      setIsModalOpen(false);
      setNewPassword('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* 🚀 رأس الصفحة والإحصائيات */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">إدارة الملاك</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm mt-1">إجمالي المشتركين النشطين في المنصة</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">إجمالي الملاك</p>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-none">{owners.length}</p>
        </div>
      </div>

      {/* 🚀 شريط البحث */}
      <div className="relative group">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text"
          placeholder="ابحث باسم المالك، الهاتف، أو اسم الماركت..."
          className="w-full pr-12 pl-4 py-3 sm:py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all font-bold text-sm sm:text-base text-slate-800 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 🚀 شبكة بطاقات الملاك (بديل الجدول المعقد) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence>
          {filteredOwners.map((owner) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={owner._id} 
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col group"
            >
              {/* الهيدر: الأفاتار والاسم */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="w-12 h-12 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-lg sm:text-xl shrink-0">
                  {owner.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 dark:text-white text-sm sm:text-base line-clamp-1">{owner.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] sm:text-xs mt-0.5">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="line-clamp-1">{owner.organization_id?.name || 'بدون مؤسسة'}</span>
                  </div>
                </div>
              </div>

              {/* الإحصائيات (رقم الهاتف والفروع) */}
              <div className="grid grid-cols-2 gap-3 mb-4 sm:mb-5">
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex flex-col justify-center items-center text-center">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 mb-1" />
                  <p className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 tracking-wider">{owner.phone}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex flex-col justify-center items-center text-center">
                  <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 mb-1" />
                  <p className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300">
                    {owner.organization_id?.max_allowed_branches || 1} فروع
                  </p>
                </div>
              </div>

              {/* التاريخ وزر الإجراء */}
              <div className="mt-auto flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] sm:text-xs">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>انضم: {new Date(owner.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedOwner(owner);
                    setIsModalOpen(true);
                  }}
                  className="w-full py-2.5 sm:py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  تغيير كلمة المرور
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 🚀 حالة عدم وجود نتائج */}
      {filteredOwners.length === 0 && (
        <div className="text-center py-16 sm:py-20 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-bold flex flex-col items-center gap-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm sm:text-base text-slate-500">لا توجد نتائج تطابق بحثك</p>
        </div>
      )}

      {/* 🚀 Modal تغيير كلمة المرور (Responsive & Dark Mode) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isResetting && setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
              dir="rtl"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
                      <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">تغيير الباسورد</h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-bold line-clamp-1">للمالك: {selectedOwner?.name}</p>
                    </div>
                  </div>
                  <button 
                    disabled={isResetting}
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 rotate-180" />
                  </button>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 mr-1">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      <input 
                        required
                        type="text"
                        placeholder="أدخل 6 أحرف/أرقام على الأقل"
                        className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-bold tracking-widest text-base sm:text-lg text-slate-800 dark:text-white"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isResetting}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex gap-2 sm:gap-3 border border-blue-100 dark:border-blue-800/30">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] sm:text-[11px] font-bold text-blue-800 dark:text-blue-300 leading-relaxed">
                      بمجرد الحفظ، سيتم إنهاء جميع جلسات المالك الحالية ولن يتمكن من الدخول إلا بكلمة المرور الجديدة.
                    </p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isResetting}
                    className="w-full py-3.5 sm:py-4 bg-slate-900 dark:bg-blue-600 text-white font-black rounded-xl sm:rounded-2xl shadow-xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {isResetting ? (
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    ) : (
                      <>تحديث كلمة المرور الآن</>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;