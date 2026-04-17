import { useState, useContext } from 'react';
import {
  User,
  Phone,
  Lock,
  Building2,
  Store,
  MapPin,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';
import { showAlert } from '../../utils/alert';

const RegisterOwner = () => {
  const logoUrl = 'https://cdn-icons-png.flaticon.com/512/3655/3655682.png';
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    owner_name: '',
    phone: '',
    password: '',
    organization_name: '',
    branch_name: '',
    branch_location: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleNextStep = () => {
    if (!formData.owner_name || formData.owner_name.length < 3)
      return showAlert.error('تنبيه', 'يرجى إدخال اسم المالك بشكل صحيح');
    if (!/^01[0125][0-9]{8}$/.test(formData.phone))
      return showAlert.error('تنبيه', 'صيغة رقم الهاتف غير صحيحة');
    if (formData.password.length < 6)
      return showAlert.error('تنبيه', 'كلمة المرور يجب ألا تقل عن 6 أحرف/أرقام');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.organization_name ||
      !formData.branch_name ||
      !formData.branch_location
    ) {
      return showAlert.error('بيانات ناقصة', 'يرجى إكمال جميع بيانات السوبر ماركت');
    }

    try {
      setIsLoading(true);
      showAlert.loading('جاري تأسيس النظام وتهيئة قاعدة البيانات...');

      const response = await authService.registerOwner(formData);

      login(response.user, response.token);

      await showAlert.success('عملية ناجحة!', response.message || 'تم تأسيس النظام بنجاح!');
      navigate('/owner/dashboard');
    } catch (error) {
      showAlert.error('فشل التأسيس', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center p-0 md:p-4 arabic-direct bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      
      <div className="w-full h-full md:h-auto md:max-w-md bg-white dark:bg-slate-900 md:rounded-[40px] overflow-hidden shadow-indigo-100 dark:shadow-none md:shadow-2xl relative flex flex-col justify-between animate-slide-up-fade border border-transparent dark:border-slate-800 transition-colors duration-300">
        
        <div className="flex-grow flex flex-col justify-center">
          
          <div className="absolute top-0 left-0 w-full h-[110px] z-0 pointer-events-none opacity-100 dark:opacity-80 transition-opacity">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="gradient-reg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#312e81', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,0.00 L0.00,0.00 Z" style={{ stroke: 'none', fill: 'url(#gradient-reg)' }}></path>
            </svg>
          </div>

          <div className="relative z-10 text-center mt-6 mb-4 px-8 md:px-14">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-800 p-2 mb-2 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 border border-slate-100 dark:border-slate-700 transition-colors">
              <img src={logoUrl} alt="دكاني" className="w-10 h-10 object-contain" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
              تأسيس مؤسسة
            </h2>
            
            {/* مؤشر الخطوات المظلم/المضيء */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-8 bg-indigo-600 dark:bg-indigo-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}></div>
              <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-8 bg-indigo-600 dark:bg-indigo-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 mb-2 flex-grow flex flex-col justify-center">
            
            {step === 1 && (
              <div className="space-y-4 animate-fade-in-rapid">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 text-center transition-colors">
                  الخطوة 1: بيانات الدخول الخاصة بك
                </h3>

                <div className="space-y-1 group">
                  <label htmlFor="owner_name" className="block text-sm font-black text-slate-700 dark:text-slate-300 pr-2 transition-colors">
                    الاسم الرباعي
                  </label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 z-10 transition-colors" />
                    <input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      type="text"
                      placeholder="الاسم الرباعي"
                      className="w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 outline-none text-right font-bold text-base transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1 group">
                  <label htmlFor="phone" className="block text-sm font-black text-slate-700 dark:text-slate-300 pr-2 transition-colors">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 z-10 transition-colors" />
                    <input
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      type="tel"
                      placeholder="رقم الهاتف"
                      className="w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 outline-none text-left font-bold text-base transition-all"
                      disabled={isLoading}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1 group">
                  <label htmlFor="password" className="block text-sm font-black text-slate-700 dark:text-slate-300 pr-2 transition-colors">
                    كلمة المرور الآمنة
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 z-10 transition-colors" />
                    <input
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      type="password"
                      placeholder="********"
                      className="w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 outline-none text-left font-bold tracking-widest text-base transition-all"
                      disabled={isLoading}
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-indigo-600 dark:bg-indigo-500 text-white text-base font-black rounded-2xl shadow-lg shadow-indigo-500/30 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all"
                >
                  التالي <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in-rapid">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 text-center transition-colors">
                  الخطوة 2: بيانات السوبر ماركت
                </h3>

                <div className="space-y-1 group">
                  <label htmlFor="organization_name" className="block text-sm font-black text-slate-700 dark:text-slate-300 pr-2 transition-colors">
                    اسم المؤسسة
                  </label>
                  <div className="relative">
                    <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 z-10 transition-colors" />
                    <input
                      id="organization_name"
                      value={formData.organization_name}
                      onChange={handleChange}
                      type="text"
                      placeholder="مثال: ماركت النور"
                      className="w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 outline-none text-right font-bold text-base transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1 group">
                  <label htmlFor="branch_name" className="block text-sm font-black text-slate-700 dark:text-slate-300 pr-2 transition-colors">
                    اسم الفرع
                  </label>
                  <div className="relative">
                    <Store className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 z-10 transition-colors" />
                    <input
                      id="branch_name"
                      value={formData.branch_name}
                      onChange={handleChange}
                      type="text"
                      placeholder="مثال: الرئيسي"
                      className="w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 outline-none text-right font-bold text-base transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1 group">
                  <label htmlFor="branch_location" className="block text-sm font-black text-slate-700 dark:text-slate-300 pr-2 transition-colors">
                    الموقع
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 z-10 transition-colors" />
                    <input
                      id="branch_location"
                      value={formData.branch_location}
                      onChange={handleChange}
                      type="text"
                      placeholder="مثال: شارع المحطة"
                      className="w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 outline-none text-right font-bold text-base transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="w-1/3 flex items-center justify-center py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/30 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                    {isLoading ? 'جاري التأسيس...' : 'تأسيس'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="py-5 border-t border-slate-100 dark:border-slate-800 text-center px-8 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black hover:gap-3 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة لتسجيل الدخول
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterOwner;