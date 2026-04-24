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
