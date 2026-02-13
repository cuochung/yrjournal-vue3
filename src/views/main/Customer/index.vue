<template>
  <div class="customerlist">
    <!-- 上傳file用的input -->
    <!-- <input type="file" accept="image/*" ref="fileInput" @change="onFileSelected" style="display: none" /> -->

    <v-card>
      <v-card-title>
        <v-toolbar rounded class="bg-white">
          <span class="mr-3 font-weight-bold">會員管理&批次消費作業</span>
          <v-spacer></v-spacer>
          <div class="d-flex align-center gap-20 mr-3">
            <div v-if="isPatching && filterChecked.length > 0">
              <!-- <v-btn @click=runPatchInputProcess()>批次輸入消費資料</v-btn> -->
              <PatchInputForm :checkedItems="filterChecked" />
            </div>

            <v-checkbox label="批次作業" v-model="isPatching" hide-details class="mr-5"></v-checkbox>
          </div>

          <v-text-field hide-details prepend-inner-icon="mdi-magnify" single-line label="搜尋" v-model="searchKey"
            v-if="auth.customer_search_key"></v-text-field>

          <popupadd ref="childFn" class="ml-2" :usingDatabase="usingDatabase" :useingItems="items"
            @getAllData="getAllData" v-if="auth.customer_add_key"></popupadd>
        </v-toolbar>
        <!-- </div> -->
      </v-card-title>

      <v-card-text>
        <PaginatedIterator :items="searchfilter" v-model:page="currentPage" v-model:items-per-page="itemsPerPage"
          :items-per-page-options="itemsPerPageOptions">
          <template #default="{ items }">
            <v-table fixed-header class="text-no-wrap" hide-default-footer>
              <template #default>
                <thead class="title">
                  <tr>
                    <th>
                      <v-checkbox v-if="isPatching" :label="`${isSelectAll ? '全不選' : '全選'} (${filterChecked.length})`"
                        v-model="isSelectAll" @change="changeState()" width="150" hide-details></v-checkbox>
                    </th>
                    <th class="text-left"><v-icon small color="grey darken-2">mdi-identifier</v-icon> ID</th>
                    <th class="text-left"><v-icon small color="purple darken-2">mdi-account-circle</v-icon> IG帳號/FB名字</th>
                    <th class="text-left"><v-icon small color="indigo darken-2">mdi-account</v-icon> 會員名稱</th>
                    <th class="text-left"><v-icon small color="teal darken-2">mdi-cellphone</v-icon> 手機</th>
                    <th class="text-left"><v-icon small color="amber darken-2">mdi-medal</v-icon> 會員等級</th>
                    <th class="text-left"><v-icon small color="amber darken-2">mdi-cash-multiple</v-icon> 總消費金額</th>
                    <th class="text-left"><v-icon small color="blue darken-2">mdi-calendar-range</v-icon> 本年消費金額</th>
                    <th class="text-left"><v-icon small color="green darken-2">mdi-calendar-month</v-icon> 本月消費金額</th>
                    <th class="text-left"><v-icon small color="amber darken-2">mdi-star-circle</v-icon> 總回饋點數</th>
                    <th class="text-left"><v-icon small color="red darken-2">mdi-star-off</v-icon> 已使用回饋點數</th>
                    <th class="text-left"><v-icon small color="green darken-2">mdi-star</v-icon> 剩餘回饋點數</th>
                    <th class="text-left"><v-icon small color="grey darken-2">mdi-note-text</v-icon> 備註資料</th>
                    <th class="text-left"><v-icon small color="blue darken-2">mdi-account-plus</v-icon> 創建紀錄</th>
                    <th class="text-left"><v-icon small color="blue darken-2">mdi-pencil</v-icon> 修改紀錄</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in items" :key="index" @click="!isPatching && readonly(item)">
                    <td class="pa-0 d-flex justify-center align-center">
                      <v-checkbox v-model="item.raw.isChecked" v-if="isPatching" hide-details></v-checkbox>

                      <v-menu transition="scale-transition" offset-y v-else @click.stop>
                        <!-- <template v-slot:activator="{ props }">
                          <v-btn variant="text" v-bind="props" @click.stop>
                            <img src="@/assets/gear.svg" alt="" />
                          </v-btn>
                        </template> -->

                        <template v-slot:activator="{ props: activatorProps }">
                          <v-btn variant="text" v-bind="activatorProps">
                            <img src="@/assets/gear.svg" alt="" />
                          </v-btn>
                        </template>

                        <v-list>
                          <v-list-item @click="edit(item.raw)" v-if="auth.customer_edit_key">
                            <v-list-item-title>修改</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="del(item.raw)" v-if="auth.customer_del_key">
                            <v-list-item-title>刪除</v-list-item-title>
                          </v-list-item>

                        </v-list>
                      </v-menu>
                    </td>

                    <td>
                      {{ item.raw.snkey }}</td>
                    <td>{{ item.raw.socialName }}</td>
                    <td>{{ item.raw.name }} {{ item.raw.sex }}</td>
                    <td>{{ item.raw.cellphone }}</td>
                    <td>
                      {{ item.raw.level }}
                    </td>
                    <td>
                      {{ item.raw.totalPrice }}
                    </td>
                    <td>
                      {{ item.raw.yearPrice }}
                    </td>
                    <td>
                      {{ item.raw.monthPrice }}
                    </td>

                    <td>
                      {{ item.raw.rewardPoint }}
                    </td>
                    <td>
                      {{ item.raw.usePoint }}
                    </td>
                    <td>
                      {{ item.raw.rewardPoint - item.raw.usePoint }}
                    </td>

                    <td class="text-truncate" style="max-width: 200px">
                      {{ item.raw.note }}
                    </td>

                    <td>
                      {{ `${item.raw.createInfo.name}(${item.raw.createInfo.time})` }}
                    </td>
                    <td>
                      <div v-if="item.raw.editInfo" class="text-truncate" style="max-width: 500px">
                        <span v-for="(i, index) in item.raw.editInfo" :key="index">{{ `${i.name}(${i.time})` }}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-table>

          </template>
        </PaginatedIterator>

      </v-card-text>
      <!-- <pre>{{ items }}</pre> -->
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useStore } from '@/stores/useStore'
import dayjs from "dayjs"
import PatchInputForm from "./PatchInputForm.vue"
import popupadd from "./Add.vue"
import PaginatedIterator from '@/components/PaginatedIterator.vue'
import api from '@/assets/js/api.js'

const { proxy } = getCurrentInstance()

const store = useStore()
const childFn = ref(null)

// 響應式數據
const usingDatabase = ref("customer")
const items = ref([])
const searchKey = ref("")
const auth = ref("")
// const picBaseUrl = ref(null)
// const selectedFile = ref("")
// const uploadItem = ref("")
const isPatching = ref(false)
const isSelectAll = ref(false)
const purchaseRecords = ref([])

// 分頁相關
const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [
  { value: 5, title: '5' },
  { value: 10, title: '10' },
  { value: 25, title: '25' },
];

// 計算屬性
const searchfilter = computed(() => {
  const keys = searchKey.value.split(" ")
  let str = ""

  let matchs = keys.reduce((prev, element) => {
    return prev.filter((item) => {
      str = JSON.stringify(item).toUpperCase()
      if (str.includes(element.toUpperCase())) {
        return item
      }
    })
  }, items.value)

  console.log('matchs', matchs)
  return matchs;
})

const filterChecked = computed(() => {
  return searchfilter.value.filter((item) => item.isChecked)
})

// 方法
const totalCounts = (customerInfo, type) => {
  const now = dayjs()

  // 取得指定對象的消費記錄
  const matchDatas = purchaseRecords.value.filter(i => i.customerInfo.customerInfo.snkey == customerInfo.snkey)

  return matchDatas.reduce((sum, item) => {
    if (!item.price || !item.Date) return sum
    const itemDate = dayjs(item.Date)
    if (type === 'year') {
      if (itemDate.year() === now.year()) {
        return sum + Number(item.price)
      }
    } else if (type === 'month') {
      if (itemDate.year() === now.year() && itemDate.month() === now.month()) {
        return sum + Number(item.price)
      }
    } else {
      // total
      return sum + Number(item.price)
    }
    return sum
  }, 0)
}

const totalPointCounts = (customerInfo, type) => {
  // 取得指定對象的消費記錄
  const matchDatas = purchaseRecords.value.filter(i => i.customerInfo.customerInfo.snkey == customerInfo.snkey)
  return matchDatas.reduce((sum, item) => sum + Number(item[type] || 0), 0)
}

const changeState = () => {
  searchfilter.value.forEach((item) => {
    item.isChecked = isSelectAll.value
  })
}

const getAllData = async () => {
  const rs = await api.get(usingDatabase.value)
  console.log('customer rs', rs)
  items.value = rs.map(i => ({
    ...JSON.parse(i.datalist),
    snkey: i.snkey,
    isChecked: false,
  }))
    .map(i => ({
      ...i,
      totalPrice: totalCounts(i, 'total'),
      yearPrice: totalCounts(i, 'year'),
      monthPrice: totalCounts(i, 'month'),
      rewardPoint: totalPointCounts(i, 'rewardPoint'),
      usePoint: totalPointCounts(i, 'usePoint'),
    }))
}

const readonly = (item) => {
  childFn.value.readonlyProcess(item.raw)
}

const edit = (item) => {
  childFn.value.editProcess(item)
}

const del = (item) => {
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
      console.log('delete rs', rs)
      if (rs.state == 1) {
        proxy.$swal({
          icon: "success",
          title: "刪除成功",
          toast: true,
          confirmButtonText: '確定',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false,
          allowEscapeKey: false
        })
        getAllData();
        // store.dispatch("getUsingItems", usingDatabase.value)
      }
    }
  })
}

// 初始化
onMounted(async () => {
  auth.value = store.state.pData
  // picBaseUrl.value = `${store.state.base_url}/upload/${usingDatabase.value}/`

  purchaseRecords.value = await api.get('purchase_record').then(rs => {
    return rs.map(i => ({
      ...JSON.parse(i.datalist),
      snkey: i.snkey
    }))
  })

  await getAllData()
})
</script>


<style lang="scss">
.customerlist {
  .theme--light.v-data-table>.v-data-table__wrapper>table>thead>tr>th {
    font-size: 1rem;
  }
}
</style>