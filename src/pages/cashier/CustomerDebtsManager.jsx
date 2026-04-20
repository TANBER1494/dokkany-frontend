import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom'; // 👈 استيراد البورتال لحل مشكلة المودال
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  UserPlus,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  X,
  Wallet,
  BookOpen,
  Calendar,
  DollarSign,
  ArrowRight,
  AlertCircle,
  Edit3,
  Trash2,
  Printer,
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import { AuthContext } from '../../context/AuthContext';
import customerDebtService from '../../services/customerDebtService';

const CustomerDebtsManager = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('ADD');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isStatementPanelOpen, setIsStatementPanelOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [statementData, setStatementData] = useState(null);

  // Forms
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    initial_amount: '',
    notes: '',
  });
  const [transactionData, setTransactionData] = useState({
    type: 'CREDIT',
    amount: '',
    notes: '',
  }); // CREDIT = شكك, PAYMENT = سداد

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customerDebtService.getCustomers();
      const customersArray = data.customers
        ? data.customers
        : Array.isArray(data)
          ? data
          : [];
      setCustomers(customersArray);
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const totalMarketDebt = customers.reduce(
    (sum, c) => sum + (c.net_debt || 0),
    0
  );

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!customerForm.name) return showAlert.error('تنبيه', 'الاسم مطلوب');

    try {
      setIsSubmitting(true);
      if (formMode === 'ADD') {
        if (!customerForm.initial_amount)
          return showAlert.error('تنبيه', 'أول مبلغ دين مطلوب');
        await customerDebtService.addCustomerWithDebt(customerForm);
        showAlert.success('تم بنجاح', 'تم فتح حساب الزبون وتسجيل أول دين');
      } else {
        await customerDebtService.updateCustomer(
          selectedCustomer._id,
          customerForm
        );
        showAlert.success('تم التحديث', 'تم تعديل بيانات الزبون بنجاح');
      }
      setIsFormOpen(false);
      fetchCustomers();
    } catch (error) {
      showAlert.error('فشل العملية', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({
      name: customer.name,
      phone: customer.phone || '',
      initial_amount: '',
      notes: '',
    });
    setFormMode('EDIT');
    setIsFormOpen(true);
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من إغلاق وحذف حساب الزبون (${name})؟`))
      return;
    try {
      setIsLoading(true);
      // 🚀 تم تنظيف الكود ليعمل بشكل مباشر
      await customerDebtService.deleteCustomer(id);
      showAlert.success('تم الحذف', 'تم مسح الزبون من الدفتر');
      fetchCustomers();
    } catch (error) {
      showAlert.error('خطأ', error.message);
      setIsLoading(false);
    }
  };

  const handleRecordTransaction = async (e) => {
    e.preventDefault();
    if (!transactionData.amount)
      return showAlert.error('تنبيه', 'يجب إدخال المبلغ');

    try {
      setIsSubmitting(true);
      await customerDebtService.recordTransaction({
        customer_id: selectedCustomer._id,
        type: transactionData.type,
        amount: transactionData.amount,
        notes: transactionData.notes,
      });

      showAlert.success(
        'تم التسجيل',
        transactionData.type === 'CREDIT'
          ? 'تمت الإضافة لحساب الزبون'
          : 'تم استلام المبلغ ودخوله الدرج'
      );
      setIsTransactionModalOpen(false);
      setTransactionData({ type: 'CREDIT', amount: '', notes: '' });
      fetchCustomers();
    } catch (error) {
      showAlert.error('فشل التسجيل', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewStatement = async (customer) => {
    try {
      setSelectedCustomer(customer);
      setIsSubmitting(true);
      const data = await customerDebtService.getCustomerStatement(customer._id);
      setStatementData(data);
      setIsStatementPanelOpen(true);
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => window.print();

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.includes(searchTerm) || (c.phone && c.phone.includes(searchTerm))
  );

  const paymentAmountNum = Number(transactionData.amount) || 0;
  const maxPaymentLimit = selectedCustomer?.net_debt || 0;
  const isPaymentOverLimit =
    transactionData.type === 'PAYMENT' && paymentAmountNum > maxPaymentLimit;

  return (
    <div className="w-full flex flex-col gap-5 pb-20 transition-colors duration-300">
      {/* هيدر التوجيه */}
      <div>
        <button
          onClick={() => navigate('/cashier')}
          className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95 w-fit text-sm"
        >
          <ArrowRight className="w-4 h-4" /> رجوع للرئيسية
        </button>
      </div>

      {/* البحث والإضافة */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث باسم الزبون أو رقمه..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-11 pl-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none text-sm font-bold focus:border-indigo-400 dark:focus:border-indigo-500 shadow-sm transition-all"
          />
        </div>
        <button
          onClick={() => {
            setFormMode('ADD');
            setCustomerForm({
              name: '',
              phone: '',
              initial_amount: '',
              notes: '',
            });
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/30 dark:shadow-none active:scale-95 transition-all flex items-center justify-center shrink-0"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* 💰 كارت إجمالي أموال المحل بالخارج */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-4 sm:p-5 rounded-2xl flex justify-between items-center shadow-sm shrink-0 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-200 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-xl shadow-inner hidden sm:block">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mb-0.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> إجمالي ديون الزبائن
                (أموال المحل بالخارج)
              </p>
              <h4 className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">
                {totalMarketDebt.toLocaleString()}{' '}
                <span className="text-sm font-bold opacity-80">ج.م</span>
              </h4>
            </div>
          </div>
        </motion.div>
      )}

      {/* 📓 شبكة الزبائن (الكشكول) */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500 dark:text-indigo-400 w-10 h-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-20 opacity-70">
              <BookOpen className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-base font-bold">
                دفتر الزباين فارغ أو لا يوجد تطابق
              </p>
            </div>
          )}
          {filteredCustomers.map((customer) => (
            <div
              key={customer._id}
              className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col relative hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(customer)}
                  className="p-1.5 sm:p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-all shadow-sm"
                  title="تعديل الزبون"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    handleDeleteCustomer(customer._id, customer.name)
                  }
                  className="p-1.5 sm:p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-sm"
                  title="حذف الزبون"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-1 pr-1">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-xl shadow-md shadow-indigo-500/20 shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="overflow-hidden pr-2">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base truncate">
                    {customer.name}
                  </h3>
                  <p
                    className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5 truncate"
                    dir="ltr"
                  >
                    {customer.phone || 'بدون رقم'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 mb-4 flex justify-between items-center border border-slate-100 dark:border-slate-700 transition-colors">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                  مديونية الزبون الحالية
                </span>
                <span
                  className={`text-base sm:text-lg font-black ${customer.net_debt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                >
                  {customer.net_debt.toLocaleString()} ج
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <button
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setTransactionData({
                      type: 'CREDIT',
                      amount: '',
                      notes: '',
                    });
                    setIsTransactionModalOpen(true);
                  }}
                  className="py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold text-[10px] sm:text-[11px] flex items-center justify-center gap-1.5 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all active:scale-95 border border-indigo-100 dark:border-indigo-500/20"
                >
                  <Wallet className="w-3.5 h-3.5" /> تسجيل عملية
                </button>
                <button
                  onClick={() => handleViewStatement(customer)}
                  className="py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-[10px] sm:text-[11px] flex items-center justify-center gap-1.5 hover:bg-slate-900 dark:hover:bg-slate-600 transition-all active:scale-95 border border-slate-700 dark:border-slate-600"
                >
                  <FileText className="w-3.5 h-3.5" /> كشف حساب
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================== */}
      {/* 🆕 مودال: فتح/تعديل حساب زبون (React Portal) */}
      {/* ========================================== */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isFormOpen && (
              <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4">
                <div
                  className="absolute inset-0 z-0"
                  onClick={() => setIsFormOpen(false)}
                ></div>
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="bg-white dark:bg-slate-900 w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl relative z-10 border-t sm:border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                      <UserPlus className="text-indigo-500 dark:text-indigo-400 w-4 h-4" />{' '}
                      {formMode === 'ADD'
                        ? 'فتح دفتر جديد'
                        : 'تعديل بيانات زبون'}
                    </h3>
                    <button
                      onClick={() => setIsFormOpen(false)}
                      className="p-1.5 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form
                    onSubmit={handleSubmitForm}
                    className="p-5 sm:p-6 space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        اسم الزبون
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: أحمد علي"
                        value={customerForm.name}
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-400 dark:focus:border-indigo-500 font-bold text-sm transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        رقم الهاتف (اختياري)
                      </label>
                      <input
                        type="tel"
                        placeholder="01xxxxxxxxx"
                        dir="ltr"
                        value={customerForm.phone}
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-400 dark:focus:border-indigo-500 font-bold text-sm text-left transition-colors"
                      />
                    </div>
                    {formMode === 'ADD' && (
                      <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                        <label className="text-[11px] font-bold text-rose-500 dark:text-rose-400">
                          قيمة أول سحبة (بضاعة شكك)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          dir="ltr"
                          value={customerForm.initial_amount}
                          onChange={(e) =>
                            setCustomerForm({
                              ...customerForm,
                              initial_amount: e.target.value,
                            })
                          }
                          className="w-full py-3 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 outline-none focus:border-rose-400 dark:focus:border-rose-500 font-black text-rose-600 dark:text-rose-400 text-lg text-center transition-colors"
                        />
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-black rounded-xl shadow-md active:scale-95 flex justify-center items-center gap-2 text-sm transition-all"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : formMode === 'ADD' ? (
                        'إنشاء وتسجيل الدين'
                      ) : (
                        'حفظ التعديلات'
                      )}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* ========================================== */}
      {/* 💸 مودال: تسجيل حركة (React Portal) */}
      {/* ========================================== */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isTransactionModalOpen && (
              <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4">
                <div
                  className="absolute inset-0 z-0"
                  onClick={() => setIsTransactionModalOpen(false)}
                ></div>
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="bg-white dark:bg-slate-900 w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl relative z-10 border-t sm:border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="font-black text-lg text-slate-800 dark:text-white">
                        تسجيل حركة{' '}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        الزبون: {selectedCustomer?.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsTransactionModalOpen(false)}
                      className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl mb-5 transition-colors">
                    <button
                      type="button"
                      onClick={() =>
                        setTransactionData({
                          ...transactionData,
                          type: 'CREDIT',
                          amount: '',
                        })
                      }
                      className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${transactionData.type === 'CREDIT' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/50 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      سحب بضاعة (دين)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTransactionData({
                          ...transactionData,
                          type: 'PAYMENT',
                          amount: '',
                        })
                      }
                      className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${transactionData.type === 'PAYMENT' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      سداد كاش (للدرج)
                    </button>
                  </div>

                  <form
                    onSubmit={handleRecordTransaction}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          المبلغ (جنيه)
                        </label>
                        {transactionData.type === 'PAYMENT' && (
                          <span className="text-[9px] font-black text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-500/20">
                            المطلوب: {maxPaymentLimit.toLocaleString()} ج
                          </span>
                        )}
                      </div>

                      <input
                        type="number"
                        placeholder="0"
                        dir="ltr"
                        value={transactionData.amount}
                        onChange={(e) =>
                          setTransactionData({
                            ...transactionData,
                            amount: e.target.value,
                          })
                        }
                        className={`w-full p-3.5 rounded-xl border text-center text-2xl font-black outline-none transition-all 
                        ${
                          transactionData.type === 'CREDIT'
                            ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 focus:border-rose-400 dark:focus:border-rose-500'
                            : isPaymentOverLimit
                              ? 'border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 focus:border-rose-500'
                              : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 focus:border-emerald-400 dark:focus:border-emerald-500'
                        }`}
                      />

                      {isPaymentOverLimit && (
                        <p className="text-[10px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" /> عذراً، سداد أكبر
                          من المديونية!
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        البيان
                      </label>
                      <input
                        type="text"
                        placeholder={
                          transactionData.type === 'CREDIT'
                            ? 'مثال: كرتونة زيت...'
                            : 'سداد دفعة...'
                        }
                        value={transactionData.notes}
                        onChange={(e) =>
                          setTransactionData({
                            ...transactionData,
                            notes: e.target.value,
                          })
                        }
                        className="w-full py-3 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-400 dark:focus:border-indigo-500 font-bold text-xs transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        isPaymentOverLimit ||
                        paymentAmountNum <= 0
                      }
                      className={`w-full mt-2 py-3.5 text-white font-black rounded-xl shadow-md active:scale-95 flex justify-center items-center gap-2 text-sm transition-all 
                      ${
                        isPaymentOverLimit || paymentAmountNum <= 0
                          ? 'bg-slate-400 dark:bg-slate-700 shadow-none cursor-not-allowed text-slate-200 dark:text-slate-500'
                          : transactionData.type === 'CREDIT'
                            ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 shadow-rose-500/20 dark:shadow-none'
                            : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-emerald-500/20 dark:shadow-none'
                      }`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <Wallet className="w-4 h-4" />
                      )}
                      {transactionData.type === 'CREDIT'
                        ? 'إضافة الدين'
                        : 'تأكيد الدخول للدرج'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* ========================================== */}
      {/* 📑 كشف الحساب المركزي القابل للطباعة 🖨️ (React Portal) */}
      {/* ========================================== */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isStatementPanelOpen && (
              <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 print:p-0 print:bg-white print:block">
                <div
                  className="absolute inset-0 z-0 hide-on-print"
                  onClick={() => setIsStatementPanelOpen(false)}
                ></div>

                <style media="print">
                  {`
                  @page { size: A4 portrait; margin: 15mm; }
                  body, html { height: auto !important; overflow: visible !important; background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  body * { visibility: hidden; }
                  .printable-document, .printable-document * { visibility: visible; }
                  .printable-document {
                    position: absolute !important; left: 0 !important; top: 0 !important;
                    width: 100% !important; height: auto !important; margin: 0 !important; padding: 0 !important;
                    transform: none !important; box-shadow: none !important; border: none !important; border-radius: 0 !important;
                  }
                  .print-row { page-break-inside: avoid; border-bottom: 1px solid #e2e8f0 !important; }
                  .hide-on-print { display: none !important; }
                  .print-text-black { color: #000 !important; }
                `}
                </style>
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="printable-document bg-white dark:bg-slate-900 w-full sm:max-w-2xl flex flex-col shadow-2xl rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] sm:max-h-[85vh] relative z-10 border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden print:max-h-none print:border-none"
                >
                  <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0 hide-on-print">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                        كشف حساب الزبون
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-xs mt-0.5">
                        {statementData?.customer_info.name} -{' '}
                        {statementData?.customer_info.phone || 'بدون رقم'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsStatementPanelOpen(false)}
                      className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar print:overflow-visible">
                    {isSubmitting ? (
                      <div className="flex justify-center items-center py-20 hide-on-print">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 dark:text-indigo-400" />
                      </div>
                    ) : (
                      <div className="p-4 sm:p-6">
                        <div className="text-center pb-5 sm:pb-6 mb-5 sm:mb-6 border-b border-slate-100 dark:border-slate-800 border-dashed">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-slate-500 hide-on-print">
                            <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1 print-text-black">
                            {statementData?.customer_info.name}
                          </h2>
                          <p
                            className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 print-text-black"
                            dir="ltr"
                          >
                            {statementData?.customer_info.phone || 'بدون هاتف'}
                          </p>

                          <div className="inline-block bg-rose-50 dark:bg-rose-500/10 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border border-rose-100 dark:border-rose-500/20 print:border-2 print:border-gray-800 print:bg-white">
                            <p className="text-[10px] sm:text-xs font-bold text-rose-500 dark:text-rose-400 mb-0.5 sm:mb-1 uppercase tracking-wider print-text-black">
                              المديونية المستحقة (للمحل)
                            </p>
                            <h4 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 print-text-black">
                              {statementData?.customer_info.net_debt.toLocaleString()}{' '}
                              <span className="text-sm text-rose-500 dark:text-rose-400 opacity-80 print-text-black">
                                ج.م
                              </span>
                            </h4>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center justify-between print-text-black">
                            الخط الزمني للحركات
                            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 print:border print:border-gray-300 print-text-black">
                              {statementData?.history.length} عملية
                            </span>
                          </h4>

                          {statementData?.history.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-bold bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 print-text-black">
                              لا توجد حركات مسجلة.
                            </div>
                          ) : (
                            <div className="space-y-2.5 sm:space-y-3 print:space-y-0">
                              {statementData?.history.map((trx, idx) => (
                                <div
                                  key={idx}
                                  className="print-row flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-[16px] sm:rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors print:p-2 print:rounded-none print:border-x-0 print:border-t-0"
                                >
                                  <div
                                    className={`p-2.5 rounded-xl shrink-0 hide-on-print ${trx.type === 'CREDIT' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}
                                  >
                                    {trx.type === 'CREDIT' ? (
                                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                    ) : (
                                      <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                  </div>
                                  <div className="flex-1 w-full">
                                    <h5 className="font-black text-slate-800 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 print-text-black">
                                      {trx.type === 'CREDIT'
                                        ? 'سحب بضاعة (دين)'
                                        : 'سداد نقدي للكاشير'}
                                    </h5>
                                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 flex items-center gap-1.5 print-text-black">
                                      <Calendar className="w-3 h-3 hide-on-print text-slate-400 dark:text-slate-500" />{' '}
                                      {new Date(trx.date).toLocaleDateString(
                                        'ar-EG',
                                        {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                        }
                                      )}
                                      <span className="text-slate-300 dark:text-slate-600 hide-on-print">
                                        •
                                      </span>
                                      <span>
                                        {new Date(trx.date).toLocaleTimeString(
                                          'ar-EG',
                                          { hour: '2-digit', minute: '2-digit' }
                                        )}
                                      </span>
                                    </p>
                                    {trx.notes && (
                                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-50 dark:bg-slate-900/50 inline-block px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700 print:bg-white print:border-dashed print-text-black">
                                        {trx.notes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-left w-full sm:w-auto flex justify-between sm:flex-col items-center sm:items-end mt-1.5 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-700 print:border-0">
                                    <span
                                      className={`font-black text-sm sm:text-lg print-text-black ${trx.type === 'CREDIT' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                    >
                                      {trx.type === 'CREDIT' ? '+' : '-'}{' '}
                                      {trx.amount.toLocaleString()} ج
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="hide-on-print p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-2.5 shrink-0 transition-colors">
                    <button
                      onClick={() => setIsStatementPanelOpen(false)}
                      className="flex-1 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-black rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ArrowRight className="w-4 h-4" /> إغلاق
                    </button>
                    <button
                      onClick={handlePrint}
                      disabled={!statementData}
                      className="flex-1 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-black rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 dark:shadow-none disabled:opacity-50"
                    >
                      <Printer className="w-4 h-4" /> طباعة الكشف
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default CustomerDebtsManager;
