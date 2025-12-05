<template>
  <div class="CustomerShipmentListPrint pa-3">
    <div v-for="item in filterData" :key="item.snkey">
      <v-row>
        <v-col cols="4">
          <!-- <h1>{{ cData.company_name }}</h1>
          <h2>統編:47816069</h2> -->
          <!-- <img
            :src="require('@/assets/herfa-logo-01.png')"
            style="height:100px"
          > -->
        </v-col>
        <v-col cols="4" class="text-h6 font-weight-bold d-flex justify-center align-center">
          <div class="text-center">
            {{ cData.company_name }} <br />
            應收帳款摘要表 <br>
            帳款月份: {{ returnMonth(list.dates.startDay) }} 月
          </div>
          <!-- <h2>({{ list.dates.startDay }} ~ {{ list.dates.endDay }})</h2> -->
        </v-col>
        <v-col cols="4" class="text-right text-h5 font-weight-bold">
          <div>台南市安吉路二段36-2號</div>
          <div>TEL:(06)2566720 / FAX:(06)2452484</div>
          <div>手機:0983281704 / 0965817100</div>
          <div>統編:47816069</div>
        </v-col>
        <!-- <v-col cols="4" class="text-right text-h5 font-weight-bold">
          <div>地址</div>
          <div>TEL:(06)1234567 / FAX:(06)7654321</div>
          <div>手機:0900123456</div>
          <div>統編:12345678</div>
        </v-col> -->
      </v-row>

      <v-divider class="my-2"></v-divider>

      <v-row class="mx-3 text-h4" v-if="item.filterCustomer">
        <v-col cols="4" class="my-0 pb-0">會員統編: {{ item.filterCustomer.code }}</v-col>
        <v-col cols="4" class="my-0 pb-0">請款對象: {{ item.filterCustomer.name }}</v-col>
        <v-col cols="4" class="my-0 pb-0">電話: {{ item.filterCustomer.cellphone }}</v-col>
        <v-col cols="8" class="my-0 pt-0">公司地址: {{ item.filterCustomer.address }}</v-col>
        <v-col cols="4" class="my-0 pt-0">聯絡人: {{ item.filterCustomer.name }}</v-col>
      </v-row>

      <v-divider class="my-2"></v-divider>

      <v-simple-table>
        <template v-slot:default>
          <thead class="text-no-wrap">
            <tr class="grey lighten-4">
              <th class="text-center text-h6 font-weight-bold">日期</th>
              <!-- <th class="text-center text-h6 font-weight-bold">單號</th> -->
              <th class="text-center text-h6 font-weight-bold">買賣金額</th>
              <th class="text-center text-h6 font-weight-bold">加工金額</th>
              <th class="text-center text-h6 font-weight-bold">出貨總金額</th>
            </tr>
          </thead>
          <tbody class="text-right">
            <tr v-for="(item, index) in item.data" :key="index">
              <td class="text-center text-h6">{{ item.date }}</td>
              <!-- <td class="text-center text-h6">{{ item.code }}</td> -->
              <td class="text-center text-h6">{{ item.totalPrice }}</td>
              <td class="text-center text-h6">{{ item.machiningPrice }}</td>
              <td class="text-center text-h6">
                {{ item.totalPrice + item.machiningPrice }}
              </td>
            </tr>

            <tr class="grey lighten-4">
              <td class="text-h6 font-weight-bold text-center">各欄位總計</td>
              <!-- <td></td> -->
              <td class="text-h6 font-weight-bold text-center">
                {{ comTotal(item.data, "totalPrice") | filtermoney }}
              </td>

              <td class="text-h6 font-weight-bold text-center">
                {{ comTotal(item.data, "machiningPrice") | filtermoney }}
              </td>
              <td class="text-h6 font-weight-bold text-center">
                {{
                  (comTotal(item.data, "totalPrice") +
                    comTotal(item.data, "machiningPrice"))
                    | filtermoney
                }}
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>

      <v-divider class="my-2"></v-divider>

      <div class="font-weight-bold text-h5 text-right mr-5">
        本期應收帳款:
        {{
          (comTotal(item.data, "totalPrice") +
            comTotal(item.data, "machiningPrice"))
            | filtermoney
        }}
      </div>

      <v-divider class="my-2"></v-divider>

      <p style="page-break-after: always"></p>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

export default {
  data() {
    return {
      items: [],
      list: JSON.parse(this.$route.query.data), //表單中收到的資料內容
      cData: JSON.parse(sessionStorage.getItem("cData")),
      customerItems: [], //暫存所有會員名單
    };
  },

  filters: {
    filtermoney(num) {
      if (!num) {
        return "";
      }
      const n = Number(num);
      return `$${n.toFixed(0).replace(/./g, (c, i, a) => {
        const currency =
          i && c !== "." && (a.length - i) % 3 === 0
            ? `, ${c}`.replace(/\s/g, "")
            : c;
        return currency;
      })}`;
    },
  },

  computed: {
    //重新構築各筆資料的會員資料
    filterData() {
      return this.list.items.map((i) => {
        let newData = i.data.sort((a, b) => {
          return a.date > b.date ? 1 : -1;
        });
        i.data = newData;
        return {
          ...i,
          filterCustomer: this.filterCustomer(i),
        };
      });
    },
  },

  mounted() {
    this.getAllData();
    this.getData("customer");
  },

  methods: {
    //回傳月份
    returnMonth(day){
      return dayjs(day).format("MM");
    },
    //取得本筆資料會員資料
    filterCustomer(item) {
      return this.customerItems.find(
        (i) => i.snkey == item.data[0].customer.snkey
      );
    },
    //取得指定資料
    getData(tableName) {
      let data = {
        url:
          "general/getAll/" + this.$store.state.databaseName + "/" + tableName,
        postData: "",
      };
      let returnItems = this.$store.dispatch("returnItems", data);

      returnItems.then((rs) => {
        this[tableName + "Items"] = rs.map((i) => {
          let newItem = JSON.parse(i.datalist);
          newItem.snkey = i.snkey;
          if (newItem.picname == undefined) {
            newItem.picname = "lazypic.jpg";
          }
          return newItem;
        });
      });
    },
    //取得所有資料
    getAllData() {
      let data = {
        url: "general/getAll/" + this.$store.state.databaseName + "/shipment",
        postData: "",
      };
      let returnItems = this.$store.dispatch("returnItems", data);

      returnItems.then((rs) => {
        this.items = rs.map((i) => {
          let newItem = JSON.parse(i.datalist);
          newItem.snkey = i.snkey;
          if (newItem.picname == undefined) {
            newItem.picname = "lazypic.jpg";
          }
          return newItem;
        });
      });
    },
    //回傳單筆資料總額
    priceTotal(items) {
      return items.tempItems.reduce((total, item) => {
        return (total += this.filterFinalPrice(item));
      }, 0);
    },
    filterFinalPrice(item) {
      if (item.noSize) {
        var val =
          item.quantity *
          (parseFloat(item.rawmaterial.price) +
            parseFloat(item.extraRawmaterialPrice));
      } else {
        val =
          item.weight *
          (parseFloat(item.rawmaterial.price) +
            parseFloat(item.extraRawmaterialPrice));
      }
      return Math.round(val); //2021.3.19 改回傳四捨五入,取整數
      // return this.roundUp(val, 0);
    },
    //各種工作總金額
    optionTotal(items, type, extraType) {
      return items.tempItems.reduce((total, item) => {
        if (item[type]) {
          return (total +=
            (parseFloat(item[type].price) + parseFloat(item[extraType])) *
            item.quantity);
        } else {
          return total;
        }
      }, 0);
    },
    //回傳指定項目的總合
    comTotal(items, type) {
      return items.reduce((total, i) => {
        return (total += parseInt(i[type]));
      }, 0);
    },
    //列印指定會員應收帳款列表
    printCustomerList(items) {
      let routeData = this.$router.resolve({
        path: "/print/customershipmentlistprint",
        query: { data: JSON.stringify(items) },
      });
      window.open(routeData.href, "_blank");
    },
  },
};
</script>

<style lang="scss">
.CustomerShipmentListPrint {
  table,
  th,
  td {
    border-top: 1px solid black;
    border-bottom: 1px solid black;
  }
}
@media print {
  @page {
    /* size: A4 portrait; */
    margin: 0cm;
    padding: 0cm;
  }
}
</style>