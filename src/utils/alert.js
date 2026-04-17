import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const baseConfig = {
  confirmButtonText: 'حسناً',
  buttonsStyling: false,
  customClass: {
    popup: 'rounded-2xl p-6 arabic-direct shadow-xl border border-slate-100',
    title: 'text-lg font-bold text-slate-800 mb-2',
    htmlContainer: 'text-slate-500 font-medium text-sm',
    confirmButton: 'bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md mt-4',
  }
};

export const showAlert = {
  success: (title, text) => {
    return MySwal.fire({
      ...baseConfig,
      icon: 'success',
      iconColor: '#4f46e5',
      title: title || 'تم بنجاح',
      text: text,
    });
  },
  
  error: (title, text) => {
    return MySwal.fire({
      ...baseConfig,
      icon: 'error',
      title: title || 'خطأ في النظام',
      text: text,
      customClass: {
        ...baseConfig.customClass,
        confirmButton: 'bg-rose-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-700 transition-all shadow-md mt-4',
      }
    });
  },

  loading: (title) => {
    return MySwal.fire({
      title: title || 'جاري المعالجة...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-2xl p-6 arabic-direct shadow-xl',
        title: 'text-base font-bold text-slate-700',
      },
      didOpen: () => {
        MySwal.showLoading();
      }
    });
  },

  close: () => {
    MySwal.close();
  }
};