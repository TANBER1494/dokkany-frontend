/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// نفس بياناتك
firebase.initializeApp({
  apiKey: "AIzaSyBf8K0Zsvge_H87J3JVTdgmtMBR-5hfXLA",
  authDomain: "dokkany-47a0e.firebaseapp.com",
  projectId: "dokkany-47a0e",
  storageBucket: "dokkany-47a0e.firebasestorage.app",
  messagingSenderId: "94415362969",
  appId: "1:94415362969:web:44b627ee275f737f2b1108"
});

const messaging = firebase.messaging();

// ==============================================================
// 🚀 تفعيل الضغط على الإشعارات (Ultra-Robust Click Handler)
// ==============================================================
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] 🎯 Notification Clicked!');
  event.notification.close();

  let targetUrl = 'https://dokkany-frontend.vercel.app';

  if (event.notification.data && event.notification.data.click_action) {
    targetUrl = event.notification.data.click_action;
  } else if (event.notification.data && event.notification.data.FCM_MSG && event.notification.data.FCM_MSG.notification) {
    targetUrl = event.notification.data.FCM_MSG.notification.click_action || targetUrl;
  } else if (event.action) {
    targetUrl = event.action; // في حال استخدمنا أزرار داخل الإشعار
  }

  console.log('[Service Worker] 🔗 Target URL resolved to:', targetUrl);

  // 2. البحث عن نافذة مفتوحة للتطبيق أو فتح نافذة جديدة
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      
      // هل التطبيق مفتوح في أي تبويبة؟
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        
        // إذا كان مفتوحاً (سواء في الخلفية أو أمامك)، قم بتوجيهه وإيقاظه
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          console.log('[Service Worker] 🔄 Focusing existing window...');
          client.navigate(targetUrl); 
          return client.focus();
        }
      }
      
      // إذا كان التطبيق مغلقاً تماماً، افتح نافذة جديدة
      console.log('[Service Worker] 🌍 Opening new window...');
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});