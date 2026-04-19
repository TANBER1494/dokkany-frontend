import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom'; // 👈 استيراد البورتال السحري
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Plus, Search, Receipt, FileText, Loader2, Camera, X, Building2, UserPlus, Edit3, Calendar, ArrowDownLeft, Image as ImageIcon, Phone, ArrowRight, AlertCircle, Banknote, Wallet, Trash2, Printer
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import { AuthContext } from '../../context/AuthContext';
import vendorService from '../../services/vendorService';
import vendorInvoiceService from '../../services/vendorInvoiceService';
import cashFlowService from '../../services/cashFlowService';

const VendorsManager = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [vendors, setVendors] = useState([]);
  const [totalDebt, setTotalDebt] = useState(0); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isFetching, setIsFetching] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); 
  const [isStatementPanelOpen, setIsStatementPanelOpen] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [statementData, setStatementData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formMode, setFormMode] = useState('ADD');
  const [invoiceFormMode, setInvoiceFormMode] = useState('ADD'); 
  const [editingInvoiceId, setEditingInvoiceId] = useState(null); 

  const [maxPaymentLimit, setMaxPaymentLimit] = useState(0);

  const [vendorForm, setVendorForm] = useState({ name: '', company_name: '', phone: '' });
  
  const [invoiceData, setInvoiceData] = useState({
    total_amount: '',
    paid_amount: '', 
    invoice_number: '',
    notes: '',
    image: null,
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    notes: '',
  });

  const fetchVendors = async () => {
    try {
      setIsFetching(true);
      const data = await vendorService.getVendors(user.branch_id);
      const vendorsArray = data.vendors ? data.vendors : Array.isArray(data) ? data : [];
      setVendors(vendorsArray);
      setTotalDebt(data.total_debt || 0);
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user) fetchVendors();
  }, [user]);

  const handleViewStatement = async (vendor) => {
    try {
      setSelectedVendor(vendor);
      setIsLoading(true);
      setIsStatementPanelOpen(true);
      const data = await vendorInvoiceService.getVendorStatement(user.branch_id, vendor._id);
      setStatementData(data);
    } catch (error) {
      showAlert.error('خطأ', error.message);
      setIsStatementPanelOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPayment = async (vendor) => {
    try {
      setSelectedVendor(vendor);
      setIsLoading(true);
      const data = await vendorInvoiceService.getVendorStatement(user.branch_id, vendor._id);
      const currentDebt = data.vendor_info.total_due;

      if (currentDebt <= 0) {
        showAlert.success('تنبيه مالي', 'هذا المورد ليس له أي مديونيات مستحقة لسدادها.');
        setIsLoading(false);
        return;
      }

      setMaxPaymentLimit(currentDebt);
      setPaymentData({ amount: '', notes: '' });
      setIsPaymentModalOpen(true);
    } catch (error) {
      showAlert.error('خطأ', 'تعذر التحقق من مديونية المورد');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (vendor) => {
    setSelectedVendor(vendor);
    setVendorForm({ name: vendor.name, company_name: vendor.company_name, phone: vendor.phone });
    setFormMode('EDIT');
    setIsFormOpen(true);
  };

  const handleDeleteVendor = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف المورد (${name})؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    try {
      setIsLoading(true);
      await vendorService.deleteVendor(id);
      showAlert.success('تم الحذف', 'تم إزالة المورد بنجاح');
      fetchVendors();
    } catch (error) {
      showAlert.error('فشل الحذف', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!vendorForm.name || !vendorForm.phone) return showAlert.error('تنبيه', 'الاسم والهاتف مطلوبان');
    try {
      setIsLoading(true);
      if (formMode === 'ADD') {
        await vendorService.addVendor({ ...vendorForm, branch_id: user.branch_id });
        showAlert.success('تم الحفظ', 'تم إضافة المورد بنجاح');
      } else {
        await vendorService.updateVendor(selectedVendor._id, vendorForm);
        showAlert.success('تم التحديث', 'تم تعديل بيانات المورد');
      }
      setIsFormOpen(false);
      fetchVendors();
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddInvoiceModal = (vendor) => {
    setSelectedVendor(vendor);
    setInvoiceData({ total_amount: '', paid_amount: '', invoice_number: '', notes: '', image: null });
    setInvoiceFormMode('ADD');
    setEditingInvoiceId(null);
    setIsInvoiceModalOpen(true);
  };

  const openEditInvoiceModal = (trx) => {
    setInvoiceData({
      total_amount: trx.amount || '',
      paid_amount: trx.paid_at_time || '',
      invoice_number: trx.reference || '',
      notes: trx.notes || '',
      image: null
    });
    setInvoiceFormMode('EDIT');
    setEditingInvoiceId(trx.id);
    setIsInvoiceModalOpen(true);
    setIsStatementPanelOpen(false); 
  };

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('branch_id', user.branch_id);
    formData.append('vendor_id', selectedVendor._id);
    formData.append('total_amount', invoiceData.total_amount);
    formData.append('paid_amount', invoiceData.paid_amount || 0); 
    formData.append('invoice_number', invoiceData.invoice_number);
    formData.append('notes', invoiceData.notes);
    if (invoiceData.image) formData.append('invoice_image', invoiceData.image);

    try {
      setIsLoading(true);
      if (invoiceFormMode === 'ADD') {
        await vendorInvoiceService.addInvoice(formData);
        showAlert.success('تم التسجيل', Number(invoiceData.paid_amount) > 0 ? 'تم تسجيل الفاتورة وخصم الدفعة من الدرج' : 'تم تسجيل الفاتورة كمديونية آجلة');
      } else {
        await vendorInvoiceService.updateInvoice(editingInvoiceId, formData);
        showAlert.success('تم التعديل', 'تم تحديث بيانات الفاتورة والحسابات المرتبطة بنجاح');
      }
      
      setIsInvoiceModalOpen(false);
      setInvoiceData({ total_amount: '', paid_amount: '', invoice_number: '', notes: '', image: null });
      fetchVendors();

      if (isStatementPanelOpen && selectedVendor) {
        const data = await vendorInvoiceService.getVendorStatement(user.branch_id, selectedVendor._id);
        setStatementData(data);
      }
    } catch (error) {
      showAlert.error(invoiceFormMode === 'ADD' ? 'فشل التسجيل' : 'مرفوض إدارياً', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await cashFlowService.addCashFlow({
        type: 'VENDOR_PAYMENT',
        vendor_id: selectedVendor._id,
        amount: paymentData.amount,
        description: paymentData.notes || 'سداد دفعة نقدية من الحساب',
      });
      showAlert.success('تم التسجيل', 'تم خصم الدفعة من الدرج بنجاح وتسويتها في كشف حساب المورد');
      setIsPaymentModalOpen(false);
      setPaymentData({ amount: '', notes: '' });
      fetchVendors();
      if (isStatementPanelOpen && selectedVendor) {
        const data = await vendorInvoiceService.getVendorStatement(user.branch_id, selectedVendor._id);
        setStatementData(data);
      }
    } catch (error) {
      showAlert.error('فشل السداد', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    showAlert.error('تأكيد التراجع', 'هل أنت متأكد من مسح هذه الفاتورة؟ سيتم إلغاء تأثيرها المالي تماماً.').then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          await vendorInvoiceService.deleteInvoice(invoiceId);
          showAlert.success('تم بنجاح', 'تم التراجع عن الفاتورة ومسحها من السجلات.');
          
          fetchVendors();
          if (isStatementPanelOpen && selectedVendor) {
            const data = await vendorInvoiceService.getVendorStatement(user.branch_id, selectedVendor._id);
            setStatementData(data);
          }
        } catch (error) {
          showAlert.error('مرفوض إدارياً', error.message);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredVendors = vendors.filter((v) => v.name.includes(searchTerm) || v.company_name?.includes(searchTerm));

  const paymentAmountNum = Number(paymentData.amount) || 0;
  const isPaymentOverLimit = paymentAmountNum > maxPaymentLimit;

  const invoiceTotalNum = Number(invoiceData.total_amount) || 0;
  const invoicePaidNum = Number(invoiceData.paid_amount) || 0;
  const isInvoiceOverpaid = invoiceTotalNum > 0 && invoicePaidNum > invoiceTotalNum;

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5 pb-20 transition-colors duration-300">
      
      <div>
        <button onClick={() => navigate('/cashier')} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95 w-fit text-sm">
          <ArrowRight className="w-4 h-4" /> رجوع للرئيسية
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
          <input type="text" placeholder="ابحث عن شركة أو مندوب..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-11 pl-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none text-sm font-bold focus:border-blue-400 dark:focus:border-blue-500 transition-all shadow-sm" />
        </div>
        <button onClick={() => { setFormMode('ADD'); setVendorForm({ name: '', company_name: '', phone: '' }); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-5 py-3.5 rounded-2xl shadow-lg shadow-blue-500/30 dark:shadow-none active:scale-95 transition-all flex items-center justify-center shrink-0">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {!isFetching && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-4 sm:p-5 rounded-2xl flex justify-between items-center shadow-sm shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-200 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl shadow-inner hidden sm:block">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-extrabold text-rose-600 dark:text-rose-400 mb-0.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> إجمالي الديون المستحقة للموردين والشركات
              </p>
              <h4 className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-300 tracking-tight">
                {totalDebt.toLocaleString()} <span className="text-sm font-bold opacity-80">ج.م</span>
              </h4>
            </div>
          </div>
        </motion.div>
      )}

      {isFetching ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 dark:text-blue-400 w-10 h-10" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVendors.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-20 opacity-70">
              <Building2 className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-base font-bold">لا يوجد موردين أو لا يوجد تطابق</p>
            </div>
          )}
          {filteredVendors.map((vendor) => (
            <div key={vendor._id} className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col relative hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/50 transition-all duration-300">
              
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <button onClick={() => handleOpenEdit(vendor)} className="p-1.5 sm:p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-all shadow-sm" title="تعديل المورد">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteVendor(vendor._id, vendor.name)} className="p-1.5 sm:p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 transition-all shadow-sm" title="حذف المورد">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-1 pr-1">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded-xl shadow-md shadow-blue-500/20 shrink-0">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="overflow-hidden pr-2">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base truncate">{vendor.name}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5 truncate">{vendor.company_name || 'بدون شركة'}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 mb-4 flex justify-between items-center border border-slate-100 dark:border-slate-700 transition-colors">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المستحق للمورد</span>
                <span className={`text-base sm:text-lg font-black ${vendor.total_due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {vendor.total_due.toLocaleString()} ج
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-auto">
                <button onClick={() => openAddInvoiceModal(vendor)} className="py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold text-[10px] sm:text-[11px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all active:scale-95 border border-blue-100 dark:border-blue-500/20">
                  <Receipt className="w-3.5 h-3.5" /> <span>فاتورة</span>
                </button>
                <button disabled={isLoading} onClick={() => handleOpenPayment(vendor)} className="py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] sm:text-[11px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait border border-emerald-100 dark:border-emerald-500/20">
                  <Banknote className="w-3.5 h-3.5" /> <span>سداد</span>
                </button>
                <button onClick={() => handleViewStatement(vendor)} className="py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-[10px] sm:text-[11px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 hover:bg-slate-900 dark:hover:bg-slate-600 transition-all active:scale-95 border border-slate-700 dark:border-slate-600">
                  <FileText className="w-3.5 h-3.5" /> <span>الكشف</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================== */}
      {/* 🧾 مودال 1: تسجيل / تعديل فاتورة (React Portal) */}
      {/* ========================================== */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isInvoiceModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-8 sm:pt-16 px-4 pb-6 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
              <div className="absolute inset-0 z-0" onClick={() => setIsInvoiceModalOpen(false)}></div>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: -20 }} className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-sm p-5 sm:p-6 shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-slate-800 dark:text-white flex items-center gap-2">
                      <Receipt className="text-blue-500 dark:text-blue-400 w-5 h-5" /> 
                      {invoiceFormMode === 'ADD' ? 'تسجيل بضاعة' : 'تعديل الفاتورة'}
                    </h3>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">المورد: {selectedVendor?.name}</p>
                  </div>
                  <button onClick={() => setIsInvoiceModalOpen(false)} className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 sm:p-2 rounded-xl transition-colors"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                </div>
                <form onSubmit={handleSubmitInvoice} className="space-y-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الفاتورة (جنيه)</label>
                    <input type="number" placeholder="0.00" dir="ltr" value={invoiceData.total_amount} onChange={(e) => setInvoiceData({ ...invoiceData, total_amount: e.target.value })} className="w-full py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center text-xl sm:text-2xl font-black text-slate-800 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all" />
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <label className="text-[11px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5"/> مدفوع من الدرج الآن</span>
                      {isInvoiceOverpaid && <span className="text-rose-500 dark:text-rose-400 text-[9px] bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-500/20">مبلغ خاطئ!</span>}
                    </label>
                    <input type="number" placeholder="اتركه فارغاً للآجل" dir="ltr" value={invoiceData.paid_amount} onChange={(e) => setInvoiceData({ ...invoiceData, paid_amount: e.target.value })} className={`w-full py-3 sm:py-3.5 rounded-xl border text-center text-lg sm:text-xl font-black outline-none transition-all placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-bold ${isInvoiceOverpaid ? 'border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 focus:border-rose-500 placeholder:text-rose-300 dark:placeholder:text-rose-500/30' : 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 focus:border-emerald-400 placeholder:text-emerald-300 dark:placeholder:text-emerald-500/30'}`} />
                    {isInvoiceOverpaid && (
                      <p className="text-[10px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3"/> لا يمكن دفع مبلغ أكبر من إجمالي الفاتورة!</p>
                    )}
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">رقم الفاتورة الورقية (اختياري)</label>
                    <input type="text" placeholder="مثال: #100234" dir="ltr" value={invoiceData.invoice_number} onChange={(e) => setInvoiceData({ ...invoiceData, invoice_number: e.target.value })} className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-left" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">ملاحظات الفاتورة (اختياري)</label>
                    <input type="text" placeholder="مثال: خصم خاص، بضاعة تالفة..." value={invoiceData.notes} onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })} className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all" />
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer relative mt-2">
                    <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400 dark:text-blue-500" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{invoiceFormMode === 'ADD' ? 'تصوير الفاتورة الورقية' : 'تحديث صورة الفاتورة'}</p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">اضغط لفتح الكاميرا</p>
                    </div>
                    <input type="file" accept="image/*" capture="environment" onChange={(e) => setInvoiceData({ ...invoiceData, image: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>

                  <button type="submit" disabled={isLoading || isInvoiceOverpaid || !invoiceData.total_amount} className={`w-full py-3.5 sm:py-4 mt-2 text-white font-black rounded-xl shadow-md active:scale-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 ${isInvoiceOverpaid ? 'bg-slate-400 dark:bg-slate-700 shadow-none cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-blue-500/20 dark:shadow-none'}`}>
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : invoiceFormMode === 'ADD' ? <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> : <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />}
                    {invoiceFormMode === 'ADD' ? 'اعتماد الفاتورة' : 'حفظ التعديلات'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================== */}
      {/* 💵 مودال 2: سداد منفصل (React Portal) */}
      {/* ========================================== */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isPaymentModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 sm:pt-16 px-4 pb-6 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
              <div className="absolute inset-0 z-0" onClick={() => setIsPaymentModalOpen(false)}></div>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: -20 }} className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-sm p-5 sm:p-6 shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><Banknote className="w-5 h-5" /> سداد دفعة</h3>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">المورد: {selectedVendor?.name}</p>
                  </div>
                  <button onClick={() => setIsPaymentModalOpen(false)} className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 sm:p-2 rounded-xl transition-colors"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                </div>
                <form onSubmit={handleRecordPayment} className="space-y-4">
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                       <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">المبلغ المُسدد من الدرج</label>
                       <span className="text-[9px] font-black text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-500/20">المستحق: {maxPaymentLimit.toLocaleString()} ج</span>
                    </div>
                    <input type="number" placeholder="0" dir="ltr" value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })} className={`w-full py-3.5 rounded-xl border text-center text-2xl sm:text-3xl font-black outline-none transition-all ${isPaymentOverLimit ? 'border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 focus:border-rose-500' : 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 focus:border-emerald-400 dark:focus:border-emerald-500'}`} />
                    
                    {isPaymentOverLimit && (
                      <p className="text-[10px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> لا يمكن سداد مبلغ أكبر من المديونية!
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">بيان (اختياري)</label>
                    <input type="text" placeholder="مثال: دفعة من حساب قديم..." value={paymentData.notes} onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })} className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors" />
                  </div>

                  <button type="submit" disabled={isLoading || isPaymentOverLimit || paymentAmountNum <= 0} className={`w-full py-3.5 sm:py-4 mt-2 text-white font-black rounded-xl shadow-md active:scale-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 ${isPaymentOverLimit || paymentAmountNum <= 0 ? 'bg-slate-400 dark:bg-slate-700 shadow-none cursor-not-allowed text-slate-200 dark:text-slate-500' : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-emerald-500/20 dark:shadow-none'}`}>
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />}
                    سحب المبلغ من الدرج
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================== */}
      {/* 📑 مودال 3: كشف الحساب (React Portal) */}
      {/* ========================================== */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isStatementPanelOpen && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-8 sm:pt-12 px-4 pb-6 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm print:p-0 print:bg-white print:block overflow-hidden">
              <div className="absolute inset-0 z-0 hide-on-print" onClick={() => setIsStatementPanelOpen(false)}></div>
              
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

              <motion.div initial={{ scale: 0.95, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: -20 }} className="printable-document relative bg-white dark:bg-slate-900 w-full max-w-2xl flex flex-col shadow-2xl rounded-[24px] sm:rounded-[32px] max-h-[85vh] border border-slate-100 dark:border-slate-800 z-10 overflow-hidden print:max-h-none print:border-none">
                
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0 hide-on-print">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">كشف حساب المورد</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-xs mt-0.5">{statementData?.vendor_info.company} ({statementData?.vendor_info.name})</p>
                  </div>
                  <button onClick={() => setIsStatementPanelOpen(false)} className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar print:overflow-visible">
                   {isLoading ? (
                      <div className="flex justify-center items-center py-20 hide-on-print"><Loader2 className="w-8 h-8 animate-spin text-blue-500 dark:text-blue-400" /></div>
                   ) : (
                     <div className="p-4 sm:p-6">
                       
                       <div className="text-center pb-5 sm:pb-6 mb-5 sm:mb-6 border-b border-slate-100 dark:border-slate-800 border-dashed">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-slate-500 hide-on-print">
                            <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1 print-text-black">{statementData?.vendor_info.company || 'لا توجد شركة'}</h2>
                          <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 print-text-black">السيد/ {statementData?.vendor_info.name}</p>
                          
                          <div className="inline-block bg-rose-50 dark:bg-rose-500/10 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border border-rose-100 dark:border-rose-500/20 print:border-2 print:border-gray-800 print:bg-white">
                            <p className="text-[10px] sm:text-xs font-bold text-rose-500 dark:text-rose-400 mb-0.5 sm:mb-1 uppercase tracking-wider print-text-black">إجمالي المديونية المستحقة (للمورد)</p>
                            <h4 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 print-text-black">
                              {statementData?.vendor_info.total_due.toLocaleString()} <span className="text-sm text-rose-500 dark:text-rose-400 opacity-80 print-text-black">ج.م</span>
                            </h4>
                          </div>
                       </div>

                       <div>
                         <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center justify-between print-text-black">
                            التسلسل الزمني
                            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 print:border print:border-gray-300 print-text-black">{statementData?.history.length} عملية</span>
                         </h4>
                         
                         {statementData?.history.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-bold bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 print-text-black">لا توجد حركات مسجلة.</div>
                          ) : (
                            <div className="space-y-2.5 sm:space-y-3 print:space-y-0">
                              {statementData?.history.map((trx, idx) => (
                                <div key={idx} className="print-row flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-[16px] sm:rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors print:p-2 print:rounded-none print:border-x-0 print:border-t-0">
                                  <div className={`p-2.5 rounded-xl shrink-0 hide-on-print ${trx.type === 'INVOICE' ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                                    {trx.type === 'INVOICE' ? <Receipt className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                                  </div>
                                  <div className="flex-1 w-full">
                                    <h5 className="font-black text-slate-800 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 print-text-black">
                                      {trx.type === 'INVOICE' ? `فاتورة بضاعة ${trx.reference ? `#${trx.reference}` : ''}` : 'سداد نقدي من الدرج'}
                                      {trx.type === 'INVOICE' && trx.paid_at_time > 0 && (
                                        <span className="hide-on-print bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-black">دفع جزئي</span>
                                      )}
                                    </h5>
                                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 flex items-center gap-1.5 print-text-black">
                                      <Calendar className="w-3 h-3 hide-on-print text-slate-400 dark:text-slate-500" /> {new Date(trx.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                      <span className="text-slate-300 dark:text-slate-600 hide-on-print">•</span>
                                      <span>{new Date(trx.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </p>
                                    {trx.type === 'INVOICE' && trx.paid_at_time > 0 && (
                                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-50 dark:bg-slate-900/50 inline-block px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700 print:bg-white print:border-dashed print-text-black">
                                        إجمالي: {trx.amount} | <span className="text-emerald-600 dark:text-emerald-400 print-text-black">دفع وقت الاستلام: {trx.paid_at_time}</span> | <span className="text-rose-500 dark:text-rose-400 print-text-black">باقي: {trx.remaining}</span>
                                      </p>
                                    )}
                                    {trx.notes && (
                                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-50 dark:bg-slate-900/50 inline-block px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700 print:bg-white print:border-dashed print-text-black">
                                        {trx.notes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-left w-full sm:w-auto flex justify-between sm:flex-col items-center sm:items-end mt-1.5 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-700 print:border-0">
                                    <span className={`font-black text-sm sm:text-lg print-text-black ${trx.type === 'INVOICE' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                      {trx.type === 'INVOICE' ? '+' : '-'} {(trx.type === 'INVOICE' ? trx.remaining : trx.amount).toLocaleString()} ج
                                    </span>
                                    {trx.image && (
                                      <a href={trx.image} target="_blank" rel="noreferrer" className="hide-on-print text-[9px] text-blue-600 dark:text-blue-400 hover:underline font-bold mt-1 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded w-fit">
                                        عرض المرفق 📎
                                      </a>
                                    )}

                                    {trx.type === 'INVOICE' && (
                                      <div className="flex items-center gap-1.5 mt-2 sm:mt-1 hide-on-print">
                                        <button 
                                          onClick={() => openEditInvoiceModal(trx)}
                                          className="text-[9px] sm:text-[10px] text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 font-bold bg-white dark:bg-slate-800 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                                        >
                                          <Edit3 className="w-3 h-3" /> تعديل
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteInvoice(trx.id)}
                                          className="text-[9px] sm:text-[10px] text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/30 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 font-bold bg-white dark:bg-slate-800 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                                        >
                                          <Trash2 className="w-3 h-3" /> مسح
                                        </button>
                                      </div>
                                    )}
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
                  <button onClick={() => setIsStatementPanelOpen(false)} className="flex-1 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-black rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm">
                    <ArrowRight className="w-4 h-4" /> إغلاق
                  </button>
                  <button onClick={handlePrint} disabled={!statementData} className="flex-1 py-3 bg-blue-600 dark:bg-blue-500 text-white font-black rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 dark:shadow-none disabled:opacity-50">
                    <Printer className="w-4 h-4" /> طباعة الكشف
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================== */}
      {/* 👤 مودال 4: إضافة/تعديل بيانات مورد (React Portal) */}
      {/* ========================================== */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 sm:pt-16 px-4 pb-6 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
              <div className="absolute inset-0 z-0" onClick={() => setIsFormOpen(false)}></div>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: -20 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] flex flex-col shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-500 dark:text-blue-400" /> {formMode === 'ADD' ? 'إضافة مورد جديد' : 'تعديل بيانات المورد'}
                  </h3>
                  <button onClick={() => setIsFormOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 pr-1">اسم المندوب</label>
                    <input type="text" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-sm font-bold text-slate-800 dark:text-white focus:border-blue-400 dark:focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 pr-1">اسم الشركة (اختياري)</label>
                    <input type="text" value={vendorForm.company_name} onChange={(e) => setVendorForm({ ...vendorForm, company_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-sm font-bold text-slate-800 dark:text-white focus:border-blue-400 dark:focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 pr-1">رقم الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input type="tel" dir="ltr" value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-sm font-bold text-slate-800 dark:text-white focus:border-blue-400 dark:focus:border-blue-500 text-left transition-colors" />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-black rounded-xl shadow-md active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : formMode === 'ADD' ? <UserPlus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    {formMode === 'ADD' ? 'حفظ المورد الجديد' : 'تحديث البيانات'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default VendorsManager;