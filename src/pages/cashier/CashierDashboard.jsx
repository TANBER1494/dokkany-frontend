import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Truck,
  BookOpen,
  Banknote,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Play,
  Calendar,
  ChevronLeft,Store
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import shiftService from '../../services/shiftService';
import employeeService from '../../services/employeeService';

const CashierDashboard = () => {
  const navigate = useNavigate();

  const [activeShift, setActiveShift] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [lastShiftInfo, setLastShiftInfo] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [startingCash, setStartingCash] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [pinCode, setPinCode] = useState('');

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [shift, empsData] = await Promise.all([
        shiftService.getActiveShift().catch(() => null),
        employeeService.getEmployees().catch(() => ({ employees: [] })),
      ]);

      if (shift) {
        setActiveShift(shift);
      } else {
        const lastShift = await shiftService.getLastClosedShift();
        setLastShiftInfo(lastShift);
      }

      setEmployees(empsData.employees || empsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleInitialOpen = async (e) => {
    e.preventDefault();
    if (!lastShiftInfo?.has_previous && (startingCash === '' || Number(startingCash) < 0)) {
      return showAlert.error('تنبيه', 'يرجى إدخال عهدة الافتتاح بشكل صحيح');
    }

    try {
      setIsProcessing(true);
      await shiftService.openShift({
        shift_type: 'STANDARD',
        initial_cash_if_first: lastShiftInfo?.has_previous ? 0 : Number(startingCash),
      });
      showAlert.success('تم فتح النظام', 'تم إنشاء الوردية بنجاح.');
      fetchDashboardData();
    } catch (error) {
      showAlert.error('فشل الفتح', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcknowledge = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) return showAlert.error('تنبيه', 'يجب اختيار اسمك من القائمة');
    if (!pinCode || pinCode.length !== 4) return showAlert.error('تنبيه', 'يجب إدخال الرمز السري (PIN) المكون من 4 أرقام!');

    try {
      setIsProcessing(true);
      await shiftService.acknowledgeShift({
        employee_id: selectedEmployeeId,
        pin_code: pinCode,
      });
      showAlert.success('تم التأكيد', 'تم استلام الدرج بنجاح!');
      setPinCode('');
      fetchDashboardData();
    } catch (error) {
      setPinCode(''); 
      showAlert.error('عفواً', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ⏱️ حساب العداد المباشر (Live Timer)
  const getShiftDuration = () => {
    if (!activeShift?.acknowledged_at) return '00:00:00';
    const diff = Math.floor((currentTime - new Date(activeShift.acknowledged_at)) / 1000);
    if (diff < 0) return '00:00:00';
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const currentDateString = currentTime.toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' });

  if (isLoading)
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );

  // ==========================================
  // 1. شاشة افتتاح الوردية (الدرج المغلق)
  // ==========================================
  if (!activeShift) {
    return (
      <div className="w-full flex items-center justify-center py-10 sm:py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-lg shadow-indigo-500/5 dark:shadow-none border border-slate-100 dark:border-slate-700 text-center transition-colors">
          <div className="mx-auto w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-[24px] flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 border border-indigo-100 dark:border-indigo-500/20">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">الدرج مغلق حالياً</h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8">يجب استلام العهدة لبدء نظام المبيعات</p>
          
          <form onSubmit={handleInitialOpen} className="space-y-6">
            {lastShiftInfo?.has_previous ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-[24px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">عهدة الوردية السابقة المُرحّلة</p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{lastShiftInfo.last_ending_cash.toLocaleString()} <span className="text-base text-emerald-500">ج.م</span></p>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-3 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg inline-block border border-slate-100 dark:border-slate-700">سلمها: {lastShiftInfo.last_cashier_name}</p>
              </div>
            ) : (
              <div className="text-right">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 pr-2">العهدة الافتتاحية لأول مرة:</label>
                <input
                  type="number" value={startingCash} onChange={(e) => setStartingCash(e.target.value)}
                  placeholder="0.00"
                  dir="ltr"
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-left text-xl font-black outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 text-slate-900 dark:text-white transition-all"
                />
              </div>
            )}
            
            <button type="submit" disabled={isProcessing} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 dark:shadow-none active:scale-95 transition-all flex justify-center items-center gap-2">
              {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              {lastShiftInfo?.has_previous ? 'استلام وبدء الوردية' : 'افتتاح النظام'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 🎨 تصميم كروت الـ Enterprise (نظيف، عصري، بدون ألوان مزعجة)
  const cards = [
    { 
      id: 'shift', title: 'إدارة الوردية والدرج', path: '/cashier/shift', icon: <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />, 
      accent: 'bg-emerald-500', hoverBorder: 'hover:border-emerald-500 dark:hover:border-emerald-500',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white' 
    },
    { 
      id: 'vendors', title: 'فواتير الشركات', path: '/cashier/vendors', icon: <Truck className="w-6 h-6 sm:w-7 sm:h-7" />, 
      accent: 'bg-blue-500', hoverBorder: 'hover:border-blue-500 dark:hover:border-blue-500',
      iconBg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white' 
    },
    { 
      id: 'debts', title: 'كشكول الزباين', path: '/cashier/customer-debts', icon: <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />, 
      accent: 'bg-amber-500', hoverBorder: 'hover:border-amber-500 dark:hover:border-amber-500',
      iconBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white' 
    },
    { 
      id: 'expenses', title: 'مصروفات وسلف', path: '/cashier/expenses', icon: <Banknote className="w-6 h-6 sm:w-7 sm:h-7" />, 
      accent: 'bg-rose-500', hoverBorder: 'hover:border-rose-500 dark:hover:border-rose-500',
      iconBg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white' 
    },
  ];

  return (
    // 🚀 السكرول سيعمل هنا بشكل طبيعي تماماً بفضل gap-5 ومرونة الحاوية
    <div className="w-full flex flex-col gap-5 sm:gap-6 pb-10">
      
      {/* ========================================== */}
      {/* 2. شريط الوردية الشبحية (بانتظار البصمة) */}
      {/* ========================================== */}
      {!activeShift.is_acknowledged && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-[14px] flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-black text-amber-800 dark:text-amber-400 leading-tight">بانتظار استلام العهدة ({activeShift.starting_cash.toLocaleString()} ج.م)</h3>
                <p className="text-[11px] sm:text-xs font-bold text-amber-700/80 dark:text-amber-400/80 mt-1">أدخل الـ PIN لتأكيد هويتك وبدء مسؤوليتك عن الدرج.</p>
              </div>
            </div>

            <form onSubmit={handleAcknowledge} className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 shrink-0">
              <div className="flex gap-2 w-full">
                <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} className="flex-1 sm:w-40 p-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-slate-800 font-bold text-sm outline-none focus:border-amber-500 text-slate-800 dark:text-white transition-colors cursor-pointer">
                  <option value="">-- اختر اسمك --</option>
                  {employees.filter((emp) => emp.employee_title === 'CASHIER').map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>

                <div className="relative w-24 sm:w-28 shrink-0">
                  <input type="password" maxLength="4" placeholder="PIN" value={pinCode} onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))} dir="ltr" className="w-full p-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-slate-800 outline-none text-center font-black tracking-widest text-sm focus:border-amber-500 text-slate-800 dark:text-white transition-colors placeholder:tracking-normal placeholder:text-xs" />
                </div>
              </div>

              <button type="submit" disabled={isProcessing} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-black text-sm active:scale-95 transition-all shadow-sm flex items-center justify-center shrink-0 gap-2">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                <span className="sm:hidden">تأكيد الاستلام</span>
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* ========================================== */}
      {/* 3. لوحة القيادة (Enterprise Dashboard Header) */}
      {/* ========================================== */}
      <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-colors">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[16px] flex flex-col items-center justify-center shrink-0 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-none">وردية</span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none mt-1">#{activeShift.shift_sequence}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 transition-colors">
              <span className="relative flex h-2.5 w-2.5">
                {activeShift.is_acknowledged && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeShift.is_acknowledged ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              {activeShift.is_acknowledged ? activeShift.acknowledged_by?.name || 'كاشير نشط' : 'النظام يعمل (بانتظار المستلم)'}
            </h2>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 flex items-center flex-wrap gap-2 sm:gap-3 transition-colors">
    {/* 🚀 إضافة اسم الفرع هنا كـ Badge احترافي */}
    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 transition-all">
      <Store className="w-3.5 h-3.5" />
      {'فرع ' +activeShift.branch_id?.name || 'الفرع الحالي'}
    </span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400"/> {currentDateString}</span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
              {activeShift.is_acknowledged ? (
                <span className="font-mono flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-500/20" dir="ltr">
                  {getShiftDuration()} <Clock className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span className="text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">جاهز لإدخال العمليات</span>
              )}
            </div>
          </div>
        </div>
        
        {/* العهدة - تصميم بنكي صارم */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-center gap-4 bg-slate-50 dark:bg-slate-900/50 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="text-right">
            <span className="block text-[11px] font-black text-slate-400 dark:text-slate-500 mb-0.5 uppercase tracking-wider">عهدة الاستلام</span>
            <span className="text-xl font-black text-slate-800 dark:text-white leading-none">
              {activeShift.starting_cash.toLocaleString()} <span className="text-sm text-slate-500">ج.م</span>
            </span>
          </div>
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 4. شبكة أزرار التحكم (تصميم Enterprise نظيف) */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 content-start">
        {cards.map((card) => (
          <motion.div
            key={card.id} whileTap={{ scale: 0.98 }} onClick={() => navigate(card.path)}
            className={`group relative bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-[24px] cursor-pointer shadow-sm border border-slate-200 dark:border-slate-700 ${card.hoverBorder} flex flex-row lg:flex-col items-center lg:items-start gap-4 transition-all duration-300 overflow-hidden`}
          >
            {/* خط لوني رفيع يعطي طابع الـ ERP */}
            <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            
            <div className={`p-3.5 rounded-2xl shrink-0 transition-colors duration-300 ${card.iconBg}`}>
              {card.icon}
            </div>
            <div className="flex-1 lg:mt-2">
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{card.title}</h3>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                اضغط للتسجيل <ChevronLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default CashierDashboard;