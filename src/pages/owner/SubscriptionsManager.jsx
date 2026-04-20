import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Clock,
  UploadCloud,
  CheckCircle,
  Loader2,
  X,
  FileText,
  Smartphone,
  CalendarDays,
  Building,
  ArrowRight,
  History,
  ChevronDown,
  Activity,
  Trash2
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import branchService from '../../services/branchService';
import platformPaymentService from '../../services/platformPaymentService';

const SUBSCRIPTION_PACKAGES = [
  { months: 1, price: 500, title: 'باقة شهرية', discount: null },
  { months: 3, price: 1350, title: 'باقة 3 شهور', discount: 'توفير 150 جنيه' },
  { months: 9, price: 3800, title: 'باقة 9 شهور', discount: 'توفير 700 جنيه' },
];

const VODAFONE_CASH_NUMBERS = ['01112793953', '01032716249'];

const SubscriptionsManager = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [expandedBranch, setExpandedBranch] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(SUBSCRIPTION_PACKAGES[0]);
  const [transferNumber, setTransferNumber] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [branchesRes, historyData] = await Promise.all([
        branchService.getBranches(),
        platformPaymentService.getHistory(),
      ]);
      setBranches(branchesRes.branches || branchesRes);
      setPaymentHistory(historyData);
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleClearHistory = async (branchId, branchName) => {
    showAlert.error(
      'تنظيف السجل',
      `هل أنت متأكد من مسح جميع سجلات الاشتراكات السابقة لفرع (${branchName}) من أمامك؟ (هذا الإجراء لا يؤثر على اشتراكك الحالي)`
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await platformPaymentService.clearBranchHistory(branchId);
          showAlert.success('تم التنظيف', 'تم إخفاء السجلات السابقة بنجاح.');
          fetchInitialData(); // تحديث القائمة
        } catch (error) {
          showAlert.error('خطأ', error.message);
        }
      }
    });
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedBranch || !transferNumber || !receiptImage) {
      return showAlert.error('تنبيه', 'يرجى إكمال جميع الحقول وإرفاق صورة الإيصال');
    }

    const formData = new FormData();
    formData.append('branch_id', selectedBranch);
    formData.append('amount_paid', selectedPackage.price);
    formData.append('requested_months', selectedPackage.months);
    formData.append('transfer_number', transferNumber);
    formData.append('receipt_image', receiptImage);

    setIsSubmitting(true);
    try {
      await platformPaymentService.submitRequest(formData);
      showAlert.success('تم الإرسال', 'تم رفع طلبك بنجاح. سيتم تفعيل الباقة فور مراجعة الإدارة.');
      setIsModalOpen(false);
      setSelectedBranch('');
      setTransferNumber('');
      setReceiptImage(null);
      setSelectedPackage(SUBSCRIPTION_PACKAGES[0]);
      fetchInitialData();
    } catch (error) {
      showAlert.error('فشل الإرسال', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return (
          <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 w-fit border border-emerald-100 dark:border-emerald-500/20 transition-colors">
            <CheckCircle className="w-3.5 h-3.5" /> تم التفعيل (مقبول)
          </span>
        );
      case 'PENDING': return (
          <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 w-fit border border-amber-100 dark:border-amber-500/20 animate-pulse transition-colors">
            <Clock className="w-3.5 h-3.5" /> قيد المراجعة
          </span>
        );
      case 'REJECTED': return (
          <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 w-fit border border-rose-100 dark:border-rose-500/20 transition-colors">
            <AlertTriangle className="w-3.5 h-3.5" /> مرفوض
          </span>
        );
      default: return null;
    }
  };

  const toggleBranchHistory = (branchId) => {
    setExpandedBranch(expandedBranch === branchId ? null : branchId);
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 rounded-[24px] border border-slate-200 dark:border-slate-700/50 shadow-inner overflow-hidden relative transition-colors duration-300">
      
      <div className="bg-white dark:bg-slate-800 px-4 sm:px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/owner')} 
            className="p-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-90 border border-slate-200 dark:border-slate-600 shadow-sm"
            title="رجوع للوحة القيادة"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> الاشتراكات 
            </h2>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">
              متابعة حالة اشتراك الفروع وتاريخ التجديدات
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" /> طلب تجديد لفرع
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-transparent">
        {branches.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 border-dashed p-16 text-center max-w-lg mx-auto transition-colors">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-700">
               <Building className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h4 className="font-black text-slate-800 dark:text-white text-lg">لا توجد فروع مسجلة</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-2 leading-relaxed">
              يجب عليك افتتاح فرع أولاً من شاشة إدارة الفروع لكي تتمكن من تجديد اشتراكه.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-20">
            {branches.map((branch) => {
              const branchHistory = paymentHistory.filter(p => (p.branch_id?._id === branch._id || p.branch_id === branch._id));
              const isExpanded = expandedBranch === branch._id;

              return (
                <div key={branch._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[28px] overflow-hidden shadow-sm transition-colors">
                  
                  <div 
                    onClick={() => toggleBranchHistory(branch._id)}
                    className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm transition-colors ${branch.status === 'LOCKED' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400' : branch.days_left <= 5 ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
                        <Building className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{branch.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          {branch.status === 'LOCKED' ? (
                            <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black border border-rose-100 dark:border-rose-500/20">متوقف</span>
                          ) : branch.days_left <= 5 ? (
                            <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black border border-amber-200 dark:border-amber-500/20 animate-pulse">تجديد خلال {branch.days_left} يوم</span>
                          ) : (
                            <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black border border-emerald-200 dark:border-emerald-500/20">نشط ({branch.days_left} يوم)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-slate-100 dark:border-slate-700 pt-4 lg:pt-0">
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">إجمالي الطلبات المُسجلة</span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">{branchHistory.length} طلب (مقبول/مرفوض/معلق)</span>
                      </div>
                      <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-5 h-5" />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700"
                      >
                        <div className="p-5 sm:p-8">
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                              <History className="w-4 h-4" /> السجل التاريخي للاشتراكات
                            </h4>
                            {branchHistory.length > 0 && (
                              <button 
                                onClick={() => handleClearHistory(branch._id, branch.name)}
                                className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-rose-500 hover:text-rose-600 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> تنظيف السجل
                              </button>
                            )}
                          </div>

                          {branchHistory.length === 0 ? (
                            <div className="text-center py-8">
                              <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">لم يتم رفع أي طلبات تجديد لهذا الفرع حتى الآن.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {branchHistory.map((payment, idx) => (
                                <div key={payment._id} className="bg-white dark:bg-slate-800 p-5 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors relative overflow-hidden">
                                  {/* الترتيب التسلسلي للطلب ليعطي إحساس السجل */}
                                  <div className="absolute top-0 right-0 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-bl-lg text-[9px] font-black text-slate-400 dark:text-slate-500 border-b border-l border-slate-200 dark:border-slate-600">
                                    طلب #{branchHistory.length - idx}
                                  </div>

                                  <div className="flex items-start gap-4 mt-2 md:mt-0">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-center min-w-[90px] shrink-0 transition-colors">
                                      <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{payment.amount_paid}</p>
                                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mt-1">ج.م</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-slate-800 dark:text-white mb-1.5">طلب تفعيل باقة {payment.requested_months} أشهر</p>
                                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                                        <CalendarDays className="w-3.5 h-3.5" />
                                        تم الرفع: {new Date(payment.createdAt).toLocaleString('ar-EG')}
                                      </p>
                                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                        <Smartphone className="w-3 h-3" />
                                        من رقم: {payment.transfer_number}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col md:items-end gap-2 border-t md:border-t-0 border-slate-100 dark:border-slate-700 pt-3 md:pt-0 w-full md:w-auto">
                                    {getStatusBadge(payment.status)}
                                    {payment.status === 'REJECTED' && payment.admin_notes && (
                                      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-1.5 rounded-md border border-rose-100 dark:border-rose-500/20 w-full md:max-w-xs text-right mt-1">
                                        السبب: {payment.admin_notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* مودال رفع طلب الدفع وتجديد الاشتراك */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm transition-colors">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0 transition-colors">
                <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> إجراء تجديد اشتراك
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-xl hover:text-rose-500 dark:hover:text-rose-400 shadow-sm border border-slate-100 dark:border-slate-600 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                
                {/* تعليمات التحويل */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 border border-indigo-100 dark:border-indigo-500/20 p-5 rounded-[24px] transition-colors">
                  <p className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-300 mb-3">خطوات الدفع (المحافظ الإلكترونية):</p>
                  <ul className="text-[11px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-400 space-y-3">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full"></div> حول قيمة الباقة لرقم من دول   :</li>
                    <div className="flex flex-wrap gap-2 my-2">
                       {VODAFONE_CASH_NUMBERS.map(n => (
                         <span key={n} className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/30 shadow-sm font-black text-indigo-900 dark:text-indigo-300 select-all tracking-wider transition-colors">{n}</span>
                       ))}
                    </div>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full"></div> ارفع لقطة شاشة (Screenshot) لرسالة التأكيد بالأسفل.</li>
                  </ul>
                </div>

                <form id="payment-form" onSubmit={handleSubmitPayment} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 pr-1">الفرع المراد تجديده</label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-800 dark:text-slate-200 text-sm outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all"
                        required
                      >
                        <option value="">-- اختر الفرع --</option>
                        {branches.map((b) => (
                          <option key={b._id} value={b._id}> {b.name} </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 pr-1">رقم المحفظة المحول منها</label>
                      <div className="relative">
                        <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
                          type="tel"
                          placeholder="01xxxxxxxxx"
                          value={transferNumber}
                          onChange={(e) => setTransferNumber(e.target.value)}
                          className="w-full pr-11 pl-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-800 dark:text-slate-200 text-left text-sm outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 pr-1">اختر الباقة المناسبة</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {SUBSCRIPTION_PACKAGES.map((pkg, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${selectedPackage.months === pkg.months ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-200 dark:hover:border-slate-600'}`}
                        >
                          {pkg.discount && (
                            <span className="absolute -top-2.5 right-2 bg-emerald-500 dark:bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">{pkg.discount}</span>
                          )}
                          <h4 className="font-black text-slate-800 dark:text-white text-xs">{pkg.title}</h4>
                          <p className="text-lg font-black text-indigo-700 dark:text-indigo-400 mt-1">{pkg.price} <span className="text-[10px] text-slate-400 dark:text-slate-500">ج.م</span></p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 pr-1">إثبات التحويل (صورة الإيصال)</label>
                    <div className={`relative border-2 border-dashed rounded-[24px] p-8 text-center transition-all ${receiptImage ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50'}`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setReceiptImage(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      {receiptImage ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mb-3" />
                          <p className="font-black text-emerald-800 dark:text-emerald-300 text-sm">تم إرفاق الإيصال بنجاح</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate max-w-[200px]">{receiptImage.name}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <UploadCloud className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="font-black text-slate-600 dark:text-slate-400 text-sm">دوس هنا لرفع الإيصال</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold tracking-tighter">JPEG, PNG ARE SUPPORTED</p>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-4 transition-colors">
                 <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl active:scale-95 transition-all text-sm"
                >
                  إلغاء العملية
                </button>
                <button
                  type="submit"
                  form="payment-form"
                  disabled={isSubmitting}
                  className="flex-[2] bg-indigo-600 dark:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/20 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all flex justify-center items-center gap-2 text-sm"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />} اعتماد ورفع الإيصال
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionsManager;