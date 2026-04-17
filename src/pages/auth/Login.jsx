import { useState, useContext } from 'react';
import { Mail, Lock, LogIn, Store, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';
import { showAlert } from '../../utils/alert';

const Login = () => {
  const logoUrl = "https://cdn-icons-png.flaticon.com/512/3655/3655682.png"; 
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone || !password) return showAlert.error('بيانات ناقصة', 'يرجى إدخال رقم الهاتف وكلمة المرور');
    if (!/^01[0125][0-9]{8}$/.test(phone)) return showAlert.error('صيغة خاطئة', 'صيغة رقم الهاتف غير صحيحة (مثال: 01012345678)');
    if (password.length < 6) return showAlert.error('كلمة المرور قصيرة', 'كلمة المرور يجب ألا تقل عن 6 أحرف/أرقام');

    try {
      setIsLoading(true);
      showAlert.loading('جاري تسجيل الدخول...'); 
      
      const response = await authService.login({ phone, password });
      
      login(response.user, response.token, response.refresh_token);
      
     await showAlert.success('أهلاً بك!', response.message || 'تم تسجيل الدخول بنجاح');

      // توجيه ذكي حسب الصلاحية
      if (response.user.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else if (response.user.role === 'OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/cashier');
      }

    } catch (error) {
      showAlert.error('فشل الدخول', error.message); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 🚀 تطبيق خلفية مرنة تتغير مع الثيم
    <div className="h-[100dvh] w-full flex items-center justify-center p-0 md:p-4 arabic-direct bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* 🚀 كارت تسجيل الدخول المظلم/المضيء */}
      <div className="w-full h-full md:h-auto md:max-w-md bg-white dark:bg-slate-900 md:rounded-[40px] overflow-hidden shadow-indigo-100 dark:shadow-none md:shadow-2xl relative flex flex-col justify-between animate-slide-up-fade border border-transparent dark:border-slate-800 transition-colors duration-300">
        
        <div className="flex-grow flex flex-col">
          {/* الشكل المتموج العلوي */}
          <div className="absolute top-0 left-0 w-full h-[150px] z-0 pointer-events-none opacity-100 dark:opacity-80 transition-opacity">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: '#4f46e5', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#312e81', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              <path d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,0.00 L0.00,0.00 Z" style={{stroke: 'none', fill: 'url(#gradient)'}}></path>
            </svg>
          </div>

          {/* اللوجو والترحيب */}
          <div className="relative z-10 text-center mt-12 mb-6 px-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-slate-800 p-2 mb-4 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 border border-slate-100 dark:border-slate-700 transition-colors">
              <img src={logoUrl} alt="دكاني" className="w-16 h-16 object-contain" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">الدخول الآمن</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-bold">أدخل بياناتك للوصول لنظامك</p>
          </div>

          {/* نموذج الدخول */}
          <form onSubmit={handleLogin} className="space-y-6 px-8 mb-6 flex-grow flex flex-col justify-center">
            
            <div className="space-y-2 group">
              <label htmlFor="phone" className="block text-sm font-black text-slate-700 dark:text-slate-300 pr-2 transition-colors">رقم الهاتف</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 z-10 transition-colors" />
                <input 
                  id="phone" 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx" 
                  className="w-full pr-12 pl-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 transition-all outline-none text-left font-bold text-lg" 
                  disabled={isLoading}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label htmlFor="password" className="block text-sm font-black text-slate-700 dark:text-slate-300 pr-2 transition-colors">كلمة المرور / الـ PIN</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 z-10 transition-colors" />
                <input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********" 
                  className="w-full pr-12 pl-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 transition-all outline-none tracking-widest text-left font-bold text-lg" 
                  disabled={isLoading}
                  dir="ltr"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 dark:bg-indigo-500 text-white text-lg font-black rounded-2xl shadow-lg shadow-indigo-500/30 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {isLoading ? 'جاري التحقق...' : 'دخول آمن'}
            </button>
          </form>
        </div>

        {/* قسم إنشاء حساب جديد */}
        <div className="py-6 border-t border-slate-100 dark:border-slate-800 text-center space-y-3 px-8 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">هل أنت مالك جديد؟</p>
          <Link 
            to="/register" 
            className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-black py-3 px-6 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all border border-indigo-100 dark:border-indigo-500/20"
          >
            <Store className="w-4 h-4" />
            تأسيس مؤسسة جديدة الآن
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;