<template>
  <div class="PersonnelList">
    <!-- 上傳file用的input -->
    <input type="file" accept="image/*" ref="fileInput" @change="onFileSelected" style="display: none" />

    <v-card>
      <v-card-title>
        <div class="d-flex align-center">
          <span class="mr-3">人員管理</span>
          <v-spacer></v-spacer>
          <v-text-field hide-details prepend-icon="mdi-magnify" single-line label="搜尋"
            v-model="searchKey"></v-text-field>

          <popupadd ref="childFn" :authKeys="authKeys" :personnelItems="items" :usingDatabase="usingDatabase"
            class="ml-2" @getAllData="getAllData" v-if="auth.personnel_add_key"></popupadd>
        </div>
        <!-- </div> -->
      </v-card-title>
      <v-card-text>
        <v-data-iterator v-if="searchfilter.length" :items="searchfilter">
          <template v-slot:default="{ items }">
            <v-data-table fixed-header class="text-no-wrap" height="68vh">
              <template v-slot:default>
                <thead class="title text-h6">
                  <tr>
                    <th class="text-left"></th>
                    <th class="text-left">個人照</th>
                    <th class="text-left">登入帳號</th>
                    <th class="text-left">姓名</th>
                    <th class="text-left">停職</th>
                    <th class="text-left">可用權限</th>
                    <th class="text-left">創建紀錄</th>
                    <th class="text-left">修改紀錄</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in items" :key="index">
                    <td>
                      <v-menu transition="scale-transition" offset-y>
                        <template v-slot:activator="{ props }">
                          <v-btn icon v-bind="props">
                            <img src="@/assets/gear.svg" alt="" />
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item @click="edit(item.raw)" v-if="auth.personnel_edit_key">
                            <v-list-item-title>修改</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="del(item.raw)" v-if="auth.personnel_del_key">
                            <v-list-item-title>刪除</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click=" uploadItem = item.raw; $refs.fileInput.click();">
                            <v-list-item-title>上傳圖片</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </td>
                    <td>
                      <div style="position: relative">
                        <showBigpic :item="item.raw" :folder="usingDatabase" />
                      </div>
                    </td>
                    <td>
                      {{ item.raw.account }}
                    </td>
                    <td>
                      {{ item.raw.name }}
                    </td>
                    <td>
                      <v-checkbox hide-details="" v-model="item.raw.suspension" value="true"
                        @click.stop="suspensionSet(item.raw)"></v-checkbox>
                    </td>
                    <td>
                      <div class="d-flex">
                        <div v-for="authKey in authKeys" :key="authKey.label">
                          <v-chip :class="authKey.class" :color="authKey.color"
                            v-if="item.raw[`${authKey.keyName}_key`]">{{
                              authKey.label }}</v-chip>
                          <v-chip :class="authKey.class" :color="authKey.color"
                            v-if="item.raw[`${authKey.keyName}_add_key`]">增</v-chip>
                          <v-chip :class="authKey.class" :color="authKey.color"
                            v-if="item.raw[`${authKey.keyName}_edit_key`]">修</v-chip>
                          <v-chip :class="authKey.class" :color="authKey.color"
                            v-if="item.raw[`${authKey.keyName}_del_key`]">刪</v-chip>
                          <v-chip :class="authKey.class" :color="authKey.color"
                            v-if="item.raw[`${authKey.keyName}_search_key`]">查</v-chip>
                        </div>
                      </div>
                    </td>
                    <td>
                      {{ `${item.raw.createInfo.name}(${item.raw.createInfo.time})` }}
                    </td>
                    <td>
                      <div v-if="item.raw.editInfo" class="text-truncate" style="max-width: 400px">
                        <span v-for="(i, index) in item.raw.editInfo" :key="index">{{ `${i.name}(${i.time})` }}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-data-table>
          </template>
        </v-data-iterator>
      </v-card-text>
      <!-- <pre>{{ items }}</pre> -->
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores/useStore'
import { getCurrentInstance } from 'vue'
import showBigpic from "@/components/showBigpic.vue"
import popupadd from "./Add.vue"
import dayjs from "dayjs"
import api from '@/assets/js/api.js'

const { proxy } = getCurrentInstance()
const store = useStore()
const childFn = ref(null)
const fileInput = ref(null)

// 響應式數據
const items = ref([])
const usingDatabase = ref("personnel")
const searchKey = ref("")
const auth = ref("")
const picBaseUrl = ref(null)
const selectedFile = ref("")
const uploadItem = ref("")

const authKeys = computed(() => {
  return store.state.authKeys.filter((i) => i.authKey != "exit_key")
})

const searchfilter = computed(() => {
  const keys = searchKey.value.split(" ")
  let str = ""

  return keys.reduce((prev, element) => {
    return prev.filter((item) => {
      str = JSON.stringify(item).toUpperCase()
      if (str.includes(element.toUpperCase())) {
        return item
      }
    })
  }, items.value)
})

// 方法
const getAllData = async () => {
  await api.get(usingDatabase.value).then((rs) => {
    if (rs.length > 0) {
      items.value = rs.map((i) => ({
        ...JSON.parse(i.datalist),
        snkey: i.snkey,
        // picName: i.picName ? i.picName : "lazypic.jpg",
      }))
    }
  })

}

const edit = (item) => {
  childFn.value.editProcess(item)
}


const del = async (item) => {
  proxy.$swal({
    title: '確認要刪除嗎?',
    text: '此操作無法復原',
    icon: 'warning',
    toast: false,
    timer: null,
    showConfirmButton: true,
    showCancelButton: true,
    position: 'center'
  }).then(async (result) => {
    if (result.isConfirmed) {

      item.delInfo = {
        name: store.state.pData.name,
        time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      }

      const postData = {
        snkey: item.snkey,
        tablename: usingDatabase.value,
        datalist: JSON.stringify(item),
      }

      const rs = await api.delete(usingDatabase.value, postData)
      if (rs.state == 1) {
        

        if (item.picName && item.picName != "lazypic.jpg") {
          console.log('del process run del pic')
          await delExistPic(uploadItem.value.picName)
        }

        proxy.$swal({
          icon: "success",
          title: "刪除成功",
          confirmButtonText: '確定',
          confirmButtonColor: '#3085d6',
          allowEscapeKey: false
        })

        await getAllData();
      }
    }
  })
}

const suspensionSet = (item) => {
  proxy.$swal({
    title: '確認更動停權設定?',
    icon: 'warning',
    toast: false,
    timer: null,
    showConfirmButton: true,
    showCancelButton: true,
    position: 'center'
  }).then((result) => {
    if (result.isConfirmed) {
      if (item.edit_man == undefined) {
        item.edit_man = ""
      }
      item.edit_man = `${store.state.pData.name}(${dayjs().format("YYYY-MM-DD HH:mm:ss")})${item.edit_man}`

      const postData = {
        snkey: item.snkey,
        datalist: JSON.stringify(item),
      }

      api.post(usingDatabase.value, postData).then((rs) => {
        if (rs.state == 1) {
          proxy.$swal({
            icon: "success",
            title: "已修改,權限相關功能將在重新登入後生效",
          })
          getAllData()
        }
      })
    } else {
      if (item.suspension === null) {
        item.suspension = "true"
      } else {
        item.suspension = null
      }
    }
  })
}

const onFileSelected = async (event) => {
  selectedFile.value = event.target.files[0]
  const extension = selectedFile.value.name.split(".").pop().toLowerCase()
  const fitType = ["gif", "png", "jpg", "jpeg"]

  let errorMsg = ""
  if (fitType.indexOf(extension) == -1) {
    errorMsg = "檔案:" + selectedFile.value.name + "不是支持的影像檔案"
  }
  if (selectedFile.value.size > 1024 * 1024 * 5) {
    errorMsg = "檔案:" + selectedFile.value.name + "不能超過5M唷"
  }

  if (errorMsg == "") {
    //上傳前確認檔案是否存在，存在就刪除
    if (uploadItem.value.picName && uploadItem.value.picName != "lazypic.jpg") {
      await delExistPic(uploadItem.value.picName)
      // const url = `general/delPic/${usingDatabase.value}/${uploadItem.value.picName}`
      // await api.options(url).then((rs) => {
      //   console.log('delete pic rs', rs)
      // })
    }
      
    //執行上傳圖片，接受狀態
    const rs = await onUpload()
    console.log('upload rs', rs)
    if (rs.state != 1) {
      proxy.$swal({
        icon: "error",
        title: "上傳失敗，請聯絡系統服務商"
      })
      return
    } else {
      //更新圖片名稱到資料庫
      uploadItem.value.picName = rs.picName
      const postData = {
        snkey: uploadItem.value.snkey,
        datalist: JSON.stringify(uploadItem.value),
      }
      api.post(usingDatabase.value, postData)

      //更新畫面
      items.value.some((item) => {
        if (item.snkey == uploadItem.value.snkey) {
          item.picName = rs.picName
        }
      })

      // 清空input，否則無法上傳同一張圖片
      fileInput.value.value = ""
    }
  } else {
    proxy.$swal({
      icon: "error",
      title: errorMsg
    })
    selectedFile.value = ""
  }
}

//上傳圖片或檔案都適用
const onUpload = () => {
  const fd = new FormData()
  fd.append("file", selectedFile.value)

  return api.upload(`personnel`, fd)
  // .then((rs) => {
  //   console.log('upload rs', rs)
  //   if (rs.state != 1) {
  //     proxy.$swal({
  //       icon: "error",
  //       title: "上傳失敗，請聯絡系統服務商"
  //     })
  //     return
  //   }else{
  //     return rs
  //   }

  // fileInput.value.value = ""
  // items.value.some((item) => {
  //   if (item.snkey == uploadItem.value.snkey) {
  //     item.picname = rs.data.picname
  //   }
  // })

  // const data = {
  //   url: `general/edit/${store.state.databaseName}/personnel`,
  //   postData: {
  //     snkey: uploadItem.value.snkey,
  //     datalist: JSON.stringify(uploadItem.value),
  //   },
  // }
  // store.dispatch("returnItems", data).then((rs) => {
  //   console.log(rs)
  // })
  // })
}

const delExistPic = async (picName) => {
  const url = `general/delPic/${usingDatabase.value}/${picName}`
  const rs = await api.options(url)
  console.log('delExistPic rs', rs)
}

// 生命週期鉤子
onMounted(async () => {
  auth.value = store.state.pData
  await getAllData()
  picBaseUrl.value = `${store.state.base_url}/upload/${usingDatabase.value}/`
})
</script>