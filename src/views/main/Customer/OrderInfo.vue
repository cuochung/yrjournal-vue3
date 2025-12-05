<template>
  <div class="OrderInfo">
    <v-card>
      <div class="d-flex justify-center px-2 py-2 bg-grey-lighten-3">
        <h3 class="font-weight-bold text-grey-darken-2">
          相關記錄
        </h3>
      </div>

      <v-card-text class="pa-1">
        <v-form ref="form">
          <transition name="slide-fade2" mode="out-in">
            <div class="memberInfoZone">
              <div class="grey lighten-4 rounded pa-2">
                <h3>會員資料</h3>
                <hr>
                <v-row class="mt-1">
                  <v-col cols="12" sm="4">
                    <h3>
                      <v-icon color="indigo darken-2" left>mdi-account</v-icon>
                      {{ list.name }} {{ list.sex }}
                    </h3>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <h3>
                      <v-icon color="teal darken-2" left>mdi-cellphone</v-icon>
                      {{ list.cellphone }}
                    </h3>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <h3>
                      <v-icon color="amber darken-2" left>mdi-medal</v-icon>
                      {{ list.level }}
                    </h3>
                  </v-col>

                </v-row>

                <v-divider class="my-2"></v-divider>

                <v-row>
                  <v-col cols="12" sm="3">
                    <h3>
                      <v-icon left color="amber darken-2">mdi-cash-multiple</v-icon>
                      總消費金額：{{ totalCounts('total') }}
                    </h3>
                  </v-col>
                  <v-col cols="12" sm="3">
                    <h3>
                      <v-icon left color="warning darken-2">mdi-calendar-range</v-icon>
                      去年度消費金額：{{ totalCounts('lastyear') }}
                    </h3>
                  </v-col>
                  <v-col cols="12" sm="3">
                    <h3>
                      <v-icon left color="blue darken-2">mdi-calendar-range</v-icon>
                      本年度消費金額：{{ totalCounts('year') }}
                    </h3>
                  </v-col>
                  <v-col cols="12" sm="3">
                    <h3>
                      <v-icon left color="green darken-2">mdi-calendar-month</v-icon>
                      本月消費金額：{{ totalCounts('month') }}
                    </h3>
                  </v-col>

                </v-row>

                <v-row>
                  <v-col cols="12" sm="4">
                    <h3>
                      <v-icon left color="amber darken-2">mdi-star-circle</v-icon>
                      總回饋點數：{{ totalPointCounts('rewardPoint') }}
                    </h3>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <h3>
                      <v-icon left color="red darken-2">mdi-star-off</v-icon>
                      已使用點數：{{ totalPointCounts('usePoint') }}
                    </h3>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <h3>
                      <v-icon left color="green darken-2">mdi-star</v-icon>
                      剩餘點數：{{ totalPointCounts('rewardPoint') - totalPointCounts('usePoint') }}
                    </h3>
                  </v-col>
                </v-row>




              </div>


              <v-divider class="my-2"></v-divider>

              <div class="grey lighten-4 rounded pa-2">
                <h3>消費記錄</h3>

                <v-divider class="mb-2"></v-divider>

                <v-data-iterator :items="purchaseRecords" >
                  <template v-slot:default="{ items }">
                    <v-data-table fixed-header class="text-no-wrap">
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
                    </v-data-table>
                  </template>
                </v-data-iterator>


              </div>

            </div>
          </transition>

        </v-form>
      </v-card-text>

    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from '@/stores/useStore'
import dayjs from "dayjs"
import api from '@/assets/js/api'

const store = useStore()

// Props
const props = defineProps({
  list: {
    type: Object,
    required: true
  }
})

// refs
const purchaseRecords = ref([]) //購買記錄

// methods
const totalCounts = (type) => {
  const now = dayjs()
  return purchaseRecords.value.reduce((sum, item) => {
    if (!item.price || !item.Date) return sum
    const itemDate = dayjs(item.Date)
    if (type === 'year') {
      if (itemDate.year() === now.year()) {
        return sum + Number(item.price)
      }
    } else if (type === 'lastyear') {
      if (itemDate.year() === now.year() - 1) {
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

const totalPointCounts = (type) => {
  return purchaseRecords.value.reduce((sum, item) => sum + Number(item[type] || 0), 0)
}

// lifecycle hooks
onMounted(async () => {
  try {
    const postData = {
      key: 'customerInfo.customerInfo.snkey',
      value: props.list.snkey
    }
    const rs = await api.options(`byjson/searchByKeyValue/${store.state.databaseName}/purchase_record`, postData)
    console.log('購買記錄', rs)
    if (rs.length > 0) {
      purchaseRecords.value = rs.map(i => ({
        ...JSON.parse(i.datalist),
        snkey: i.snkey
      }))
    }
  } catch (error) {
    console.error('Error fetching purchase records:', error)
  }
})
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
</style>