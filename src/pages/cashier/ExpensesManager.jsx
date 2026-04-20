import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom'; // 👈 استيراد البورتال لحل مشاكل الموبايل
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote,
  Users,
  Truck,
  Receipt,
  Loader2,
  Trash2,
  Clock,
  Plus,
  X,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import { AuthContext } from '../../context/AuthContext';
import shiftService from '../../services/shiftService';
import cashFlowService from '../../services/cashFlowService';
import employeeService from '../../services/employeeService';

const ExpensesManager = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [activeShift, setActiveShift] = useState(null);
  const [cashFlows, setCashFlows] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('OPERATION');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    employee_id: '',
  });

  const initializePage = async () => {
    try {
      setIsLoading(true);
      const shift = await shiftService.getActiveShift();

      if (!shift) {
        showAlert.error(
          'تنبيه',
          'يجب فتح الوردية أولاً لتتمكن من الدخول للخزينة'
        );
        setIsLoading(false);
        return;
      }

      setActiveShift(shift);

      const [flowsData, employeesData] = await Promise.all([
        cashFlowService.getShiftCashFlows(shift._id),
        employeeService.getEmployees(),
      ]);

      setCashFlows(flowsData);
      setEmployees(employeesData.employees || employeesData);
    } catch (error) {
      showAlert.error('خطأ', error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializePage();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description)
      return showAlert.error('تنبيه', 'المبلغ والبيان مطلوبان');

    let payload = {
      amount: formData.amount,
      description: formData.description,
    };

    if (activeTab === 'OPERATION') {
      payload = { ...payload, type: 'EXPENSE', expense_category: 'OPERATION' };
    } else if (activeTab === 'PERSONAL') {
      if (!formData.employee_id)
        return showAlert.error('تنبيه', 'يجب اختيار اسم العامل');
      payload = {
        ...payload,
        type: 'EXPENSE',
        expense_category: 'PERSONAL',
        employee_id: formData.employee_id,
      };
    }

    try {
      setIsSubmitting(true);
      await cashFlowService.addCashFlow(payload);
      showAlert.success('تم التسجيل', 'تم خصم المبلغ من عهدة الدرج بنجاح');
      setFormData({
        amount: '',
        description: '',
        employee_id: '',
      });
      setIsMobileModalOpen(false);

      const updatedFlows = await cashFlowService.getShiftCashFlows(
        activeShift._id
      );
      setCashFlows(updatedFlows);
    } catch (error) {
      showAlert.error('فشل التسجيل', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm('هل أنت متأكد من حذف هذه الحركة واسترجاع المبلغ للدرج؟')
    )
      return;
    try {
      await cashFlowService.deleteCashFlow(id);
      showAlert.success('تم الحذف', 'تم استرجاع المبلغ لعهدة الدرج');
      setCashFlows(cashFlows.filter((f) => f._id !== id));
    } catch (error) {
      showAlert.error('خطأ', error.message);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500 dark:text-rose-400" />
      </div>
    );

  const totalExpenses = cashFlows.reduce((acc, curr) => acc + curr.amount, 0);

  // 🚀 دالة عرض النموذج (مستخدمة في الديسكتوب والموبايل)
  const renderForm = () => (
    <div className="flex flex-col h-full">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-[14px] mb-5 transition-colors">
        {[
          {
            id: 'OPERATION',
            label: 'مصروف تشغيل',
            icon: <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
          },
          {
            id: 'PERSONAL',
            label: 'سلفة عامل',
            icon: <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
          }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/50 dark:border-slate-600'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon} <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        <div className="space-y-1.5">
          <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 pr-1">
            المبلغ المراد خروجه من الدرج
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0"
              dir="ltr"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full py-3.5 sm:py-4 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-center text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 outline-none focus:border-rose-400 dark:focus:border-rose-500 transition-all placeholder:text-rose-200 dark:placeholder:text-rose-500/30"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-rose-400 dark:text-rose-500 text-sm">
              ج.م
            </span>
          </div>
        </div>

        {activeTab === 'PERSONAL' && (
          <div className="space-y-1.5 animate-fade-in-rapid">
            <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 pr-1">
              اسم العامل المستلم
            </label>
            <select
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-rose-400 dark:focus:border-rose-500 font-bold text-xs sm:text-sm text-slate-800 dark:text-white transition-colors cursor-pointer"
            >
              <option value="">-- اختر العامل --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 pr-1">
            بيان الصرف (السبب)
          </label>
          <input
            type="text"
            placeholder={activeTab === 'OPERATION' ? "مثال: فاتورة كهرباء، بلاستيك..." : "مثال: سلفة من الراتب..."}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-rose-400 dark:focus:border-rose-500 font-bold text-xs sm:text-sm text-slate-800 dark:text-white transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 sm:mt-auto py-3.5 sm:py-4 bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white font-black text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          تأكيد خروج المبلغ
        </button>
      </form>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5 pb-20 transition-colors duration-300">
      
      <div>
        <button 
          onClick={() => navigate('/cashier')}
          className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-bold bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95 w-fit text-sm"
        >
          <ArrowRight className="w-4 h-4" /> رجوع للرئيسية
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 flex-1 min-h-0">
        
        {/* الفورم في شاشات الديسكتوب */}
        <div className="hidden lg:flex w-5/12 bg-white dark:bg-slate-800 rounded-[24px] p-5 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex-col h-full overflow-y-auto transition-colors">
          <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 dark:text-rose-400" /> تسجيل مصروف 
          </h2>
          {renderForm()}
        </div>

        {/* قائمة السجلات */}
        <div className="w-full lg:w-7/12 bg-white dark:bg-slate-800 rounded-[24px] p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full overflow-hidden relative transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-5">
            <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Receipt className="text-slate-400 dark:text-slate-500 w-5 h-5" /> سجل مصاريف الوردية
            </h2>
            <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-2 rounded-xl font-black text-[11px] sm:text-xs border border-rose-100 dark:border-rose-500/20 w-full sm:w-auto text-center tracking-wide">
              إجمالي المنصرف: {totalExpenses.toLocaleString()} ج
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5 sm:space-y-3 pb-10">
            {cashFlows.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60 py-10">
                <Banknote className="w-12 h-12 sm:w-16 sm:h-16 mb-3" />
                <p className="font-bold text-xs sm:text-sm">
                  لم يتم سحب أي مبالغ من الدرج اليوم.
                </p>
              </div>
            ) : (
              cashFlows.map((flow) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={flow._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 transition-colors gap-3 group"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div
                      className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${flow.type === 'VENDOR_PAYMENT' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : flow.expense_category === 'PERSONAL' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                    >
                      {flow.type === 'VENDOR_PAYMENT' ? (
                        <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : flow.expense_category === 'PERSONAL' ? (
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800 dark:text-white text-xs sm:text-sm">
                        {flow.type === 'VENDOR_PAYMENT'
                          ? `دفعة مورد: ${flow.vendor_id?.name || ''}`
                          : flow.expense_category === 'PERSONAL'
                            ? `سلفة عامل: ${flow.employee_id?.name || ''}`
                            : 'مصروفات تشغيل'}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-1 line-clamp-1">
                        {flow.description}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center flex-wrap gap-1 font-bold">
                        <Clock className="w-3 h-3" />
                        {new Date(flow.createdAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto mt-1 sm:mt-0 pt-2 sm:pt-0 border-t border-slate-200 dark:border-slate-700 sm:border-0">
                    <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 tracking-tight">
                      - {flow.amount} ج
                    </span>
                    <button
                      onClick={() => handleDelete(flow._id)}
                      className="p-2 sm:p-2.5 sm:bg-white dark:sm:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg sm:rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 shadow-sm transition-all sm:opacity-0 sm:group-hover:opacity-100 border border-slate-100 dark:border-slate-700"
                      title="إلغاء واسترجاع للدرج"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* شريط الإجراء العائم (Sticky Footer) للموبايل - زر فقط */}
        <div className="lg:hidden sticky bottom-4 mx-auto w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-[90] transition-colors mt-4">
          <button
            onClick={() => setIsMobileModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-black active:scale-95 transition-all shadow-md shadow-rose-500/20 dark:shadow-none"
          >
            <Plus className="w-5 h-5" /> تسجيل مصروف جديد
          </button>
        </div>

        {/* مودال الموبايل (React Portal) */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {isMobileModalOpen && (
              <div className="fixed inset-0 z-[9999] lg:hidden flex flex-col justify-end bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm p-0">
                <div className="absolute inset-0 z-0" onClick={() => setIsMobileModalOpen(false)}></div>
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="bg-white dark:bg-slate-900 w-full rounded-t-[32px] p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] relative z-10 border-t border-slate-200 dark:border-slate-800"
                >
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-black text-lg sm:text-xl text-slate-800 dark:text-white flex items-center gap-2">
                       <Wallet className="w-5 h-5 text-rose-500 dark:text-rose-400" /> خروج نقدي
                    </h3>
                    <button
                      onClick={() => setIsMobileModalOpen(false)}
                      className="p-1.5 sm:p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 border border-slate-100 dark:border-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar pr-1">
                    {renderForm()}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </div>
  );
};

export default ExpensesManager;