<template>
  <nav class="nav">

    <v-navigation-drawer app temporary v-model="drawer" location="right" class="navbar-drawer">
      <v-list-item-title class="text-center text-white my-2" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);">功能選擇</v-list-item-title>
      <v-divider style="border-color: rgba(255, 255, 255, 0.1);"></v-divider>

      <v-list density="compact" nav>
        <v-list-item v-for="item in items" :key="item.label" :to="item.route" v-show="checkAuth(item.authKey)">
          <template v-slot:prepend>
            <v-icon color="white">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title class="text-white" style="font-size:1rem; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">{{ item.label }}</v-list-item-title>
        </v-list-item>

        <v-list-item @click="logout">
          <template v-slot:prepend>
            <v-icon color="white">mdi-logout</v-icon>
          </template>
          <v-list-item-title class="text-white" style="font-size:1rem; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">登出</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app fixed class="align-center navbar-bar">
      <v-toolbar-title style="cursor: pointer;">
        <router-link to="/main/functionlist" custom v-slot="{ navigate }">
          <div @click="navigate" @keypress.enter="navigate" class="d-flex">
            <span class="font-weight-black text-white subtitle-1 text-sm-h6">
              {{ store.state.cData.company_name }}
            </span>
            <span class="subtitle-1 text-white ml-2 d-none d-sm-flex">
              v.{{ store.state.verMsg }}
            </span>
          </div>
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text color="white" @click.stop="drawer = !drawer"
        class="font-weight-black text-white text-caption text-sm-h6">
        {{ store.state.pData.name }}
        <v-icon>mdi-apps</v-icon>
      </v-btn>
    </v-app-bar>


  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores/useStore'

const router = useRouter()
const store = useStore()

// 響應式數據
const personnel_key = ref(true)
const drawer = ref(false)

// 計算屬性
const items = computed(() => {
  return store.state.authKeys
})

// 方法
const logout = () => {
  store.state.logined = false
  router.push("/login")
  sessionStorage.clear() //清除sessionStorage
}

const getSessionStorage = () => {
  if (sessionStorage.getItem("pData") != null) {
    store.state.cData = JSON.parse(sessionStorage.getItem("cData"))
    store.state.pData = JSON.parse(sessionStorage.getItem("pData"))
  } else {
    router.push("/login")
  }
}

const checkAuth = (authkey) => {
  if (store.state.pData[authkey] === "true" || authkey === "pass") {
    return true
  }
  return false
}

// 生命週期鉤子
onMounted(() => {
  getSessionStorage() //取得暫存的廠商及使用者資料
  checkAuth() //判斷授權的功能
})
</script>

<style lang="scss">
.navbar-bar {
  background-image: url("@/assets/BG_top.png") !important;
  background-repeat: repeat !important;
  background-color: rgba(0, 0, 0, 0.7) !important;
  backdrop-filter: blur(10px) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.navbar-drawer {
  background-image: url("@/assets/BG_top.png") !important;
  background-repeat: repeat !important;
  background-color: rgba(0, 0, 0, 0.7) !important;
  backdrop-filter: blur(10px) !important;
  border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.v-toolbar__content {
  background: transparent !important;
}

.v-list-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
}

.v-list-item--active {
  background: rgba(255, 255, 255, 0.12) !important;
}

.v-btn:hover {
  background: rgba(255, 255, 255, 0.08) !important;
}

.v-snack__content {
  font-size: 2rem;
}
</style>