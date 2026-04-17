import React, { createContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

// تعريف الثوابت لمنع الأخطاء الإملائية (Best Practice)
const STORAGE_KEYS = {
  TOKEN: 'dokkany_token',
  REFRESH_TOKEN: 'dokkany_refresh_token',
  USER: 'dokkany_user'
};

export const AuthProvider = ({ children }) => {
  // التهيئة البطيئة (Lazy Initialization) لقراءة البيانات من المتصفح مرة واحدة فقط
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [socket, setSocket] = useState(null);
  const loading = false; // البيانات تُقرأ بشكل متزامن، لا نحتاج لحالة تحميل حقيقية هنا

  // إدارة الاتصال اللحظي وإعدادات إعادة الاتصال التلقائي
  useEffect(() => {
    let newSocket;

    if (user) {
      newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5, // محاولة إعادة الاتصال 5 مرات عند انقطاع الإنترنت
        reconnectionDelay: 2000, // الانتظار ثانيتين بين كل محاولة
      });

      newSocket.on('connect', () => {
        let room;
        
        // توجيه المستخدم لغرفته المخصصة بناءً على دوره المعماري
        if (user.role === 'SUPER_ADMIN') {
          room = 'SUPER_ADMIN_ROOM';
        } else if (user.role === 'OWNER') {
          room = user.organization_id;
        } else {
          room = user._id || user.id;
        }
        
        newSocket.emit('joinRoom', room);
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection failed:', error.message);
      });
    }

    // تنظيف الاتصال عند تدمير المكون أو تسجيل الخروج
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);

  // استخدام useCallback لمنع إعادة التصيير غير الضروري للمكونات الفرعية
  const login = useCallback((userData, accessToken, incomingRefreshToken) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, incomingRefreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.removeItem('dokkany_last_splash');
    
    setToken(accessToken);
    setRefreshToken(incomingRefreshToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem('dokkany_splash_seen');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    
    if (socket) {
      socket.disconnect();
    }
  }, [socket]);

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, loading, login, logout, socket }}>
      {children}
    </AuthContext.Provider>
  );
};