import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  MapPin,
  Plus,
  X,
  Loader2,
  Trash2,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Settings2,
  Save,
  Edit3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { showAlert } from '../../utils/alert';
import branchService from '../../services/branchService';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);

  const [newBranch, setNewBranch] = useState({
    name: '',
    location: '',
    shift_start_time: '08:00',
    shift_duration_hours: '12',
  });

  const [editingBranch, setEditingBranch] = useState(null); 

  const fetchBranches = async () => {
    try {
      setIsFetching(true);
      const data = await branchService.getBranches();
      setBranches(data.branches);
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.location)
      return showAlert.error('تنبيه', 'يرجى إدخال اسم وموقع الفرع');

    try {
      setIsLoading(true);
      await branchService.addBranch(newBranch);
      showAlert.success('تمت الإضافة', 'تم افتتاح الفرع الجديد بنجاح!');
      setIsModalOpen(false);
      setNewBranch({ name: '', location: '', shift_start_time: '08:00', shift_duration_hours: '12' });
      fetchBranches();
    } catch (error) {
      showAlert.error('فشل الإضافة', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (branch) => {
    setEditingBranch({
      id: branch._id,
      name: branch.name,
      shift_start_time: branch.shift_start_time,
      shift_duration_hours: branch.shift_duration_hours,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await branchService.updateBranch(editingBranch.id, {
        name: editingBranch.name,
        shift_start_time: editingBranch.shift_start_time,
        shift_duration_hours: editingBranch.shift_duration_hours,
      });
      showAlert.success('تم التحديث', 'تم حفظ التعديلات الجديدة بنجاح');
      setIsEditModalOpen(false);
      fetchBranches();
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockBranch = (id, name) => {
    showAlert.error('تأكيد الإيقاف', `هل أنت متأكد من إيقاف الفرع (${name})؟`).then(async (result) => {
        if (result.isConfirmed) {
          try { setIsLoading(true); await branchService.deleteBranch(id); showAlert.success('تم الإيقاف', 'تم تعطيل الفرع بنجاح.'); fetchBranches(); }
          catch (error) { showAlert.error('خطأ', error.message); } finally { setIsLoading(false); }
        }
      });
  };

  const handleReactivate = async (id) => {
    try { setIsLoading(true); await branchService.reactivateBranch(id); showAlert.success('تم التنشيط', 'تم إعادة الفرع للعمل بنجاح.'); fetchBranches(); }
    catch (error) { showAlert.error('خطأ', error.message); } finally { setIsLoading(false); }
  };

  const handleHardDelete = (id, name) => {
    showAlert.error('حذف نهائي!', `سيتم مسح الفرع (${name}) نهائياً.`).then(async (result) => {
        if (result.isConfirmed) {
          try { setIsLoading(true); await branchService.hardDeleteBranch(id); showAlert.success('تم الحذف', 'تم مسح الفرع نهائياً.'); fetchBranches(); }
          catch (error) { showAlert.error('فشل الحذف', error.message); } finally { setIsLoading(false); }
        }
      });
  };

  return (
    <div className="w-full h-full flex flex-col relative text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-50/50 dark:bg-slate-900/60 z-[200] flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-[32px] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">إدارة الفروع</h1>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">التحكم الكامل في أسماء الفروع ومواعيد عملها.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3.5 rounded-full font-bold shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/20 hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all text-[15px] shrink-0">
          <Plus className="w-5 h-5" /> افتتاح فرع جديد
        </button>
      </div>

      {isFetching ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" /></div>
      ) : branches.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] bg-white dark:bg-slate-800/50 text-center p-10 transition-colors">
          <Store className="w-16 h-16 text-slate-200 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-black text-slate-400 dark:text-slate-500">لا توجد فروع حالياً</h3>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-10">
          {branches.map((branch) => (
            <div key={branch._id} className={`bg-white dark:bg-slate-800 border p-5 sm:p-6 rounded-[28px] shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${branch.status === 'LOCKED' ? 'border-rose-100 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-900/10 opacity-90' : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-slate-600'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm transition-colors ${branch.status === 'LOCKED' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400' : branch.days_left <= 5 ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
                  <Store className="w-7 h-7" />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">{branch.name}</h3>
                    {branch.status === 'LOCKED' ? (
                      <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black border border-rose-100 dark:border-rose-500/20"><XCircle className="w-3 h-3" /> متوقف</span>
                    ) : branch.days_left <= 5 ? (
                      <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black border border-amber-200 dark:border-amber-500/20 animate-pulse">تجديد خلال {branch.days_left} يوم</span>
                    ) : (
                      <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black border border-emerald-200 dark:border-emerald-500/20">نشط ({branch.days_left} يوم)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700"><MapPin className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-500" /> {branch.location}</span>
                    <button onClick={() => openEditModal(branch)} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                      <Clock className="w-3.5 h-3.5" /> {branch.shift_start_time} (وردية {branch.shift_duration_hours} س)
                      <Settings2 className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 dark:border-slate-700 pt-4 lg:pt-0">
                {branch.status === 'LOCKED' ? (
                  <>
                    <button onClick={() => handleReactivate(branch._id)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-500 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-700 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 dark:shadow-none text-sm active:scale-95">تنشيط</button>
                    <button onClick={() => handleHardDelete(branch._id, branch.name)} className="p-3 bg-white dark:bg-slate-700 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all active:scale-95 shadow-sm"><Trash2 className="w-5 h-5" /></button>
                  </>
                ) : (
                  <>
                    <Link to={`/owner/branches/${branch._id}`} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 dark:shadow-none text-sm active:scale-95"><LayoutDashboard className="w-4 h-4" /> إدارة الفرع</Link>
                    <button onClick={() => openEditModal(branch)} className="p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all active:scale-95 shadow-sm" title="تعديل الإعدادات"><Edit3 className="w-5 h-5" /></button>
                    <button onClick={() => handleLockBranch(branch._id, branch.name)} className="p-3 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all active:scale-95 shadow-sm" title="إيقاف مؤقت"><XCircle className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال إضافة فرع جديد */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-slate-700 transition-colors">
              <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2"><Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> افتتاح فرع جديد</h3>
                <button onClick={() => !isLoading && setIsModalOpen(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <form id="add-branch-form" onSubmit={handleAddBranch} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block">اسم الفرع</label>
                    <input type="text" value={newBranch.name} onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none font-bold text-slate-800 dark:text-slate-200 transition-all focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500" placeholder="مثال: فرع وسط البلد" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block">الموقع أو العنوان</label>
                    <input type="text" value={newBranch.location} onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none font-bold text-slate-800 dark:text-slate-200 transition-all focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500" placeholder="العنوان بالتفصيل" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block text-right">بداية الوردية</label>
                      <input type="time" value={newBranch.shift_start_time} onChange={(e) => setNewBranch({ ...newBranch, shift_start_time: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none font-bold text-slate-800 dark:text-slate-200 transition-all text-left" dir="ltr" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block text-right">المدة (ساعة)</label>
                      <input type="number" min="1" max="24" value={newBranch.shift_duration_hours} onChange={(e) => setNewBranch({ ...newBranch, shift_duration_hours: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none font-black text-slate-800 dark:text-slate-200 transition-all text-center" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-5 border-t border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3 transition-colors">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all text-sm">إلغاء</button>
                <button type="submit" form="add-branch-form" disabled={isLoading} className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all text-sm">حفظ وافتتاح</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* مودال تعديل إعدادات الفرع */}
      <AnimatePresence>
        {isEditModalOpen && editingBranch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-slate-700 transition-colors">
              <div className="p-6 border-b border-indigo-50 dark:border-slate-700 flex justify-between items-center bg-indigo-50/30 dark:bg-slate-800/50">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2"><Settings2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> تعديل بيانات {editingBranch.name}</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6">
                <form id="edit-branch-form" onSubmit={handleUpdateSettings} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block">تغيير اسم الفرع</label>
                    <input 
                      type="text" 
                      value={editingBranch.name} 
                      onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })} 
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none font-black text-slate-800 dark:text-slate-200 transition-all focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500" 
                      placeholder="اسم الفرع الجديد" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block text-right">بداية الوردية</label>
                      <input type="time" value={editingBranch.shift_start_time} onChange={(e) => setEditingBranch({ ...editingBranch, shift_start_time: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none font-bold text-slate-800 dark:text-slate-200 transition-all text-left focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500" dir="ltr" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block text-right">المدة (ساعة)</label>
                      <input type="number" min="1" max="24" value={editingBranch.shift_duration_hours} onChange={(e) => setEditingBranch({ ...editingBranch, shift_duration_hours: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none font-black text-slate-800 dark:text-slate-200 transition-all text-center focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-5 border-t border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3 transition-colors">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all text-sm">تراجع</button>
                <button type="submit" form="edit-branch-form" disabled={isLoading} className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all text-sm">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ التعديلات</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Branches;