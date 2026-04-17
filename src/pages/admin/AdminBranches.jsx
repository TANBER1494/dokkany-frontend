import React, { useState, useEffect, useMemo } from 'react';
import { 
  Store, Search, Building2, Calendar, Phone, 
  CreditCard, Loader2, AlertCircle, CheckCircle2, 
  Clock, Lock, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';

const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllBranches();
      setBranches(data.branches || []);
    } catch (error) {
      toast.error(error.message || 'فشل في تحميل قائمة الفروع');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const matchesSearch = 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.organization_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.organization_id?.phone?.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'ALL' || branch.subscription_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [branches, searchTerm, statusFilter]);

  const getStatusConfig = (status, daysLeft) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'نشط',
          icon: CheckCircle2,
          colors: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          progressColor: daysLeft < 7 ? 'bg-amber-400' : 'bg-emerald-500'
        };
      case 'TRIAL':
        return {
          label: 'فترة تجريبية',
          icon: Clock,
          colors: 'bg-blue-50 text-blue-700 border-blue-200',
          progressColor: 'bg-blue-500'
        };
      case 'OVERDUE':
        return {
          label: 'متأخر في الدفع',
          icon: AlertCircle,
          colors: 'bg-rose-50 text-rose-700 border-rose-200',
          progressColor: 'bg-rose-500'
        };
      case 'LOCKED':
        return {
          label: 'مغلق',
          icon: Lock,
          colors: 'bg-slate-100 text-slate-700 border-slate-300',
          progressColor: 'bg-slate-400'
        };
      default:
        return {
          label: 'غير معروف',
          icon: Store,
          colors: 'bg-gray-50 text-gray-700 border-gray-200',
          progressColor: 'bg-gray-500'
        };
    }
  };

  const stats = useMemo(() => {
    return {
      total: branches.length,
      active: branches.filter(b => b.subscription_status === 'ACTIVE').length,
      trial: branches.filter(b => b.subscription_status === 'TRIAL').length,
      overdue: branches.filter(b => b.subscription_status === 'OVERDUE').length,
    };
  }, [branches]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">إدارة الفروع</h1>
          <p className="text-slate-500 font-bold text-sm">مراقبة حالة الاشتراكات لجميع الفروع المسجلة</p>
        </div>
        
        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          {[
            { id: 'ALL', label: 'الكل', count: stats.total, color: 'text-slate-600 bg-slate-100' },
            { id: 'ACTIVE', label: 'نشط', count: stats.active, color: 'text-emerald-700 bg-emerald-50' },
            { id: 'TRIAL', label: 'تجريبي', count: stats.trial, color: 'text-blue-700 bg-blue-50' },
            { id: 'OVERDUE', label: 'متأخر', count: stats.overdue, color: 'text-rose-700 bg-rose-50' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all border whitespace-nowrap ${
                statusFilter === filter.id 
                  ? 'border-slate-800 bg-slate-800 text-white shadow-lg' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter.label}
              <span className={`px-2 py-0.5 rounded-md text-xs ${statusFilter === filter.id ? 'bg-white/20 text-white' : filter.color}`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text"
          placeholder="ابحث باسم الفرع، المؤسسة، أو هاتف المالك..."
          className="w-full pr-14 pl-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredBranches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-20 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-black text-slate-700 mb-1">لا توجد فروع</h3>
          <p className="text-slate-500 font-bold">لم يتم العثور على أي فروع تطابق معايير البحث الحالية.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredBranches.map((branch, idx) => {
              const statusConfig = getStatusConfig(branch.subscription_status, branch.days_left);
              const StatusIcon = statusConfig.icon;
              
              const totalDays = branch.subscription_status === 'TRIAL' ? 14 : 30;
              const progressPercentage = Math.min(100, Math.max(0, (branch.days_left / totalDays) * 100));

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  key={branch._id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all group flex flex-col"
                >
                  <div className="p-6 border-b border-slate-100 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${statusConfig.colors}`}>
                          <StatusIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 text-lg truncate" title={branch.name}>
                            {branch.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold truncate" title={branch.organization_id?.name}>
                              {branch.organization_id?.name || 'مؤسسة غير معروفة'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-bold flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          قيمة الاشتراك
                        </span>
                        <span className="font-black text-slate-800">{branch.monthly_fee} ج.م</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-bold flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          هاتف المالك
                        </span>
                        <span className="font-black text-slate-800 tracking-wider" dir="ltr">
                          {branch.organization_id?.phone || '---'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-bold flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          تاريخ الإنشاء
                        </span>
                        <span className="font-bold text-slate-700">
                          {new Date(branch.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الحالة والأيام المتبقية</p>
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black border ${statusConfig.colors}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-black text-slate-800 leading-none">
                          {branch.days_left} <span className="text-xs text-slate-500">يوم</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mt-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${statusConfig.progressColor}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminBranches;