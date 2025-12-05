<template>
  <div class="tableImage">
    <div class="d-flex justify-center align-center justTransparent" style="height:100%">
      <v-row class="justify-center" v-if="matchDatabase">
        <v-col cols="11" md="7">
          <div class="loginCardBg pa-6 rounded" style="color:#32435F">
            <div class="d-flex justify-space-between align-center">
              <div class="text-h7 text-sm-h5 font-weight-bold">
                {{ store.cData.company_name }} 後台管理系統
              </div>
              <div class="text-caption text-sm-h6">
                ver.{{ store.state.verMsg }}
              </div>
            </div>

            <v-divider></v-divider>

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
                    color="#FFFFFF"
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
                    color="#FFFFFF"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-btn block class="mt-2 pa-2 white--text" color="#32435F" @click.stop="checkLogin">登入</v-btn>

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

.loginCardBg {
  background: rgba(255, 255, 255, 0.4);
  /* 深色半透明，可依需求調整 */
  box-shadow: 0 8px 32px 0 rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
}

</style>
