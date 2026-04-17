import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, KeyRound, Phone, Building2, 
  Calendar, ShieldCheck, Loader2, ChevronLeft, 
  ExternalLink, AlertCircle, RefreshCw
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
    <div className="space-y-6">
      {/* رأس الصفحة والإحصائيات */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">إدارة الملاك</h1>
          <p className="text-slate-500 font-bold text-sm">إجمالي المشتركين النشطين في المنصة</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">إجمالي الملاك</p>
            <p className="text-xl font-black text-slate-800 leading-none">{owners.length}</p>
          </div>
        </div>
      </div>

      {/* شريط البحث */}
      <div className="relative group">
        <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text"
          placeholder="ابحث باسم المالك، رقم الهاتف، أو اسم الماركت..."
          className="w-full pr-14 pl-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* الجدول الرئيسي */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-sm font-black text-slate-600">المالك والمؤسسة</th>
                <th className="px-6 py-5 text-sm font-black text-slate-600 text-center">رقم الهاتف</th>
                <th className="px-6 py-5 text-sm font-black text-slate-600 text-center">عدد الفروع المتاحة</th>
                <th className="px-6 py-5 text-sm font-black text-slate-600 text-center">تاريخ الانضمام</th>
                <th className="px-6 py-5 text-sm font-black text-slate-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOwners.map((owner) => (
                <tr key={owner._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                        {owner.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-[15px]">{owner.name}</p>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Building2 className="w-3 h-3" />
                          <span className="text-[11px] font-bold">{owner.organization_id?.name || 'بدون مؤسسة'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700 font-bold text-sm tracking-wider">
                      {owner.phone}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="font-black text-slate-800">
                      {owner.organization_id?.max_allowed_branches || 1}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-500">
                        {new Date(owner.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => {
                        setSelectedOwner(owner);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-600 hover:shadow-sm rounded-xl transition-all font-bold text-sm"
                    >
                      <KeyRound className="w-4 h-4" />
                      تغيير الباسورد
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOwners.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">لا توجد نتائج تطابق بحثك</p>
          </div>
        )}
      </div>

      {/* Modal تغيير كلمة المرور */}
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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800">تغيير كلمة المرور</h3>
                      <p className="text-xs text-slate-500 font-bold">للمالك: {selectedOwner?.name}</p>
                    </div>
                  </div>
                  <button 
                    disabled={isResetting}
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                  >
                    <ChevronLeft className="w-6 h-6 rotate-180" />
                  </button>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 mr-1">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        type="text"
                        placeholder="أدخل 6 أحرف/أرقام على الأقل"
                        className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold tracking-widest text-lg"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isResetting}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-blue-800 leading-relaxed">
                      بمجرد الحفظ، سيتم إنهاء جميع جلسات المالك الحالية ولن يتمكن من الدخول إلا بكلمة المرور الجديدة التي ستعطيها له.
                    </p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isResetting}
                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isResetting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
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