import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Loader2, PackageSearch, Scale, Boxes } from 'lucide-react';
import { showAlert } from '../../utils/alert';
import branchService from '../../services/branchService';
import CatalogTab from './CatalogTab';
import InventoryEngineTab from './InventoryEngineTab';

const InventoryManager = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [activeTab, setActiveTab] = useState('CATALOG'); 
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const branchesData = await branchService.getBranches();
        setBranches(branchesData.branches);
        if (branchesData.branches.length > 0) {
          setSelectedBranch(branchesData.branches[0]._id);
        }
      } catch (error) {
        showAlert.error('خطأ', 'فشل في جلب قائمة الفروع');
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  if (isPageLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 dark:text-slate-200 pb-10 relative transition-colors duration-300">
      
      {/* الهيدر العلوي */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 sm:p-5 rounded-[20px] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 transition-colors">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> إدارة المخزن والجرد
          </h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
            تحكم في المنتجات، الفئات، وقم بجرد المحل لمعرفة أرباحك
          </p>
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Store className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <select 
            value={selectedBranch} 
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all appearance-none cursor-pointer"
          >
            {branches.length === 0 && <option value="">لا توجد فروع</option>}
            {branches.map(b => <option key={b._id} value={b._id}>{b.name} - {b.location}</option>)}
          </select>
        </div>
      </div>

      {/* شريط التبديل بين التابات */}
      {branches.length > 0 && (
        <div className="flex p-1.5 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm w-full max-w-md shrink-0 transition-colors">
          <button 
            onClick={() => setActiveTab('CATALOG')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'CATALOG' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <Boxes className="w-4 h-4" /> قاعدة المنتجات
          </button>
          <button 
            onClick={() => setActiveTab('INVENTORY')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'INVENTORY' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <Scale className="w-4 h-4" /> الميزانية (جرد المحل)
          </button>
        </div>
      )}

      {/* منطقة المحتوى للشاشات الفرعية */}
      <div className="w-full">
        {branches.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/50 rounded-[20px] border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm transition-colors">
            <Store className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-600 dark:text-slate-300">يجب إضافة فرع أولاً</h3>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-2">لا يمكنك إدارة المخزن بدون وجود فروع مسجلة في النظام.</p>
          </div>
        ) : !selectedBranch ? (
           <div className="flex justify-center py-20">
             <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
           </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'CATALOG' && (
              <motion.div key="catalog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <CatalogTab branchId={selectedBranch} />
              </motion.div>
            )}

            {activeTab === 'INVENTORY' && (
              <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <InventoryEngineTab branchId={selectedBranch} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

    </div>
  );
};

export default InventoryManager;