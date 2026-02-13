## 更新記錄

### 2025-02-13

#### 會員管理頁面 (`src/views/main/Customer/index.vue`)
- **表格欄位調整**：將原本顯示「黑名單」狀態的欄位改為顯示「IG帳號/FB名字」內容
  - 欄位標題：黑名單 → IG帳號/FB名字
  - 欄位內容：黑名單勾選狀態 → socialName（IG帳號/FB名字）
  - 圖示更新為 `mdi-account-circle`
  - 黑名單仍可在新增/編輯會員表單中勾選設定

### 2025-12-15

#### UI/UX 改進
- **配色方案統一**：將所有頁面統一為深色主題風格
  - 背景色：黑色 (#000000)
  - 卡片/元素：半透明白色背景 (rgba(255, 255, 255, 0.05)) + 模糊效果 (backdrop-filter: blur(10px))
  - 文字：白色 + 陰影效果
  - 邊框：半透明白色 (rgba(255, 255, 255, 0.1))

#### 頁面更新

**orderpage 頁面 (`src/views/orderpage/index.vue`)**
- 更新標題為「煬董玩車會員專屬網站」
- 添加社交媒體連結（可點擊）：
  - LINE：會員專屬官方LINE (https://lin.ee/x2NdDO6)
  - Instagram：yr_journal
  - Facebook：煬董玩車日誌 YR.Journal
  - 更多相關網站：linkgoods.com/yrjournal
- 使用 LINE 官方 logo 圖片 (`LINE_Brand_icon.png`)
- 調整按鈕樣式：左右對齊，文字置中

**login 頁面 (`src/views/login/index.vue`)**
- 添加 banner logo 圖片
- 調整登入卡片樣式以符合深色主題
- 優化登入按鈕樣式，提高可見度（背景色不透明度提升至 0.2）
- 添加按鈕 hover 效果和過渡動畫

**main 頁面 (`src/views/main/Main.vue`)**
- 背景色改為黑色 (#000000)

**FunctionList 頁面 (`src/views/main/FunctionList.vue`)**
- 卡片樣式更新，使用統一的半透明效果

**Navbar 組件 (`src/components/Navbar.vue`)**
- 調整配色以符合深色主題
- 保留背景圖片 (`BG_top.png`)，添加深色半透明層
- 統一文字和圖標顏色為白色
- 添加 hover 效果

#### 全局樣式更新 (`src/assets/css/mystyle.css`)
- `.myTransparent`：更新為半透明白色背景 + 模糊效果 + 邊框
- `.justTransparent`：調整為 `rgba(0, 0, 0, 0.3)`
- `.titleFontColor`：改為白色 + 陰影效果
- `.contentfontColor`：改為白色 + 陰影效果


# Vue 3 + Vite + Pinia + SweetAlert2 +Vuetify3
- 使用 yrjournal 當資料庫樣本
- 後台 使用vue3vuetifyapi; (git上名稱應該是 vue3Projectapi)

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
# vue3Project

