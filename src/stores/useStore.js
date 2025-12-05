import { defineStore } from 'pinia'

export const useStore = defineStore('company', () => {
  const state = {
    verMsg: "2025.8.22.1",
    databaseName: "yrjournal", //資料庫名
    // base_url: "http://localhost/vue3vueitfyapi", //localhost測試用
    base_url: "https://www.pddtvgame.com/yrjournalapi", //線上專用指定去讀圖片或其他東西的位置

    loading: false, //載入中

    //暫存用資料
    cData: {},  //廠商資料
    pData: {},  //使用者

    usingItems: [], //處理中頁面暫存資料
    customerItems: [], //會員資料

    //功能名稱,樣式,key值,引用圖片,授權,icon圖片設定,
    authKeys: [
      {
        label: "會員畫面預覽", class: "ma-1 white--text", color: "green", keyName: 'pass',
        image: new URL('@/assets/img/website_normal.png', import.meta.url).href,
        route: "/main/Orderpagepv",
        authKey: "pass",
        icon: 'mdi-eye', // 預覽
      },
      {
        label: "各項設定", class: "ma-1 white--text", color: "green", keyName: 'orderset',
        image: new URL('@/assets/img/template_calender_j.jpg', import.meta.url).href,
        route: "/main/Orderset",
        authKey: "orderset_key",
        icon: 'mdi-cog', // 設定
      },
      {
        label: "消費記錄管理", class: "ma-1 white--text", color: "green", keyName: 'PurchaseRecord',
        image: new URL('@/assets/img/kankou_shopping_asia.png', import.meta.url).href,
        route: "/main/PurchaseRecord",
        authKey: "PurchaseRecord_key",
        icon: 'mdi-file-document', // 記錄管理
      },
      {
        label: "會員管理&批次消費作業", class: "ma-1 white--text", color: "green", keyName: 'customer',
        image: new URL('@/assets/img/my_number_card_omote.png', import.meta.url).href,
        route: "/main/Customer",
        authKey: "customer_key",
        icon: 'mdi-account-group', // 會員管理
      },
      {
        label: "人員管理", class: "ma-1 white--text", color: "purple", keyName: 'personnel',
        image: new URL('@/assets/img/job_one_operation_woman.png', import.meta.url).href,
        route: "/main/Personnel",
        authKey: "personnel_key",
        icon: 'mdi-account-tie', // 人員管理
      },
      {
        label: "登出", class: "ma-1 white--text", color: "dark", keyName: 'exit',
        image: new URL('@/assets/img/text_exit.png', import.meta.url).href,
        route: "/login",
        authKey: "exit_key",
        icon: 'mdi-logout', // 登出
      },
    ],
  }

  return {
    state, //暫存用的都放這裡
    // toasts, showToastMulti, closeShowToastMulti,  //multi toast用的到
    // handleImageError,
  }
})
