// ============================================================
// Firebase 專案設定 — 請依 README.md 的步驟建立你自己的 Firebase
// 專案後，把下方六個值換成你自己的（Console > 專案設定 > 一般 >
// 你的應用程式 > SDK 設定與程式碼片段 > 設定）。
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCvtQIc_1DD2VzgzbHzGljjv818L1LgelQ",
  authDomain: "my-live-poll-2dfef.firebaseapp.com",
  databaseURL: "https://my-live-poll-2dfef-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-live-poll-2dfef",
  storageBucket: "my-live-poll-2dfef.firebasestorage.app",
  messagingSenderId: "129667013449",
  appId: "1:129667013449:web:514dece6318124af175898"
};

// 管理後台（admin.html）的簡易密碼保護。
// 這只是基本防呆（避免路人誤點進去），不是正式帳號驗證機制。
// 若要更安全，請改用 Firebase Authentication（README 有說明）。
const ADMIN_PASSWORD = "zxc811024";
