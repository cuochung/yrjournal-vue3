<template>
  <div class="OrderinfoAdd">
    <EditOrder ref="childFn"/>

    <v-dialog v-model="dialog" fullscreen :persistent="$store.state.dialogCloseable">
      <v-card class="grey lighten-4">
        <v-card-title>
          <div class="text-sm-h4 font-weight-bold">{{ list.day }} 訂位一覽</div>
          <v-spacer></v-spacer>
          <v-btn class="primary mr-2" small @click="addOrder()">新增訂位</v-btn>
          <v-icon @click="dialog=false">mdi-close</v-icon>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-2">
          <TimeZone v-for="(time,index) in timeArr" 
          :index="index"
          :key="time" 
          :time="time" 
          :usingDatabase="usingDatabase" 
          :ordersetItems="ordersetItems"
          :orderItems="orderItems"
          class="grey lighten-1 pa-2 mb-10 rounded" 
          :class="index % 2 ? 'darken-3' : ''" />
          <h2 v-if="!timeArr.length">暫無資料...</h2>
          
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// import dayjs from "dayjs";
import TimeZone from './TimeZone.vue'
import EditOrder from '@/views/orderpage/Add.vue'

export default {
  components:{ TimeZone, EditOrder },
  props:["usingDatabase"],
  data() {
    return {
      dialog: false,
      list:{},
      orderItems: null,  //點選日期當天的資料
      timeArr:[], //選中當日的用餐時段陣列
      emptyRules: [(v) => !!v || "不可空白"],
      ordersetItems: null, //訂位設定資料

      // dialogCloseable:true, //設定dailog是否可以自動關閉 true是不行 false是可以自動關閉
    };
  },

  async mounted(){
    await this.$api.get('orderset').then(rs=>{
      this.ordersetItems = rs.map(i=>{
        return {
          ...JSON.parse(i.datalist),
          snkey : i.snkey
        }
      })
    })
  },

  methods: {
    //後台新增訂位資料功能
    addOrder() {
      this.$refs.childFn.backAddProcess(this.list.day);
    },
    //訂位列表開啟晝面控制
    editProcess(item) {
      this.list = JSON.parse(JSON.stringify(item));
      this.orderItems = this.list.orderItems.sort((a,b)=>a.timeInfo.time > b.timeInfo.time ? 1 : -1);
      //取得時間陣列,不重覆
      let timeArr = []
      this.orderItems.forEach(i=>{
        timeArr.push(i.timeInfo.time)
      });
      this.timeArr = [...new Set(timeArr)];
      this.timeArr.sort((a,b)=>a > b ? 1 :-1)
      //取得時間陣列,不重覆 end

      this.$store.commit("setdialogCloseable", true);  //控制dialog中persistent的反應
      this.dialog = true;
    },
  },
};
</script>
