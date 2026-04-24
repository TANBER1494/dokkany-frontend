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
// 🚀 تفعيل الضغط على الإشعارات (Click Action Handler)
// ==============================================================
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  // 1. إغلاق الإشعار فور الضغط عليه
  event.notification.close();

  // 2. استخراج الرابط الذي أرسلناه من الباك إند
  const targetUrl = event.notification.data?.click_action || event.notification.data?.FCM_MSG?.notification?.click_action || self.location.origin;

  // 3. فحص النوافذ المفتوحة للتطبيق
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      
      // هل التطبيق مفتوح بالفعل في الخلفية؟
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // إذا كان مفتوحاً، قم بتحديث الرابط وإيقاظ التطبيق (Focus)
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl); // توجيهه للصفحة المطلوبة
          return client.focus();
        }
      }
      
      // إذا كان التطبيق مغلقاً تماماً، افتح نافذة جديدة
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});