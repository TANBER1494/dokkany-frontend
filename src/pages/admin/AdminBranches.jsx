import React, { useState, useEffect, useMemo } from 'react';
import { 
  Store, Search, Building2, Calendar, Phone, 
  CreditCard, Loader2, AlertCircle, CheckCircle2, 
  Clock, Lock, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';

const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // 🚀 حالة لتعقب البطاقة المفتوحة حالياً
  const [expandedBranchId, setExpandedBranchId] = useState(null);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllBranches();
      setBranches(data.branches || []);
    } catch (error) {
      toast.error(error.message || 'فشل في تحميل قائمة الفروع');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const matchesSearch = 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.organization_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.organization_id?.phone?.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'ALL' || branch.subscription_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [branches, searchTerm, statusFilter]);

  // 🎨 إعدادات الألوان المتوافقة مع الوضع الليلي
  const getStatusConfig = (status, daysLeft) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'نشط',
          icon: CheckCircle2,
          colors: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
          progressColor: daysLeft < 7 ? 'bg-amber-400 dark:bg-amber-500' : 'bg-emerald-500 dark:bg-emerald-500'
        };
      case 'TRIAL':
        return {
          label: 'تجريبي',
          icon: Clock,
          colors: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
          progressColor: 'bg-blue-500 dark:bg-blue-500'
        };
      case 'OVERDUE':
        return {
          label: 'متأخر',
          icon: AlertCircle,
          colors: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
          progressColor: 'bg-rose-500 dark:bg-rose-500'
        };
      case 'LOCKED':
        return {
          label: 'مغلق',
          icon: Lock,
          colors: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
          progressColor: 'bg-slate-400 dark:bg-slate-600'
        };
      default:
        return {
          label: 'غير معروف',
          icon: Store,
          colors: 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-400 border-gray-200 dark:border-slate-700',
          progressColor: 'bg-gray-500 dark:bg-slate-600'
        };
    }
  };

  const stats = useMemo(() => {
    return {
      total: branches.length,
      active: branches.filter(b => b.subscription_status === 'ACTIVE').length,
      trial: branches.filter(b => b.subscription_status === 'TRIAL').length,
      overdue: branches.filter(b => b.subscription_status === 'OVERDUE').length,
    };
  }, [branches]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-10" dir="rtl">
      
      {/* 🚀 الهيدر والفلتر (Responsive & Dark Mode) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">إدارة الفروع</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm mt-1">مراقبة حالة الاشتراكات لجميع الفروع المسجلة</p>
        </div>
        
        <div className="flex gap-2 sm:gap-3 overflow-x-auto custom-scrollbar pb-2 xl:pb-0 w-full xl:w-auto">
          {[
            { id: 'ALL', label: 'الكل', count: stats.total, color: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800' },
            { id: 'ACTIVE', label: 'نشط', count: stats.active, color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
            { id: 'TRIAL', label: 'تجريبي', count: stats.trial, color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
            { id: 'OVERDUE', label: 'متأخر', count: stats.overdue, color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all border whitespace-nowrap ${
                statusFilter === filter.id 
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-600 text-white shadow-lg' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {filter.label}
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs ${statusFilter === filter.id ? 'bg-white/20 text-white' : filter.color}`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 🚀 شريط البحث */}
      <div className="relative group">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text"
          placeholder="ابحث باسم الفرع، المؤسسة، أو الهاتف..."
          className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all font-bold text-sm sm:text-base text-slate-800 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 🚀 المحتوى (شبكة الكروت المنسدلة) */}
      {filteredBranches.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-16 sm:p-20 text-center shadow-sm">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Store className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-700 dark:text-slate-200 mb-1">لا توجد فروع</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold">لم يتم العثور على أي فروع تطابق معايير البحث.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredBranches.map((branch) => {
              const statusConfig = getStatusConfig(branch.subscription_status, branch.days_left);
              const StatusIcon = statusConfig.icon;
              const totalDays = branch.subscription_status === 'TRIAL' ? 14 : 30;
              const progressPercentage = Math.min(100, Math.max(0, (branch.days_left / totalDays) * 100));
              
              const isExpanded = expandedBranchId === branch._id;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={branch._id}
                  onClick={() => setExpandedBranchId(isExpanded ? null : branch._id)}
                  className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col group"
                >
                  {/* 🚀 الهيدر (مرئي دائماً) */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border shrink-0 ${statusConfig.colors}`}>
                        <StatusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-800 dark:text-white text-sm sm:text-base truncate">
                          {branch.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-0.5">
                          <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span className="text-[10px] sm:text-xs font-bold truncate">
                            {branch.organization_id?.name || 'مؤسسة مجهولة'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <div className="text-center">
                        <p className={`text-sm sm:text-lg font-black leading-none ${branch.days_left < 7 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>
                          {branch.days_left} <span className="text-[9px] sm:text-[10px] text-slate-400">يوم</span>
                        </p>
                      </div>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-slate-400">
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.div>
                    </div>
                  </div>

                  {/* 🚀 المحتوى المنسدل (Collapsible Content) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800"
                      >
                        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                          
                          {/* شريط التقدم */}
                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className={`inline-flex px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black border ${statusConfig.colors}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <div className="h-1.5 sm:h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${statusConfig.progressColor}`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* التفاصيل في شبكة صغيرة */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                              <span className="text-slate-400 font-bold text-[10px] sm:text-xs flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5" /> الاشتراك
                              </span>
                              <span className="font-black text-slate-700 dark:text-slate-200 text-xs sm:text-sm">{branch.monthly_fee} ج.م</span>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                              <span className="text-slate-400 font-bold text-[10px] sm:text-xs flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" /> المالك
                              </span>
                              <span className="font-black text-slate-700 dark:text-slate-200 text-xs sm:text-sm tracking-wider" dir="ltr">
                                {branch.organization_id?.phone || '---'}
                              </span>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between sm:col-span-2">
                              <span className="text-slate-400 font-bold text-[10px] sm:text-xs flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> تاريخ الإنشاء
                              </span>
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs">
                                {new Date(branch.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminBranches;