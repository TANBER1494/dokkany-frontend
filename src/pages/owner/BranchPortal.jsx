import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Users,
  Truck,
  BookOpen,
  Store,
  MonitorSmartphone,
} from 'lucide-react';
import BranchVendors from './BranchVendors';
import BranchCustomers from './BranchCustomers';
import BranchEmployees from './BranchEmployees';
import BranchPosSettings from './BranchPosSettings';

const BranchPortal = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('EMPLOYEES');

  const tabs = [
    { id: 'EMPLOYEES', label: 'فريق العمل', icon: Users },
    { id: 'VENDORS', label: 'الموردين', icon: Truck },
    { id: 'CUSTOMERS', label: 'كشكول الزباين', icon: BookOpen },
    { id: 'POS_SETTINGS', label: 'الكاشير', icon: MonitorSmartphone },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 dark:text-slate-200 pb-10 transition-colors duration-300">
      
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-[32px] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/owner/branches')}
            className="p-3 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 rounded-2xl hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all border border-slate-100 dark:border-slate-700 active:scale-95 shadow-sm"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Store className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> إدارة الفرع
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap p-1.5 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm w-full gap-1 shrink-0 transition-colors">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 dark:shadow-none'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'EMPLOYEES' && <BranchEmployees />}
            {activeTab === 'POS_SETTINGS' && <BranchPosSettings branchId={branchId} />}
            {activeTab === 'VENDORS' && <BranchVendors branchId={branchId} />}
            {activeTab === 'CUSTOMERS' && <BranchCustomers branchId={branchId} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BranchPortal;