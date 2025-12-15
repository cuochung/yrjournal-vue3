<template>
  <div class="OrderPage">
    <popupadd :usingDatabase="usingDatabase" class="fixedStyle" :showButtom="showButtom" @getCompData="getCompData" style="z-index: 3;" />
    
    <!-- 頂部圖片 -->
    <div class="banner-top">
      <v-img :src="bannerImg" alt="" contain class="banner-img"></v-img>
    </div>

    <!-- 主要內容區域 -->
    <div class="main-content">
      <!-- Logo 區域 -->
      <div class="logo-section">
       
        <!-- YR JOURNAL 文字 -->
        <!-- <div class="brand-name">
          <span class="yr-text">YR</span>
          <span class="journal-text">JOURNAL</span>
        </div> -->
      </div>

      <!-- 內容卡片 -->
      <div class="content-card">
        <!-- 商店資訊 -->
        <div class="store-info">
          <h2 class="store-title">煬董玩車會員專屬網站</h2>
        </div>

        <!-- 社交媒體資訊 -->
        <div class="social-media">
          <a href="https://lin.ee/x2NdDO6" target="_blank" rel="noopener noreferrer" class="social-item">
            <img :src="lineLogo" alt="LINE" class="line-logo-img" />
            <span class="social-text">會員專屬官方LINE</span>
          </a>
          <a href="https://www.instagram.com/yr_journal?igsh=bzg3NXBrend5eXNo&utm_source=qr" target="_blank" rel="noopener noreferrer" class="social-item">
            <v-icon class="social-icon instagram-icon">mdi-instagram</v-icon>
            <span class="social-text">yr_journal</span>
          </a>
          <a href="https://www.facebook.com/share/1BjLTwLPm1/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" class="social-item">
            <v-icon class="social-icon facebook-icon">mdi-facebook</v-icon>
            <span class="social-text">煬董玩車日誌 YR.Journal</span>
          </a>
          <a href="https://linkgoods.com/yrjournal" target="_blank" rel="noopener noreferrer" class="social-item">
            <v-icon class="social-icon link-icon">mdi-link-variant</v-icon>
            <span class="social-text">更多相關網站</span>
          </a>
        </div>

        <!-- 公司介紹（如果有的話） -->
        <div class="company-intro" v-if="matchDatabase && store.state.cData.introduce">
          <v-divider class="my-4 white"></v-divider>
          <div class="intro-content contentfontColor" v-html="store.state.cData.introduce"></div>
        </div>
      </div>
    </div>

    <!-- 版本資訊 -->
    <div class="version-info">
      {{ store.state.verMsg }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useStore } from '@/stores/useStore'
import popupadd from './Add.vue'
import api from '@/assets/js/api'
import bannerImg from '@/assets/img/banner.jpg'
import lineLogo from '@/assets/img/LINE_Brand_icon.png'

const { proxy } = getCurrentInstance()
const store = useStore()

const usingDatabase = ref('orderinfo')
const matchDatabase = ref(false)
const showButtom = ref(false)

async function getCompData() {
  await api
    .get('other_data')
    .then((rs) => {
      console.log(rs)
      if (rs.length){
        const cData = rs[0]
        store.state.cData = cData
        sessionStorage.setItem('cData', JSON.stringify(cData))
        matchDatabase.value = true
        showButtom.value = true
      }else{
        matchDatabase.value = false
        proxy.$swal({ icon: 'error', title: '伺服器暫時無法連線唷~' })
      }
    })
}

onMounted(async () => {
  await getCompData()
})
</script>

<style scoped>
.OrderPage {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background-color: #000000;
}

.banner-top {
  margin-top: 100px;
  width: 100%;
  max-height: 40vh;
  overflow: hidden;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000000;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  max-width: 100%;
  max-height: 40vh;
}

.fixedStyle {
  color: red;
  position: fixed;
  bottom: 2%;
  right: 5%;
  z-index: 10;
}

.main-content {
  position: relative;
  z-index: 2;
  min-height: calc(100vh - 40vh);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  box-sizing: border-box;
  background-color: #000000;
}

/* Logo 區域 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  width: 100%;
  max-width: 500px;
}

.speedometer-arc {
  width: 100%;
  max-width: 400px;
  height: 120px;
  margin-bottom: -40px;
  position: relative;
  z-index: 3;
}

.arc-svg {
  width: 100%;
  height: 100%;
}

/* 跑車剪影 */
.car-silhouette {
  width: 100%;
  max-width: 300px;
  height: 100px;
  margin-bottom: 20px;
  position: relative;
  z-index: 4;
}

.car-svg {
  width: 100%;
  height: 100%;
}

.car-body {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* 品牌名稱 */
.brand-name {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.yr-text {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
  font-family: 'Arial', sans-serif;
}

.journal-text {
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
  font-family: 'Arial', sans-serif;
}

/* 內容卡片 */
.content-card {
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* 商店資訊 */
.store-info {
  margin-bottom: 32px;
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.store-title {
  font-size: 1.5rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: 500;
  margin: 0;
  letter-spacing: 1px;
}

/* 社交媒體 */
.social-media {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  align-items: stretch;
}

.social-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-decoration: none;
  color: inherit;
}

.social-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.social-icon {
  font-size: 24px;
  width: 24px;
  height: 24px;
}

.line-logo-img {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  object-fit: contain;
}

.instagram-icon {
  color: #E4405F;
}

.facebook-icon {
  color: #1877F2;
}

.link-icon {
  color: #FF6B35;
}

.social-text {
  color: white;
  font-size: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 公司介紹 */
.company-intro {
  width: 100%;
  margin-top: 24px;
  padding-top: 24px;
}

.intro-content {
  overflow: auto;
  max-height: 50vh;
  text-align: left;
}

/* 版本資訊 */
.version-info {
  position: fixed;
  bottom: 10px;
  left: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  z-index: 2;
}

/* 響應式設計 - 手機 */
@media (max-width: 600px) {
  .banner-top {
    max-height: 30vh;
  }

  .main-content {
    padding: 24px 16px;
    min-height: calc(100vh - 30vh);
  }

  .logo-section {
    max-width: 90%;
    margin-bottom: 30px;
  }

  .speedometer-arc {
    max-width: 90%;
    height: 100px;
    margin-bottom: -30px;
  }

  .car-silhouette {
    max-width: 80%;
    height: 80px;
  }

  .yr-text {
    font-size: 2.2rem;
  }

  .journal-text {
    font-size: 1.3rem;
  }

  .content-card {
    padding: 24px 20px;
  }

  .store-title {
    font-size: 1.2rem;
  }

  .social-item {
    padding: 10px 16px;
  }

  .social-text {
    font-size: 0.9rem;
  }
}

/* 響應式設計 - 平板 */
@media (min-width: 601px) and (max-width: 960px) {
  .logo-section {
    max-width: 70%;
  }

  .speedometer-arc {
    max-width: 70%;
  }

  .car-silhouette {
    max-width: 60%;
  }
}

/* 響應式設計 - 桌面 */
@media (min-width: 961px) {
  .banner-top {
    max-height: 30vh;
  }

  .banner-img {
    max-width: 600px;
    max-height: 30vh;
  }

  .logo-section {
    max-width: 500px;
  }

  .speedometer-arc {
    max-width: 400px;
  }

  .car-silhouette {
    max-width: 300px;
  }

}

.contentfontColor {
  overflow: auto;
  max-height: 50vh;
}
</style>
