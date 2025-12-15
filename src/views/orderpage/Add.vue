<template>
  <div class="OrderPageAdd">
    <v-dialog v-model="dialog" scrollable transition="scroll-y-reverse-transition"
      :fullscreen="optionProcessing != 'checkAuth'">
      <template v-slot:activator="{ props }">
        <transition name="slide-fade" mode="out-in">
          <v-btn 
            class="login-btn titleFontColor text-white" 
            color="#1E3A8A" 
            size="large" 
            v-if="showButtom" 
            @click="addProcess()"
            v-bind="props"
          >
            會員登入
          </v-btn>
        </transition>
      </template>

      <v-card class="dialog-card">
        <div class="dialog-header">
          <div>　</div>
          <!-- {{ optionProcessing }} -->
          <h3 class="dialog-title" v-if="optionProcessing == 'checkAuth'">
            會員登入
          </h3>
          <h3 class="dialog-title" v-if="optionProcessing == 'addMember'">
            新增會員資料
          </h3>
          <h3 class="dialog-title" v-if="optionProcessing == 'memberCheckOK'">
            會員資料及相關記錄
          </h3>

          <v-icon class="close-icon" @click.stop="dialog = false">mdi-close</v-icon>
        </div>

        <v-card-text class="pa-1">
          <v-form ref="form">
            <div class="login-form" v-if="optionProcessing == 'checkAuth'">
              <v-text-field 
                type="number" 
                label="請輸入手機號碼" 
                prepend-inner-icon="mdi-cellphone" 
                v-model="list.cellphone"
                :rules="emptyRules" 
                autofocus 
                @keydown.enter.prevent="checkPhone()" 
                v-if="dialog"
                variant="outlined"
                class="custom-text-field"
              ></v-text-field>
              <v-btn 
                class="confirm-btn" 
                @click.stop="checkPhone()" 
                block
                color="#1E3A8A"
              >
                確認
              </v-btn>
            </div>

            <transition name="slide-fade2" mode="out-in">
              <div class="memberInfoZone" v-if="optionProcessing == 'memberCheckOK'">
                <div class="info-card">
                  <h3 class="info-title">會員資料</h3>
                  <v-divider class="my-3"></v-divider>
                  <v-row class="mt-1">
                    <v-col cols="12" sm="4">
                      <h3>
                        <v-icon color="indigo-darken-2">mdi-account</v-icon>
                        {{ list.customerInfo.name }} {{ list.customerInfo.sex }}
                      </h3>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <h3>
                        <v-icon color="teal-darken-2">mdi-cellphone</v-icon>
                        {{ list.customerInfo.cellphone }}
                      </h3>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <h3>
                        <v-icon color="amber-darken-2">mdi-medal</v-icon>
                        {{ list.customerInfo.level }}
                      </h3>
                    </v-col>

                  </v-row>

                  <v-divider class="my-2"></v-divider>

                  <v-row>
                    <v-col cols="12" sm="3">
                      <h3>
                        <v-icon color="amber-darken-2">mdi-cash-multiple</v-icon>
                        總消費金額：{{ totalCounts('total') }}
                      </h3>
                    </v-col>
                    <v-col cols="12" sm="3">
                      <h3>
                        <v-icon color="warning-darken-2">mdi-calendar-range</v-icon>
                        去年度消費金額：{{ totalCounts('lastyear') }}
                      </h3>
                    </v-col>
                    <v-col cols="12" sm="3">
                      <h3>
                        <v-icon color="blue-darken-2">mdi-calendar-range</v-icon>
                        本年度消費金額：{{ totalCounts('year') }}
                      </h3>
                    </v-col>
                    <v-col cols="12" sm="3">
                      <h3>
                        <v-icon color="green-darken-2">mdi-calendar-month</v-icon>
                        本月消費金額：{{ totalCounts('month') }}
                      </h3>
                    </v-col>

                  </v-row>

                  <v-row>
                    <v-col cols="12" sm="4">
                      <h3>
                        <v-icon color="amber-darken-2">mdi-star-circle</v-icon>
                        總回饋點數：{{ totalPointCounts('rewardPoint') }}
                      </h3>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <h3>
                        <v-icon color="red-darken-2">mdi-star-off</v-icon>
                        已使用點數：{{ totalPointCounts('usePoint') }}
                      </h3>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <h3>
                        <v-icon color="green-darken-2">mdi-star</v-icon>
                        剩餘點數：{{ totalPointCounts('rewardPoint') - totalPointCounts('usePoint') }}
                      </h3>
                    </v-col>
                  </v-row>




                </div>


                <v-divider class="my-4"></v-divider>

                <div class="info-card">
                  <h3 class="info-title">消費記錄</h3>

                  <v-divider class="mb-3 mt-3"></v-divider>

                  <PaginatedIterator :items="purchaseRecords" v-model:page="currentPage"
                    v-model:items-per-page="itemsPerPage" :items-per-page-options="itemsPerPageOptions">
                    <template #default="{ items }">
                      <v-table fixed-header class="custom-table text-no-wrap">
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left">日期</th>
                              <th class="text-left">消費金額</th>
                              <th class="text-left">回饋點數</th>
                              <th class="text-left">使用點數</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(item, index) in items" :key="index">
                              <td>{{ item.raw.Date }}</td>
                              <td>{{ item.raw.price }}</td>
                              <td>{{ item.raw.rewardPoint }}</td>
                              <td>{{ item.raw.usePoint }}</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-table>
                    </template>
                  </PaginatedIterator>

                </div>

              </div>
            </transition>

            <!-- 非會員新增資料 -->
            <transition name="slide-fade2" mode="out-in">
              <div class="addMemberInfoZone" v-if="optionProcessing == 'addMember'">
                <v-form ref="addnewmember">
                  <v-card class="form-card">
                    <v-card-text class="form-content">
                      <v-text-field 
                        type="number" 
                        label="請再次輸入手機號碼(必填)" 
                        prepend-inner-icon="mdi-cellphone"
                        v-model="newMemberInfo.cellphone" 
                        :rules="emptyRules" 
                        autofocus
                        variant="outlined"
                        class="custom-text-field"
                      ></v-text-field>
                      <v-text-field 
                        label="請輸入姓名(必填)" 
                        prepend-inner-icon="mdi-face-man" 
                        v-model="newMemberInfo.name"
                        :rules="emptyRules"
                        variant="outlined"
                        class="custom-text-field"
                      ></v-text-field>
                      <v-select 
                        label="稱謂(必選)" 
                        prepend-inner-icon="mdi-account" 
                        :items="sexItems" 
                        v-model="newMemberInfo.sex"
                        :rules="emptyRules"
                        variant="outlined"
                        class="custom-text-field"
                      ></v-select>
                      <v-text-field 
                        label="身份證字號(必填)" 
                        prepend-inner-icon="mdi-card-account-details"
                        v-model="newMemberInfo.idNumber" 
                        :rules="idRule"
                        variant="outlined"
                        class="custom-text-field"
                      ></v-text-field>
                      <v-text-field 
                        label="生日 用於生日禮優惠(必填)" 
                        prepend-inner-icon="mdi-cake-variant" 
                        type="date"
                        v-model="newMemberInfo.birthday" 
                        :rules="emptyRules"
                        variant="outlined"
                        class="custom-text-field"
                      ></v-text-field>

                      <v-text-field 
                        label="請輸入IG帳號/FB名字" 
                        prepend-inner-icon="mdi-account-circle"
                        v-model="newMemberInfo.socialName"
                        variant="outlined"
                        class="custom-text-field"
                      ></v-text-field>
                      <v-text-field 
                        label="Email 信箱" 
                        prepend-inner-icon="mdi-email" 
                        type="email" 
                        v-model="newMemberInfo.email"
                        :rules="emailRule"
                        variant="outlined"
                        class="custom-text-field"
                      ></v-text-field>
                    </v-card-text>

                    <v-card-actions class="form-actions">
                      <v-spacer></v-spacer>
                      <v-btn 
                        class="submit-btn" 
                        @click.stop="addNewMember()" 
                        :loading="loading"
                        :disabled="loading"
                        color="#1E3A8A"
                      >
                        確認新增
                      </v-btn>
                    </v-card-actions>
                  </v-card>

                </v-form>
              </div>
            </transition>
          </v-form>
        </v-card-text>

      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import PaginatedIterator from '@/components/PaginatedIterator.vue'

import { ref, getCurrentInstance, onMounted } from 'vue'
import { useStore } from '@/stores/useStore'
import dayjs from 'dayjs'
import api from '@/assets/js/api'

const props = defineProps({
  usingDatabase: String,
  showButtom: Boolean,
})

const { proxy } = getCurrentInstance()
const store = useStore()

// 分頁相關
const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [
  { value: 5, title: '5' },
  { value: 10, title: '10' },
  { value: 25, title: '25' },
];

// refs / state
const dialog = ref(false)
const list = ref({})
const processType = ref("")
const emptyRules = [(v) => !!v || "不可空白"]
const idRule = [
  (v) => !!v || "不可空白",
  (v) => /^[A-Z][12][0-9]{8}$/.test(v) || "身份證字號格式不正確",
]
const zeroRules = [(v) => v >= 0 || "不可小於0"]
const emailRule = [
  (v) => !v || /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v) || "Email 格式不正確",
]
const loading = ref(false)

const customerItems = ref(null)
const optionProcessing = ref('checkAuth')
const newMemberInfo = ref({})
const sexItems = ref(["先生", "小姐"])
const purchaseRecords = ref([])

const form = ref(null)
const addnewmember = ref(null)

onMounted(async () => {
  await getItems('customer')
})

function addProcess() {
  processType.value = 'add'
  list.value = {}
  newMemberInfo.value = {}
  optionProcessing.value = 'checkAuth'
  dialog.value = true
}

function yn(text) {
  return proxy.$swal({
    title: text,
    icon: 'question',
    showCancelButton: true,
    showConfirmButton: true,
    toast: false,
    position: "center",
  })
}

function checkPhone() {
  if (list.value.cellphone) {
    const match = (customerItems.value || []).find(i => i.cellphone === list.value.cellphone)
    if (match) {
      if (match.blacklist) {
        proxy.$swal({ icon: 'error', title: '請聯絡服務人員唷!!' })
      } else {
        optionProcessing.value = 'memberCheckOK'
        list.value.customerInfo = { ...match }

        const postData = {
          key: 'customerInfo.customerInfo.snkey',
          value: match.snkey,
        }
        api.options(`byjson/searchByKeyValue/${store.state.databaseName}/purchase_record`, postData).then(rs => {
          if (rs.length > 0) {
            purchaseRecords.value = rs.map(i => ({
              ...JSON.parse(i.datalist),
              snkey: i.snkey,
            }))
          }
        })
      }
    } else {
      yn('無此會員，是否新增資料？').then(result => {
        if (result.isConfirmed) {
          optionProcessing.value = 'addMember'
        }
      })
    }
  }
}

async function getItems(databaseName) {
  await api.get(databaseName).then((rs) => {
    const parsed = rs.map(i => {
      if (isJSON(i.datalist)) {
        return {
          ...JSON.parse(i.datalist),
          snkey: i.snkey,
        }
      } else {
        return ""
      }
    })
    if (databaseName === 'customer') customerItems.value = parsed

    function isJSON(str) {
      if (typeof str == 'string') {
        try {
          const obj = JSON.parse(str)
          return typeof obj == 'object' && obj
        } catch (e) {
          alert('2資料庫存在不合法的資料,請跟工程師聯絡!!')
          console.log('databaseName:', databaseName, 'error:' + str + '!!!' + e)
          return false
        }
      }
    }
  })
}

async function addNewMember() {
  if (addnewmember.value.validate()) {
    if (list.value.cellphone != newMemberInfo.value.cellphone) {
      proxy.$swal({ icon: 'error', title: '請確認兩個手機號碼要一致唷!!' })
      return false
    }

    newMemberInfo.value.createInfo = {
      name: newMemberInfo.value.name,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }

    const postData = {
      datalist: JSON.stringify(newMemberInfo.value),
    }

    loading.value = true
    await api.add('customer', postData).then(async (rs) => {
      if (rs.state) {
        customerItems.value = null
        await getItems('customer')
        checkPhone()
        loading.value = false
      }
    })
  }
}

function totalCounts(type) {
  const now = dayjs()
  return purchaseRecords.value.reduce((sum, item) => {
    if (!item.price || !item.Date) return sum
    const itemDate = dayjs(item.Date)
    if (type === 'year') {
      if (itemDate.year() === now.year()) return sum + Number(item.price)
    } else if (type === 'lastyear') {
      if (itemDate.year() === now.year() - 1) return sum + Number(item.price)
    } else if (type === 'month') {
      if (itemDate.year() === now.year() && itemDate.month() === now.month()) return sum + Number(item.price)
    } else {
      return sum + Number(item.price)
    }
    return sum
  }, 0)
}

function totalPointCounts(type) {
  return purchaseRecords.value.reduce((sum, item) => sum + Number(item[type] || 0), 0)
}
</script>

<style scoped>
.v-card__text::-webkit-scrollbar {
  display: none;
}

.setOutBox {
  position: relative;
}

.setInBox {
  position: absolute;
  top: 5px;
  right: 5px;
}

/* 登入按鈕 */
.login-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 1px !important;
  text-transform: none !important;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4) !important;
  transition: all 0.3s ease !important;
  padding: 12px 32px !important;
}

.login-btn:hover {
  box-shadow: 0 6px 16px rgba(30, 58, 138, 0.6) !important;
  transform: translateY(-2px) !important;
}

.login-btn:active {
  transform: translateY(0) !important;
}

/* 對話框卡片 */
.dialog-card {
  background: #2a2a2a !important;
  color: #ffffff !important;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(30, 58, 138, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.dialog-title {
  font-weight: 600;
  color: #ffffff !important;
  font-size: 1.25rem;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.close-icon {
  color: #ffffff !important;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-icon:hover {
  color: #ff5252 !important;
  transform: scale(1.1);
}

/* 登入表單 */
.login-form {
  padding: 24px;
}

.custom-text-field {
  margin-bottom: 16px;
}

.custom-text-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.custom-text-field :deep(.v-field__input) {
  color: #ffffff !important;
  font-weight: 500;
}

.custom-text-field :deep(.v-field__input input) {
  color: #ffffff !important;
}

.custom-text-field :deep(.v-label) {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
}

.custom-text-field :deep(.v-field--focused .v-label) {
  color: #4A90E2 !important;
}

.custom-text-field :deep(.v-field--focused) {
  border-color: #4A90E2 !important;
}

.custom-text-field :deep(.v-field__prepend-inner) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.confirm-btn,
.submit-btn {
  border-radius: 8px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  margin-top: 8px;
  padding: 12px 24px !important;
}

/* 會員資訊區域 */
.memberInfoZone {
  padding: 16px;
}

.info-card {
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 16px;
}

.info-title {
  color: #ffffff !important;
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.memberInfoZone :deep(h3) {
  color: #ffffff !important;
  font-size: 1rem;
  margin: 8px 0;
  font-weight: 500;
}

.memberInfoZone :deep(.v-icon) {
  margin-right: 8px;
  opacity: 0.9;
}

.memberInfoZone :deep(.v-divider) {
  border-color: rgba(255, 255, 255, 0.2) !important;
}

/* 表格樣式 */
.custom-table {
  background: transparent !important;
}

.custom-table :deep(thead) {
  background: rgba(30, 58, 138, 0.4) !important;
}

.custom-table :deep(thead th) {
  color: #ffffff !important;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.custom-table :deep(tbody tr) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.custom-table :deep(tbody tr:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

.custom-table :deep(tbody td) {
  color: #ffffff !important;
  font-weight: 500;
}

/* 新增會員表單 */
.addMemberInfoZone {
  padding: 16px;
}

.form-card {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.form-content {
  padding: 24px !important;
  background: transparent !important;
}

.form-actions {
  padding: 16px 24px !important;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 響應式設計 */
@media (max-width: 600px) {
  .dialog-header {
    padding: 16px;
  }

  .dialog-title {
    font-size: 1.1rem;
  }

  .login-form {
    padding: 16px;
  }

  .info-card {
    padding: 16px;
  }

  .form-content {
    padding: 16px !important;
  }
}
</style>