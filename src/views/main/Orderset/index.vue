<template>
  <div class="OrdersetList">
    <!-- <popupadd ref="childFn" :usingDatabase="usingDatabase" @getAllData="getAllData"></popupadd> -->
    <WeekContent ref="WeekContentFn" :usingDatabase="usingDatabase" :items="items" :weekContentItems="weekContentItems"
      @getAllData="getAllData"></WeekContent>

    <v-card v-if="dataReady">
      <v-card-title class="d-flex">
        <div class="text-h5 font-weight-bold">各項設定</div>
        <v-spacer></v-spacer>
        <v-btn class="bg-primary" @click.stop="updateSetup()">更新目前設定資料</v-btn>
      </v-card-title>
      <v-card-text>
        <div class="grey lighten-4 rounded pa-2">
          <div>
            <h3 class="align-self-start mt-6">主畫面簡介</h3>
            <v-textarea v-model="introduce" class="ma-1 pa-1 amber lighten-5 rounded" auto-grow></v-textarea>
          </div>
        </div>

      </v-card-text>
    </v-card>

    <div class="mt-2" v-if="!dataReady">
      資料讀取&處理中... <v-icon>fas fa-spinner fa-spin</v-icon>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { useStore } from '@/stores/useStore';
import dayjs from "dayjs";
// import popupadd from "./Add.vue";
import WeekContent from "./WeekContent.vue";

// 使用組合式 API
const { proxy } = getCurrentInstance();
const store = useStore();
import api from '@/assets/js/api.js'

// 基本數據
const usingDatabase = "orderset";
const items = ref([]);
//星期日~六 數值為 0 ~ 6
const weekContentItems = ["日", "一", "二", "三", "四", "五", "六"];
const list = ref({
  time: "00:00",
});
const emptyRules = [(v) => !!v || "不可空白"];
const maxminRules = [(v) => v >= 1 && v <= 10 || "限制數值為 1~10"];

//其他設定
const maxday = ref(0);  //最大天數設定
const maxOrderCounts = ref(0);  //最大單次訂位人數設定
const holidaySet = ref([]);  //假日設定
const additionalHolidaySet = ref([]); //額外假日設定
const introduce = ref(""); //主畫面簡介
const memberOnly = ref(""); //設定只有會員可以訂位
const tables = ref([]); //坐位資料設定
const tableList = ref({});
const allBookingSet = ref([]); //包場設定
const allBookingList = ref({}); //新增包場用
const selectedWeek = ref(null);
const additionalDate = ref(''); //額外假日設定日期

// refs
const childFn = ref(null);
const WeekContentFn = ref(null);
const form = ref(null);

// 計算屬性
const dataReady = computed(() => {
  return Boolean(items.value);
});

// 生命週期
onMounted(async () => {
  getAllData();
  await getCompData();
  await setDatas(); //設定各項畫面中使用的資料
});

// 方法
const setDatas = async () => {
  maxday.value = store.state.cData.maxday;
  maxOrderCounts.value = store.state.cData.maxOrderCounts;
  holidaySet.value = JSON.parse(store.state.cData.holidaySet);
  additionalHolidaySet.value = JSON.parse(store.state.cData.additionalHolidaySet);
  introduce.value = store.state.cData.introduce;
  memberOnly.value = store.state.cData.memberOnly;
  allBookingSet.value = JSON.parse(store.state.cData.allBookingSet).sort((a, b) => a.Date > b.Date ? 1 : -1);
  tables.value = JSON.parse(store.state.cData.tables).sort((a, b) => a.name > b.name ? 1 : -1);
};

//選擇日期-> 找出指定日符合的訂位資訊
const matchOrderSetInfo = () => {
  let week = dayjs(allBookingList.value.Date).day();
  return items.value
    .filter((i) => i.week == weekContentItems[week])
    .map((i) => {
      return {
        text: i.time,
        week: i.week,
        time: i.time,
        maxUsers: i.maxUsers
      };
    }).sort((a, b) => a.time > b.time ? 1 : -1);
};

//清除預約時間 -> 讓時段重新判斷
const clearTimeInfo = () => {
  delete allBookingList.value.timeInfo;
};

//新增額外假日設定
const addAdditionalHoliday = () => {
  if (additionalDate.value) {
    additionalHolidaySet.value.push(additionalDate.value);
  } else {
    proxy.$swal({ icon: "warning", title: "未選擇日期" });
  }
};

const delAdditionalHoliday = (index) => {
  proxy.$swal({
    title: '確認要刪除嗎?',
    icon: 'warning',
    showConfirmButton: true,
    showCancelButton: true,
  }).then(result => {
    if (result.isConfirmed) {
      additionalHolidaySet.value.splice(index, 1);
    }
  });
};

//新增坐位資訊
const addAllBookingOK = () => {
  allBookingSet.value.push({
    ...allBookingList.value
  });
};

//刪除坐位資訊
const delAllBookingOK = (index) => {
  proxy.$swal({
    title: '確認要刪除嗎?',
    icon: 'warning',
    showConfirmButton: true,
    showCancelButton: true,
  }).then(result => {
    if (result.isConfirmed) {
      allBookingSet.value.splice(index, 1);
    }
  });
};

//新增坐位資訊
const addTableOK = () => {
  tables.value.push({
    ...tableList.value
  });
};

//刪除坐位資訊
const delTableOK = (item) => {
  proxy.$swal({
    title: '確認要刪除嗎?',
    icon: 'warning',
    showConfirmButton: true,
    showCancelButton: true,
  }).then(result => {
    if (result.isConfirmed) {
      tables.value.some((i, index) => {
        if (i.name == item.name && i.counts == item.counts) {
          tables.value.splice(index, 1);
        }
      });
    }
  });
};

//回傳每日的資料內容
const returnWeekData = (week) => {
  return items.value
    .filter((i) => i.week == week)
    .sort((a, b) => (a.time > b.time ? 1 : -1));
};

const getAllData = () => {
  api.get(usingDatabase).then(rs => {
    if (rs.length)
      items.value = rs.map(i => ({
        ...JSON.parse(i.datalist),
        snkey: i.snkey
      }));
  });
};

const addTimeOK = () => {
  //確認新增時間
  if (form.value.validate()) {
    list.value.createInfo = {
      name: store.state.pData.name,
      time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };

    let data = {
      url:
        "general/add/" +
        store.state.databaseName +
        "/" +
        usingDatabase,
      postData: {
        datalist: JSON.stringify(list.value),
      },
    };

    let returnItems = store.dispatch("returnItems", data);

    returnItems
      .then((rs) => {
        if (rs.state == 1) {
          proxy.$swal({ icon: "success", title: "已新增" });
          getAllData(); //讀入本頁使用的資料
        }
      })
      .catch((err) => {
        proxy.$swal({ icon: "error", title: "資料存取錯誤!!內容:" + err });
      });
  } else {
    proxy.$swal({ icon: "error", title: "資料輸入不完整!!請再次確認!!" });
  }
};

const editProcess = (item) => {
  childFn.value.editProcess(item);
};

//更新所有設定
const updateSetup = async () => {
  let postData =  {
    snkey: 1,
    maxday: maxday.value,
    maxOrderCounts: maxOrderCounts.value,
    holidaySet: JSON.stringify(holidaySet.value),
    additionalHolidaySet: JSON.stringify(additionalHolidaySet.value),
    introduce: introduce.value,
    memberOnly: memberOnly.value,
    allBookingSet: JSON.stringify(allBookingSet.value),
    tables: JSON.stringify(tables.value)
  }
  let returnItems = api.post("other_data",postData)

  returnItems.then(async (rs) => {
    console.log(rs);
    if (rs.state == 1) {
      proxy.$swal({
        icon: "success",
        title: "已修改",
      });
      await getCompData(); //重新取得廠商資料 other_data
      await setDatas(); //設定各項畫面中使用的資料
    }
  });
};

const copyWeek = (item) => {
  WeekContentFn.value.editProcess(item);
};

//取得廠商資料
const getCompData = async () => {
  console.log('getcomp');
  await api.get("other_data").then(
    (rs) => {
      let cData = rs[0];
      if (cData) {
        store.state.cData = cData
        sessionStorage.setItem("cData", JSON.stringify(cData));
      }
    },
    (reason) => {
      console.log(reason); // Error!
      proxy.$swal({
        icon: "error",
        title: "資料庫未正常連結!! 請按 CTRL+F5 後重新登入~ 或洽系統工程師",
      });
    }
  );
};
</script>

<style scoped>
.weekDay {
  border-bottom: 1px solid black;
  width: 100%;
  line-height: 30px;
}

.holiday {
  background-color: rgb(224, 147, 147);
}

.weekContent {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  width: 100%;
  height: 50vh;
  line-height: 30px;
}
</style>