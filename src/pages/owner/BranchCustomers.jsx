import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, FileText, Loader2, X, Users, Calendar, ShieldCheck, ArrowRight, Printer 
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import ownerReportService from '../../services/ownerReportService';

const BranchCustomers = ({ branchId }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  
  const [isStatementPanelOpen, setIsStatementPanelOpen] = useState(false);
  const [statementData, setStatementData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsFetching(true);
        const data = await ownerReportService.getBranchCustomers(branchId);
        setCustomers(data);
      } catch (error) {
        showAlert.error('خطأ', error.message);
      } finally {
        setIsFetching(false);
      }
    };
    if (branchId) fetchCustomers();
  }, [branchId]);

  const handleViewStatement = async (customer) => {
    try {
      setIsLoadingDetails(true);
      setIsStatementPanelOpen(true);
      const data = await ownerReportService.getCustomerStatement(customer._id, branchId);
      setStatementData(data);
    } catch (error) {
      showAlert.error('خطأ', error.message);
      setIsStatementPanelOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredCustomers = customers.filter(c => 
    c.name.includes(searchTerm) || (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 dark:text-slate-200 relative transition-colors duration-300">
      
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-5 rounded-[24px] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 print:hidden transition-colors">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> كشكول الزباين
          </h2>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">متابعة ديون الزبائن  </p>
        </div>
        
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="ابحث باسم الزبون أو رقمه..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 outline-none text-sm font-bold text-slate-800 dark:text-slate-200 focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all" 
          />
        </div>
      </div>

      {isFetching ? (
        <div className="flex justify-center py-10 print:hidden"><Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 w-10 h-10" /></div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[24px] bg-white dark:bg-slate-800/50 text-center p-12 print:hidden transition-colors">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">الكشكول فارغ</h3>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">لم يتم تسجيل أي زبائن أو ديون في هذا الفرع حتى الآن.</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400 font-bold print:hidden">لا يوجد زبون مطابق للبحث.</div>
      ) : (
        <div className="flex flex-col gap-3 pb-10 print:hidden">
          {filteredCustomers.map((customer) => (
            <div key={customer._id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 sm:p-5 rounded-[24px] shadow-sm hover:shadow-md dark:hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white text-base">{customer.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 bg-slate-50 dark:bg-slate-900/50 inline-block px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700 transition-colors">
                    {customer.phone || 'بدون رقم هاتف'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 dark:border-slate-700 pt-3 sm:pt-0 w-full sm:w-auto">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mb-0.5">الرصيد المستحق</span>
                  <span className={`text-lg font-black tracking-tight transition-colors ${customer.net_debt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {customer.net_debt.toLocaleString()} <span className="text-xs">ج.م</span>
                  </span>
                </div>
                <button 
                  onClick={() => handleViewStatement(customer)} 
                  className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-100 dark:hover:border-indigo-500/20 px-5 py-3 rounded-xl font-bold transition-all text-sm active:scale-95"
                >
                  <FileText className="w-4 h-4" /> كشف الحساب
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isStatementPanelOpen && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 print:p-0 print:bg-white print:block overflow-hidden">
            <div className="absolute inset-0 z-0 hide-on-print" onClick={() => setIsStatementPanelOpen(false)}></div>
            
            <style media="print">
              {`
                @page { size: A4 portrait; margin: 15mm; }
                body, html { height: auto !important; overflow: visible !important; background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                body * { visibility: hidden; }
                .printable-document, .printable-document * { visibility: visible; }
                .printable-document {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  transform: none !important; 
                  box-shadow: none !important;
                  border: none !important;
                }
                .print-row { page-break-inside: avoid; border-bottom: 1px solid #e2e8f0 !important; }
                .hide-on-print { display: none !important; }
              `}
            </style>

            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="printable-document bg-white dark:bg-slate-900 w-full sm:max-w-2xl flex flex-col shadow-2xl rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] sm:max-h-[85vh] relative z-10 border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden print:max-h-none print:border-none"
            >
              
              <div className="hide-on-print p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> تدقيق الحساب المالي
                </h3>
                <button onClick={() => setIsStatementPanelOpen(false)} className="p-2 bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-xl hover:text-rose-500 dark:hover:text-rose-400 shadow-sm border border-slate-100 dark:border-slate-600 transition-all active:scale-95">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 custom-scrollbar print:overflow-visible">
                {isLoadingDetails ? (
                  <div className="flex justify-center items-center py-20 hide-on-print"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" /></div>
                ) : statementData ? (
                  <div className="p-6 sm:p-8">
                    
                    <div className="text-center pb-6 mb-6 border-b-2 border-slate-100 dark:border-slate-700 border-dashed transition-colors">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500 hide-on-print transition-colors">
                        <Users className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 print:text-black">{statementData.customer_info?.name}</h2>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 print:text-gray-600">{statementData.customer_info?.phone || 'لا يوجد رقم مسجل'}</p>
                      
                      <div className="inline-block bg-slate-50 dark:bg-slate-900/50 px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 print:border-2 print:border-gray-800 transition-colors">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider print:text-black">إجمالي المديونية المستحقة</p>
                        <h4 className={`text-4xl font-black tracking-tight transition-colors ${statementData.customer_info.net_debt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'} print:text-black`}>
                          {statementData.customer_info.net_debt.toLocaleString()} <span className="text-base">ج.م</span>
                        </h4>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-5 flex items-center justify-between print:text-black">
                        سجل الحركات التفصيلي
                        <span className="text-[11px] font-black bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md print:border print:border-gray-300 transition-colors">{statementData.history.length} عملية</span>
                      </h4>

                      {statementData.history.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-900/50 rounded-2xl print:text-black transition-colors">لا توجد حركات مالية مسجلة.</div>
                      ) : (
                        <div className="space-y-3 print:space-y-0">
                          {statementData.history.map((trx, idx) => (
                            <div key={idx} className="print-row bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-[20px] flex justify-between items-center hover:border-slate-50 dark:hover:border-slate-600 transition-colors group print:p-3 print:rounded-none print:border-x-0 print:border-t-0">
                              <div>
                                <h5 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 print:text-black">
                                  <span className={`w-2 h-2 rounded-full hide-on-print ${trx.type === 'CREDIT' ? 'bg-rose-500 dark:bg-rose-400' : 'bg-emerald-500 dark:bg-emerald-400'}`}></span>
                                  {trx.type === 'CREDIT' ? 'سحب بضاعة (شكك)' : 'سداد دفعة نقدية'}
                                </h5>
                                <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 print:text-gray-600">
                                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(trx.date).toLocaleDateString('ar-EG')}</span>
                                  <span>•</span>
                                  <span>{new Date(trx.date).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                {trx.notes && (
                                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-2 bg-slate-50 dark:bg-slate-900/50 inline-block px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 print:border-dashed print:bg-white print:text-black transition-colors">
                                    ملاحظة: {trx.notes}
                                  </p>
                                )}
                              </div>
                              
                              <div className="text-left shrink-0">
                                <span className={`text-lg font-black tracking-tight transition-colors ${trx.type === 'CREDIT' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'} print:text-black`}>
                                  {trx.type === 'CREDIT' ? '+' : '-'} {trx.amount.toLocaleString()} ج
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-20 text-slate-400 dark:text-slate-500 font-bold hide-on-print">حدث خطأ في تحميل المستند.</div>
                )}
              </div>

              <div className="hide-on-print p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3 shrink-0 transition-colors">
                <button 
                  onClick={() => setIsStatementPanelOpen(false)} 
                  className="flex-1 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-black rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <ArrowRight className="w-5 h-5" /> عودة للقائمة
                </button>
                <button 
                  onClick={handlePrint}
                  disabled={!statementData}
                  className="flex-1 py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white font-black rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 dark:shadow-none disabled:opacity-50"
                >
                  <Printer className="w-5 h-5" /> طباعة الكشف
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BranchCustomers;