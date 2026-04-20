import { useState, useEffect, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Archive,
  Loader2,
  ShieldCheck,
  Calculator,
  History,
  CheckCircle2,
  Clock,
  DollarSign,
  CreditCard,
  Plus,
  Trash2,
  FileText,
  Banknote,
  Users,
  Truck,
  X,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Image as ImageIcon
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import shiftService from '../../services/shiftService';
import { AuthContext } from '../../context/AuthContext';

const ShiftManager = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('CURRENT');
  const [activeShift, setActiveShift] = useState(null);
  const [shiftsHistory, setShiftsHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [endingCash, setEndingCash] = useState('');
  const [machines, setMachines] = useState([]);

  const [selectedArchiveShift, setSelectedArchiveShift] = useState(null);
  const [shiftTimeline, setShiftTimeline] = useState([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const [openMonths, setOpenMonths] = useState({});

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [shiftData, historyData] = await Promise.all([
        shiftService.getActiveShift().catch(() => null),
        shiftService.getShiftsHistory().catch(() => ({ shifts: [] })),
      ]);
      setActiveShift(shiftData?.shift || shiftData); 
      setShiftsHistory(historyData.shifts || []);
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedShifts = useMemo(() => {
    const groups = {};
    shiftsHistory.forEach(shift => {
      const date = new Date(shift.start_time);
      const monthYear = date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(shift);
    });
    return groups;
  }, [shiftsHistory]);

  useEffect(() => {
    const monthKeys = Object.keys(groupedShifts);
    if (monthKeys.length > 0 && Object.keys(openMonths).length === 0) {
      setOpenMonths({ [monthKeys[0]]: true });
    }
  }, [groupedShifts]);

  const toggleMonth = (month) => {
    setOpenMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const addMachineField = () => setMachines([...machines, { machine_name: '', balance: '' }]);
  const updateMachineField = (index, field, value) => {
    const updatedMachines = [...machines];
    updatedMachines[index][field] = value;
    setMachines(updatedMachines);
  };
  const removeMachineField = (index) => setMachines(machines.filter((_, i) => i !== index));

  const handleCloseShift = async (e) => {
    e.preventDefault();
    if (endingCash === '' || Number(endingCash) < 0) {
      return showAlert.error('تنبيه', 'يجب إدخال المبلغ الموجود في الدرج بدقة');
    }

    if (!window.confirm('🚨 هل أنت متأكد من إنهاء الوردية؟ (لا يمكن التراجع)')) return;

    const validMachines = machines
      .filter((m) => m.machine_name.trim() !== '' && m.balance !== '')
      .map((m) => ({
        machine_name: m.machine_name.trim(),
        balance: Number(m.balance),
      }));

    try {
      setIsSubmitting(true);
      const response = await shiftService.closeShift(activeShift._id, {
        ending_cash_actual: Number(endingCash),
        machines_balances: validMachines,
      });

      showAlert.success('تم الإغلاق بنجاح', `صافي توريد الوردية: ${response.shift_summary.net_shift_yield} ج`);
      navigate('/cashier', { replace: true });
      window.location.reload();
    } catch (error) {
      showAlert.error('فشل الإغلاق', error.message);
      setIsSubmitting(false);
    }
  };

  const handleViewShiftDetails = async (shift) => {
    try {
      setSelectedArchiveShift(shift);
      setIsDetailsLoading(true);
      const timelineData = await shiftService.getShiftTimeline(shift._id);
      setShiftTimeline(timelineData.timeline || timelineData); 
    } catch (error) {
      showAlert.error('خطأ', 'فشل في جلب تفاصيل الوردية');
      setSelectedArchiveShift(null);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const getNextShiftInfo = (currentShiftId) => {
    const idx = shiftsHistory.findIndex(s => s._id === currentShiftId);
    if (idx === 0) return activeShift; 
    if (idx > 0) return shiftsHistory[idx - 1]; 
    return null;
  };

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );

  return (
    // 🚀 إزالة المسافات الجانبية المهدرة
    <div className="flex flex-col h-full space-y-4 w-full transition-colors duration-300">
      
      <div className="px-1">
        <button
          onClick={() => navigate('/cashier')}
          className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95 w-fit text-sm"
        >
          <ArrowRight className="w-4 h-4" /> رجوع
        </button>
      </div>

      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full max-w-sm mx-auto border border-slate-200 dark:border-slate-700 transition-colors">
        <button
          onClick={() => setActiveTab('CURRENT')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeTab === 'CURRENT' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          <Wallet className="w-4 h-4" /> الجرد والإغلاق
        </button>
        <button
          onClick={() => setActiveTab('ARCHIVE')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeTab === 'ARCHIVE' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          <History className="w-4 h-4" /> الأرشيف
        </button>
      </div>

      {activeTab === 'CURRENT' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto pb-10 custom-scrollbar w-full flex justify-center">
          {!activeShift ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 w-full max-w-lg rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
              <ShieldCheck className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h2 className="text-lg font-black text-slate-500 dark:text-slate-400">لا توجد وردية مفتوحة حالياً</h2>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-[20px] p-4 sm:p-6 w-full max-w-xl shadow-md border border-slate-200 dark:border-slate-700 relative overflow-hidden transition-colors">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

              <div className="mb-6 text-center">
                <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mb-2">  تسليم الورديه</h2>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs font-bold">
                  <span className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    وردية <span className="text-emerald-600 dark:text-emerald-400">#{activeShift.shift_sequence}</span>
                  </span>
                  <span className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    العهدة: <span className="text-emerald-600 dark:text-emerald-400">{activeShift.starting_cash} ج.م</span>
                  </span>
                </div>
              </div>

              <form onSubmit={handleCloseShift} className="space-y-5">
                {/* 🚀 تصغير الخطوط والمساحات في إدخال العهدة */}
                <div className="space-y-2.5 p-4 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 transition-colors">
                  <label className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-emerald-500" /> إجمالي الفلوس النقديه في الدرج
                  </label>
                  <div className="relative">
                    <input
                      type="number" required placeholder="0.00"
                      value={endingCash} onChange={(e) => setEndingCash(e.target.value)}
                      dir="ltr"
                      className="w-full py-3 pl-3 pr-10 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-slate-900 text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 outline-none focus:border-emerald-500 text-center transition-all"
                    />
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-slate-400" /> أرصدة الماكينات
                    </label>
                    <button type="button" onClick={addMachineField} className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1.5 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-500/20 flex items-center gap-1 transition-all active:scale-95 border border-indigo-100 dark:border-indigo-500/20">
                      <Plus className="w-3 h-3" /> إضافة
                    </button>
                  </div>

                  {machines.length === 0 && (
                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold text-center py-1">لم يتم إضافة أرصدة ماكينات.</p>
                  )}

                  <AnimatePresence>
                    {machines.map((machine, index) => (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} key={index} className="flex items-center gap-1.5">
                        <input
                          type="text" placeholder="اسم الماكينة" value={machine.machine_name}
                          onChange={(e) => updateMachineField(index, 'machine_name', e.target.value)}
                          className="flex-1 min-w-0 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold outline-none focus:border-indigo-400 dark:text-white transition-colors"
                        />
                        <input
                          type="number" placeholder="الرصيد" value={machine.balance} dir="ltr"
                          onChange={(e) => updateMachineField(index, 'balance', e.target.value)}
                          className="w-20 sm:w-24 min-w-0 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-center text-xs sm:text-sm font-bold outline-none focus:border-indigo-400 dark:text-white transition-colors"
                        />
                        <button type="button" onClick={() => removeMachineField(index)} className="p-2.5 shrink-0 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-600 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 mt-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-black text-sm sm:text-base rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <><CheckCircle2 className="w-4 h-4" /> تأكيد وتسليم</>}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      )}

      {/* ============== نهاية الجزء الأول ============== */}

      {activeTab === 'ARCHIVE' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto pb-10 custom-scrollbar w-full">
          <div className="w-full max-w-4xl mx-auto space-y-4 px-1">
            {Object.keys(groupedShifts).length === 0 ? (
               <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                 <Archive className="w-16 h-16 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                 <p className="font-bold text-base text-slate-400 dark:text-slate-500">لا يوجد سجل ورديات سابق.</p>
               </div>
            ) : (
              Object.entries(groupedShifts).map(([monthYear, shifts]) => (
                <div key={monthYear} className="bg-white dark:bg-slate-800 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                  <button 
                    onClick={() => toggleMonth(monthYear)} 
                    className="w-full p-4 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                        <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="font-black text-base sm:text-lg text-slate-800 dark:text-white">{monthYear}</h3>
                      <span className="text-[10px] sm:text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg">
                        {shifts.length} وردية
                      </span>
                    </div>
                    {openMonths[monthYear] ? <ChevronUp className="text-slate-400 dark:text-slate-500" /> : <ChevronDown className="text-slate-400 dark:text-slate-500" />}
                  </button>

                  <AnimatePresence>
                    {openMonths[monthYear] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                          {shifts.map((shift) => {
                            const currentName = shift.acknowledged_by?.name?.split(' ')[0] || 'العامل';
                            const nextShift = getNextShiftInfo(shift._id);
                            const nextName = nextShift?.acknowledged_by?.name?.split(' ')[0] || 'الزميل';

                            return (
                              <div 
                                key={shift._id} 
                                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col group relative overflow-hidden transition-colors"
                              >
                                {/* الكارت لم يعد قابلاً للضغط كلياً، المؤشر أصبح عادياً */}
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex flex-col gap-1.5">
                                    <span className="inline-block w-fit px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded border border-indigo-100 dark:border-indigo-500/20">
                                      وردية #{shift.shift_sequence}
                                    </span>
                                    <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                                      <Users className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> {shift.acknowledged_by?.name || 'غير معروف'}
                                    </h4>
                                  </div>
                                  <div className="text-left text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                                    {new Date(shift.start_time).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' })}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-900/50 p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 mb-3 mt-auto">
                                   <div className={`flex justify-between items-center text-[9px] sm:text-[10px] font-black ${shift.acknowledged_at ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                     <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3"/> استلام:</span>
                                     <span>{shift.acknowledged_at ? new Date(shift.acknowledged_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'لم يُسجل'}</span>
                                   </div>
                                   <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black text-slate-600 dark:text-slate-400">
                                     <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-slate-400 dark:text-slate-500"/> تسليم:</span>
                                     <span>{shift.end_time ? new Date(shift.end_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد'}</span>
                                   </div>
                                </div>

                                <div className="flex justify-between items-center px-1 mb-3">
                                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">الصافي المورد</span>
                                  <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">{shift.net_shift_profit} ج</span>
                                </div>

                                {/* 🚀 زر عرض التفاصيل الجديد المخصص */}
                                <button
                                  onClick={() => handleViewShiftDetails(shift)}
                                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                >
                                  <FileText className="w-4 h-4" /> عرض التفاصيل
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
      {/* =========================== */}

      {/* ============== بداية الجزء الثاني (المودال عبر React Portal) ============== */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedArchiveShift && (
            /* 🚀 الحاوية الخارجية: fixed تغطي الشاشة، items-start لجعله في الأعلى، pt-12 لترك مسافة من السقف */
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 sm:pt-16 px-4 pb-6 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm">
              
              {/* 🚀 إغلاق المودال عند الضغط على الخلفية السوداء */}
              <div className="absolute inset-0 z-0" onClick={() => setSelectedArchiveShift(null)}></div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: -20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[24px] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[85vh]"
              >
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Archive className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 dark:text-indigo-400" /> تفاصيل وردية #{selectedArchiveShift.shift_sequence}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          {new Date(selectedArchiveShift.start_time).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedArchiveShift(null)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-all border border-slate-100 dark:border-slate-700 active:scale-95">
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {(() => {
                    const currentName = selectedArchiveShift.acknowledged_by?.name?.split(' ')[0] || 'العامل';
                    const nextShift = getNextShiftInfo(selectedArchiveShift._id);
                    const nextName = nextShift?.acknowledged_by?.name?.split(' ')[0] || 'الزميل';

                    return (
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-4 text-[9px] sm:text-[10px] font-bold">
                         <span className={`px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg border flex items-center gap-1 shadow-sm ${selectedArchiveShift.acknowledged_at ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'}`}>
                           <ShieldCheck className="w-3.5 h-3.5" /> 
                           1- استلم {currentName}: <span className="font-black">{selectedArchiveShift.acknowledged_at ? new Date(selectedArchiveShift.acknowledged_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'لم يُسجل'}</span>
                         </span>
                         <span className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm">
                           <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> 
                           2- سلم {currentName}: <span className="font-black text-slate-800 dark:text-white">{selectedArchiveShift.end_time ? new Date(selectedArchiveShift.end_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد'}</span>
                         </span>
                         <span className={`px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg border flex items-center gap-1 shadow-sm ${nextShift?.acknowledged_at ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                           <CheckCircle2 className="w-3.5 h-3.5" /> 
                           3- سلم {nextName}: <span className="font-black">{nextShift?.acknowledged_at ? new Date(nextShift.acknowledged_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'بانتظار المستلم'}</span>
                         </span>
                      </div>
                    );
                  })()}
                </div>

                {/* 🚀 السكرول الداخلي للمودال */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar flex flex-col">
                  
                  <div className="grid grid-cols-3 gap-2 p-4 bg-indigo-50/50 dark:bg-indigo-500/10 border-b border-slate-100 dark:border-slate-800 text-center shrink-0">
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">عهدة الاستلام</p>
                      <p className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200">{selectedArchiveShift.starting_cash} ج</p>
                    </div>
                    <div className="border-r border-l border-slate-200/60 dark:border-slate-700/60">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">المنصرف والمصروفات</p>
                      <p className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400">{selectedArchiveShift.total_expenses} ج</p>
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">الجرد النهائي للدرج</p>
                      <p className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">{selectedArchiveShift.ending_cash_actual} ج</p>
                    </div>
                  </div>

                  {selectedArchiveShift.machines_balances && selectedArchiveShift.machines_balances.length > 0 && (
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 shrink-0">
                      <h4 className="text-[11px] sm:text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> أرصدة الماكينات المرفوعة
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedArchiveShift.machines_balances.map((machine, idx) => (
                           <div key={idx} className="bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] sm:text-xs font-bold flex gap-2 shadow-sm">
                             <span className="text-slate-500 dark:text-slate-400">{machine.machine_name}</span>
                             <span className="text-slate-800 dark:text-slate-200">{machine.balance} ج</span>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">الخط الزمني</p>
                      <span className="text-[10px] sm:text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-slate-500 dark:text-slate-400">
                        {shiftTimeline.length} عملية
                      </span>
                    </div>

                    {isDetailsLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500 dark:text-indigo-400" /></div>
                    ) : shiftTimeline.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Banknote className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">لم يتم تسجيل عمليات.</p>
                      </div>
                    ) : (
                      <div className="relative pl-1 pr-3 border-r-2 border-slate-200 dark:border-slate-700 space-y-4 mr-2">
                        {shiftTimeline.map((item, idx) => (
                          <div key={idx} className="relative">
                            <span
                              className={`absolute -right-[19px] sm:-right-[23px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-white dark:bg-slate-900 ${
                                item.domain === 'CASH' && item.type !== 'INCOME' ? 'border-rose-400 dark:border-rose-500'
                                  : item.domain === 'CASH' && item.type === 'INCOME' ? 'border-emerald-400 dark:border-emerald-500'
                                  : item.domain === 'INVOICE' ? 'border-blue-400 dark:border-blue-500'
                                  : 'border-indigo-400 dark:border-indigo-500'
                              }`}
                            ></span>

                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                    {new Date(item.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                    • {item.domain === 'CASH' ? 'حركة خزينة' : item.domain === 'INVOICE' ? 'فاتورة مورد' : 'كشكول زباين'}
                                  </span>
                                </div>
                                <h5 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white leading-tight">
                                  {item.domain === 'CASH' && item.type === 'VENDOR_PAYMENT' ? `سداد للمورد: ${item.person_name}`
                                    : item.domain === 'CASH' && item.type === 'INCOME' ? `إيراد: ${item.person_name}`
                                    : item.domain === 'CASH' && item.category === 'PERSONAL' ? `سلفة: ${item.person_name}`
                                    : item.domain === 'CASH' ? `مصروف تشغيل`
                                    : item.domain === 'INVOICE' ? `بضاعة من ${item.company || item.person_name}`
                                    : item.domain === 'CUSTOMER_DEBT' && item.type === 'CREDIT' ? `سحب شكك: ${item.person_name}`
                                    : `سداد زبون: ${item.person_name}`}
                                </h5>
                                
                                {item.domain === 'INVOICE' && (
                                  <div className="mt-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 inline-block text-[9px] font-bold text-slate-600 dark:text-slate-400">
                                      إجمالي: {item.amount.toLocaleString()} | مدفوع: {item.paid_amount || 0} | باقي: {item.remaining_amount || 0}
                                  </div>
                                )}
                              </div>

                              <div className="text-left mt-1 sm:mt-0 shrink-0">
                                <span
                                  className={`text-xs sm:text-sm font-black ${
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
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
      {/* ============== نهاية الجزء الثاني ============== */}
    </div>
  );
};

export default ShiftManager;