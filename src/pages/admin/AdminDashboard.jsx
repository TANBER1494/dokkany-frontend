import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Building, Calendar, Smartphone, Search, 
  CheckCircle, XCircle, Trash2, Clock, ChevronDown 
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import platformPaymentService from '../../services/platformPaymentService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING or HISTORY
  const [payments, setPayments] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🚀 حالة لتعقب البطاقة المفتوحة حالياً في السجل
  const [expandedCardId, setExpandedCardId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'PENDING') {
        const data = await platformPaymentService.getPending();
        setPayments(data);
      } else {
        const data = await platformPaymentService.getAdminHistory();
        setHistory(data);
      }
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    // إغلاق أي بطاقة مفتوحة عند التبديل بين التبويبات
    setExpandedCardId(null);
  }, [activeTab]);

  const handleReview = async (id, action) => {
    const isApprove = action === 'APPROVE';
    const notes = window.prompt(`هل أنت متأكد من ${isApprove ? 'اعتماد' : 'رفض'} الطلب؟ (ملاحظة اختيارية):`);
    if (notes === null) return;

    try {
      await platformPaymentService.reviewRequest(id, { action, admin_notes: notes });
      showAlert.success('تم الإجراء', `تم ${isApprove ? 'تفعيل الاشتراك' : 'رفض الطلب'} بنجاح`);
      fetchData(); 
    } catch (error) {
      showAlert.error('فشل الإجراء', error.message);
    }
  };

  const handleClearHistory = async () => {
    const isConfirmed = window.confirm('هل أنت متأكد من مسح جميع السجلات من شاشتك؟ (لا يمكن التراجع)');
    if (!isConfirmed) return;

    try {
      await platformPaymentService.clearAdminHistory();
      showAlert.success('تم التنظيف', 'تم مسح السجل بنجاح');
      fetchData();
    } catch (error) {
      showAlert.error('خطأ', error.message);
    }
  };

  const currentData = activeTab === 'PENDING' ? payments : history;
  const filtered = currentData.filter(p => 
    p.organization_id?.name?.includes(searchTerm) || p.transfer_number?.includes(searchTerm)
  );

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* 🚀 الهيدر والبحث */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">إدارة الاشتراكات</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm mt-1">راجع طلبات التجديد أو تصفح السجل</p>
        </div>
        <div className="relative group w-full lg:w-80">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" placeholder="بحث باسم المؤسسة أو رقم التحويل..." 
            className="w-full pr-12 pl-4 py-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 dark:focus:border-blue-500 outline-none font-bold text-sm transition-all dark:text-white"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 🚀 أزرار التبديل وزر التنظيف */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl sm:rounded-2xl w-full sm:w-fit">
          <button 
            onClick={() => setActiveTab('PENDING')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm transition-all ${
              activeTab === 'PENDING' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> المعلقة ({activeTab === 'PENDING' ? filtered.length : payments.length})
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm transition-all ${
              activeTab === 'HISTORY' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4" /> السجل
          </button>
        </div>

        {activeTab === 'HISTORY' && history.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all"
          >
            <Trash2 className="w-4 h-4" /> تنظيف السجل
          </button>
        )}
      </div>

      {/* 🚀 عرض المحتوى */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filtered.map((payment) => {
              // 🚀 تحديد ما إذا كانت البطاقة مفتوحة
              const isExpanded = activeTab === 'PENDING' || expandedCardId === payment._id;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={payment._id} 
                  onClick={() => activeTab === 'HISTORY' && setExpandedCardId(expandedCardId === payment._id ? null : payment._id)}
                  className={`bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex flex-col ${
                    activeTab === 'HISTORY' ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'hover:shadow-lg group'
                  }`}
                >
                  {/* 🚀 الهيدر (يظهر دائماً) */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Building className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 dark:text-white text-sm sm:text-base line-clamp-1">{payment.organization_id?.name || 'مؤسسة محذوفة'}</h3>
                        <p className="text-slate-400 font-bold text-[10px] sm:text-xs line-clamp-1">{payment.branch_id?.name || 'فرع محذوف'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {payment.status === 'PENDING' && <div className="bg-amber-50 text-amber-600 px-2 sm:px-3 py-1 rounded-lg sm:rounded-full text-[10px] sm:text-xs font-black shrink-0">قيد المراجعة</div>}
                      {payment.status === 'APPROVED' && <div className="bg-emerald-50 text-emerald-600 flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg sm:rounded-full text-[10px] sm:text-xs font-black shrink-0"><CheckCircle className="w-3 h-3"/> مقبول</div>}
                      {payment.status === 'REJECTED' && <div className="bg-rose-50 text-rose-600 flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg sm:rounded-full text-[10px] sm:text-xs font-black shrink-0"><XCircle className="w-3 h-3"/> مرفوض</div>}
                      
                      {/* السهم الدوار للسجل */}
                      {activeTab === 'HISTORY' && (
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }} className="text-slate-400 shrink-0">
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* 🚀 المحتوى القابل للطي (يظهر فقط إذا كانت مفتوحة) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden flex flex-col flex-1"
                      >
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
                          <div className="bg-slate-50 dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mb-1">المبلغ المحول</p>
                            <p className="text-sm sm:text-base font-black text-slate-800 dark:text-white">{payment.amount_paid} ج.م</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mb-1">المدة</p>
                            <p className="text-sm sm:text-base font-black text-slate-800 dark:text-white">{payment.requested_months} شهر</p>
                          </div>
                        </div>

                        <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6 flex-1">
                          <div className="flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 p-2 sm:p-2.5 rounded-lg sm:rounded-xl">
                            <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
                            <span className="font-black tracking-wider break-all">{payment.transfer_number}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-xs px-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="line-clamp-1">{new Date(payment.updatedAt || payment.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          
                          {activeTab === 'HISTORY' && payment.admin_notes && (
                            <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-100 dark:border-slate-700">
                              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 mb-0.5 sm:mb-1">ملاحظة الإدارة:</p>
                              <p className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">{payment.admin_notes}</p>
                            </div>
                          )}
                        </div>

                        {/* 🚀 الأزرار السفلية */}
                        {activeTab === 'PENDING' ? (
                          <div className="flex flex-col gap-2 sm:gap-3 mt-auto">
                            <a href={payment.receipt_image_url} target="_blank" rel="noreferrer" className="w-full py-2.5 sm:py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-center rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                              عرض صورة الإيصال 🖼️
                            </a>
                            <div className="flex gap-2 sm:gap-3">
                              <button onClick={() => handleReview(payment._id, 'REJECT')} className="flex-1 py-3 sm:py-3.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-rose-500 hover:text-white transition-all">رفض</button>
                              <button onClick={() => handleReview(payment._id, 'APPROVE')} className="flex-[2] py-3 sm:py-3.5 bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all">تفعيل الاشتراك</button>
                            </div>
                          </div>
                        ) : (
                          <a href={payment.receipt_image_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="mt-auto w-full py-2.5 sm:py-3 border-2 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-center rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            الإيصال المرفق
                          </a>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 sm:py-20 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-bold flex flex-col items-center gap-2 sm:gap-3 mx-4 sm:mx-0">
          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 dark:text-slate-700" />
          <p className="text-sm sm:text-base">لا يوجد طلبات في {activeTab === 'PENDING' ? 'قائمة الانتظار' : 'هذا السجل'}</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;