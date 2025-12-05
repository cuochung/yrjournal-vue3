<template>
  <div class="customeradd">
    <v-dialog v-model="dialog" width="auto" fullscreen>
      <template v-slot:activator="{ on }">
        <v-icon class="text-red" v-on="{...on, click: addProcess}">mdi-plus-circle</v-icon>
      </template>

      <v-card>
        <v-card-title class="d-flex justify-space-between" :class="titleStyle">{{
          title
          }}
          <v-spacer></v-spacer>
          <v-icon @click.stop="dialog = false">mdi-close</v-icon>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" :readonly="processType=='readonly'">
            <v-row>
              <v-col cols="12" sm="4">
                <v-text-field label="會員名稱" prepend-icon="mdi-account" v-model="list.name" autofocus
                  :rules="emptyRules"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-select label="稱謂" prepend-icon="mdi-account" :items="sexItems" v-model="list.sex"
                  :rules="emptyRules"></v-select>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field label="手機" prepend-icon="mdi-cellphone" v-model="list.cellphone"
                  :rules="emptyRules"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field label="IG帳號/FB名字" prepend-icon="mdi-account-circle"
                  v-model="list.socialName"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field label="身份證字號" prepend-icon="mdi-card-account-details"
                  v-model="list.idNumber"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field label="生日" prepend-icon="mdi-cake-variant" type="date"
                  v-model="list.birthday"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field label="Email 信箱" prepend-icon="mdi-email" type="email"
                  v-model="list.email"></v-text-field>
              </v-col>
              <!-- <v-col cols="12" sm="4">
                <v-text-field
                  label="E-mail"
                  prepend-icon="mdi-email"
                  v-model="list.email"
                ></v-text-field>
              </v-col> -->
              <!-- <v-col cols="12" sm="4">
                1.總消費金額 2.年消費金額 3.月消費金額
              </v-col> -->

              <v-col cols="12" sm="4">
                <v-text-field label="會員等級" prepend-icon="mdi-medal" v-model="list.level"></v-text-field>
              </v-col>
              <!-- <v-col cols="12" sm="4">
                <v-text-field label="總回饋點數" prepend-icon="mdi-star-circle" v-model="list.totalRewardPoint"
                  type="number"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field label="已使用回饋點數" prepend-icon="mdi-star-off" v-model="list.usedRewardPoint"
                  type="number"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field label="剩餘回饋點數" prepend-icon="mdi-star" 
                  :value="list.totalRewardPoint - list.usedRewardPoint"
                  readonly
                  ></v-text-field>
              </v-col> -->

              <v-col cols="12" sm="4">
                <v-checkbox label="黑名單" prepend-icon="fa-solid fa-user-slash" v-model="list.blacklist"></v-checkbox>
              </v-col>
              <v-col cols="12">
                <v-textarea label="備註資料" prepend-icon="mdi-note" v-model="list.note" auto-grow></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="bg-primary" @click="addOK" v-if="processType == 'add'" :loading="loading"
            :disabled="loading">確認新增</v-btn>
          <v-btn class="bg-success" @click="editOK" v-if="processType == 'edit'">確認修改</v-btn>
        </v-card-actions>

        <div v-if="processType=='readonly'">
          <OrderInfo :list="list" />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, getCurrentInstance } from 'vue'
import { useStore } from '@/stores/useStore'
import dayjs from "dayjs"
import OrderInfo from "./OrderInfo.vue"
import api from '@/assets/js/api'

const { proxy } = getCurrentInstance()

const store = useStore()

const props = defineProps({
  usingDatabase: String,
  useingItems: Array
})

const emit = defineEmits(['getAllData'])

// refs
const form = ref(null)
const dialog = ref(false)
const list = ref({})
const processType = ref('')
const title = ref('')
const titleStyle = ref('')

const originalItem = ref('')
const loading = ref(false)

// constants
const emptyRules = [(v) => !!v || "不可空白"]
const sexItems = ['先生', '小姐']

// methods
const checkphone = (cellphone) => {
  let match = props.useingItems.find(i => i.cellphone == cellphone)
  if (match) {
    if (processType.value == 'add') {
      proxy.$swal({ icon: "error", title: "手機號碼已存在,請再確認!!" })
      return true
    } else {
      if (originalItem.value.cellphone != cellphone) {
        proxy.$swal({ icon: "error", title: "手機號碼已存在,請再確認!!" })
        return true
      }
    }
  }
  return false
}

const addProcess = () => {
  processType.value = "add"
  title.value = "新增會員資料"
  titleStyle.value = "bg-primary"
  
  dialog.value = true
  nextTick(() => {
    if (form.value) {
      form.value.resetValidation?.()
    }
  })
}

const editProcess = (item) => {
  processType.value = "edit"
  title.value = "修改會員資料"
  titleStyle.value = "bg-success"
  
  originalItem.value = item
  list.value = JSON.parse(JSON.stringify(item))
  dialog.value = true
}

const readonlyProcess = (item) => {
  processType.value = "readonly"
  title.value = "瀏覽會員資料"
  titleStyle.value = "bg-warning"
  
  list.value = JSON.parse(JSON.stringify(item))
  dialog.value = true
}

const addOK = async () => {
  const { valid } = await form.value?.validate() || { valid: false }
  if (valid) {
    if (checkphone(list.value.cellphone)) return false

    list.value.createInfo = {
      name: store.state.pData.name,
      time: dayjs().format("YYYY-MM-DD HH:mm:ss")
    }

    const postData = {
      datalist: JSON.stringify(list.value)
    }

    try {
      loading.value = true
      const rs = await api.add(props.usingDatabase, postData)
      if (rs.state == 1) {
        proxy.$swal({ icon: "success", title: "已新增" })
        emit('getAllData')
        dialog.value = false
      }
    } catch (err) {
      proxy.$swal({ icon: "error", title: "資料存取錯誤!!內容:" + err })
    } finally {
      loading.value = false
    }
  } else {
    proxy.$swal({ icon: "error", title: "資料輸入不完整!!請再次確認!!" })
  }
}

const editOK = async () => {
  const { valid } = await form.value?.validate() || { valid: false }
  if (valid) {
    if (checkphone(list.value.cellphone)) return false

    if (!list.value.editInfo) list.value.editInfo = []
    list.value.editInfo.unshift({
      name: store.state.pData.name,
      time: dayjs().format("YYYY-MM-DD HH:mm:ss")
    })

    const postData = {
      snkey: list.value.snkey,
      datalist: JSON.stringify(list.value)
    }

    try {
      const rs = await api.post(props.usingDatabase, postData)
      if (rs.state == 1) {
        proxy.$swal({ icon: "success", title: "已修改" })
        emit('getAllData')
        dialog.value = false
      }
    } catch (err) {
      proxy.$swal({ icon: "error", title: "資料存取錯誤!!內容:" + err })
    }
  } else {
    proxy.$swal({ icon: "error", title: "資料輸入不完整!!請再次確認!!" })
  }
}

// expose methods for template refs
defineExpose({
  editProcess,
  readonlyProcess
})
</script>
