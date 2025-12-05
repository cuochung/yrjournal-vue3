<template>
  <div class="purchaseRecordAdd">
    <v-dialog v-model="dialog" width="auto" fullscreen="">
      <template v-slot:activator="{ props }">
        <v-icon color="red lighten-2" dark v-bind="props" @click="addProcess">mdi-plus-circle</v-icon>
      </template>

      <v-card>
        <v-card-title class="d-flex" :class="titleStyle">{{
          title
        }}
          <v-spacer></v-spacer>
          <v-icon @click.stop="dialog = false">mdi-close</v-icon>
        </v-card-title>

        <v-card-text>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" sm="4">
                <v-autocomplete prepend-icon="mdi-face-man" label="姓名 - 電話" :items="customerItems"
                  v-model="list.customerInfo" return-object :rules="emptyObjRules" autofocus></v-autocomplete>
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field label="消費日期" type="date" prepend-icon="mdi-calendar" v-model="list.Date"
                  :rules="emptyRules"></v-text-field>
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field ref="priceInput" type="number" label="消費金額" prepend-icon="mdi-cash" v-model="list.price"
                  :rules="emptyRules"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field type="number" label="回饋點數" prepend-icon="mdi-star-circle"
                  v-model="list.rewardPoint"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field type="number" label="使用點數" prepend-icon="mdi-minus-circle"
                  v-model="list.usePoint"></v-text-field>
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
          <v-btn block class="bg-primary" @click="addtoTemp()" v-if="processType == 'add'">確認新增</v-btn>
          <v-btn class="bg-success" @click="editOK()" v-if="processType == 'edit'">確認修改</v-btn>
        </v-card-actions>

        <v-card v-if="dataTemp.length" class="ma-4 pa-2 border-xl" border="success sm opacity-100">
          <div class="stat-bar mb-2">
            <div class="text-h6">共 {{ dataTemp.length }} 筆</div>
            <div class="text-h6">
              總金額：{{dataTemp.reduce((sum, item) => sum + Number(item.price || 0), 0).toLocaleString()}}
            </div>
            <v-btn class="bg-success" @click="finishAdd()">
              <v-icon left>mdi-content-save</v-icon>儲存本次作業
            </v-btn>
          </div>

          <hr>

          <v-row class="mt-1">
            <v-col cols="12" sm="3" md="2" v-for="(item, index) in dataTemp" :key="index">
              <v-card class="purchase-card pa-3 mb-3">
                <div class="font-weight-bold mb-1">日期：{{ item.Date }}</div>
                <div class="price-text">消費金額 {{ item.price }}</div>
                <div class="price-text">回饋點數 {{ item.rewardPoint }}</div>
                <div class="price-text">使用點數 {{ item.usePoint }}</div>
                <div>備註：{{ item.note }}</div>
                <v-icon class="iconStyle" @click="delFromTemp(index)">mdi-close</v-icon>

              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, getCurrentInstance } from 'vue';
import { useStore } from '@/stores/useStore'
import dayjs from "dayjs";
import api from '@/assets/js/api'

// 定义 props
const props = defineProps({
  usingDatabase: String,
  useingItems: Array
});

// 定义 emits
const emit = defineEmits(['getAllData']);

// 使用组合式 API
const { proxy } = getCurrentInstance()
const store = useStore();

// refs
const form = ref(null);
const priceInput = ref(null);
const dialog = ref(false);
const list = ref({});
const processType = ref("");
const title = ref("");
const titleStyle = ref("");
const originalItem = ref(null);
const customerItems = ref([]);
const dataTemp = ref([]);

// 验证规则
const emptyRules = [(v) => !!v || "不可空白"];
const emptyObjRules = [(v) => Boolean(Object.keys(v || {})[0]) || "不可空白"];

// 生命周期钩子
onMounted(async () => {
  try {
    const rs = await api.get('customer');
    if (rs.length) {
      const datas = rs.map(i => ({
        ...JSON.parse(i.datalist),
        snkey: i.snkey,
      }));

      customerItems.value = datas.map(i => ({
        title: i.name + " - " + i.cellphone,
        customerInfo: {
          snkey: i.snkey,
          name: i.name,
          cellphone: i.cellphone,
        }
      }));
    }
  } catch (err) {
    proxy.$swal({ icon: "error", title: "資料庫存取錯誤!!內容:" + err });
  }
});

// 方法
const addtoTemp = async () => {
  const { valid } = await form.value.validate();
  if (valid) {
    dataTemp.value.unshift(JSON.parse(JSON.stringify(list.value)));

    list.value.price = '';
    list.value.rewardPoint = '';
    list.value.usePoint = '';

    await nextTick();
    form.value.reset();
    priceInput.value.focus();
  } else {
    proxy.$swal({ icon: "warning", title: "資料輸入不完整!!請再次確認!!" });
  }
};

const delFromTemp = (index) => {
  dataTemp.value.splice(index, 1);
};

const addProcess = async () => {
  processType.value = "add";
  title.value = "新增消費資料";
  titleStyle.value = "font-weight-black bg-error lighten-2";

  await nextTick();
  form.value.reset();

  list.value = {
    Date: dayjs().format("YYYY-MM-DD"),
    // customerInfo: {},
    price: '',
    note: '',
  };


};

const editProcess = (item) => {
  processType.value = "edit";
  title.value = "修改消費資料";
  titleStyle.value = "font-weight-black bg-success lighten-2";
  originalItem.value = item;

  //藍版vuetify 下拉選單的title 是用text 而不是title 所以要先轉換
  if (!item.customerInfo.title) {
    item.customerInfo = item.customerInfo;
    item.customerInfo.title = item.customerInfo.text
    delete item.customerInfo.text
  }

  list.value = JSON.parse(JSON.stringify(item));

  dialog.value = true;
};

const finishAdd = async () => {
  proxy.$swal({
    title: '確認完成作業嗎?',
    icon: 'warning',
    toast: false,
    timer: null,
    showConfirmButton: true,
    showCancelButton: true,
    position: 'center'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const postData = dataTemp.value.map(item => ({
        datalist: JSON.stringify({
          ...item,
          createInfo: {
            name: store.state.pData.name,
            time: dayjs().format("YYYY-MM-DD HH:mm:ss")
          }
        })
      }));

      try {
        const rs = await api.options(`general/addMulti/${store.state.databaseName}/${props.usingDatabase}`, postData);

        const isAllSuccess = rs.every(item => item === true);
        if (isAllSuccess) {
          proxy.$swal({ icon: "success", title: "已新增" });
          emit("getAllData");
          dialog.value = false;
          dataTemp.value = [];
        } else {
          proxy.$swal({ icon: "error", title: "新增資料過程有誤!!請再次確認!!" });
          console.log("新增資料過程有誤!!請再次確認!!", rs);
        }
      } catch (err) {
        proxy.$swal({ icon: "error", title: "新增資料過程有誤!!內容:" + err });
      }
    }

  });
};

const editOK = async () => {
  const { valid } = await form.value.validate();
  if (valid) {
    if (!list.value.editInfo) {
      list.value.editInfo = [];
    }

    list.value.editInfo.unshift({
      name: store.state.pData.name,
      time: dayjs().format("YYYY-MM-DD HH:mm:ss")
    });

    const postData = {
      snkey: list.value.snkey,
      datalist: JSON.stringify(list.value)
    };

    try {
      const rs = await store.$api.post(props.usingDatabase, postData);
      if (rs.state == 1) {
        proxy.$swal({
          icon: "success",
          title: "已修改",
        });
        emit("getAllData");
        dialog.value = false;
      }
    } catch (err) {
      proxy.$swal({ icon: "error", title: "修改失敗!!內容:" + err });
    }
  } else {
    proxy.$swal({ icon: "error", title: "資料輸入不完整!!請再次確認!!" });
  }
};

defineExpose({
  editProcess
})
</script>


<style scoped>
.stat-bar {
  background: rgba(50, 67, 95, 0.08);
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px 0 rgba(50, 67, 95, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-bar .v-btn {
  margin-left: auto;
}

.purchase-card {
  background: rgba(225, 220, 217, 0.85);
  border-radius: 14px;
  box-shadow: 0 4px 16px 0 rgba(50, 67, 95, 0.10);
  transition: box-shadow 0.3s, transform 0.2s;
  border: 1px solid #e0e3e7;
  position: relative;
}

.purchase-card:hover {
  box-shadow: 0 8px 24px 0 rgba(50, 67, 95, 0.18);
  transform: scale(1.03);
}

.iconStyle {
  position: absolute;
  top: 2px;
  right: 2px;
  cursor: pointer;
  font-size: 1.3em;
  transition: color 0.2s;
  color: red
}

.price-text {
  color: red;
  font-weight: bold;
}

@media (max-width: 600px) {
  .purchase-card {
    font-size: 0.95em;
    padding: 10px 6px;
  }
}
</style>