<template>
  <div class="OrderInfoList">
    <popupadd ref="childFn" :usingDatabase="usingDatabase" @getAllData="getAllData" @getCustomer="getCustomer"></popupadd>

    <v-card v-if="dataReady">
      <v-card-title>
        <span class="font-weight-bold">訂位資訊</span>
        <v-spacer></v-spacer>
        <div class="d-sm-flex">
          <v-text-field
            label="設定月份"
            type="month"
            class="mx-3"
            v-model="month"
            hide-details
            mandatory
          ></v-text-field>

          <div class="d-flex align-end mt-2">
            <v-btn @click.stop="setMonth(-1)">上個月</v-btn>
            <v-btn @click.stop="setThisMonth()">本月</v-btn>
            <v-btn @click.stop="setMonth(1)">下個月</v-btn>
          </div>
        </div>
      </v-card-title>

      <v-card-text>
        <div class="grey lighten-3 rounded pa-3">
          <div class="d-flex">
            <div
              v-for="weekContent in weekContentItems"
              :key="weekContent"
              class="weekDay text-center font-weight-bold"
              :class="
                holidaySet.includes(weekContent) ? 'holiday white--text' : ''
              "
            >
              星期{{ weekContent }}
              <span
                v-if="
                  holidaySet.includes(weekContent) ? ' holiday white--text' : ''
                "
                >(休)</span
              >
            </div>
          </div>

          <!-- 日期的部分 -->
          <transition name="slide-fade2" mode="out-in">
            <div class="calendar-day py-2" :key="month">
              <div v-for="(item, weekIndex) in items" :key="weekIndex">
                <template v-if="weekIndex % 7 == 0">
                  <div style="width: 100%; min-height: 12vh" class="d-flex">
                    <div
                      v-for="(i, dayIndex) in 7"
                      :key="dayIndex"
                      class="weekDay day d-sm-flex justify-center align-center"
                      :class="
                      [
                        {'grey darken-3 grey--text text--lightn-4' : checkThisMonth(items[weekIndex + dayIndex].day)},
                        {'weekLastDay' : dayIndex % 7 == 6}
                      ]
                      "
                      @click.stop="addProcess(items[weekIndex + dayIndex])"
                    >
                      <v-btn icon small class="ml-2 text-sm-h6 font-weight-bold" :class="{'primary ma-1 white--text pa-sm-6' : items[weekIndex + dayIndex].day == today}">{{
                        items[weekIndex + dayIndex].day.split("-")[2]
                      }}</v-btn>
                      <div class="text-sm-h6 text-center" :class="{'error--text': items[weekIndex + dayIndex].orderItems.length}">({{ items[weekIndex + dayIndex].orderItems.length }}) </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </transition>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import dayjs from "dayjs";
import popupadd from "./Add.vue";

export default {
  components:{ popupadd },
  data() {
    return {
      usingDatabase: "orderinfo",  //預定載入的主要資料庫-訂位資料
      //星期日~六 數值為 0 ~ 6
      weekContentItems: ["日", "一", "二", "三", "四", "五", "六"],
      emptyRules: [(v) => !!v || "不可空白"],

      holidaySet: "", //假日設定
      today: dayjs().format("YYYY-MM-DD"),
      month: dayjs().format("YYYY-MM"),
      items: null, //訂位資料
    };
  },

  computed: {
    dataReady() {
      if (this.dateArr) {
        let match = this.dateArr.map((i) => {
          return {
            day: i,  //指定日期
            orderItems: this.matchDayContent(i),  //指定日期的訂位資訊
          };
        });
        
        this.items = match;
        return true;
      } else {
        return false;
      }
    },
    //產生36個日期的陣列,畫面第一天為firstDay
    dateArr() {
      let arr = [];
      for (let i = 0; i < 42; i++) {
        let setDay = dayjs(this.firstDay).add(i, "day").format("YYYY-MM-DD");
        arr.push(setDay);
      }
      return arr;
    },
    //取得列表中的最左上方第一格的日期
    firstDay() {
      let thisMonthFirstDay = dayjs(this.month).format("YYYY-MM-01");
      let weekday = dayjs(thisMonthFirstDay).format("d");
      return dayjs(thisMonthFirstDay).add(-weekday, "day").format("YYYY-MM-DD");
    },
    //選出只符合使用者的資料
    filtervactionItemsForThisMan() {
      return this.vactionItems.filter(
        (i) => i.personnel_id == this.$store.state.pData.id
      );
    },
    //2022.4.17 先判斷訂位畫面的資料是否為json物件再使用
    orderInfoItems(){
      return this.$store.state.usingItems
      .map(i=>{
        if (isJSON(i.datalist)){
          return {
            ...JSON.parse(i.datalist),
            snkey : i.snkey,
          }
        }else{
          return ''
        }
      })

      function isJSON(str) {
        if (typeof str == 'string') {
            try {
                var obj=JSON.parse(str);
                if(typeof obj == 'object' && obj ){
                    return true;
                }else{
                    return false;
                }

            } catch(e) {
                alert('1資料庫存在不合法的資料,請跟工程師聯絡!!')
                console.log('error：'+str+'!!!'+e);
                return false;
            }
        }
      }
    }
  },

  async mounted() {
    this.holidaySet = JSON.parse(this.$store.state.cData.holidaySet);  //休假日設定
    await this.getAllData();
    await this.getCustomer();
  },

  methods: {
    //取得會員資料庫
    async getCustomer(){
      await this.$store.dispatch("setItems", "customer");
    },
    //顯示當日訂位畫面
    addProcess(item){
      this.$refs.childFn.editProcess(item);
    },
    //載入這個畫面主要使用的資料 - 訂位資料
    async getAllData() {
      await this.$store.dispatch("getUsingItems", this.usingDatabase);
    },
    //回傳指定日期的訂位資料
    matchDayContent(day){
      // return this.$store.state.usingItems.map(i=>{
      //   return {
      //     ...JSON.parse(i.datalist),
      //     snkey : i.snkey,
      //   }
      // }).filter((i) => i.Date == day);
      return this.orderInfoItems.filter((i) => i.Date == day);
    },
    //判斷是否在這個月份
    checkThisMonth(day) {
      if (day.includes(this.month)) {
        return false;
      } else {
        return true;
      }
    },
    setThisMonth() {
      this.month = dayjs().format("YYYY-MM");
    },
    setMonth(val) {
      this.month = dayjs(this.month).add(val, "month").format("YYYY-MM");
    },
  },
};
</script>

<style scoped>
.weekDay {
  border-bottom: 1px solid black;
  width: 100%;
  line-height: 30px;
}

.day{
  border-left:1px solid black;
}

.weekLastDay{
  border-right:1px solid black;
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