<template>
  <div class="TimeZone">
    <EditOrder ref="childFn" />
    <div class="pa-2 rounded">
      <div class="white--text text-sm-h5 d-sm-flex font-weight-bold">
        <span :class="index % 2 ? '' : 'black--text'">
          用餐時段: {{ time }} 
          總訂單數: {{ matchItems.length }}</span>
        <v-spacer></v-spacer>
        <span
          v-if="
            typeof returnRealOrderset(matchItems[0].timeInfo) == 'undefined'
          "
          class="red px-1 rounded"
          >本時段未設定</span
        >
        <span
          v-else
          :class="
            returnRealOrderset(matchItems[0].timeInfo).maxUsers - returnTotal <=
            0
              ? 'white--text error rounded px-2'
              : ''
          "
          >#剩餘可訂位
          {{
            returnRealOrderset(matchItems[0].timeInfo).maxUsers - returnTotal
          }}
          (目前: {{ returnTotal }} / 最大:
          {{ returnRealOrderset(matchItems[0].timeInfo).maxUsers }} )
        </span>

        <!-- 最大: {{ matchItems[0].timeInfo.maxUsers }} /  -->
      </div>

      <v-divider class="white my-1"></v-divider>

      <v-expansion-panels>
        <v-expansion-panel
          v-for="(item, index) in matchItems"
          :key="index"
          :class="item.canceled ? 'error lighten-1' : ''"
        >
          <div v-if="item.canceled" class="white--text mr-2 text-h6 px-4 pt-3"
              >#已取消訂位
              <div class="d-flex justify-space-between">
                <span class="text-h6" v-if="item.cancelTime">[ {{ item.cancelTime }} ]
                </span>
                  <v-btn x-small @click.stop="recoveryState(item)">回復</v-btn>
              </div>
              <v-divider></v-divider>
          </div>
          <v-expansion-panel-header class="text-sm-h5">
            <div>
              <div class="d-sm-flex justify-space-between">
                <div>
                  <!-- <span>時間: {{ item.timeInfo.time }}</span> -->
                  <div v-if="item.createInfo">訂位時間: {{ item.createInfo.time }} </div>
                  <div class="mt-2 mt-sm-0">姓名: {{ item.customerInfo.name }} 電話: {{ item.customerInfo.cellphone }}</div>
                </div>

                <div class="mr-4 mt-2 mt-sm-0">
                  大人: {{ item.adult ? item.adult : 0 }}位 小孩:
                  {{ item.children ? item.children : 0 }}位
                </div>
              </div>

              <div class="mt-2 mt-sm-0 text-sm-h6">{{ returnMatchInfo(item) != '' ? '近期用餐日:' + returnMatchInfo(item).Date : '' }}</div>
        
              <div class="text-sm-h6" v-if="item.note">
                <v-divider class="my-2"></v-divider>
                其他需求: {{ item.note }}
              </div>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="d-flex">
              <v-checkbox
                hide-details
                class="ma-0 pa-0"
                label="報到"
                v-model="item.checkIn"
                @click="checkInProcess(item)"
              ></v-checkbox>
              <span v-if="item.checkIn">[ {{ item.checkInTime }} ]</span>
              <v-checkbox
                hide-details
                class="ma-0 pa-0 ml-4"
                label="黑名單"
                v-model="item.customerInfo.blacklist"
                @change="updateCustomerNote(item.customerInfo)"
              ></v-checkbox>
              <v-btn text small @click.stop="editOrder(item)"
                ><v-icon color="green">mdi-pencil</v-icon></v-btn
              >
              <v-btn text small @click.stop="cancelOrder(item)"
                ><v-icon color="red">mdi-close</v-icon></v-btn
              >
              <v-text-field label="接待人員" v-model="item.serviceEmployee" hide-details class="pa-0 ma-0 ml-3" style="max-width:200px"></v-text-field>
              <v-btn class="success ml-1" small @click.stop="serviceEmployeeChecked(item)">接待人員確認</v-btn>
            </div>

            <div
              class="
                d-sm-flex
                align-center
                justify-space-between
                text-no-wrap
                mt-1
              "
            >
              <div class="d-sm-flex align-center justify-space-between">
                <div class="d-flex">
                  <v-chip
                    class="grey"
                    v-for="(i, index) in item.table"
                    :key="index"
                    >{{ i.text }}</v-chip
                  >
                  <!-- <v-chip v-if="item.table && !item.table.length" outlined>未設定</v-chip> -->
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-select
                label="安排坐位"
                prepend-icon="mdi-check-circle-outline"
                :items="tables"
                v-model="item.table"
                style="max-width: 50%"
                dense
                hide-details
                clearable
                multiple
                return-object
                @click.stop="changeTables(item.table)"
                @change="checkInProcess(item)"
              ></v-select>
            </div>
            <div class="d-flex">
              <v-textarea
                dense
                rows="1"
                label="店內備註"
                :class="{
                  'rounded mt-4 amber lighten-3': item.customerInfo.note,
                }"
                v-model="item.customerInfo.note"
                auto-grow
                hide-details
              ></v-textarea>
              <v-btn
                class="warning align-self-end ml-5"
                @click.stop="updateCustomerNote(item.customerInfo)"
                small
                >更新店內備註</v-btn
              >
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import EditOrder from "@/views/orderpage/Add.vue";

export default {
  components: { EditOrder },
  props: ["usingDatabase", "time", "orderItems", "ordersetItems","index"],
  data() {
    return {
      tables: [],
    };
  },

  computed: {
    //計算本時段用餐人數 大人加小孩
    returnTotal() {
      return this.matchItems.reduce((total, i) => {
        if (!i.canceled) {
          return (total += parseInt(i.adult) + parseInt(i.children));
        } else {
          return total;
        }
      }, 0);
    },

    //符合這個時段的訂位資料
    matchItems() {
      let match = this.orderItems.filter((i) => i.timeInfo.time == this.time);

      match.forEach((i) => {
        let matchCustomer = this.customerItems.find(
          (cItem) => cItem.snkey == i.customerInfo.snkey
        );
        if (matchCustomer) {
          i.customerInfo = matchCustomer;
        }
      });

      return match;
    },
    //會員資料
    customerItems() {
      return this.$store.state.customerItems.map((i) => {
        return {
          ...JSON.parse(i.datalist),
          snkey: i.snkey,
        };
      });
    },
  },

  mounted() {
    this.changeTables();
  },

  methods: {
    //回傳歷史訂位資料;
    returnMatchInfo(item){
      let match = this.$store.state.usingItems.filter(i=>{
        if (JSON.stringify(i).includes(item.customerInfo.cellphone)){
          return i
        }
      })
      //資料大於2筆時才判斷;去除大於今日的時間,還有取消訂位的資料
      match = match.map(i=>JSON.parse(i.datalist))
      .sort((a,b)=>a.Date > b.Date ? 1 : -1 )
      .filter(i=>i.Date < item.Date && !i.canceled)

      if (match.length){
        return match.pop()  //取最後一筆
      }else{
        return ''
      }
    },
    //回傳目前時段設定的真實資料
    returnRealOrderset(item) {
      return this.ordersetItems.find(
        (i) => item.time === i.time && item.week === i.week
      );
    },
    //2023.12.30 加入確認接待人員
    serviceEmployeeChecked(item){
      this.yn("確認接待人員?").then((result)=>{
        if (result.isConfirmed) {
          let tablename = "orderinfo";
          item.delInfo = {
            name: this.$store.state.pData.name,
            time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          };

          let postData = {
            snkey: item.snkey,
            datalist: JSON.stringify(item),
          };

          this.$api.post(tablename, postData).then(async (rs) => {
            if (rs.state == 1) {
              this.$confirm("接待人員資料已存檔", item);
              this.$store.dispatch("getUsingItems", "orderinfo");
              this.$store.commit("setdialogCloseable", false); //控制dialog中persistent的反應
            }
          });
        }
      })
    },
    //取消訂位
    cancelOrder(item) {
      this.yn("確認取消訂位嗎?").then((result) => {
        if (result.isConfirmed) {
          var tablename = "orderinfo";
          item.delInfo = {
            name: this.$store.state.pData.name,
            time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          };

          let postData = {
            snkey: item.snkey,
            tablename: tablename,
            datalist: JSON.stringify(item),
          };

          this.$api.delete(tablename, postData).then(async (rs) => {
            console.log('delete',rs)
            if (rs.state == 1) {
              // this.$alert({ icon: "success", title: "訂位已取消!!" });
              this.$confirm("訂位已取消", item);
              this.$store.dispatch("getUsingItems", "orderinfo");
              this.$store.commit("setdialogCloseable", false); //控制dialog中persistent的反應
            }
          });
        }
      });
    },
    //修改訂位資料功能
    editOrder(item) {
      this.$refs.childFn.editProcess(item);
    },
    changeTables(item = []) {
      //1.取得已選取的select內容(表示是text的內容)
      let selectArr = [];
      this.matchItems.forEach((i) => {
        if (i.table) {
          i.table.forEach((j) => selectArr.push(j.text));
        }
      });
      //2.比對selectArr跟原始的全部桌位資料;有重覆就不加入
      let match = JSON.parse(this.$store.state.cData.tables)
        .map((i) => {
          return {
            ...i,
            text: `${i.name} - ${i.counts}位`,
          };
        })
        .filter((i) => !selectArr.includes(i.text));

      item.forEach((i) => {
        match.unshift(i);
      });
      this.tables = match;
    },
    //更新會員備註資料
    updateCustomerNote(item) {
      let postData = {
        snkey: item.snkey,
        datalist: JSON.stringify(item),
      };
      this.$api.post("customer", postData).then(async (rs) => {
        if (rs.state) {
          this.$alert({ icon: "success", title: "資料已更新" });
          // this.$emit('getAllData');
          await this.$store.dispatch("getUsingItems", this.usingDatabase); //訂位資料更新
          // this.$emit('getCustomer');
          await this.$store.dispatch("setItems", "customer"); //會員資料更新
        } else {
          this.$alert({ icon: "error", title: "資料更新失敗" });
        }
      });
    },
    //報到
    checkInProcess(item) {
      if (item.checkIn) {
        item.checkInTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
      } else {
        item.checkInTime = null;
      }
      let postData = {
        snkey: item.snkey,
        datalist: JSON.stringify(item),
      };
      this.$api.post(this.usingDatabase, postData).then((rs) => {
        if (rs.state) {
          this.$alert({ icon: "success", title: "資料已更新" });
          this.$emit("getAllData");
        } else {
          this.$alert({ icon: "error", title: "資料更新失敗" });
        }
      });
    },
    //回復取消訂單狀態
    recoveryState(item) {
      this.yn("確認回復取消訂位嗎?").then((result) => {
        if (result.isConfirmed) {
          delete item.canceled;

          let postData = {
            snkey: item.snkey,
            datalist: JSON.stringify(item),
          };

          this.$api.post(this.usingDatabase, postData).then((rs) => {
            if (rs.state) {
              this.$confirm("訂位已回復", item);
              this.$store.dispatch("getUsingItems", "orderinfo");
              this.$store.commit("setdialogCloseable", false); //控制dialog中persistent的反應
              // this.$alert({ icon: "success", title: "資料已更新" });
              // this.$emit("getAllData");
            } else {
              this.$alert({ icon: "error", title: "資料更新失敗" });
            }
          });
        }
      });
    },
  },
};
</script>