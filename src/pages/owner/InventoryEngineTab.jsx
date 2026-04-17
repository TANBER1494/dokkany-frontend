import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Search,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  AlertCircle,
  Banknote,
  Scale,
  CheckCircle,
  RotateCcw,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Receipt,
  Layers,
  Building,
  Printer,
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import catalogService from '../../services/catalogService';
import inventoryService from '../../services/inventoryService';

const InventoryEngineTab = ({ branchId }) => {
  const [viewMode, setViewMode] = useState('LOADING');
  const [lastInventoryData, setLastInventoryData] = useState(null);

  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [countedItems, setCountedItems] = useState({});
  const [financials, setFinancials] = useState({
    actual_cash: '',
    previous_capital: '',
    fixed_expenses: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInitialData = async () => {
    if (!branchId) return;
    setViewMode('LOADING');
    try {
      const history = await inventoryService.getInventoryHistory(branchId);
      if (history && history.length > 0) {
        setLastInventoryData(history[0]);
        setViewMode('DASHBOARD');
      } else {
        startNewInventory(null);
      }
    } catch (error) {
      showAlert.error('خطأ', 'فشل جلب بيانات المخزن');
      setViewMode('WIZARD');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [branchId]);

  const startNewInventory = async (previousData = null) => {
    setViewMode('LOADING');
    try {
      const fetchedProducts = await catalogService.getProducts({ branch_id: branchId });
      setProducts(fetchedProducts);

      const initialCounts = {};
      fetchedProducts.forEach((p) => {
        initialCounts[p._id] = p.stock_quantity || 0;
      });
      setCountedItems(initialCounts);

      const prevCap = previousData ? previousData.net_store_value : '';
      setFinancials({
        actual_cash: '',
        previous_capital: prevCap,
        fixed_expenses: '',
        notes: '',
      });

      setStep(1);
      setViewMode('WIZARD');
    } catch (error) {
      showAlert.error('خطأ', 'فشل جلب المنتجات للبدء في الجرد');
      setViewMode('DASHBOARD');
    }
  };

  const handleQuantityChange = (productId, value) => {
    const val = parseInt(value, 10);
    setCountedItems((prev) => ({
      ...prev,
      [productId]: isNaN(val) || val < 0 ? 0 : val,
    }));
  };

  const proceedToFinancials = () => {
    const hasCountedAny = Object.values(countedItems).some((qty) => qty > 0);
    if (!hasCountedAny && products.length > 0)
      return showAlert.error('تنبيه', 'يجب إدخال كمية مجرودة لصنف واحد على الأقل.');
    setStep(2);
  };

  const submitFinalInventory = async (e) => {
    e.preventDefault();
    if (!financials.actual_cash || financials.previous_capital === '') {
      return showAlert.error('تنبيه', 'يرجى إدخال الكاش الفعلي ورأس المال السابق لإتمام المعادلة.');
    }

    const formattedItems = products.map((p) => ({
      product_id: p._id,
      quantity: countedItems[p._id] || 0,
    }));

    setIsSubmitting(true);
    try {
      const payload = {
        branch_id: branchId,
        counted_items: formattedItems,
        actual_cash: financials.actual_cash,
        previous_capital: financials.previous_capital,
        fixed_expenses: financials.fixed_expenses || 0,
        notes: financials.notes,
      };

      const result = await inventoryService.performInventory(payload);
      showAlert.success('تم الاعتماد', 'تم إصدار الميزانية العمومية بنجاح.');

      const newInventoryData = {
        _id: result.summary._id,
        createdAt: result.summary.createdAt,
        total_stock_purchase_value: result.summary.stock_value,
        actual_cash: result.summary.actual_cash,
        total_vendor_debts: result.summary.debts_on_us,
        total_customer_debts: result.summary.debts_for_us,
        fixed_expenses: result.summary.expenses,
        previous_capital: result.summary.previous_capital,
        net_store_value: result.summary.net_wealth,
        net_profit: result.summary.net_profit,
      };

      setLastInventoryData(newInventoryData);
      setViewMode('DASHBOARD');
    } catch (error) {
      showAlert.error('فشل الجرد', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredProducts = products.filter((p) =>
    p.name.includes(searchTerm) || (p.barcode && p.barcode.includes(searchTerm))
  );

  if (viewMode === 'LOADING') {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  // واجهة العرض الرئيسية (الميزانية العمومية مع الطباعة)
  if (viewMode === 'DASHBOARD' && lastInventoryData) {
    const profit = lastInventoryData.net_profit || 0;
    const isFirstTime = lastInventoryData.previous_capital === 0 && profit === 0;

    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-10 mt-2 printable-document relative text-slate-800 dark:text-slate-200 transition-colors duration-300">
        
        {/* محرك الطباعة الجراحي */}
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
            .hide-on-print { display: none !important; }
            .print-text-black { color: #000 !important; }
            .print-border { border-color: #e2e8f0 !important; border-width: 1px !important; }
          `}
        </style>

        <div className="hide-on-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700 shrink-0 transition-colors">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Building className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> المركز المالي للفرع
            </h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">آخر تحديث ومطابقة لدفاتر الفرع</p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all text-sm shadow-sm"
            >
              <Printer className="w-4 h-4" /> طباعة الميزانية
            </button>
            <button
              onClick={() => startNewInventory(lastInventoryData)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold shadow-md shadow-indigo-500/20 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all text-sm"
            >
              <RotateCcw className="w-4 h-4" /> جرد دوري جديد
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden print-border print:rounded-none print:shadow-none transition-colors">
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 text-center border-b border-slate-100 dark:border-slate-700 print:bg-white print:border-b-2 print:border-dashed print:border-gray-300 transition-colors">
            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 hide-on-print transition-colors">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight print-text-black">الميزانية العمومية للفرع</h1>
            <div className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 mt-3 text-slate-500 dark:text-slate-400 text-xs font-bold shadow-sm print:shadow-none print-text-black transition-colors">
              <Calendar className="w-3.5 h-3.5" />
              <span>تاريخ الإصدار: {new Date(lastInventoryData.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100 dark:divide-slate-700 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 print:divide-gray-200 print:border-gray-200 transition-colors">
            <div className="p-8 text-center print:p-6">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mb-2 uppercase tracking-wider flex items-center justify-center gap-1 print-text-black">
                <Layers className="w-4 h-4" /> صافي رأس المال الحالي
              </p>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight print-text-black">
                {lastInventoryData.net_store_value?.toLocaleString()} <span className="text-lg text-slate-400 dark:text-slate-500 print-text-black">ج.م</span>
              </p>
            </div>
            <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/30 print:bg-white print:p-6 transition-colors">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mb-2 uppercase tracking-wider flex items-center justify-center gap-1 print-text-black">
                {isFirstTime ? <Wallet className="w-4 h-4" /> : profit >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400 hide-on-print" /> : <TrendingDown className="w-4 h-4 text-rose-500 dark:text-rose-400 hide-on-print" />}
                {isFirstTime ? 'رأس المال الافتتاحي' : profit >= 0 ? 'صافي أرباح الفترة' : 'صافي خسائر الفترة'}
              </p>
              <p className={`text-4xl font-black tracking-tight print-text-black ${isFirstTime ? 'text-slate-800 dark:text-slate-200' : profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isFirstTime ? lastInventoryData.net_store_value?.toLocaleString() : Math.abs(profit).toLocaleString()} <span className="text-lg opacity-50 print-text-black">ج.م</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-100 dark:divide-slate-700 print:divide-gray-200">
            
            {/* الأصول */}
            <div className="p-8 bg-white dark:bg-slate-800 print:p-6 transition-colors">
              <h3 className="text-lg font-black text-slate-800 dark:text-white border-b-2 border-slate-100 dark:border-slate-700 pb-3 mb-5 flex items-center gap-2 print-text-black print-border transition-colors">
                <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400 hide-on-print" /> الأصول (الموجودات)
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm print-text-black">
                  <span className="text-slate-500 dark:text-slate-400 font-bold print-text-black">مخزون البضاعة (بالتكلفة)</span>
                  <span className="font-black text-slate-800 dark:text-white print-text-black">{lastInventoryData.total_stock_purchase_value?.toLocaleString()} ج</span>
                </div>
                <div className="flex justify-between items-center text-sm print-text-black">
                  <span className="text-slate-500 dark:text-slate-400 font-bold print-text-black">النقدية بالخزينة (الكاش)</span>
                  <span className="font-black text-slate-800 dark:text-white print-text-black">{lastInventoryData.actual_cash?.toLocaleString()} ج</span>
                </div>
                <div className="flex justify-between items-center text-sm print-text-black">
                  <span className="text-slate-500 dark:text-slate-400 font-bold print-text-black">أرصدة العملاء (مدينون)</span>
                  <span className="font-black text-slate-800 dark:text-white print-text-black">{lastInventoryData.total_customer_debts?.toLocaleString()} ج</span>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl print:bg-white print-border print:rounded-none transition-colors">
                  <span className="text-slate-800 dark:text-white font-black print-text-black">إجمالي الأصول</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 text-lg print-text-black">
                    {((lastInventoryData.total_stock_purchase_value || 0) + (lastInventoryData.actual_cash || 0) + (lastInventoryData.total_customer_debts || 0)).toLocaleString()} ج
                  </span>
                </div>
              </div>
            </div>

            {/* الخصوم */}
            <div className="p-8 bg-white dark:bg-slate-800 print:p-6 transition-colors">
              <h3 className="text-lg font-black text-slate-800 dark:text-white border-b-2 border-slate-100 dark:border-slate-700 pb-3 mb-5 flex items-center gap-2 print-text-black print-border transition-colors">
                <Receipt className="w-5 h-5 text-rose-500 dark:text-rose-400 hide-on-print" /> الخصوم والالتزامات
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm print-text-black">
                  <span className="text-slate-500 dark:text-slate-400 font-bold print-text-black">أرصدة الموردين (دائنون)</span>
                  <span className="font-black text-slate-800 dark:text-white print-text-black">{lastInventoryData.total_vendor_debts?.toLocaleString()} ج</span>
                </div>
                <div className="flex justify-between items-center text-sm print-text-black">
                  <span className="text-slate-500 dark:text-slate-400 font-bold print-text-black">مصروفات مستحقة أو عجز</span>
                  <span className="font-black text-slate-800 dark:text-white print-text-black">{lastInventoryData.fixed_expenses?.toLocaleString()} ج</span>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl print:bg-white print-border print:rounded-none transition-colors">
                  <span className="text-slate-800 dark:text-white font-black print-text-black">إجمالي الخصوم</span>
                  <span className="font-black text-rose-600 dark:text-rose-400 text-lg print-text-black">
                    {((lastInventoryData.total_vendor_debts || 0) + (lastInventoryData.fixed_expenses || 0)).toLocaleString()} ج
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ⚙️ محرك الجرد (Wizard Steps - Natural Scroll)
  // ==========================================
  return (
    <div className="w-full flex flex-col gap-6 relative pb-20 mt-2 transition-colors duration-300">
      
      {/* شريط التقدم (Pill Design) */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between mx-auto w-full max-w-2xl shrink-0 relative overflow-hidden transition-colors">
        <div className="flex items-center gap-3 z-10 bg-white dark:bg-slate-800 pr-2 transition-colors">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${step >= 1 ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <span className={`font-black text-sm transition-colors ${step >= 1 ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>العد الفعلي</span>
        </div>
        
        <div className="flex-1 h-1.5 mx-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden transition-colors">
          <motion.div className="h-full bg-indigo-600 dark:bg-indigo-500" initial={{ width: '0%' }} animate={{ width: step >= 2 ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
        </div>
        
        <div className="flex items-center gap-3 z-10 bg-white dark:bg-slate-800 pl-2 transition-colors">
          <span className={`font-black text-sm transition-colors ${step >= 2 ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>القيود والاعتماد</span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${step >= 2 ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
            2
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* 📦 الخطوة 1: العد الفعلي */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-4">
            
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <div className="relative w-full">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="ابحث برقم الباركود أو اسم الصنف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20 transition-colors">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>تم تعبئة الكميات تلقائياً بناءً على الرصيد الدفتري الحالي. راجع الأصناف وقم بتعديل العجز أو الزيادة فقط.</p>
              </div>
            </div>

            {/* قائمة المنتجات */}
            <div className="flex flex-col gap-3">
              {filteredProducts.map((product) => (
                <div key={product._id} className="bg-white dark:bg-slate-800 p-4 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-200 dark:hover:border-slate-600 transition-colors">
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white text-base">{product.name}</h4>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
                      <span className="bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">{product.category_id?.name || 'غير مصنف'}</span>
                      <span className="bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">{product.unit_type || 'قطعة'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-2">المجرد:</label>
                    <input
                      type="number" min="0"
                      value={countedItems[product._id] === 0 ? '' : countedItems[product._id]}
                      onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                      placeholder="0"
                      className="w-24 text-center py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 font-black text-slate-800 dark:text-white text-lg transition-all"
                    />
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="p-10 text-center text-slate-400 dark:text-slate-600 font-bold bg-white dark:bg-slate-800/50 rounded-[24px] border-2 border-dashed border-slate-200 dark:border-slate-700 transition-colors">
                  <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  لا توجد منتجات مسجلة.
                </div>
              )}
            </div>

            {/* شريط المتابعة العائم (Sticky Footer) */}
            <div className="sticky bottom-4 mx-auto w-full max-w-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center z-10 transition-colors">
              <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                أصناف تم جردها: <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">{Object.values(countedItems).filter((q) => q > 0).length}</span>
              </div>
              <button
                onClick={proceedToFinancials}
                disabled={products.length === 0}
                className="flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 text-sm shadow-md shadow-indigo-500/20"
              >
                المتابعة للقيود <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* 💵 الخطوة 2: إدخال القيود والاعتماد */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto w-full">
            
            <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-100 dark:border-slate-700 text-center transition-colors">
                <h2 className="text-xl font-black text-slate-800 dark:text-white">البيانات المالية للميزانية</h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">أرصدة العملاء والموردين تُجلب آلياً من الدفاتر. أدخل فقط النقدية بالدرج ورأس المال الافتتاحي.</p>
              </div>

              <form id="inventory-form" onSubmit={submitFinalInventory} className="p-6 sm:p-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Wallet className="w-4 h-4" /> رأس المال السابق (الافتتاحي)
                    </label>
                    <input
                      type="number" step="0.01" required
                      value={financials.previous_capital}
                      onChange={(e) => setFinancials({ ...financials, previous_capital: e.target.value })}
                      className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-black text-slate-800 dark:text-white text-lg transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Banknote className="w-4 h-4" /> النقدية الفعلية (كاش الخزينة)
                    </label>
                    <input
                      type="number" step="0.01" required
                      value={financials.actual_cash}
                      onChange={(e) => setFinancials({ ...financials, actual_cash: e.target.value })}
                      className="w-full p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-900 font-black text-emerald-700 dark:text-emerald-400 text-lg transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-6">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-500" /> مصروفات مستحقة أو عجز مالي (خصم)
                  </label>
                  <input
                    type="number"
                    value={financials.fixed_expenses}
                    onChange={(e) => setFinancials({ ...financials, fixed_expenses: e.target.value })}
                    className="w-full p-4 rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 outline-none focus:border-rose-500 dark:focus:border-rose-400 focus:bg-white dark:focus:bg-slate-900 font-black text-rose-600 dark:text-rose-400 text-base transition-all"
                    placeholder="أدخل القيمة إن وجدت..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">ملاحظات إدارية لتسوية الجرد</label>
                  <textarea
                    value={financials.notes}
                    onChange={(e) => setFinancials({ ...financials, notes: e.target.value })}
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-bold text-sm text-slate-800 dark:text-white resize-none h-24 transition-all"
                    placeholder="سجل أي ملاحظات للرجوع إليها..."
                  ></textarea>
                </div>
              </form>

              <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col-reverse sm:flex-row gap-3 transition-colors">
                <button
                  type="button" onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-all text-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" /> تراجع للعد
                </button>
                <button
                  type="submit" form="inventory-form" disabled={isSubmitting}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all text-sm shadow-lg shadow-indigo-500/20 dark:shadow-none"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  اعتماد الميزانية وإصدار التقرير
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryEngineTab;