<template>
  <div class="personneladd">
    <v-dialog v-model="dialog" width="auto">
      <template v-slot:activator="{ props }">
        <v-icon
          color="red"
          v-bind="props"
          @click="addProcess"
        >mdi-plus-circle</v-icon>
      </template>

      <v-card>
        <v-card-title :class="titleStyle" primary-title>{{
          title
        }}</v-card-title>

        <v-card-text>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  label="登入授權帳號"
                  prepend-icon="mdi-codepen"
                  v-model="list.account"
                  :rules="emptyRules"
                  autofocus          
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  label="登入密碼"
                  prepend-icon="mdi-key-variant"
                  v-model="list.password"
                  :rules="emptyRules"
                  reauired
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  label="姓名"
                  prepend-icon="mdi-account"
                  v-model="list.name"
                  :rules="emptyRules"
                ></v-text-field>
              </v-col>
              
            </v-row>

            <v-alert
                border="start"
                border-color="primary"
                elevation="2"
                class="bg-grey-lighten-4"
              >
              <div class="d-flex pa-2">
                <header class="text-primary font-weight-bold">權限設定</header>
                <v-spacer></v-spacer>
                <v-btn
                  class="mx-2 text-white"
                  color="light-blue-darken-3"
                  size="small"
                  variant="flat"
                  @click.stop="authSelectAll"
                  >全選</v-btn
                >
                <v-btn
                  size="small"
                  variant="flat"
                  color="grey-lighten-1"
                  @click.stop="authCancelAll"
                  >全不選</v-btn
                >
              </div>
              <v-row>
                <v-col cols="12" md="6" v-for="authKey in filterAuthKeys" :key="authKey.keyName">
                  <v-alert :color="authKey.color" text v-if="authKey.keyName != 'exit'">
                    <!-- <v-row justify="space-around" class="px-3 align-center"> -->
                      <v-checkbox hide-details="" :label="authKey.label" v-model="list[`${authKey.keyName}_key`]" value="true"></v-checkbox>
                      <v-row class="ml-10" justify="space-around" v-if="list[`${authKey.keyName}_key`]">
                        <v-divider></v-divider>
                        <v-checkbox hide-details="" label="新增" v-model="list[`${authKey.keyName}_add_key`]" value="true"></v-checkbox>
                        <v-checkbox hide-details="" label="修改" v-model="list[`${authKey.keyName}_edit_key`]" value="true"></v-checkbox>
                        <v-checkbox hide-details="" label="刪除" v-model="list[`${authKey.keyName}_del_key`]" value="true"></v-checkbox>
                        <v-checkbox hide-details="" label="查詢" v-model="list[`${authKey.keyName}_search_key`]" value="true"></v-checkbox>
                      </v-row>
                    <!-- </v-row> -->
                  </v-alert>
                </v-col>
                
              </v-row>
            </v-alert>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            class="text-white"
            @click="addOK"
            v-if="processType == 'add'"
            >確認新增</v-btn
          >
          <v-btn
            color="success"
            variant="flat"
            class="text-white"
            @click="editOK"
            v-if="processType == 'edit'"
            >確認修改</v-btn
          >
        </v-card-actions>
        <!-- <pre>{{ list }}</pre> -->
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, getCurrentInstance } from 'vue'
import { useStore } from '@/stores/useStore'
import dayjs from "dayjs"
import api from '@/assets/js/api'

const { proxy } = getCurrentInstance()
const store = useStore()

// Props
const props = defineProps({
  usingDatabase: String,
  personnelItems: Array,
  authKeys: Array
})

// Emits
const emit = defineEmits(['getAllData'])

// Refs
const dialog = ref(false)
const list = ref({})
const processType = ref('')
const title = ref('')
const titleStyle = ref('')
const form = ref(null)

// Validation rules
const emptyRules = [(v) => !!v || "不可空白"]

// Computed
const filterAuthKeys = computed(() => {
  return props.authKeys.filter((i) => i.authKey != "pass")
})

const keyItems = computed(() => {
  let items = {}
  for (let i of filterAuthKeys.value) {
    items[`${i.keyName}_key`] = ""
    items[`${i.keyName}_add_key`] = ""
    items[`${i.keyName}_edit_key`] = ""
    items[`${i.keyName}_del_key`] = ""
    items[`${i.keyName}_search_key`] = ""
  }
  return items
})

// Methods
const addProcess = () => {
  processType.value = "add"
  title.value = "新增人員資料"
  titleStyle.value = "font-weight-black bg-error lighten-2"
  list.value = { ...keyItems.value }
  nextTick(() => {
    form.value.resetValidation()
  })
}

const editProcess = (item) => {
  processType.value = "edit"
  title.value = "修改人員資料"
  titleStyle.value = "font-weight-black bg-success lighten-2"
  list.value = { ...item }
  dialog.value = true
}

const addOK = async () => {
  // 新增時登入帳號不可重覆
  const match = props.personnelItems.find(i => i.account == list.value.account)
  if (match) {
    proxy.$swal({ icon: "error", title: "登入帳號不可重覆!!" })
    return false
  }

  // 確認新增
  const { valid } = await form.value.validate()
  if (valid) {
    list.value.createInfo = {
      name: store.state.pData.name,
      time: dayjs().format("YYYY-MM-DD HH:mm:ss")
    }

    const postData = {
      datalist: JSON.stringify(list.value)
    }

    try {
      const rs = await api.add(props.usingDatabase, postData)
      if (rs.state == 1) {
        proxy.$swal({ icon: "success", title: "已新增" })
        emit("getAllData")
        dialog.value = false
      }
    } catch (err) {
      proxy.$swal({ icon: "error", title: "資料存取錯誤!!內容:" + err })
    }
  } else {
    proxy.$swal({ icon: "error", title: "資料輸入不完整!!請再次確認!!" })
  }
}

const editOK = async () => {
  // 確認修改
  const { valid } = await form.value.validate()
  if (valid) {
    if (!list.value.editInfo) list.value.editInfo = []
    list.value.editInfo.unshift({
      name: store.state.pData.name,
      time: dayjs().format("YYYY-MM-DD HH:mm:ss")
    })

    const postData = {
      snkey: list.value.snkey,
      datalist: JSON.stringify(list.value)
    }

    const rs = await api.post(props.usingDatabase, postData)
    if (rs.state == 1) {
      proxy.$swal({
        icon: "success",
        title: "已修改,權限相關功能將在重新登入後生效"
      })
      emit("getAllData")
      dialog.value = false
    }
  } else {
    proxy.$swal({ icon: "error", title: "資料輸入不完整!!請再次確認!!" })
  }
}

const authSelectAll = () => {
  for (let key in list.value) {
    if (key.includes("_key")) {
      list.value[key] = "true"
    }
  }
}

const authCancelAll = () => {
  for (let key in list.value) {
    if (key.includes("_key")) {
      list.value[key] = ""
    }
  }
}

defineExpose({
  editProcess
})
</script>