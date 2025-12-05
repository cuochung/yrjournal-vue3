<template>
  <div class="WeekContent">
    <v-dialog v-model="dialog" width="auto">
      <v-card>
        <v-card-title :class="titleStyle" primary-title
          >{{ title }}
          <v-spacer></v-spacer>
          <v-icon @click.stop="dialog = false">mdi-close</v-icon>
        </v-card-title>

        <v-card-text>
          <v-select
            label="複制所有資料到星期"
            :items="weekContentItems"
            v-model="selectWeek"
          ></v-select>
          <v-alert
            class="grey lighten-1 ma-1 pa-1"
            v-for="(item, index) in listItems"
            :key="index"
          >
            <h3>
              {{ item.time }} - 人數:{{
                item.maxUsers ? item.maxUsers : "未設定"
              }}
            </h3>
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="success" @click="copyOK" v-if="processType == 'edit'"
            >複制</v-btn
          >
        </v-card-actions>

      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import dayjs from "dayjs";

export default {
  props: ["usingDatabase", "items", "weekContentItems"],
  data() {
    return {
      dialog: false,
      processType: "", //存放頁面執行是add新增或edit修改
      title: "",
      titleStyle: "",
      emptyRules: [(v) => !!v || "不可空白"],
      listItems: null,
      selectWeek: "日",
    };
  },

  methods: {
    editProcess(item) {
      //進入畫面時,執行的是修改作業
      this.processType = "edit";
      this.title = "顯示資料-星期" + item;
      this.titleStyle = "font-weight-black success lighten-2";
      this.listItems = this.items.filter((i) => i.week == item);

      this.dialog = true;
    },
    copyOK() {
      //確認複制
      let newItems = this.listItems.map((i) => {
        let newData = {
          time: i.time,
          week: this.selectWeek,
          maxUsers: i.maxUsers,
          createInfo: {
            name: this.$store.state.pData.name,
            time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          },
        };
        return {
          datalist: JSON.stringify(newData),
        };
      });

      let url = "general/addMulti/" + this.$store.state.databaseName + "/" + this.usingDatabase;

      this.$api.options(url,newItems).then((rs) => {
        if (rs.state == 1) {
          this.$alert({
            icon: "success",
            title: "已新增",
          });
          this.$emit("getAllData"); //讀入本頁使用的資料
          this.dialog = false;
        }
      });
    },
  },
};
</script>