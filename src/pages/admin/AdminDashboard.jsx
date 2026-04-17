import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, CreditCard, Building, Calendar, Smartphone, Search } from 'lucide-react';
import { showAlert } from '../../utils/alert';
import platformPaymentService from '../../services/platformPaymentService';

const AdminDashboard = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPending = async () => {
    try {
      const data = await platformPaymentService.getPending();
      setPendingPayments(data);
    } catch (error) {
      showAlert.error('خطأ', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleReview = async (id, action) => {
    const isApprove = action === 'APPROVE';
    const notes = window.prompt(`هل أنت متأكد من ${isApprove ? 'اعتماد' : 'رفض'} الطلب؟ (ملاحظة اختيارية):`);
    if (notes === null) return;

    try {
      await platformPaymentService.reviewRequest(id, { action, admin_notes: notes });
      showAlert.success('تم الإجراء', `تم ${isApprove ? 'تفعيل الاشتراك' : 'رفض الطلب'} بنجاح`);
      fetchPending();
    } catch (error) {
      showAlert.error('فشل الإجراء', error.message);
    }
  };

  const filtered = pendingPayments.filter(p => 
    p.organization_id?.name.includes(searchTerm) || p.transfer_number.includes(searchTerm)
  );

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">طلبات التجديد المعلقة</h1>
          <p className="text-slate-500 font-bold text-sm mt-1">راجع إيصالات التحويل وقم بتفعيل الفروع يدوياً</p>
        </div>
        <div className="relative group w-full md:w-72">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" placeholder="بحث باسم الماركت أو الرقم..." 
            className="w-full pr-12 pl-4 py-3 rounded-2xl border border-slate-200 focus:border-primary outline-none font-bold text-sm transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((payment) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={payment._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Building className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">{payment.organization_id?.name}</h3>
                  <p className="text-slate-400 font-bold text-xs">{payment.branch_id?.name}</p>
                </div>
              </div>
              <div className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-xs font-black">قيد المراجعة</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold mb-1">المبلغ المحول</p>
                <p className="text-lg font-black text-slate-800">{payment.amount_paid} ج.م</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold mb-1">المدة المطلوبة</p>
                <p className="text-lg font-black text-slate-800">{payment.requested_months} شهر</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                <Smartphone className="w-4 h-4 text-slate-400" />
                رقم التحويل: <span className="text-slate-800">{payment.transfer_number}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                تاريخ الطلب: <span className="text-slate-800">{new Date(payment.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>

            <a href={payment.receipt_image_url} target="_blank" rel="noreferrer" className="block w-full py-3 bg-slate-100 text-slate-600 text-center rounded-2xl font-black text-sm mb-4 hover:bg-slate-200 transition-colors">
              عرض صورة الإيصال 🖼️
            </a>

            <div className="flex gap-3">
              <button onClick={() => handleReview(payment._id, 'REJECT')} className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-500 hover:text-white transition-all">رفض</button>
              <button onClick={() => handleReview(payment._id, 'APPROVE')} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">تفعيل الاشتراك</button>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold italic">لا يوجد طلبات معلقة حالياً</div>}
    </div>
  );
};

export default AdminDashboard;