<template>
    <div class="PatchInputForm">
        <v-dialog v-model="dialog" width="auto" fullscreen>
            <template v-slot:activator="{ props }">
                <v-btn class="bg-primary" v-bind="props" @click="runPatchInputProcess">批次輸入消費資料</v-btn>
            </template>

            <v-card>
                <v-card-title class="d-flex justify-space-between">
                    批次輸入消費資料
                    <v-spacer></v-spacer>
                    <v-icon @click.stop="dialog = false">mdi-close</v-icon>
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text>
                    <v-form ref="form">
                        <v-data-table fixed-header class="text-no-wrap">
                            <thead>
                                <tr>
                                    <th class="text-left text-h6" width="200">會員名稱</th>
                                    <th class="text-left text-h6" width="120">剩餘點數</th>
                                    <th class="text-left text-h6" width="200">日期</th>
                                    <th class="text-left text-h6" width="200">消費金額</th>
                                    <th class="text-left text-h6" width="200">回饋點數</th>
                                    <th class="text-left text-h6" width="200">使用點數</th>
                                    <th class="text-left text-h6">備註</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in newDatas" :key="index">
                                    <td>{{ item.customerInfo.name }} {{ item.customerInfo.sex }}</td>
                                    <td>
                                        {{ item.customerInfo.rewardPoint - item.customerInfo.usePoint }}
                                    </td>
                                    <td>
                                        <v-text-field v-model="item.date" type="date"></v-text-field>
                                    </td>
                                    <td>
                                        <v-text-field v-model="item.price" type="number"
                                            :rules="emptyRules"></v-text-field>
                                    </td>
                                    <td>
                                        <v-text-field v-model="item.rewardPoint" type="number"></v-text-field>
                                    </td>
                                    <td>
                                        <v-text-field v-model="item.usePoint" type="number"></v-text-field>
                                    </td>
                                    <td>
                                        <v-text-field v-model="item.note" type="text"></v-text-field>
                                    </td>
                                </tr>
                            </tbody>
                        </v-data-table>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn class="bg-primary" @click="finishProcess()">完成作業</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>


<script setup>
import { ref, getCurrentInstance } from 'vue'
import dayjs from "dayjs"
import { useStore } from '@/stores/useStore'
import api from '@/assets/js/api'

const { proxy } = getCurrentInstance()
const store = useStore()

// Props
const props = defineProps({
  checkedItems: {
    type: Array,
    required: true
  }
})

// Emits
const emit = defineEmits(['getAllData'])

// Refs
const dialog = ref(false)
const newDatas = ref([])
const form = ref(null)

// Validation rules
const emptyRules = [(v) => !!v || "不可空白"]

// Methods
const runPatchInputProcess = () => {
  console.log(props.checkedItems)
  dialog.value = true
  newDatas.value = props.checkedItems.map(item => ({
    customerInfo: item,
    date: dayjs().format("YYYY-MM-DD"), //預設日期為今天
  }))
}

const finishProcess = async () => {
  // 等待表單驗證完成
  const { valid } = await form.value.validate()

  if (valid) {
    proxy.$swal({
          title: '確認完成作業？？?',
          icon: 'warning',
          toast: false,
          timer: null,
          showConfirmButton: true,
          showCancelButton: true,
          position: 'center'
      }).then(async (result) => {
      if (result.isConfirmed) {
        const buildPostDatas = newDatas.value.map(item => ({
          "Date": item.date,
          "customerInfo": {
            "text": `${item.customerInfo.name} - ${item.customerInfo.cellphone}`,
            "customerInfo": {
              "snkey": item.customerInfo.snkey,
              "name": item.customerInfo.name,
              "cellphone": item.customerInfo.cellphone,
            }
          },
          "price": item.price,
          "note": item.note,
          "rewardPoint": item.rewardPoint,
          "usePoint": item.usePoint,
          "createInfo": {
            "name": store.state.pData.name,
            "time": dayjs().format("YYYY-MM-DD HH:mm:ss")
          }
        }))

        const postData = buildPostDatas.map(data => ({
          datalist: JSON.stringify(data)
        }))

        const url = `general/addMulti/${store.state.databaseName}/purchase_record`
        const rs = await api.options(url, postData)
        const isAllTrue = rs.every(item => item.state === true)

        if (isAllTrue) {
          proxy.$swal({
            icon: "success",
            title: `批次輸入成功, 新增筆數: ${rs.length}`
          })
          emit("getAllData") //讀入本頁使用的資料
          dialog.value = false
        } else {
          proxy.$swal({
            icon: "error",
            title: "批次輸入過程有誤，請聯絡系統服務商"
          })
        }
      }
    })
  } else {
    proxy.$swal({
      icon: "error",
      title: "請確認資料完整性!!"
    })
  }
}
</script>