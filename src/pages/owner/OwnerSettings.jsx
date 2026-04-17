import { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  ShieldAlert,
  Bell,
  Moon,
  Sun,
  Smartphone,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  ChevronDown,
  UserCog,
  Timer,
  Key,
} from 'lucide-react';
import { showAlert } from '../../utils/alert';
import settingsService from '../../services/settingsService';
import { ThemeContext } from '../../context/ThemeContext';

// مكوّن القائمة المنسدلة (Accordion)
const AccordionSection = ({
  id,
  title,
  subtitle,
  icon,
  children,
  isOpen,
  onToggle,
}) => (
  <div
    className={`transition-all duration-300 rounded-[24px] overflow-hidden ${
      isOpen
        ? 'bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-500/30 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-900/20 ring-1 ring-indigo-50/50 dark:ring-indigo-500/20 my-6'
        : 'bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-md mb-3'
    }`}
  >
    <button
      onClick={() => onToggle(id)}
      className={`w-full flex items-center justify-between p-5 sm:p-6 text-right transition-colors ${isOpen ? 'bg-indigo-50/30 dark:bg-indigo-500/10' : 'bg-transparent'}`}
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <div
          className={`p-3.5 rounded-2xl transition-colors ${isOpen ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
        >
          {icon}
        </div>
        <div>
          <h3
            className={`text-base sm:text-lg font-black transition-colors ${isOpen ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}
          >
            {title}
          </h3>
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>
      <div
        className={`p-2.5 rounded-full transition-all duration-300 ${isOpen ? 'rotate-180 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500'}`}
      >
        <ChevronDown className="w-5 h-5" />
      </div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="border-t border-indigo-50/50 dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          <div className="p-5 sm:p-8">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const OwnerSettings = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [openSection, setOpenSection] = useState('null');

  const [isPhoneSaving, setIsPhoneSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isPreferencesSaving, setIsPreferencesSaving] = useState(false);

  const [phone, setPhone] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [deletionWindowMinutes, setDeletionWindowMinutes] = useState(15);
  const [isDeletionAllowed, setIsDeletionAllowed] = useState(false);

  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const [notifications, setNotifications] = useState({
    shift_opened: true,
    shift_closed: true,
    large_expense: true,
    vendor_payment: true,
    new_invoice: true,
    invoice_deleted: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setPhone(data.phone || '');

        setDeletionWindowMinutes(data.deletion_window_minutes || 15);
        setIsDeletionAllowed(data.is_deletion_allowed || false);

        // 🚀 تم إزالة toggleTheme من هنا لمنع حلقة الوميض المفرغة (Flickering Bug Fix)
        
        if (data.notifications) {
          setNotifications((prev) => ({ ...prev, ...data.notifications }));
        }
      } catch (error) {
        showAlert.error('خطأ', error.message);
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    if (!/^01[0125][0-9]{8}$/.test(phone))
      return showAlert.error('تنبيه', 'رقم هاتف غير صحيح');
    try {
      setIsPhoneSaving(true);
      await settingsService.updatePhone(phone);
      showAlert.success('تم الحفظ', 'تم تحديث رقم الهاتف بنجاح');
    } catch (error) {
      showAlert.error('فشل التحديث', error.message);
    } finally {
      setIsPhoneSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password)
      return showAlert.error('تنبيه', 'كلمة المرور غير متطابقة');
    if (passwordForm.new_password.length < 6)
      return showAlert.error('تنبيه', '6 أحرف على الأقل');
    try {
      setIsPasswordSaving(true);
      await settingsService.updatePassword(passwordForm);
      showAlert.success('تم الحفظ', 'تم تغيير كلمة المرور بنجاح');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      showAlert.error('فشل التحديث', error.message);
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsPreferencesSaving(true);
      await settingsService.updatePreferences({
        is_dark_mode: isDarkMode,
        notifications,
        is_deletion_allowed: isDeletionAllowed,
        deletion_window_minutes: deletionWindowMinutes,
      });
      showAlert.success(
        'تم اعتماد التغييرات',
        'تم تحديث ضوابط الصلاحيات والإشعارات بنجاح'
      );
    } catch (error) {
      showAlert.error('فشل الحفظ', error.message);
    } finally {
      setIsPreferencesSaving(false);
    }
  };

  const handleToggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const ToggleSwitch = ({
    enabled,
    onClick,
    colorClass = 'bg-indigo-600 dark:bg-indigo-500',
  }) => (
    <div
      onClick={onClick}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0 ${enabled ? colorClass : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <motion.div
        layout
        className="bg-white w-4 h-4 rounded-full shadow-sm"
        animate={{ x: enabled ? -24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </div>
  );

  if (isPageLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );

  return (
    <div className="w-full flex flex-col pb-20 max-w-4xl mx-auto transition-colors duration-300">
      <div className="mb-8 px-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />{' '}
          إعدادات النظام المركزية
        </h2>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 sm:mr-11">
          تحكم في حسابك، حدد ضوابط مسح الفواتير للكاشير، وراقب العمليات لحظة
          بلحظة.
        </p>
      </div>

      <div className="flex flex-col">
        {/* القسم الأول: إعدادات الحساب والأمان */}
        <AccordionSection
          id="account"
          title="إعدادات الحساب والأمان"
          subtitle="تغيير رقم الهاتف المربوط بالحساب وكلمة المرور"
          icon={<UserCog className="w-6 h-6" />}
          isOpen={openSection === 'account'}
          onToggle={handleToggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />{' '}
                تغيير رقم الهاتف
              </h4>
              <form
                onSubmit={handleUpdatePhone}
                className="space-y-3 bg-slate-50/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors"
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none font-bold text-left transition-all focus:border-indigo-600 dark:focus:border-indigo-500"
                  dir="ltr"
                  maxLength="11"
                  required
                  placeholder="01xxxxxxxxx"
                />
                <button
                  type="submit"
                  disabled={isPhoneSaving}
                  className="w-full py-4 bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-indigo-500/20 dark:shadow-none"
                >
                  {isPhoneSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}{' '}
                  حفظ الرقم
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-500 dark:text-rose-400" />{' '}
                تغيير كلمة المرور
              </h4>
              <form
                onSubmit={handleUpdatePassword}
                className="space-y-3 bg-slate-50/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors"
              >
                <input
                  type="password"
                  required
                  placeholder="الحالية"
                  value={passwordForm.current_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      current_password: e.target.value,
                    })
                  }
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm outline-none focus:border-rose-400 dark:focus:border-rose-500 transition-all"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="password"
                    required
                    placeholder="الجديدة"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        new_password: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm outline-none focus:border-rose-400 dark:focus:border-rose-500 transition-all"
                  />
                  <input
                    type="password"
                    required
                    placeholder="تأكيد"
                    value={passwordForm.confirm_password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm_password: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm outline-none focus:border-rose-400 dark:focus:border-rose-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPasswordSaving}
                  className="w-full py-4 bg-slate-800 dark:bg-indigo-600 text-white hover:bg-slate-900 dark:hover:bg-indigo-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                >
                  تحديث الأمان
                </button>
              </form>
            </div>
          </div>
        </AccordionSection>

        {/* القسم الثاني: ضوابط مسح الفواتير (المنطق الإداري المرن) */}
        <AccordionSection
          id="permissions"
          title="صلاحيات مسح الفواتير"
          subtitle="تحديد المهلة الزمنية ومفتاح الاستثناء المباشر للكاشير"
          icon={<ShieldAlert className="w-6 h-6" />}
          isOpen={openSection === 'permissions'}
          onToggle={handleToggleSection}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* التحكم في المهلة الثابتة */}
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-5 rounded-[24px] flex flex-col justify-between transition-colors">
                <div>
                  <h4 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <Timer className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />{' '}
                    المهلة الزمنية الدائمة
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                    الوقت المسموح به للكاشير لمسح الفاتورة فور إصدارها (حق طبيعي
                    لتعديل الخطأ السريع).
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-600 shadow-sm w-fit transition-colors">
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={deletionWindowMinutes}
                    onChange={(e) => setDeletionWindowMinutes(e.target.value)}
                    className="w-20 p-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-black text-center text-lg text-slate-800 dark:text-white outline-none border-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 transition-colors"
                  />
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 pr-1">
                    دقيقة
                  </span>
                </div>
              </div>

              {/* مفتاح الاستثناء الاستراتيجي */}
              <div
                className={`p-5 rounded-[24px] border-2 transition-all flex flex-col justify-between ${isDeletionAllowed ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                      <Key
                        className={`w-5 h-5 ${isDeletionAllowed ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}
                      />{' '}
                      مفتاح الاستثناء
                    </h4>
                    <ToggleSwitch
                      enabled={isDeletionAllowed}
                      onClick={() => setIsDeletionAllowed(!isDeletionAllowed)}
                      colorClass="bg-amber-500 dark:bg-amber-600"
                    />
                  </div>
                  <p
                    className={`text-[11px] font-bold mt-1.5 leading-relaxed ${isDeletionAllowed ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {isDeletionAllowed
                      ? 'مفتوح الآن: الكاشير يستطيع مسح أي فاتورة حتى لو انتهت المهلة. (لا تنسَ إغلاقه بعد الانتهاء).'
                      : 'مغلق: لا يمكن للكاشير تجاوز المهلة الزمنية المحددة مهما حاول.'}
                  </p>
                </div>
                <div className="mt-4">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black border ${isDeletionAllowed ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'}`}
                  >
                    {isDeletionAllowed ? 'استثناء نشط' : 'الوضع الآمن'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end transition-colors">
              <button
                onClick={handleSavePreferences}
                disabled={isPreferencesSaving}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm shadow-xl shadow-slate-900/20 dark:shadow-none hover:bg-slate-800 dark:hover:bg-indigo-700"
              >
                {isPreferencesSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}{' '}
                حفظ ضوابط الرقابة
              </button>
            </div>
          </div>
        </AccordionSection>

        {/* القسم الثالث: المظهر والرادار */}
        <AccordionSection
          id="preferences"
          title="التفضيلات والإشعارات"
          subtitle="تخصيص المظهر وتفعيل رادار التنبيهات اللحظي"
          icon={<Bell className="w-6 h-6" />}
          isOpen={openSection === 'preferences'}
          onToggle={handleToggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                )}{' '}
                مظهر النظام
              </h4>

              <div className="flex items-center justify-between p-5 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
                <div>
                  <span className="block text-sm font-bold text-slate-800 dark:text-white">
                    تفعيل الوضع الداكن
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 block">
                    تبديل مظهر النظام بالكامل
                  </span>
                </div>
                {/* ربط الـ Toggle بالدالة العالمية toggleTheme مباشرة */}
                <ToggleSwitch enabled={isDarkMode} onClick={toggleTheme} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />{' '}
                رادار التنبيهات اللحظية
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
                  <div>
                    <span className="block text-sm font-bold text-slate-800 dark:text-white">
                      استلام الوردية (بصمة الحضور)
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 block">
                      تنبيه عند استلام الدرج وبداية الوردية
                    </span>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.shift_opened}
                    onClick={() => handleToggleNotification('shift_opened')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
                  <div>
                    <span className="block text-sm font-bold text-slate-800 dark:text-white">
                      تسليم وإغلاق الوردية
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 block">
                      تنبيه عند إنهاء الوردية وجرد الدرج
                    </span>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.shift_closed}
                    onClick={() => handleToggleNotification('shift_closed')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
                  <div>
                    <span className="block text-sm font-bold text-slate-800 dark:text-white">
                      إنذار المصروفات الضخمة
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 block">
                      تنبيه عند سحب 1000 ج.م أو أكثر من الخزينة
                    </span>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.large_expense}
                    onClick={() => handleToggleNotification('large_expense')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
                  <div>
                    <span className="block text-sm font-bold text-slate-800 dark:text-white">
                      سداد مدفوعات الموردين
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 block">
                      تنبيه عند دفع كاش لمندوب المورد
                    </span>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.vendor_payment}
                    onClick={() => handleToggleNotification('vendor_payment')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
                  <div>
                    <span className="block text-sm font-bold text-slate-800 dark:text-white">
                      استلام بضاعة جديدة
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 block">
                      تنبيه عند تسجيل فاتورة آجلة جديدة
                    </span>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.new_invoice}
                    onClick={() => handleToggleNotification('new_invoice')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-rose-50/50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20 transition-colors">
                  <div>
                    <span className="block text-sm font-black text-rose-700 dark:text-rose-400">
                      تنبيه مسح الفواتير
                    </span>
                    <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-bold mt-0.5 block">
                      تنبيه فوري في حال قيام الكاشير بحذف أو تراجع عن فاتورة.
                    </span>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.invoice_deleted}
                    onClick={() => handleToggleNotification('invoice_deleted')}
                    colorClass="bg-rose-500 dark:bg-rose-600"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleSavePreferences}
                  disabled={isPreferencesSaving}
                  className="w-full py-4 bg-emerald-500 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-700 font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 dark:shadow-none active:scale-95"
                >
                  {isPreferencesSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}{' '}
                  حفظ التفضيلات
                </button>
              </div>
            </div>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
};

export default OwnerSettings;