<template>
  <div class="OrderPageAdd">
    <v-dialog v-model="dialog" scrollable transition="scroll-y-reverse-transition" width="90vw">
      <template v-slot:activator="{ on }">
        <transition name="slide-fade" mode="out-in">
          <v-btn class="titleFontColor white--text" color="#32435F" x-large v-on="on">會員查詢</v-btn>
        </transition>
      </template>

      <v-card>
        <v-card-title class="px-4 grey lighten-3">
          <h3 class="font-weight-bold grey--text text--darken-2"> 查詢歷史記錄 </h3>
          <v-spacer></v-spacer>
          <v-icon @click.stop="dialog = false;memberOK=false;list={}">mdi-close</v-icon>
        </v-card-title>

        <v-card-text v-if="!memberOK">
          <v-form ref="form">
            <div class="pa-2" >
              <v-text-field type="number" label="請輸入手機號碼" prepend-icon="mdi-cellphone" v-model="list.cellphone"
                :rules="emptyRules" autofocus @keydown.enter.prevent="checkAuth()" v-if="dialog"></v-text-field>
              <v-text-field label="請輸入密碼" prepend-icon="mdi-cellphone" v-model="list.password" :rules="emptyRules"
                @keydown.enter.prevent="checkAuth()"></v-text-field>
              <v-btn block class="grey ml-2" @click.stop="checkAuth()">確認</v-btn>
            </div>
          </v-form>
        </v-card-text>
        <!-- 會員才可以看到歷史記錄 -->
        <transition name="slide-fade2" mode="out-in">
          <div class="memberInfoZone" v-if="memberOK">
            <div class="grey lighten-4 rounded pa-4">
              <h3>會員資料</h3>
              <div class="mt-2 d-flex justify-space-around">
                <h3>
                  <v-icon>mdi-face-man</v-icon>
                  {{ list.customerInfo.name }} {{ list.customerInfo.sex }}
                </h3>
                <h3>
                  <v-icon>mdi-cellphone</v-icon>
                  {{ list.customerInfo.cellphone }}
                </h3>
              </div>
            </div>

            {{ this.list }}
            <v-divider class="mb-2"></v-divider>
          </div>
        </transition>
        <!-- {{list}} -->
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import dayjs from "dayjs";
import DatePicker from "@/components/DatePicker";

export default {
  props: ["usingDatabase", "showButtom"],
  components: { DatePicker },
  data() {
    return {
      dialog: false,
      list: {}, //表單內資料
      processType: "", //存放頁面執行是add新增或edit修改 ; backAdd:後台新增模式
      title: "",
      titleStyle: "",
      emptyRules: [(v) => !!v || "不可空白"],
      zeroRules: [(v) => v >= 0 || "不可小於0"],
      emptyObjRules: [(v) => Boolean(Object.keys(v || {})[0]) || "不可空白"],
      loading: false, //讀取中...動畫設定

      customerItems: null, //會員資料

      memberOK: false, //判斷是否為會員
      addMemberOK: false, //判斷非會員是不可以新增資料

    };
  },

  async mounted() {
    await this.getItems("customer");
  },

  methods: {
    //判斷會員的合法性
    checkAuth() {
      if (this.list.cellphone && this.list.password) {
        //要有資料才判斷
        let match = this.customerItems.find(
          (i) => i.cellphone === this.list.cellphone && i.password === this.list.password
        );
        if (match) {
          //判斷黑名單
          if (match.blacklist) {
            this.$alert({ icon: "error", title: "請聯絡店內訂位唷!!" });
          } else {
            this.memberOK = true;

            //這裡執行顯示會員資料及載入消費記錄
            this.$set(this.list, "customerInfo", { ...match });
          }
        } else {
          this.memberOK = false;
          this.$alert({ icon: "error", title: "請再次確認手機及密碼唷!!" });
        }
      }
    },
    //讀入各項使用資料
    async getItems(databaseName) {
      await this.$api.get(databaseName).then((rs) => {
        // console.log(rs)
        this[databaseName + "Items"] = rs.map((i) => {
          if (isJSON(i.datalist)) {
            return {
              ...JSON.parse(i.datalist),
              snkey: i.snkey,
            };
          } else {
            return "";
          }
        });

        function isJSON(str) {
          if (typeof str == "string") {
            try {
              var obj = JSON.parse(str);
              if (typeof obj == "object" && obj) {
                return true;
              } else {
                return false;
              }
            } catch (e) {
              alert("2資料庫存在不合法的資料,請跟工程師聯絡!!");
              console.log(
                "databaseName:",
                databaseName,
                "error:" + str + "!!!" + e
              );
              return false;
            }
          }
        }
      });
    },

  },
};
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