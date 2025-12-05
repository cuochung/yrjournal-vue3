<template>
  <div class="OrderPage mushroomColor">
    <popupadd :usingDatabase="usingDatabase" class="fixedStyle" :showButtom="showButtom" @getCompData="getCompData" style="z-index: 3;" />
    
    <div class="title">
      <v-img :src="bannerImg" alt="" cover style="height:100vh"></v-img>
      <!-- <v-img src="@/assets/img/banner.jpg" alt=""></v-img> -->
    </div>

    <div class="introduce ma-1" style="white-space: pre-wrap;">
      <div class="companyInfo d-sm-flex justify-space-between align-center titleFontColor" v-if="matchDatabase">
        <h1 class="font-weight-bold" elevation="4">{{ store.state.cData.company_name }}</h1>
        <!-- <h3>{{ $store.state.cData.address }} {{ $store.state.cData.phone }}</h3> -->
      </div>

      <v-divider class="my-2 white"></v-divider>
      <h4 class="contentfontColor" v-html="store.state.cData.introduce"></h4>
      <!-- <h4 class="contentfontColor">{{ $store.state.cData.introduce }}</h4> -->
       
    </div>

    <!-- <div class="mapInfo pa-2 rounded">
      <h2 class="titleFontColor">地圖資訊:</h2>
      <iframe
        :src="$store.state.cData.googlemap"
        width="100%"
        height="450"
        style="border: 0"
        allowfullscreen=""
        loading="lazy"
      ></iframe>
    </div> -->

    <div class="text-caption text-right">
      {{ store.state.verMsg }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useStore } from '@/stores/useStore'
import popupadd from './Add.vue'
import api from '@/assets/js/api'
import bannerImg from '@/assets/img/background.jpg'

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
}

.fixedStyle {
  color: red;
  position: fixed;
  bottom: 2%;
  right: 5%;
  z-index: 1;
}

.introduce {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: none;
  padding: 24px 32px;
  border-radius: 12px;
  background: rgba(34, 49, 39, 0.5); /* 使用你的 gunmetalColor 並加透明度 */
  color: #E0E3E7; /* 對比色 */
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  max-width: 90vw;
  min-width: 80vw;
  z-index: 2;
  backdrop-filter: blur(4px);
  box-sizing: border-box;
}
.contentfontColor{
  overflow: auto;
  max-height:70vh;
}
</style>
