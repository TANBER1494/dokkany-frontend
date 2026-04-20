import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2, TrendingUp, TrendingDown, Store, AlertTriangle, 
  Clock, Banknote, ShieldCheck, AlertOctagon, Building, ChevronLeft
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import dashboardService from '../../services/dashboardService';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardService.getMasterDashboard();
        setDashboardData(data);
      } catch (error) {
        showAlert.error('خطأ', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (!dashboardData) return null;

  const { branches, grand_totals } = dashboardData;

  return (
    <div className="flex flex-col h-full space-y-8 pb-10 transition-colors duration-300">
      
      {/* ملخص الموقف المالي العام */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[28px] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between overflow-hidden relative transition-colors">
          <div className="absolute -left-2 -top-2 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-50"></div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">إجمالي الفلوس اللي ليك عند  (الزباين)</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {grand_totals.total_market_debts_for_us.toLocaleString()}{' '}
              <span className="text-sm font-bold text-slate-400">ج.م</span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner relative z-10">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-[28px] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between overflow-hidden relative transition-colors">
          <div className="absolute -left-2 -top-2 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full blur-3xl opacity-50"></div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">إجمالي الفلوس اللي عليك  (للمناديب)</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {grand_totals.total_market_debts_on_us.toLocaleString()}{' '}
              <span className="text-sm font-bold text-slate-400">ج.م</span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner relative z-10">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* قسم الرقابة اللحظية للفروع */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-black text-slate-800 dark:text-white">حالات الفروع بتاعتك </h2>
        </div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          {branches.length} فروع مسجلة
        </span>
      </div>

      {/* شبكة الفروع المطورة */}
      {branches.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-700 text-center transition-colors">
          <Store className="w-16 h-16 text-slate-200 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-400 dark:text-slate-500">لا توجد فروع مسجلة حالياً</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {branches.map((branch, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={branch._id}
              className={`bg-white dark:bg-slate-800 rounded-[32px] border shadow-sm transition-all overflow-hidden flex flex-col group ${branch.status === 'LOCKED' ? 'border-rose-100 dark:border-rose-900/50 opacity-90' : 'border-slate-100 dark:border-slate-700'}`}
            >
              {/* هيدر الفرع + حالة الاشتراك الذكية */}
              <div className="p-6 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-start bg-slate-50/30 dark:bg-slate-800/50">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${branch.status === 'LOCKED' ? 'bg-rose-500' : 'bg-indigo-600 dark:bg-indigo-400'}`}></div>{' '}
                    {branch.name}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    {branch.status === 'LOCKED' ? (
                      <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black border border-rose-100 dark:border-rose-500/20">
                        <AlertOctagon className="w-3 h-3" /> متوقف (يجب التجديد)
                      </span>
                    ) : branch.days_left <= 5 ? (
                      <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black border border-amber-200 dark:border-amber-500/20 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> ينتهي خلال {branch.days_left} يوم
                      </span>
                    ) : (
                      <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black border border-emerald-100 dark:border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> {branch.status === 'TRIAL' ? 'فترة تجريبية' : 'اشتراك ساري'} ({branch.days_left} يوم متبقي)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/owner/branches/${branch._id}`)}
                  className="p-3 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-slate-400 dark:text-slate-300 rounded-2xl hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all shadow-sm active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              {/* ديون الموردين والزبائن */}
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-50 dark:divide-slate-700/50 bg-white dark:bg-slate-800 border-b border-slate-50 dark:border-slate-700/50">
                <div className="p-5 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ليك عند ال (زبائن)</p>
                  <p className="text-base font-black text-slate-800 dark:text-slate-200">{branch.debts_for_us.toLocaleString()} ج</p>
                </div>
                <div className="p-5 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">عليك لل (موردين)</p>
                  <p className="text-base font-black text-slate-800 dark:text-slate-200">{branch.debts_on_us.toLocaleString()} ج</p>
                </div>
              </div>

              {/* نبض الوردية الحية */}
              <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 flex-1">
                {branch.active_shift ? (
                  <div
                    onClick={() => navigate('/owner/shifts')}
                    className="bg-white dark:bg-slate-700/50 border border-indigo-50 dark:border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:shadow-md transition-all group/shift"
                  >
                    <div className="absolute right-0 top-0 w-1.5 h-full bg-indigo-600 dark:bg-indigo-400 opacity-0 group-hover/shift:opacity-100 transition-opacity"></div>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 dark:bg-indigo-400"></span>
                        </span>
                        <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">وردية شغاله دلوقتي</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-300 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-600">
                        <Clock className="w-3 h-3" /> {new Date(branch.active_shift.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">الكاشير المستلم</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 group-hover/shift:text-indigo-600 dark:group-hover/shift:text-indigo-400 transition-colors">
                          {branch.active_shift.cashier_name}
                        </p>
                      </div>
                      <div className="text-left flex flex-col items-end">
                        <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">عهدة الدرج</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          {branch.active_shift.starting_cash?.toLocaleString()}{' '}
                          <span className="text-xs text-slate-400">ج.م</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center bg-white/50 dark:bg-slate-800/30">
                    <Banknote className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2 opacity-50" />
                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">الفرع مغلق حالياً</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;