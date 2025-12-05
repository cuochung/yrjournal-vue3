<template>
  <div class="purchaseRecordList">
    <v-card>
      <v-card-title>
        <v-toolbar dense rounded>
          <span class="mr-3 font-weight-bold">消費記錄管理</span>
          <v-spacer></v-spacer>

          <v-text-field class="ml-4" hide-details prepend-icon="mdi-magnify" single-line label="搜尋"
            v-model="searchKey"></v-text-field>

          <PopupAdd ref="childFn" class="ml-2" :usingDatabase="usingDatabase" :useingItems="items"
            @getAllData="getAllData" />
        </v-toolbar>
      </v-card-title>
      <v-card-text>
        <PaginatedIterator
          :items="searchfilter"
          v-model:page="currentPage"
          v-model:items-per-page="itemsPerPage"
          :items-per-page-options="itemsPerPageOptions"
        >
          <template #default="{ items }">
            <v-table fixed-header class="text-no-wrap" hide-default-footer>
              <template #default>
                <thead class="title">
                  <tr>
                    <th class="text-left"></th>
                    <th class="text-left"><v-icon small color="grey darken-2">mdi-identifier</v-icon> 記錄ID</th>
                    <th class="text-left"><v-icon small color="blue darken-2">mdi-calendar</v-icon> 日期</th>
                    <th class="text-left"><v-icon small color="indigo darken-2">mdi-account</v-icon> 會員資訊</th>
                    <th class="text-left"><v-icon small color="amber darken-2">mdi-cash-multiple</v-icon> 消費金額</th>
                    <th class="text-left"><v-icon small color="amber darken-2">mdi-star-circle</v-icon> 回饋點數</th>
                    <th class="text-left"><v-icon small color="red darken-2">mdi-star-off</v-icon> 使用點數</th>
                    <th class="text-left"><v-icon small color="grey darken-2">mdi-note-text</v-icon> 備註資料</th>
                    <th class="text-left"><v-icon small color="blue darken-2">mdi-account-plus</v-icon> 創建紀錄</th>
                    <th class="text-left"><v-icon small color="blue darken-2">mdi-pencil</v-icon> 修改紀錄</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in items" :key="index">
                    <td class="pa-0 d-flex justify-center align-center">
                      <!-- 你的自定義功能選單 -->
                      <v-menu transition="scale-transition" offset-y>
                        <template v-slot:activator="{ props }">
                          <v-btn variant="text" v-bind="props">
                            <img src="@/assets/gear.svg" alt="" />
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item @click="edit(item.raw)">
                            <v-list-item-title>修改</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="del(item.raw)">
                            <v-list-item-title>刪除</v-list-item-title>
                          </v-list-item>
                          <!-- 你可以在這裡加入更多自定義功能 -->
                          <!-- <v-list-item @click="viewDetail(item.raw)">
                            <v-list-item-title>查看詳細</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="duplicate(item.raw)">
                            <v-list-item-title>複製記錄</v-list-item-title>
                          </v-list-item> -->
                        </v-list>
                      </v-menu>
                    </td>
                    <td>{{ item.raw.snkey }}</td>
                    <td>{{ item.raw.Date }}</td>
                    <td>{{ `${item.raw.customerInfo.customerInfo.name} -
                      ${item.raw.customerInfo.customerInfo.cellphone}` }}</td>
                    <td>{{ item.raw.price }}</td>
                    <td>{{ item.raw.rewardPoint }}</td>
                    <td>{{ item.raw.usePoint }}</td>
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
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from '@/stores/useStore'
import PopupAdd from "./Add.vue";
import PaginatedIterator from '@/components/PaginatedIterator.vue'
import dayjs from "dayjs";
import api from '@/assets/js/api'

const store = useStore();
const childFn = ref(null);

// 基本数据
const items = ref([]);
const usingDatabase = "purchase_record";
const searchKey = ref("");
const auth = ref("");

// 分頁相關
const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [
  { value: 5, title: '5' },
  { value: 10, title: '10' },
  { value: 25, title: '25' },
];

// 生命周期钩子
onMounted(async () => {
  auth.value = store.state.pData;
  await getAllData();
});

const searchfilter = computed(() => {
  const keys = searchKey.value.split(" ");
  let str = "";

  return keys.reduce((prev, element) => {
    return prev.filter((item) => {
      str = JSON.stringify(item).toUpperCase();
      return str.includes(element.toUpperCase());
    });
  }, items.value);
});

// 分頁計算由 PaginatedIterator 負責，這裡不再需要顯示輔助

// 方法
const getAllData = async () => {
  await api.get(usingDatabase).then((rs) => {
    let datas = rs.map((i) => {
      return {
        ...JSON.parse(i.datalist),
        snkey: i.snkey
      }
    });

    items.value = datas
  });
};

const edit = (item) => {
  childFn.value.editProcess(item);
};

const del = async (item) => {
  const confirmed = confirm('確認要刪除嗎? 此操作無法復原');

  if (confirmed) {
    const tablename = usingDatabase;
    item.delInfo = {
      name: store.state.pData.name,
      time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };

    const postData = {
      snkey: item.snkey,
      tablename: tablename,
      datalist: JSON.stringify(item),
    };

    const rs = await api.delete(usingDatabase, postData);
    if (rs.state == 1) {
      getAllData();
    }
  }
};

// 額外的自定義功能範例
// const viewDetail = (item) => {
//   console.log('查看詳細:', item);
//   // 你的詳細頁面邏輯
// };

// const duplicate = (item) => {
//   console.log('複製記錄:', item);
//   // 你的複製邏輯
// };
</script>