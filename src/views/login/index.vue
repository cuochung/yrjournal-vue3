<template>
  <div class="tableImage">
    <div class="d-flex justify-center align-center justTransparent" style="height:100%">
      <v-row class="justify-center" v-if="matchDatabase">
        <v-col cols="11" md="7">
          <!-- Logo 區域 -->
          <div class="banner-top">
            <v-img :src="bannerImg" alt="" contain class="banner-img"></v-img>
          </div>
          
          <div class="loginCardBg pa-6 rounded">
            <div class="d-flex justify-space-between align-center">
              <div class="text-h7 text-sm-h5 font-weight-bold">
                {{ store.cData.company_name }} 後台管理系統
              </div>
              <div class="text-caption text-sm-h6">
                ver.{{ store.state.verMsg }}
              </div>
            </div>

            <v-divider class="my-4" style="border-color: rgba(255, 255, 255, 0.1);"></v-divider>

            <v-form class="mt-3" ref="form">
              <v-row>
                <v-col cols="12">
                  <v-text-field 
                    label="授權帳號 (Account)" 
                    prepend-icon="mdi-codepen" 
                    v-model="loginForm.account"
                    :rules="emptyRules" 
                    @keyup.enter="checkLogin" 
                    autofocus 
                    color="white"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field 
                    type="password" 
                    label="密碼 (Password)" 
                    prepend-icon="mdi-onepassword"
                    v-model="loginForm.password" 
                    :rules="emptyRules" 
                    @keyup.enter="checkLogin"
                    color="white"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-btn block class="mt-2 pa-2 white--text login-btn" @click.stop="checkLogin">登入</v-btn>

              <div class="d-flex justify-end mt-2 titleFontColor">
                <span>{{ store.cData.last_login_time }}</span>
                <v-spacer></v-spacer>
                <v-icon>mdi-registered-trademark</v-icon>
                <span>2025.07.03</span>
              </div>
            </v-form>
          </div>
        </v-col>
      </v-row>

      <div v-else>
        <h1 class="white--text titleFontColor">
          資料庫未正常連結!! 請按 CTRL+F5 後重新登入~ 或洽系統工程師
        </h1>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores/useStore'
import api from '@/assets/js/api.js'

const { proxy } = getCurrentInstance()

const store = useStore()
const router = useRouter()
const form = ref(null)

import bannerImg from '@/assets/img/banner.jpg'

// 響應式數據
const matchDatabase = ref(false)
const loginForm = ref({
  account: '',
  password: ''
})

// 表單驗證規則
const emptyRules = [(v) => !!v || '不可空白']

// 檢查是否已登入
const loginedCheck = () => {
  if (sessionStorage.getItem('logined') === 'logined') {
    router.push('/main/functionlist')
  }
}

// 獲取公司數據
const getCompData = async () => {
  try {
    const response = await api.get('other_data')
    console.log('response',response)
    const cData = response[0]
    if (cData) {
      store.cData = cData
      sessionStorage.setItem('cData', JSON.stringify(cData))
      matchDatabase.value = true
    }
  } catch (error) {
    matchDatabase.value = false
    console.error(error)
    proxy.$swal({
      icon: 'error',
      title: '資料庫未正常連結!! 請按 CTRL+F5 後重新登入~ 或洽系統工程師'
    })
  }
}

// 登入檢查
const checkLogin = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    const url = `login/logining/${store.state.databaseName}`
    const response = await api.options(url, loginForm.value)
    console.log('login response',response)
    
    if (response.data === 'databaseError') {
      proxy.$swal({
        icon: 'error',
        title: '資料庫未正常連結!! 請按F5後重新登入~'
      })
    } else if (response.state === 'logined') {
      if (response.pData.suspension) {
        proxy.$swal({
          icon: 'error',
          title: '停權中!!! 無法登入!!'
        })
      } else {
        store.pData = response.pData
        sessionStorage.setItem('pData', JSON.stringify(response.pData))
        sessionStorage.setItem('logined', 'logined')
        router.push('/main/functionlist')
        proxy.$swal({
          icon: 'success',
          title: '登入成功'
        })
      }
    } else {
      proxy.$swal({
        icon: 'error',
        title: '未授權的登入者'
      })
    }
  } catch (error) {
    proxy.$swal({
      icon: 'error',
      title: '登入失敗，請檢查帳號密碼'
    })
  }
}

// 生命週期鉤子
onBeforeMount(() => {
  getCompData()
})

onMounted(() => {
  loginedCheck()
})
</script>

<style scoped>
body::-webkit-scrollbar {
  display: none;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
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
  color: #ff0000;
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

.banner-top {
  width: 100%;
  max-height: 200px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.banner-img {
  width: 100%;
  max-width: 400px;
  height: auto;
  object-fit: contain;
}

.loginCardBg {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  color: white;
}

.login-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  font-weight: bold !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2) !important;
}

/* 響應式設計 */
@media (max-width: 600px) {
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
}

</style>
