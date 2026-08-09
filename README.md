# 即時互動系統（文字雲 / 投票 / 留言板）

純前端（HTML/CSS/JS）+ Firebase Realtime Database 的免費線上互動系統，可用於課堂、演講、工作坊即時收集觀眾回饋，並在簡報畫面（可嵌入 PowerPoint）即時呈現。

## 檔案結構

```
live-poll-system/
├── firebase-config.js   ← 你的 Firebase 專案金鑰（需自行填入）
├── common.js             ← 共用工具函式
├── admin.html             ← 【主持人】控制台：新增/切換題目、審核留言、調整版面
├── display.html           ← 【簡報呈現】大螢幕/投影用，也是要嵌入 PPT 的網址
└── audience.html          ← 【觀眾】手機用的作答頁面（QR Code 掃描後開啟）
```

三個角色開三個不同網址：
- 你（主持人）自己電腦上開 `admin.html` 操作
- 投影/簡報畫面開 `display.html`（或嵌入 PPT）
- 觀眾手機掃 QR Code 開 `audience.html`

---

## 第一步：建立 Firebase 專案與 Realtime Database（全部免費）

1. 前往 https://console.firebase.google.com/ ，用 Google 帳號登入，點「新增專案」，輸入專案名稱（例如 `my-live-poll`），一路下一步建立完成。
2. 左側選單找到 **Build > Realtime Database**，點「建立資料庫」。
   - 地區建議選離你近的（例如 `asia-southeast1` 新加坡）。
   - 安全性規則先選「**測試模式**」即可（等一下我們會換成正式規則）。
3. 建立完成後，左側選單點齒輪圖示 → **專案設定** → 往下捲到「你的應用程式」→ 點 `</>`（網頁應用程式圖示）。
   - 輸入應用程式暱稱（隨意），**不用**勾選 Firebase Hosting。
   - 註冊後會看到一段 `firebaseConfig = {...}` 的程式碼，把裡面 6 個值複製起來。
4. 打開專案裡的 [firebase-config.js](firebase-config.js)，把 `YOUR_API_KEY` 等 6 個佔位值換成你剛剛複製的內容。`databaseURL` 也要換成你資料庫的網址（在 Realtime Database 頁面最上方可以看到）。
5. 同一個檔案裡的 `ADMIN_PASSWORD`，改成你自己要用的管理密碼（避免路人誤開 `admin.html` 亂改題目，屬於基本防呆，不是正式帳號系統）。

## 第二步：設定安全規則

回到 **Realtime Database > 規則** 分頁，貼上以下內容並「發布」：

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        "activeQuestionId": { ".write": true },
        "questions": {
          "$qid": {
            ".write": true,
            ".validate": "newData.hasChildren(['type', 'title'])",
            "title": { ".validate": "newData.isString() && newData.val().length <= 120" },
            "type": { ".validate": "newData.val() === 'wordcloud' || newData.val() === 'poll' || newData.val() === 'qa'" }
          }
        },
        "settings": { ".write": true },
        "responses": {
          "$qid": {
            "$respId": {
              ".write": true,
              "text": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 300)" }
            }
          }
        }
      }
    }
  }
}
```

> **請注意安全性的取捨**：這組規則會驗證資料的「形狀」（型別、長度上限），阻擋亂塞垃圾資料，但因為系統沒有登入機制，理論上任何拿到你 Firebase 專案設定的人都能寫入資料。實務上足以應付課堂/演講場景（`admin.html` 網址不對外公開、資料庫又有基本驗證）。若要更高安全性，之後可加上 Firebase Authentication（例如主持人用 Email 登入，規則改成 `auth != null` 才能寫入 `questions`/`settings`），有需要我可以再幫你加。

## 第三步：本機測試

因為用了 ES module 以外的一般 script，直接用瀏覽器打開 `file://` 也大致能跑，但建議用簡單的本機伺服器（避免部分瀏覽器的安全限制）：

```bash
cd live-poll-system
npx serve .
```

打開終端機顯示的網址，分別測試：
- `http://localhost:3000/admin.html?session=test1`（建立題目、啟用題目）
- `http://localhost:3000/audience.html?session=test1`（用手機或另一個分頁模擬觀眾作答）
- `http://localhost:3000/display.html?session=test1`（看即時結果）

`?session=xxx` 是「場次代碼」，同一個 Firebase 專案可以同時跑多場不衝突的活動（例如不同班級），三個頁面的 session 代碼要一致才能互通。`admin.html` 裡有「建立新場次」按鈕會自動產生代碼並更新網址。

---

## 第四步：部署上線

### 選項 A：GitHub Pages（推薦，全免費）

```bash
cd live-poll-system
git init
git add .
git commit -m "Initial commit"
```

1. 到 GitHub 建一個新的 repository（例如 `live-poll-system`），依畫面指示把本機 repo push 上去：

```bash
git remote add origin https://github.com/你的帳號/live-poll-system.git
git branch -M main
git push -u origin main
```

2. 到 repo 的 **Settings > Pages**，Source 選 `main` 分支、根目錄 `/`，儲存。
3. 幾分鐘後即可用 `https://你的帳號.github.io/live-poll-system/admin.html` 這類網址存取。

### 選項 B：Vercel（免費，也很簡單）

1. 到 https://vercel.com 用 GitHub 帳號登入。
2. 「Add New Project」→ 選你剛剛的 GitHub repo → 因為是純靜態網站，Framework 選 `Other`，Build 指令留空，Output Directory 留空 → Deploy。
3. 部署完成會拿到一個 `https://xxx.vercel.app` 網域，之後用法同上，把 `admin.html` / `display.html` / `audience.html` 接在網域後面即可。

> ⚠️ **firebase-config.js 會被公開在網路上**，這是正常的（Firebase 網頁 SDK 的 API Key 本來就設計成可公開，真正的存取控制是靠上面的「安全規則」，不是靠隱藏金鑰）。但 `ADMIN_PASSWORD` 因為也會一起公開，只能當作「避免路人誤觸」的門檻，不是防駭客的機制，這點請留意。

---

## 第五步：嵌入 PowerPoint

部署完成後，把 `display.html` 的完整網址（記得帶上 `?session=你的場次代碼`）準備好，例如：

```
https://你的帳號.github.io/live-poll-system/display.html?session=class01
```

在 PowerPoint 裡嵌入網頁有兩種常見做法：

1. **Web Viewer 增益集**（Office 增益集商店可搜尋「Web Viewer」）：安裝後在投影片插入 Web Viewer 物件，貼上上面的網址即可在投影片裡即時顯示互動畫面。放映簡報時該區塊會即時更新。
2. **LiveWeb / Live Slides 之類的增益集**：用法類似，插入時貼上同一個網址。

也可以不嵌入 PPT，直接用另一個視窗/延伸螢幕全螢幕開 `display.html`，這樣完全不受 PPT 增益集限制，動畫效果也最完整（建議大型場合優先用這個方式）。

---

## 使用流程（給主持人）

1. 開 `admin.html?session=你的場次代碼`，輸入密碼登入。
2. 在「新增題目」選類型（文字雲 / 投票 / 留言板），投票題可新增多個選項、勾選是否複選。
3. 在題目列表點「啟用」，該題就會立刻出現在 `display.html` 和觀眾的 `audience.html` 上。
4. 同時間只會有一題是「啟用中」；要換題目，啟用下一題即可（不用手動停用上一題）。
5. 留言板類型預設關閉「自動核准」，留言要在控制台按「核准」才會顯示在大螢幕（可依需求在「簡報呈現設定」打開自動核准，跳過審核）。
6. 「簡報呈現設定」可即時調整 QR Code 在大螢幕的位置（左/右/頂端）與佔比（12%–45%），`display.html` 會即時套用不需重新整理。

## 防刷屏機制（觀眾端）

- **文字雲**：同一裝置每題最多送出 8 個字，每次送出後有 4 秒冷卻。
- **投票**：以裝置匿名 ID 記錄，同一裝置對同一題只會保留最後一次投票（可改變心意，但不會灌票）。
- **留言板**：每則留言送出後有 15 秒冷卻。

這些限制存在瀏覽器 `localStorage`，重新整理頁面仍有效，但清除瀏覽器資料或換裝置可繞過——這是純前端方案（無帳號系統）的已知限制，適合一般課堂/演講場景。
