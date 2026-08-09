// ============================================================
// 共用工具函式，供 admin.html / display.html / audience.html 使用
// ============================================================

// 從網址參數取得場次代碼（?session=xxx），預設為 "default"
function getSessionId() {
  const params = new URLSearchParams(location.search);
  let sid = params.get('session') || 'default';
  // Firebase RTDB 路徑不可包含 . # $ [ ] /
  return sid.replace(/[.#$[\]/]/g, '_').slice(0, 40) || 'default';
}

// 產生／取得裝置匿名 ID（存在 localStorage），用來讓投票可覆蓋、做防刷屏
function getDeviceId() {
  let id = localStorage.getItem('lps_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('lps_device_id', id);
  }
  return id;
}

// 純文字轉義，避免任何使用者輸入被當成 HTML 插入造成 XSS
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

// 修剪並限制輸入長度
function sanitizeInput(str, maxLen) {
  return String(str == null ? '' : str).trim().slice(0, maxLen || 200);
}

// 簡易防抖
function debounce(fn, wait) {
  let t = null;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// 讀取 / 寫入 localStorage 的冷卻時間戳記，回傳「還要等幾秒」（0 表示可以送出）
function getCooldownRemaining(key) {
  const last = Number(localStorage.getItem(key) || 0);
  const elapsed = (Date.now() - last) / 1000;
  return elapsed;
}
function setCooldownNow(key) {
  localStorage.setItem(key, String(Date.now()));
}

// 建立目前網域下 audience.html 的完整網址（帶 session 參數）
function buildAudienceUrl(sessionId) {
  const url = new URL('audience.html', location.href);
  url.searchParams.set('session', sessionId);
  return url.toString();
}
