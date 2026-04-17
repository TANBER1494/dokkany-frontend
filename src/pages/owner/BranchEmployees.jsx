import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Phone,
  X,
  Loader2,
  UserCog,
  Trash2,
  DollarSign,
  Edit3,
  CheckCircle,
  Calculator,
  CalendarDays,
  Banknote,
  ShieldCheck,
  History,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import employeeService from '../../services/employeeService';
import payrollService from '../../services/payrollService';

const BranchEmployees = () => {
  const { branchId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    employee_title: 'CASHIER',
    daily_wage: '',
    pin_code: '',
    start_date: new Date().toISOString().split('T')[0],
  });
  const [editingId, setEditingId] = useState(null);

  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [selectedPayrollEmp, setSelectedPayrollEmp] = useState(null);
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [payrollData, setPayrollData] = useState(null);
  const [isPayrollLoading, setIsPayrollLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setIsFetching(true);
      const data = await employeeService.getEmployees(branchId);
      setEmployees(data.employees);
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (branchId) fetchEmployees();
  }, [branchId]);

  const openEditModal = (emp) => {
    setFormData({
      name: emp.name,
      phone: emp.phone,
      employee_title: emp.employee_title || 'FLOOR_WORKER',
      daily_wage: emp.daily_wage,
      status: emp.status,
      pin_code: '',
      start_date: emp.start_date ? emp.start_date.split('T')[0] : (emp.createdAt ? emp.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
    });
    setEditingId(emp._id);
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.name.length < 3)
      return showAlert.error('تنبيه', 'يرجى كتابة الاسم بشكل صحيح');
    if (!/^01[0125][0-9]{8}$/.test(formData.phone))
      return showAlert.error('تنبيه', 'رقم هاتف غير صحيح');
    if (formData.employee_title === 'CASHIER' && !/^\d{4}$/.test(formData.pin_code)) {
      return showAlert.error('تنبيه', 'يجب إدخال رمز PIN مكون من 4 أرقام للكاشير!');
    }

    try {
      setIsLoading(true);
      await employeeService.addEmployee({ ...formData, branch_id: branchId });
      showAlert.success('تمت الإضافة', 'تم إضافة الموظف بنجاح');
      setIsModalOpen(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      showAlert.error('فشل الإضافة', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (formData.employee_title === 'CASHIER' && formData.pin_code && !/^\d{4}$/.test(formData.pin_code)) {
      return showAlert.error('تنبيه', 'رمز الـ PIN يجب أن يكون 4 أرقام فقط!');
    }

    try {
      setIsLoading(true);
      await employeeService.updateEmployee(editingId, { ...formData, branch_id: branchId });
      showAlert.success('تم التحديث', 'تم تحديث بيانات الموظف بنجاح');
      setIsEditOpen(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      showAlert.error('فشل التحديث', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      employee_title: 'CASHIER',
      daily_wage: '',
      pin_code: '',
      start_date: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
  };

  const handleDelete = async (employeeId, employeeName) => {
    showAlert
      .error('تأكيد الإزالة', `هل أنت متأكد من إزالة (${employeeName})؟`)
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await employeeService.deleteEmployee(employeeId, branchId);
            showAlert.success('تمت الإزالة', 'تم إيقاف حساب الموظف');
            fetchEmployees();
          } catch (error) {
            showAlert.error('فشل الإزالة', error.message);
          }
        }
      });
  };

  const handleOpenPayroll = (emp) => {
    setSelectedPayrollEmp(emp);
    setPayrollData(null);
    setIsPayrollModalOpen(true);
    calculatePayroll(emp._id, payrollMonth, payrollYear);
  };

  const calculatePayroll = async (empId, month, year) => {
    try {
      setIsPayrollLoading(true);
      const data = await payrollService.getEmployeeSettlement(empId, month, year);
      setPayrollData(data);
    } catch (error) {
      showAlert.error('خطأ', error.message);
      setPayrollData(null);
    } finally {
      setIsPayrollLoading(false);
    }
  };

  useEffect(() => {
    if (isPayrollModalOpen && selectedPayrollEmp) {
      calculatePayroll(selectedPayrollEmp._id, payrollMonth, payrollYear);
    }
  }, [payrollMonth, payrollYear]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-5 rounded-[24px] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
            فريق العمل
          </h2>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
            إدارة العمال، الكاشيرية، ومحاسبة الرواتب
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold shadow-md shadow-indigo-500/20 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all text-sm"
        >
          <UserPlus className="w-4 h-4" /> إضافة موظف جديد
        </button>
      </div>

      {isFetching ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[24px] bg-white dark:bg-slate-800/50 text-center p-12 transition-colors">
          <UserCog className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">
            لا يوجد عمال مسجلين حالياً
          </h3>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 sm:p-5 rounded-[24px] shadow-sm hover:shadow-md dark:hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
            >
              <div className={`absolute right-0 top-0 w-1.5 h-full ${emp.status === 'ACTIVE' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500 dark:bg-rose-400'}`}></div>

              <div className="flex items-center gap-4 pr-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0 transition-colors ${emp.employee_title === 'CASHIER' ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-400 dark:bg-slate-600'}`}>
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-black text-slate-800 dark:text-white leading-none">
                      {emp.name}
                    </h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border transition-colors ${emp.employee_title === 'CASHIER' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'}`}>
                      {emp.employee_title === 'CASHIER' ? 'كاشير' : 'عامل أرضية'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {emp.phone}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"><DollarSign className="w-3 h-3" /> الأجر: {emp.daily_wage} ج</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => handleOpenPayroll(emp)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-100 dark:hover:border-indigo-500/20 px-4 py-2.5 rounded-xl font-bold transition-all text-sm active:scale-95"
                >
                  <Calculator className="w-4 h-4" /> تصفية الراتب
                </button>
                <button
                  onClick={() => openEditModal(emp)}
                  className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-100 dark:hover:border-indigo-500/20 rounded-xl transition-all active:scale-95"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(emp._id, emp.name)}
                  className="p-2.5 bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all active:scale-95"
                  title="إيقاف العامل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isPayrollModalOpen && selectedPayrollEmp && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors">
              
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> تصفية حساب عامل
                  </h3>
                </div>
                <button onClick={() => setIsPayrollModalOpen(false)} className="p-2 bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 shadow-sm border border-slate-100 dark:border-slate-600 transition-all active:scale-95">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 custom-scrollbar p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center font-black text-xl border border-indigo-100 dark:border-indigo-500/20">
                    {selectedPayrollEmp.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white">{selectedPayrollEmp.name}</h4>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                      {selectedPayrollEmp.employee_title === 'CASHIER' ? 'كاشير (مستلم درج)' : 'عامل أرضية'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 block uppercase">شهر التصفية</label>
                    <select value={payrollMonth} onChange={(e) => setPayrollMonth(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all">
                      {Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={i + 1}>شهر {i + 1}</option>))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 block uppercase">سنة التصفية</label>
                    <select value={payrollYear} onChange={(e) => setPayrollYear(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all">
                      {[2024, 2025, 2026, 2027].map((y) => (<option key={y} value={y}>سنة {y}</option>))}
                    </select>
                  </div>
                </div>

                {isPayrollLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <p className="font-bold text-sm">جاري حساب الاستحقاقات...</p>
                  </div>
                ) : payrollData ? (
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-center py-3 border-b border-slate-200/60 dark:border-slate-700">
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-slate-400 dark:text-slate-500" /> أيام العمل</span>
                        <span className="text-sm font-black text-slate-800 dark:text-white">{payrollData.summary.days_worked} يوم</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-slate-200/60 dark:border-slate-700">
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-400 dark:text-slate-500" /> الأجر المستحق</span>
                        <span className="text-sm font-black text-slate-800 dark:text-white">{payrollData.summary.total_earned} ج.م</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-slate-200/60 dark:border-slate-700">
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><Banknote className="w-4 h-4 text-slate-400 dark:text-slate-500" /> السلف المخصومة</span>
                        <span className="text-sm font-black text-slate-800 dark:text-white">- {payrollData.summary.total_advances} ج.م</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 mt-1 border-t border-slate-200/60 dark:border-slate-700">
                        <span className="text-sm font-black text-slate-800 dark:text-white">تصفية الحساب</span>
                        {payrollData.summary.remaining_salary > 0 ? (
                          <div className="text-left bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                            <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 block mb-0.5">مستحق له (ليه)</span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{payrollData.summary.remaining_salary.toLocaleString()} ج</span>
                          </div>
                        ) : payrollData.summary.remaining_salary < 0 ? (
                          <div className="text-left bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-100 dark:border-rose-500/20 shadow-sm">
                            <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 block mb-0.5">مديون للمحل (عليه)</span>
                            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{Math.abs(payrollData.summary.remaining_salary).toLocaleString()} ج</span>
                          </div>
                        ) : (
                          <div className="text-left bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">الحساب النهائي</span>
                            <span className="text-2xl font-black text-slate-600 dark:text-slate-300">خالص (0)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {payrollData.history && payrollData.history.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1 uppercase tracking-wider">
                          <History className="w-3.5 h-3.5" /> تفاصيل السلف المسحوبة
                        </h4>
                        <div className="space-y-2">
                          {payrollData.history.map((record) => (
                            <div key={record._id} className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-slate-200 dark:hover:border-slate-600 transition-all">
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-white">{record.description || 'سلفة نقدية'}</p>
                                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
                                  {new Date(record.createdAt).toLocaleDateString('ar-EG')} - {new Date(record.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <p className="text-sm font-black text-rose-500 dark:text-rose-400">- {record.amount} ج</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shrink-0">
                <button onClick={() => setIsPayrollModalOpen(false)} className="w-full py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-600 font-black rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm">
                  <ArrowRight className="w-5 h-5" /> عودة لقائمة العمال
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isModalOpen || isEditOpen) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              
              <div className="flex items-center justify-between p-5 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  {isEditOpen ? 'تعديل بيانات العامل' : 'إضافة عامل جديد'}
                </h3>
                <button onClick={() => isEditOpen ? setIsEditOpen(false) : setIsModalOpen(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form id="emp-form" onSubmit={isEditOpen ? handleUpdateSubmit : handleAddSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block">الاسم</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block">الهاتف</label>
                  <input type="tel" disabled={isEditOpen} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 text-left disabled:opacity-50 transition-all" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block">الأجر اليومي (ج.م)</label>
                  <input type="number" value={formData.daily_wage} onChange={(e) => setFormData({ ...formData, daily_wage: e.target.value })} className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 transition-all" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block">المسمى الوظيفي</label>
                  <select value={formData.employee_title} onChange={(e) => setFormData({ ...formData, employee_title: e.target.value })} className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none font-bold text-slate-800 dark:text-slate-200 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all">
                    <option value="CASHIER">كاشير (مستلم درج)</option>
                    <option value="FLOOR_WORKER">عامل أرضية / نظافة</option>
                  </select>
                </div>

                <AnimatePresence mode="wait">
                  {formData.employee_title === 'CASHIER' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-2">
                        <label className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> الرمز السري (PIN) لاستلام الوردية
                        </label>
                        <input type="password" maxLength="4" placeholder={isEditOpen ? 'اتركه فارغاً إن لم ترغب بتغييره' : 'أدخل 4 أرقام (مثال: 1234)'} value={formData.pin_code} onChange={(e) => setFormData({ ...formData, pin_code: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="w-full p-3.5 rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 outline-none text-center tracking-[1em] text-xl font-black text-rose-700 dark:text-rose-400 focus:border-rose-400 dark:focus:border-rose-500 placeholder:tracking-normal placeholder:text-sm placeholder:font-bold transition-all" />
                      </div>
                    </motion.div>
                  )}

                  {formData.employee_title === 'FLOOR_WORKER' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-2">
                        <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" /> تاريخ بدء العمل (لحساب الرواتب)
                        </label>
                        <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 outline-none font-bold text-emerald-700 dark:text-emerald-400 focus:border-emerald-400 dark:focus:border-emerald-500 transition-all text-right" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isEditOpen && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pr-1 mb-1 block">الحالة</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none font-bold text-slate-800 dark:text-slate-200 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all">
                      <option value="ACTIVE">نشط</option>
                      <option value="INACTIVE">موقوف</option>
                    </select>
                  </div>
                )}
              </form>
              
              <div className="p-5 border-t border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3 transition-colors">
                <button type="button" onClick={() => isEditOpen ? setIsEditOpen(false) : setIsModalOpen(false)} className="flex-1 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all text-sm">
                  إلغاء
                </button>
                <button type="submit" form="emp-form" disabled={isLoading} className="flex-[2] py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isEditOpen ? 'تحديث البيانات' : 'حفظ العامل'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BranchEmployees;