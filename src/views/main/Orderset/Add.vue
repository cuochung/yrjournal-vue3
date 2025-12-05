<template>
  <div class="OrdersetAdd">
    <v-dialog v-model="dialog" width="auto">
      <v-card>
        <v-card-title :class="titleStyle" primary-title
          >{{ title }}
          <v-spacer></v-spacer>
          <v-icon @click.stop="dialog = false">mdi-close</v-icon>
        </v-card-title>

        <v-card-text>
          <v-form ref="form">
            <!-- <TimePicker2 :label="'訂位時間'" v-model="list.time" /> -->
            <v-text-field
              label="最大人數設定(預設為10)"
              type="number"
              prepend-icon="fa fa-users"
              v-model="list.maxUsers"
              :rules="emptyRules"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn class="error" @click="deleteOK" v-if="processType == 'edit'"
            >刪除</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn class="success" @click="editOK" v-if="processType == 'edit'"
            >設定</v-btn
          >
        </v-card-actions>
        <!-- <pre>{{ list }}</pre> -->
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import dayjs from "dayjs";

export default {
  props: ["usingDatabase"],
  data() {
    return {
      dialog: false,
      list: {}, //表單內資料
      processType: "", //存放頁面執行是add新增或edit修改
      title: "",
      titleStyle: "",
      emptyRules: [(v) => !!v || "不可空白"],
    };
  },

  methods: {
    editProcess(item) {
      //進入畫面時,執行的是修改作業
      this.processType = "edit";
      this.title = "資料設定";
      this.titleStyle = "font-weight-black success lighten-2";
      this.list = { ...item }; //複制一份實際修改資料內容
      if (!this.list.maxUsers){
        this.list.maxUsers = 10;
      }
      this.dialog = true;
    },
    editOK() {
      //確認修改
      if (this.$refs.form.validate()) {
        if (this.list.editInfo == undefined) {
          this.list.editInfo = [];
        }
        this.list.editInfo.unshift({
          name: this.$store.state.pData.name,
          time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });

        let data = {
          url:
            "general/edit/" +
            this.$store.state.databaseName +
            "/" +
            this.usingDatabase,
          postData: {
            snkey: this.list.snkey,
            datalist: JSON.stringify(this.list),
          },
        };
        let returnItems = this.$store.dispatch("returnItems", data);

        returnItems.then((rs) => {
          if (rs.state == 1) {
            this.$alert({
              icon: "success",
              title: "已修改",
            });
            this.$emit("getAllData"); //讀入本頁使用的資料
            this.dialog = false;
          }
        });
      } else {
        this.$alert({ icon: "error", title: "資料輸入不完整!!請再次確認!!" });
      }
    },
    //刪除功能
    deleteOK() {
      let item = this.list;
      //yn() 全域函數寫在main.js裡
      this.yn().then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          var tablename = this.usingDatabase;
          item.delInfo = {
            name:this.$store.state.pData.name,
            time:dayjs().format("YYYY-MM-DD HH:mm:ss")
          }

          let data = {
            url:
              "general/delv3/" +
              this.$store.state.databaseName +
              "/" +
              tablename,
            postData: {
              snkey: item.snkey,
              tablename: tablename,
              datalist: JSON.stringify(item),
            },
          };
          let returnItems = this.$store.dispatch("returnItems", data);
          returnItems.then((rs) => {
            if (rs.state == 1) {
              this.$alert({ icon: "success", title: "已刪除!" });
              this.$emit("getAllData"); //讀入本頁使用的資料
              this.dialog = false;
            }
          });

        }
      });
    },
  },
};
</script>