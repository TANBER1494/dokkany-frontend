import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Loader2, Activity, Archive, Clock, DollarSign, Users, Banknote, X,
  RefreshCw, ShieldCheck, ArrowDownLeft, Truck, FileText, Image as ImageIcon,
  BookOpen, ChevronLeft, ArrowRight, CheckCircle2, 
  ChevronDown, CalendarDays 
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import branchService from '../../services/branchService';
import ownerReportService from '../../services/ownerReportService';

const ShiftsMonitor = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [activeTab, setActiveTab] = useState('LIVE');

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [liveShift, setLiveShift] = useState(null);
  const [liveTotalExpenses, setLiveTotalExpenses] = useState(0);

  const [shiftsHistory, setShiftsHistory] = useState([]);

  const [selectedArchiveShift, setSelectedArchiveShift] = useState(null);
  const [shiftTimeline, setShiftTimeline] = useState([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);


  const [expandedMonth, setExpandedMonth] = useState(null);

  const groupedShifts = shiftsHistory.reduce((groups, shift) => {
    const date = new Date(shift.start_time);
    // سيخرج بصيغة: "أبريل ٢٠٢٦"
    const monthYear = date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(shift);
    return groups;
  }, {});

  useEffect(() => {
    if (shiftsHistory.length > 0) {
      const firstMonth = Object.keys(groupedShifts)[0];
      setExpandedMonth(firstMonth);
    }
  }, [shiftsHistory]);


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const branchesData = await branchService.getBranches();
        setBranches(branchesData.branches);
        if (branchesData.branches.length > 0) {
          setSelectedBranch(branchesData.branches[0]._id);
        }
      } catch (error) {
        showAlert.error('خطأ', 'فشل في جلب الفروع');
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchTabData = async () => {
    if (!selectedBranch) return;
    setIsDataLoading(true);
    try {
      const [shift, history] = await Promise.all([
        ownerReportService.getLiveShift(selectedBranch).catch(() => null),
        ownerReportService.getShiftsHistory(selectedBranch).catch(() => ({ shifts: [] }))
      ]);
      
      setLiveShift(shift);
      setShiftsHistory(history.shifts || []);

      if (activeTab === 'LIVE' && shift) {
        const timeline = await ownerReportService.getShiftTimeline(shift._id, selectedBranch);
        const totalExp = timeline
          .filter((t) => t.domain === 'CASH' && t.type !== 'INCOME')
          .reduce((sum, f) => sum + f.amount, 0);
        setLiveTotalExpenses(totalExp);
      }
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchTabData();
  }, [selectedBranch, activeTab]);

  const handleRefreshLive = () => {
    fetchTabData();
  };

  const getNextShiftInfo = (currentShiftId) => {
    const idx = shiftsHistory.findIndex((s) => s._id === currentShiftId);
    if (idx === 0) return liveShift; 
    if (idx > 0) return shiftsHistory[idx - 1];
    return null;
  };

  const handleViewDetails = async (shift, isLive = false) => {
    const shiftDataForModal = {
      ...shift,
      total_expenses: isLive ? liveTotalExpenses : shift.total_expenses,
    };
    setSelectedArchiveShift(shiftDataForModal);

    setIsDetailsLoading(true);
    try {
      const timeline = await ownerReportService.getShiftTimeline(
        shift._id,
        selectedBranch
      );
      setShiftTimeline(timeline);
    } catch (error) {
      showAlert.error('خطأ', 'فشل جلب التفاصيل الشاملة');
      setSelectedArchiveShift(null);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  if (isPageLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );

  return (
    <div className="flex flex-col h-full space-y-5 relative text-slate-800 dark:text-slate-200 pb-10 transition-colors duration-300">
      
      {/* الهيدر وفلتر الفروع */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            الورديات والرقابة الشاملة
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            مراقبة الأوقات وحركات الخزينة بتصميم تدقيقي
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Store className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 appearance-none cursor-pointer transition-all"
          >
            {branches.length === 0 && <option value="">لا توجد فروع</option>}
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} - {b.location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* التابات */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full max-w-sm shrink-0 transition-colors">
        <button
          onClick={() => setActiveTab('LIVE')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'LIVE' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          <Activity className="w-4 h-4" /> الوردية الحية
        </button>
        <button
          onClick={() => setActiveTab('ARCHIVE')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'ARCHIVE' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          <Archive className="w-4 h-4" /> سجل الأرشيف
        </button>
      </div>

      {/* التاب الأول: الوردية الحية */}
      {activeTab === 'LIVE' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto">
          {isDataLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-500" /></div>
          ) : !liveShift ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm max-w-2xl mx-auto transition-colors">
              <ShieldCheck className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">الدرج مغلق حالياً</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">لم يقم أي كاشير بفتح وردية في هذا الفرع حتى الآن.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-400 dark:bg-emerald-500 animate-pulse"></div>

              <div className="flex items-center gap-4 w-full xl:w-auto">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold text-lg border border-emerald-100 dark:border-emerald-500/20 shrink-0">
                  #{liveShift.shift_sequence}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">وردية نشطة الآن</h2>
                  </div>
                  
                  {(() => {
                    const previousShift = shiftsHistory[0];
                    const leaverName = previousShift?.acknowledged_by?.name?.split(' ')[0] || liveShift.cashier_id?.name?.split(' ')[0] || 'السابق';
                    const takerName = liveShift.acknowledged_by?.name?.split(' ')[0] || 'الحالي';

                    return (
                      <div className="flex flex-col gap-2 text-[11px] font-bold mt-2">
                        {!liveShift.acknowledged_at ? (
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-2 rounded-lg border border-amber-200 dark:border-amber-500/20 shadow-sm">
                            <Clock className="w-4 h-4 shrink-0" /> 
                            <span>مازال العامل <strong className="font-black">({leaverName})</strong> في انتظار استلام الزميل الآخر للدرج منذ: <span className="font-black tracking-wider">{new Date(liveShift.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span></span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" /> 
                            <span>تم تسليم الدرج من <strong className="font-black">({leaverName})</strong> إلى <strong className="font-black">({takerName})</strong> في: <span className="font-black tracking-wider">{new Date(liveShift.acknowledged_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span></span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full xl:w-auto border-t xl:border-t-0 border-slate-100 dark:border-slate-700 pt-4 xl:pt-0">
                <div className="flex gap-6 w-full sm:w-auto justify-between sm:justify-start px-2 sm:px-0">
                  <div className="text-right sm:border-l border-slate-100 dark:border-slate-700 sm:pl-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">عهدة الاستلام</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{liveShift.starting_cash.toLocaleString()} ج</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">منصرف الكاش</p>
                    <p className="text-lg font-black text-rose-600 dark:text-rose-400">{liveTotalExpenses.toLocaleString()} ج</p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <button onClick={handleRefreshLive} className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all" title="تحديث الأرقام">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleViewDetails(liveShift, true)} className="flex-1 sm:flex-none py-3 px-5 bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 text-sm shadow-sm">
                    <FileText className="w-4 h-4" /> سجل الوردية
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* التاب الثاني: أرشيف الورديات (مقسم بالشهور) */}
      {activeTab === 'ARCHIVE' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto pb-6">
          {isDataLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-500" /></div>
          ) : shiftsHistory.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-2xl mx-auto transition-colors">
              <Archive className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-500 dark:text-slate-400">لا توجد ورديات مغلقة مسجلة في هذا الفرع.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* 🚀 رسم الأكورديون بناءً على الشهور المجمعة */}
              {Object.entries(groupedShifts).map(([monthYear, shiftsInMonth]) => {
                const isExpanded = expandedMonth === monthYear;

                return (
                  <div key={monthYear} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[24px] overflow-hidden shadow-sm transition-colors">
                    
                    {/* 📅 هيدر الشهر القابل للضغط */}
                    <button
                      onClick={() => setExpandedMonth(isExpanded ? null : monthYear)}
                      className={`w-full flex items-center justify-between p-5 transition-colors ${isExpanded ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-colors ${isExpanded ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                          <CalendarDays className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <h3 className={`text-lg font-black transition-colors ${isExpanded ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>
                            سجلات {monthYear}
                          </h3>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                            {shiftsInMonth.length} ورديات مغلقة
                          </p>
                        </div>
                      </div>
                      <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500'}`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </button>

                    {/* 📂 محتويات الشهر (كروت الورديات) */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"
                        >
                          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {shiftsInMonth.map((shift) => {
                              const currentName = shift.acknowledged_by?.name?.split(' ')[0] || 'العامل';
                              const nextShift = getNextShiftInfo(shift._id);
                              const nextName = nextShift?.acknowledged_by?.name?.split(' ')[0] || 'الزميل القادم';

                              return (
                                <div key={shift._id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col relative">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-md border border-slate-200 dark:border-slate-700 mb-2">
                                        وردية #{shift.shift_sequence}
                                      </span>
                                      <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                        <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> {shift.acknowledged_by?.name || 'مجهول'}
                                      </h3>
                                    </div>
                                    <div className="text-left text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                                      {new Date(shift.start_time).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' })}
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 my-4">
                                     <div className={`flex justify-between items-center text-[10px] font-black ${shift.acknowledged_at ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                       <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5"/> 1- استلام ({currentName}):</span>
                                       <span>{shift.acknowledged_at ? new Date(shift.acknowledged_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'لم يُسجل'}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-[10px] font-black text-slate-600 dark:text-slate-400">
                                       <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"/> 2- تسليم للدرج:</span>
                                       <span>{shift.end_time ? new Date(shift.end_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد'}</span>
                                     </div>
                                     <div className={`flex justify-between items-center text-[10px] font-black ${nextShift?.acknowledged_at ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500 dark:text-rose-400'}`}>
                                       <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/> 3- حضور ({nextName}):</span>
                                       <span>{nextShift?.acknowledged_at ? new Date(nextShift.acknowledged_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'بانتظار'}</span>
                                     </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 mb-4 text-center">
                                    <div>
                                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">جرد الدرج</p>
                                      <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{shift.ending_cash_actual} ج</p>
                                    </div>
                                    <div className="border-r border-l border-slate-100 dark:border-slate-700">
                                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">منصرف الكاش</p>
                                      <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">{shift.total_expenses} ج</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">صافي المبيعات</p>
                                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{shift.net_shift_profit} ج</p>
                                    </div>
                                  </div>

                                  <button onClick={() => handleViewDetails(shift, false)} className="mt-auto w-full py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-white dark:hover:bg-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all flex items-center justify-center gap-1.5 active:scale-95">
                                    <FileText className="w-3.5 h-3.5" /> عرض تفاصيل الوردية والخط الزمني
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* مودال التفتيش الشامل (Timeline) */}
      <AnimatePresence>
        {selectedArchiveShift && (
          <div className="fixed top-20 right-0 bottom-0 left-0 z-[100] flex items-start justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="bg-white dark:bg-slate-800 w-full max-w-2xl flex flex-col shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-auto max-h-full"
            >
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> التدقيق المالي لوردية #{selectedArchiveShift.shift_sequence}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedArchiveShift(null)} className="p-2 bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-300 rounded-lg hover:text-rose-500 dark:hover:text-rose-400 shadow-sm border border-slate-100 dark:border-slate-600 transition-all active:scale-95">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {(() => {
                  const currentName = selectedArchiveShift.acknowledged_by?.name?.split(' ')[0] || 'العامل';
                  const nextShift = getNextShiftInfo(selectedArchiveShift._id);
                  const nextName = nextShift?.acknowledged_by?.name?.split(' ')[0] || 'الزميل القادم';

                  return (
                    <div className="flex flex-wrap items-center gap-2 mt-4 text-[10px] sm:text-[11px] font-bold bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                       <span className={`px-2.5 py-2 rounded-lg border flex items-center gap-1.5 ${selectedArchiveShift.acknowledged_at ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'}`}>
                         <ShieldCheck className="w-4 h-4" /> 
                         1- استلام {currentName}: <span className="font-black">{selectedArchiveShift.acknowledged_at ? new Date(selectedArchiveShift.acknowledged_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'لم يُسجل'}</span>
                       </span>
                       <span className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                         <Clock className="w-4 h-4 text-slate-400" /> 
                         2- تسليم {currentName} للدرج: <span className="font-black text-slate-800 dark:text-white">{selectedArchiveShift.end_time ? new Date(selectedArchiveShift.end_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد'}</span>
                       </span>
                       <span className={`px-2.5 py-2 rounded-lg border flex items-center gap-1.5 ${nextShift?.acknowledged_at ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                         <CheckCircle2 className="w-4 h-4" /> 
                         3- حضور واستلام {nextName}: <span className="font-black">{nextShift?.acknowledged_at ? new Date(nextShift.acknowledged_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'بانتظار المستلم'}</span>
                       </span>
                    </div>
                  );
                })()}
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">الخط الزمني للعمليات النقدية</h4>
                  <span className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md text-slate-500 dark:text-slate-400">
                    {shiftTimeline.length} عملية
                  </span>
                </div>

                {isDetailsLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-500" />
                  </div>
                ) : shiftTimeline.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-20 text-slate-400 dark:text-slate-600">
                    <ShieldCheck className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">سجل العمليات فارغ.</p>
                  </div>
                ) : (
                  <div className="relative pl-2 pr-4 border-r-2 border-slate-200 dark:border-slate-700 space-y-5 mr-2 sm:mr-3">
                    {shiftTimeline.map((item, idx) => (
                      <div key={idx} className="relative">
                        <span
                          className={`absolute -right-[23px] sm:-right-[27px] top-1 w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-800 ${
                            item.domain === 'CASH' && item.type !== 'INCOME'
                              ? 'border-rose-400 dark:border-rose-500'
                              : item.domain === 'CASH' && item.type === 'INCOME'
                                ? 'border-emerald-400 dark:border-emerald-500'
                                : item.domain === 'INVOICE'
                                  ? 'border-blue-400 dark:border-blue-500'
                                  : 'border-indigo-400 dark:border-indigo-500'
                          }`}
                        ></span>

                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3.5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                {new Date(item.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600 text-[10px]">•</span>
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                {item.domain === 'CASH' ? 'حركة خزينة' : item.domain === 'INVOICE' ? 'فاتورة مورد' : 'كشكول زباين'}
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-slate-800 dark:text-white">
                              {item.domain === 'CASH' && item.type === 'VENDOR_PAYMENT' ? `سداد للمورد: ${item.person_name}`
                                : item.domain === 'CASH' && item.type === 'INCOME' ? `إيراد/سداد دين من: ${item.person_name}`
                                : item.domain === 'CASH' && item.category === 'PERSONAL' ? `سلفة للعامل: ${item.person_name}`
                                : item.domain === 'CASH' ? `مصروف تشغيل`
                                : item.domain === 'INVOICE' ? `استلام بضاعة آجلة من ${item.company || item.person_name}`
                                : item.domain === 'CUSTOMER_DEBT' && item.type === 'CREDIT' ? `سحب شكك: ${item.person_name}`
                                : `سداد زبون: ${item.person_name}`}
                            </h5>
                            {(item.description || item.invoice_number) && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                {item.description || `رقم الفاتورة: #${item.invoice_number}`}
                              </p>
                            )}
                            
                            {item.domain === 'INVOICE' && (
                              <div className="mt-2 inline-block bg-slate-50 dark:bg-slate-700/50 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                  إجمالي: {item.amount.toLocaleString()} | <span className="text-emerald-600 dark:text-emerald-400">مدفوع استلام: {item.paid_amount?.toLocaleString() || 0}</span> | <span className="text-rose-500 dark:text-rose-400">باقي دين الفاتورة: {item.remaining_amount?.toLocaleString() || 0}</span>
                                </p>
                              </div>
                            )}

                            {(item.domain === 'INVOICE' || (item.domain === 'CASH' && item.type === 'VENDOR_PAYMENT')) && item.vendor_balance !== undefined && item.vendor_balance !== null && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border shadow-sm ${item.vendor_balance > 0 ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'}`}>
                                  الرصيد المستحق للمورد حالياً: {item.vendor_balance.toLocaleString()} ج.م
                                </span>
                              </div>
                            )}

                            {item.image && (
                              <a href={item.image} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium mt-1.5 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">
                                <ImageIcon className="w-3 h-3" /> عرض المرفق
                              </a>
                            )}
                          </div>

                          <div className="text-left mt-1 sm:mt-0">
                            <span
                              className={`text-sm sm:text-base font-black ${
                                item.domain === 'CASH' && item.type !== 'INCOME' ? 'text-rose-600 dark:text-rose-400'
                                  : item.domain === 'CUSTOMER_DEBT' && item.type === 'CREDIT' ? 'text-indigo-600 dark:text-indigo-400'
                                  : item.domain === 'INVOICE' ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {item.domain === 'CASH' && item.type !== 'INCOME' ? '-' : '+'}
                              {item.domain === 'INVOICE' ? item.remaining_amount?.toLocaleString() : item.amount?.toLocaleString()} ج
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
                <button onClick={() => setSelectedArchiveShift(null)} className="w-full py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 shadow-sm">
                  <ArrowRight className="w-5 h-5" /> عودة للخلف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShiftsMonitor;