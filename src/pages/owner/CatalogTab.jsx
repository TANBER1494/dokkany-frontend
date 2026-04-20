import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderPlus, Loader2, Edit3, Trash2, ChevronDown, Folder, X, CheckCircle,
  PackageOpen, Search, PlusCircle, Package, AlertTriangle, Scale,
  FileSpreadsheet, Download, UploadCloud, Info 
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import catalogService from '../../services/catalogService';

const CatalogTab = ({ branchId }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 📂 حالات الفئات
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryEdit, setIsCategoryEdit] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // 📦 حالات المنتجات
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductEdit, setIsProductEdit] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '', unit_type: 'قطعة', purchase_price: '', selling_price: '', stock_quantity: '', category_id: ''
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📊 حالات استيراد الإكسيل
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  // 🔄 جلب البيانات الأساسية
  const fetchData = async () => {
    if (!branchId) return;
    setIsFetching(true);
    try {
      const fetchedCategories = await catalogService.getCategories(branchId);
      const fetchedProducts = await catalogService.getProducts({ branch_id: branchId });
      setCategories(fetchedCategories);
      setProducts(fetchedProducts);
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId]);

  // ==========================================
  // عمليات الفئات
  // ==========================================
  const openEditCategory = (category, e) => {
    e.stopPropagation();
    setCategoryForm({
      name: category.name,
      description: category.description || '',
    });
    setEditingCategoryId(category._id);
    setIsCategoryEdit(true);
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim())
      return showAlert.error('تنبيه', 'يرجى إدخال اسم الفئة');
    setIsSubmitting(true);
    try {
      if (isCategoryEdit) {
        await catalogService.updateCategory(editingCategoryId, { ...categoryForm, branch_id: branchId });
        showAlert.success('تم التحديث', 'تم تعديل الفئة بنجاح');
      } else {
        await catalogService.addCategory({
          ...categoryForm,
          branch_id: branchId,
        });
        showAlert.success('تمت الإضافة', 'تم إنشاء الفئة الجديدة');
      }
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', description: '' });
      setIsCategoryEdit(false);
      fetchData();
    } catch (error) {
      showAlert.error('فشل العملية', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name, e) => {
    e.stopPropagation();
    showAlert
      .error('تأكيد الحذف', `سيتم حذف قسم (${name}).`)
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await catalogService.deleteCategory(id);
            showAlert.success('تم الحذف', 'تم مسح الفئة بنجاح');
            fetchData();
          } catch (error) {
            showAlert.error('فشل الحذف', error.message);
          }
        }
      });
  };

  // ==========================================
  // عمليات المنتجات
  // ==========================================

  // ==========================================
  // 📥 دوال الإكسيل (الجديدة)
  // ==========================================
  const handleDownloadTemplate = async () => {
    try {
      const blob = await catalogService.exportProductsTemplate(branchId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Dokkany-Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showAlert.error('خطأ', error.message);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return showAlert.error('تنبيه', 'اختر ملفاً أولاً');
    try {
      setIsImporting(true);
      const result = await catalogService.importProductsFromExcel(branchId, importFile);
      setImportSummary(result.summary);
      showAlert.success('اكتملت العملية', result.message);
      fetchData();
    } catch (error) {
      showAlert.error('فشل الاستيراد', error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const openAddProduct = (categoryId, e) => {
    e.stopPropagation();
    setProductForm({
      name: '',
      unit_type: '',
      purchase_price: '',
      selling_price: '',
      stock_quantity: '',
      category_id: categoryId,
    });
    setIsProductEdit(false);
    setIsProductModalOpen(true);
  };

  const openEditProduct = (product, e) => {
    e.stopPropagation();
    setProductForm({
      name: product.name,
      unit_type: product.unit_type || '', 
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id._id || product.category_id,
    });
    setEditingProductId(product._id);
    setIsProductEdit(true);
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (
      !productForm.name ||
      !productForm.purchase_price ||
      !productForm.selling_price ||
      !productForm.unit_type
    ) {
      return showAlert.error(
        'تنبيه',
        'يرجى إكمال البيانات الأساسية واسم الوحدة'
      );
    }
    setIsSubmitting(true);
    try {
      const payload = { ...productForm, branch_id: branchId };
      if (!isProductEdit) {
        payload.barcode = `SKU-${Date.now()}`;
      }

      if (isProductEdit) {
        await catalogService.updateProduct(editingProductId, payload);
        showAlert.success('تم التحديث', 'تم تعديل الصنف بنجاح');
      } else {
        await catalogService.addProduct(payload);
        showAlert.success('تمت الإضافة', 'تم إضافة الصنف للمخزن');
      }
      setIsProductModalOpen(false);
      fetchData();
    } catch (error) {
      showAlert.error('فشل العملية', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name, e) => {
    e.stopPropagation();
    showAlert
      .error('تأكيد الحذف', `هل أنت متأكد من حذف (${name})؟`)
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await catalogService.deleteProduct(id);
            showAlert.success('تم الحذف', 'تم مسح الصنف من المخزن');
            fetchData();
          } catch (error) {
            showAlert.error('فشل الحذف', error.message);
          }
        }
      });
  };

  const toggleAccordion = (id) =>
    setExpandedCategory(expandedCategory === id ? null : id);

  const getFilteredProductsForCategory = (categoryId) => {
    return products.filter((p) => {
      const matchCategory = (p.category_id._id || p.category_id) === categoryId;
      const matchSearch = p.name.includes(searchTerm); 
      return matchCategory && matchSearch;
    });
  };

return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 rounded-[24px] border border-slate-200 dark:border-slate-700/50 shadow-inner p-4 sm:p-6 overflow-hidden transition-colors duration-300">
      
      {/* الهيدر العلوي الذكي */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 gap-4 transition-colors">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="ابحث باسم المنتج..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (
                e.target.value &&
                !expandedCategory &&
                categories.length > 0
              ) {
                setExpandedCategory(categories[0]._id);
              }
            }}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>

        {/* حاوية الأزرار المحدثة (زر الإضافة وزر الاستيراد) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* 🚀 زر استيراد الإكسيل الجديد */}
          <button
            onClick={() => {
              setImportSummary(null);
              setImportFile(null);
              setIsImportModalOpen(true);
            }}
            className="flex-1 sm:flex-none py-2.5 sm:py-3 px-3 sm:px-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 font-bold rounded-xl active:scale-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-500/30"
          >
            <FileSpreadsheet className="w-4 h-4" /> <span className="hidden sm:inline">استيراد من إكسيل</span>
          </button>

          <button
            onClick={() => {
              setCategoryForm({ name: '', description: '' });
              setIsCategoryEdit(false);
              setIsCategoryModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 sm:py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto"
          >
            <FolderPlus className="w-4 h-4" /> قسم جديد
          </button>
        </div>
      </div>

      {/* قائمة الأكورديون للأقسام */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed shadow-sm transition-colors">
            <PackageOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="font-bold text-slate-500 dark:text-slate-400">
              لا توجد أقسام مسجلة في المخزن.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-10">
            {categories.map((category) => {
              const categoryProducts = getFilteredProductsForCategory(
                category._id
              );
              if (searchTerm && categoryProducts.length === 0) return null;

              return (
                <div
                  key={category._id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-slate-600"
                >
                  {/* رأس القسم */}
                  <div
                    onClick={() => toggleAccordion(category._id)}
                    className={`flex flex-wrap items-center justify-between p-4 cursor-pointer transition-colors ${expandedCategory === category._id ? 'bg-indigo-50/80 dark:bg-indigo-500/10 border-b border-indigo-100 dark:border-indigo-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl transition-all ${expandedCategory === category._id ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                      >
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                          {category.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                          {categoryProducts.length} صنف مسجل
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
                      <button
                        onClick={(e) => openAddProduct(category._id, e)}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-xs mr-2"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> إضافة صنف
                      </button>

                      <button
                        onClick={(e) => openEditCategory(category, e)}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) =>
                          handleDeleteCategory(category._id, category.name, e)
                        }
                        className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                      <motion.div
                        animate={{
                          rotate: expandedCategory === category._id ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </motion.div>
                    </div>
                  </div>

                  {/* قائمة المنتجات المنسدلة */}
                  <AnimatePresence>
                    {expandedCategory === category._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-50/50 dark:bg-slate-900/30"
                      >
                        <div className="p-4">
                          <button
                            onClick={(e) => openAddProduct(category._id, e)}
                            className="sm:hidden w-full flex justify-center items-center gap-2 mb-4 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-sm border border-emerald-200 dark:border-emerald-500/20"
                          >
                            <PlusCircle className="w-4 h-4" /> إضافة صنف جديد هنا
                          </button>

                          {categoryProducts.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 transition-colors">
                              <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                لا توجد أصناف مسجلة في هذا القسم.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {categoryProducts.map((product) => (
                                <div
                                  key={product._id}
                                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-slate-500 transition-all flex flex-col relative group"
                                >
                                  <h4 className="font-extrabold text-slate-800 dark:text-white text-sm pr-1">
                                    {product.name}
                                  </h4>
                                  <p className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 mt-1 flex items-center gap-1">
                                    <Scale className="w-3 h-3" /> يباع بـ ({' '}
                                    {product.unit_type || 'قطعة'} )
                                  </p>

                                  <div className="grid grid-cols-3 gap-2 mt-4 mb-4 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 text-center transition-colors">
                                    <div>
                                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                                        سعر الشراء
                                      </p>
                                      <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                                        {product.purchase_price} ج
                                      </p>
                                    </div>
                                    <div className="border-r border-l border-slate-200 dark:border-slate-700">
                                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                                        سعر البيع
                                      </p>
                                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                        {product.selling_price} ج
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                                        الكميه 
                                      </p>
                                      <p
                                        className={`text-xs font-black ${product.stock_quantity <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}
                                      >
                                        {product.stock_quantity}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-auto flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) =>
                                        openEditProduct(product, e)
                                      }
                                      className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) =>
                                        handleDeleteProduct(
                                          product._id,
                                          product.name,
                                          e
                                        )
                                      }
                                      className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
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

      {/* ========================================== */}
      {/* 📂 مودال 1: إضافة / تعديل قسم */}
      {/* ========================================== */}
      <AnimatePresence>
        {(isCategoryModalOpen || isCategoryEdit) && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
            <div className="absolute inset-0 z-0" onClick={() => { setIsCategoryModalOpen(false); setIsCategoryEdit(false); }}></div>
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="relative w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col border-t sm:border border-slate-100 dark:border-slate-700 transition-colors z-10"
            >
              <div className="p-6 border-b border-indigo-50 dark:border-slate-700 flex justify-between items-center bg-indigo-50/30 dark:bg-slate-800/50">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> {isCategoryEdit ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}
                </h3>
                <button onClick={() => { setIsCategoryModalOpen(false); setIsCategoryEdit(false); }} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-colors"><X className="w-4 h-4" /></button>
              </div>
              
              <div className="p-6">
                <form id="cat-form" onSubmit={handleCategorySubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">اسم القسم</label>
                    <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 font-semibold transition-all" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">وصف مبسط (اختياري)</label>
                    <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 font-medium resize-none h-20 transition-all" />
                  </div>
                </form>
              </div>

              <div className="p-5 border-t border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3 transition-colors">
                <button type="button" onClick={() => { setIsCategoryModalOpen(false); setIsCategoryEdit(false); }} className="flex-1 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all text-sm">إلغاء</button>
                <button type="submit" form="cat-form" disabled={isSubmitting} className="flex-[2] py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} تأكيد القسم
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* 📦 مودال 2: إضافة / تعديل صنف (منتج) */}
      {/* ========================================== */}
      <AnimatePresence>
        {(isProductModalOpen || isProductEdit) && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 overflow-hidden">
            <div className="absolute inset-0 z-0" onClick={() => { !isSubmitting && setIsProductModalOpen(false); setIsProductEdit(false); }}></div>
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="relative w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-t sm:border border-slate-100 dark:border-slate-700 transition-colors z-10"
            >
              <div className="p-6 border-b border-indigo-50 dark:border-slate-700 flex justify-between items-center bg-indigo-50/30 dark:bg-slate-800/50 shrink-0">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> {isProductEdit ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}
                </h3>
                <button onClick={() => { setIsProductModalOpen(false); setIsProductEdit(false); }} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <form id="prod-form" onSubmit={handleProductSubmit} className="space-y-5">
                  <div className="grid grid-cols-[2fr_1fr] gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">اسم الصنف</label>
                      <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none font-semibold focus:border-indigo-400" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">نوع الكمية</label>
                      <input type="text" value={productForm.unit_type} onChange={(e) => setProductForm({ ...productForm, unit_type: e.target.value })} placeholder="قطعة..." className="w-full p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/10 outline-none font-bold text-indigo-700" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">سعر الشراء</label>
                      <input type="number" step="0.01" value={productForm.purchase_price} onChange={(e) => setProductForm({ ...productForm, purchase_price: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none font-bold" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">سعر البيع</label>
                      <input type="number" step="0.01" value={productForm.selling_price} onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })} className="w-full p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 font-black" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">الكمية</label>
                      <input type="number" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none font-bold" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">القسم</label>
                      <select value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none font-bold text-sm">
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3 shrink-0 transition-colors">
                <button type="button" onClick={() => { setIsProductModalOpen(false); setIsProductEdit(false); }} className="flex-1 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm">إلغاء</button>
                <button type="submit" form="prod-form" disabled={isSubmitting} className="flex-[2] py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 text-sm flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} {isProductEdit ? 'تحديث البيانات' : 'حفظ الصنف'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* 📊 مودال 3: استيراد المنتجات من إكسيل */}
      {/* ========================================== */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
            <div className="absolute inset-0 z-0" onClick={() => !isImporting && setIsImportModalOpen(false)}></div>
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="relative w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col border-t sm:border border-slate-100 dark:border-slate-700 transition-colors z-10"
            >
              <div className="p-5 sm:p-6 border-b border-emerald-50 dark:border-slate-700 flex justify-between items-center bg-emerald-50/30 dark:bg-slate-800/50">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" /> استيراد من Excel
                </h3>
                <button onClick={() => setIsImportModalOpen(false)} className="p-1.5 sm:p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-colors"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
              </div>

              <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto">
                {!importSummary ? (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-2xl">
                      <h4 className="font-bold text-blue-700 dark:text-blue-400 text-sm flex items-center gap-1.5 mb-2"><Info className="w-4 h-4"/> الخطوة 1: تحميل القالب الذكي</h4>
                      <p className="text-[11px] sm:text-xs text-blue-600/80 dark:text-blue-400/80 font-bold mb-3 leading-relaxed">قم بتحميل قالب الإكسيل الخاص بفرعك. القالب يحتوي على قوائم منسدلة بالأقسام المسجلة لديك لمنع الأخطاء الإملائية.</p>
                      <button onClick={handleDownloadTemplate} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"><Download className="w-4 h-4" /> تحميل قالب الإكسيل</button>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-2xl">
                      <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-1.5 mb-3"><UploadCloud className="w-4 h-4"/> الخطوة 2: رفع الملف بعد تعبئته</h4>
                      <form id="import-form" onSubmit={handleImportSubmit}>
                        <div className="relative border-2 border-dashed border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 text-center hover:bg-emerald-100/50 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer group">
                          <input type="file" accept=".xlsx, .xls" onChange={(e) => setImportFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" required />
                          <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${importFile ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-300 dark:text-emerald-600'} transition-colors`} />
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate px-2">{importFile ? importFile.name : 'اضغط لاختيار ملف الإكسيل'}</p>
                        </div>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 rounded-2xl text-center">
                      <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <h4 className="font-black text-emerald-700 dark:text-emerald-400 text-lg">اكتمل الاستيراد!</h4>
                      <p className="text-sm font-bold text-emerald-600 mt-1">تمت إضافة <span className="text-lg">{importSummary.success_count}</span> منتج بنجاح.</p>
                      {importSummary.new_categories_created > 0 && <p className="text-xs font-bold text-emerald-600/80 mt-1">تم إنشاء {importSummary.new_categories_created} قسم جديد تلقائياً.</p>}
                    </div>
                    {importSummary.failed_count > 0 && (
                      <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 p-4 rounded-2xl">
                        <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm flex items-center gap-1.5 mb-2"><AlertTriangle className="w-4 h-4"/> تم تخطي {importSummary.failed_count} صف لوجود أخطاء:</h4>
                        <ul className="text-[10px] sm:text-xs text-rose-600 dark:text-rose-400 font-bold space-y-1 list-disc list-inside max-h-32 overflow-y-auto">
                          {importSummary.errors.map((err, idx) => <li key={idx}>{err}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3 transition-colors">
                <button type="button" onClick={() => setIsImportModalOpen(false)} className="flex-1 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all text-sm">{importSummary ? 'إغلاق' : 'تراجع'}</button>
                {!importSummary && (
                  <button type="submit" form="import-form" disabled={isImporting || !importFile} className="flex-[2] py-3.5 bg-emerald-600 dark:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 dark:shadow-none hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} بدء الاستيراد
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div> 
  );
};

export default CatalogTab;