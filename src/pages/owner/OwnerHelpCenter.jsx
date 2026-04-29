import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Map, HelpCircle, Store, Users, UserSquare2, 
  CreditCard, Settings, History, Bell, ChevronDown, ArrowLeft
} from 'lucide-react';

const ownerRoadmap = [
  {
    icon: <Store className="w-4 h-4 sm:w-5 sm:h-5" />,
    color: "bg-indigo-500",
    title: "1. إدارة الفروع وإضافتها",
    desc: "عند الدخول إلى 'الفروع'، سترى الفرع الذي أنشأته أثناء التسجيل. يمكنك دائماً التوسع وإضافة فروع أخرى عبر زر 'فتح فرع جديد'."
  },
  {
    icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
    color: "bg-emerald-500",
    title: "2. الدخول للفرع وإضافة الموظفين",
    desc: "من خلال 'إدارة الفرع'، يمكنك إضافة العمال (الموظفين)، والاطلاع على الحسابات المعلقة الخاصة بالموردين وزبائن هذا الفرع تحديداً."
  },
  {
    icon: <UserSquare2 className="w-4 h-4 sm:w-5 sm:h-5" />,
    color: "bg-blue-500",
    title: "3. إعداد حساب الكاشير",
    desc: "من نفس شاشة إدارة الفرع، يجب إعداد حساب الكاشير (اسم، رقم هاتف، كلمة سر). هذا هو الحساب الموحد الذي سيدخل به موظفو الفرع لنقطة البيع."
  },
  {
    icon: <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />,
    color: "bg-rose-500",
    title: "4. الاشتراكات والتجديد",
    desc: "من قسم 'الاشتراكات'، يمكنك تجديد اشتراك أي فرع بناءً على الخطط المطروحة، ومتابعة سجل طلبات التجديد (مقبولة أو مرفوضة)."
  },
  {
    icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" />,
    color: "bg-slate-500",
    title: "5. ضبط الإعدادات والصلاحيات",
    desc: "يحتوي قسم الإعدادات على: الأمان (تغيير الهاتف والرقم السري)، صلاحيات مسح الفواتير (تحديد المهلة ومفتاح الاستثناء)، وتفضيلات المظهر."
  },
  {
    icon: <History className="w-4 h-4 sm:w-5 sm:h-5" />,
    color: "bg-amber-500",
    title: "6. مراقبة الورديات (Live)",
    desc: "بمجرد عمل الكاشير، ستظهر الأرقام في الرئيسية. ومن قسم 'الورديات' يمكنك مراقبة العمليات اللحظية، ومراجعة أرشيف الورديات السابقة بالتفصيل."
  },
  {
    icon: <Bell className="w-4 h-4 sm:w-5 sm:h-5" />,
    color: "bg-purple-500",
    title: "7. رادار الإشعارات اللحظية",
    desc: "أنت دائماً في قلب الحدث. سيصلك إشعار فوري عند تسليم أي وردية، أو عند سداد تنزيل فاتورة من مورد في أي فرع."
  }
];

const faqData = [
  {
    category: "المخزن والجرد السريع",
    questions: [
      { q: "كيف أضيف كميات كبيرة من المنتجات مرة واحدة؟", a: "لتوفير وقتك، ادخل إلى قسم (المخزن)، واضغط على 'استيراد من إكسيل'. قم بتحميل القالب الذكي، املأه ببيانات منتجاتك، ثم ارفعه مرة أخرى ليتم تسجيلها فوراً." },
      { q: "ما هي الخطوات الصحيحة لجرد المحل؟", a: "اذهب إلى (المخزن -> جرد المحل). أولاً: قم بالعد الفعلي للمنتجات وعدل الكميات. ثانياً: انتقل للبيانات المالية وأدخل 'الكاش الفعلي في الدرج' و 'رأس المال السابق' ليقوم النظام بحساب العجز أو الزيادة وصافي الأرباح وإصدار الميزانية العمومية." }
    ]
  },
  {
    category: "الإعدادات والصلاحيات",
    questions: [
      { q: "كيف أمنع الكاشير من التلاعب بالفواتير؟", a: "من (الإعدادات -> صلاحيات مسح الفواتير)، يمكنك تحديد مهلة زمنية (مثلاً 15 دقيقة) يُسمح فيها بمسح الفاتورة أو التعديل عليها، أو إيقافها تماماً. ولا يمكن تجاوزها إلا إذا قمت بتفعيل 'مفتاح الاستثناء' مؤقتاً." },
      { q: "هل يمكنني اختيار الإشعارات التي تصلني؟", a: "نعم بالتأكيد. من (الإعدادات -> التفضيلات والإشعارات)، يمكنك تفعيل أو إيقاف إشعارات معينة مثل: سحب مصروفات ضخمة (أكثر من 1000ج)، استلام وتسليم الوردية، سداد الموردين، أو مسح الفواتير." }
    ]
  }
];

const FaqItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-xl mb-2.5 sm:mb-3 overflow-hidden bg-white dark:bg-slate-900/50 transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-right font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="text-xs sm:text-sm pr-2">{q}</span>
        <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-3.5 sm:pb-4 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed"
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OwnerHelpCenter = () => {
  const [activeTab, setActiveTab] = useState('roadmap');
  const navigate = useNavigate(); // 🚀 استخدام الموجه

  return (
    <div className="max-w-4xl mx-auto pb-10 transition-colors duration-300 px-2 sm:px-0">
      
      {/* الهيدر المحسن */}
      <div className="bg-indigo-600 rounded-[20px] sm:rounded-3xl p-5 sm:p-8 mb-4 sm:mb-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[100px] sm:min-h-[120px]">
        <div className="absolute -left-10 -top-10 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <h1 className="text-lg sm:text-2xl font-black mb-1 sm:mb-2 relative z-10 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" /> مركز مساعدة دكاني
        </h1>
        <p className="text-indigo-100 text-[11px] sm:text-sm font-bold relative z-10">
          دليلك الشامل لإدارة فروعك ومخازنك باحترافية
        </p>
      </div>

      {/* أزرار التبديل */}
      <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-sm transition-all ${
            activeTab === 'roadmap' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> خريطة الطريق
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-sm transition-all ${
            activeTab === 'faq' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> أسئلة شائعة
        </button>
      </div>

      {/* المحتوى */}
      <AnimatePresence mode="wait">
        {activeTab === 'roadmap' ? (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 sm:space-y-6 relative before:absolute before:inset-0 before:ml-4 sm:before:ml-[28px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent"
          >
            {ownerRoadmap.map((step, index) => (
              <div key={index} className="relative flex items-start sm:items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`mt-1 sm:mt-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[3px] sm:border-4 border-slate-50 dark:border-slate-950 ${step.color} text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                  {step.icon}
                </div>
                <div className="w-[calc(100%-2.5rem)] sm:w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <h3 className="font-black text-slate-800 dark:text-white text-sm sm:text-base mb-1.5 sm:mb-2">{step.title}</h3>
                  <p className="text-[11px] sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {faqData.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 mb-3 px-2">
                  {section.category}
                </h2>
                <div>
                  {section.questions.map((faq, fIdx) => (
                    <FaqItem key={fIdx} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/*  الزر النهائي: توجيه المستخدم للبدء الفعلي */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 transition-colors"
      >
        <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-3">هل أنت مستعد للانطلاق؟</h2>
        <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 px-4">
          لقد اطلعت على كافة التعليمات، الآن حان وقت البدء في تهيئة فرعك الأول وإضافة موظفيك.
        </p>
        <button
          onClick={() => navigate('/owner/branches')}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-indigo-500/20 mx-auto"
        >
          ابدأ بإدارة فروعك الآن <ArrowLeft className="w-4 h-4" />
        </button>
      </motion.div>

    </div>
  );
};

export default OwnerHelpCenter;