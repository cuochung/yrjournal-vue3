<template>
  <div class="ShipmentListPrint pa-3">
    <v-row>
      <v-col cols="4">
        <h1>{{ cData.company_name }}</h1>
        <h2>統編:47816069</h2>
        <!-- <h2>統編:12345678</h2> -->
        <!-- <v-img :src="require('@/assets/herfa-logo-01.png')" aspect-ratio="3.5" contain></v-img> -->
      </v-col>
      <v-col cols="4" class="d-flex justify-center align-center">
        <div class="text-center">
          <div class="text-h3 font-weight-bold">應收帳款統計表</div>
          <h2>({{ list.startDay }} ~ {{ list.endDay }})</h2>
        </div>
      </v-col>
      <v-col cols="4" class="text-right">
        <h3>台南市安吉路二段36-2號</h3>
        <h3>TEL:(06)2566720</h3>
        <h3>FAX:(06)2452484</h3>
        <!-- <h3>地址</h3>
        <h3>TEL:(06)1234567</h3>
        <h3>FAX:(06)7654321</h3> -->
      </v-col>
    </v-row>

    <v-divider class="my-2"></v-divider>

    <v-simple-table>
      <template v-slot:default>
        <thead class="text-no-wrap">
          <tr class="grey lighten-4">
            <th class="text-center text-h6 font-weight-bold d-print-none">
              <v-icon @click.stop="printCustomerList(filterShipment)"
                >mdi-printer</v-icon
              >
              會員統編
            </th>
            <th class="text-center text-h6 font-weight-bold">會員名稱</th>
            <th class="text-center text-h6 font-weight-bold">買賣金額</th>
            <th class="text-center text-h6 font-weight-bold">加工金額</th>
            <th class="text-center text-h6 font-weight-bold">出貨總金額</th>
          </tr>
        </thead>
        <tbody class="text-right">
          <tr v-for="(item, index) in filterShipment" :key="index">
            <td class="text-center text-h6 d-print-none">
              <v-icon @click.stop="printCustomerListSingle(item)"
                >mdi-printer</v-icon
              >
              {{ item.code }}
            </td>
            <td class="text-center text-h6">{{ item.name }}</td>
            <td class="text-center text-h6">{{ item.allTotalPrice }}</td>
            <td class="text-center text-h6">{{ item.allMachiningPrice }}</td>

            <td class="text-center text-h6">
              {{ item.allTotalPrice + item.allMachiningPrice }}
            </td>
          </tr>

          <tr class="grey lighten-4">
            <td class="text-h6 font-weight-bold text-center">各欄位小計</td>
            <td></td>
            <td class="text-h6 font-weight-bold text-center">
              {{ comTotal(filterShipment, "allTotalPrice") | filtermoney }}
            </td>
            <td class="text-h6 font-weight-bold text-center">
              {{ comTotal(filterShipment, "allMachiningPrice") | filtermoney }}
            </td>
            <td class="text-h6 font-weight-bold text-center">
              {{
                (comTotal(filterShipment, "allTotalPrice") +
                  comTotal(filterShipment, "allMachiningPrice"))
                  | filtermoney
              }}
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <!-- <pre>cData{{cData}}</pre> -->
    <!-- <pre>filterShipment:{{ filterShipment[0].data[0].tempItems[0].totalMachining }}</pre> -->
  </div>
</template>

<script>
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import * as math from 'mathjs';  //引入mathjs,處理浮點相乘產生的問題

export default {
  data() {
    return {
      list: JSON.parse(this.$route.query.data),
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
    items() {
      return this.$store.state.shipmentItems.map((i) => {
        let newItem = JSON.parse(i.datalist);
        newItem.snkey = i.snkey;
        if (newItem.picname == undefined) {
          newItem.picname = "lazypic.jpg";
        }
        return newItem;
      });
    },
    //建構列表表格內容
    filterShipment() {
      //1.取得.符合時間區段的資料
      let match = this.items.filter((i) =>
        dayjs(i.date).isBetween(
          this.list.startDay,
          dayjs(this.list.endDay),
          null,
          "[]"
        )
      );
      //計算出1.的資料中的各項資料總合
      match = match.map((i) => {
        return {
          ...i,
          totalPrice: this.priceTotal(i), //買賣金額
          machiningPrice: this.machiningTotal(i), //加工金額
        };
      });

      //2.取得所有符合資料的會員snkey -> 取得不重覆陣列值
      let snkeyItems = match.map((i) => i.customer.snkey); //取得所有符合資料的會員snkey
      snkeyItems = [...new Set(snkeyItems)]; //取得不重覆陣列值

      let createTableDatas = snkeyItems.map((snkey) => {
        let matchArr = match.filter((i) => i.customer.snkey == snkey);

        return {
          code: matchArr[0].customer.code,
          name: matchArr[0].customer.name,
          allTotalPrice: this.comTotal(matchArr, "totalPrice"),
          allMachiningPrice: this.comTotal(matchArr, "machiningPrice"),
          data: matchArr,
        };
      });

      return createTableDatas;
    },
  },

  mounted() {
    this.getAllData();
  },

  methods: {
    //取得所有資料
    getAllData() {
      this.$store.dispatch("setItems", "shipment"); //取得請款單資料 放在store裡
    },
    //回傳總額
    priceTotal(items) {
      return items.tempItems.reduce((total, item) => {
        return (total += parseInt(this.filterFinalPrice(item)));
      }, 0);
    },
    //回傳加工金額總額 2021/10/15 修正未計算數量產生的錯誤
    machiningTotal(items){
      return items.tempItems.reduce((total, item) => {
        return (total += parseInt(item.totalMachining) * item.quantity);
      }, 0);
    },
    filterFormat(item, type) {
      if (item[type + "Set"] == "25") {
        // let checkVal = (item[type] - parseInt(item[type])).toFixed(2);
        // let checkVal = parseInt(String(parseInt(item[type])).substr(-2, 2));
        let checkVal = parseInt(item[type]) - parseInt(item[type] / 100) * 100;
        if (checkVal > 0 && checkVal < 25) {
          return parseInt(item[type] / 100) * 100 + 25;
        }
        if (checkVal > 25 && checkVal < 50) {
          return parseInt(item[type] / 100) * 100 + 50;
        }
        if (checkVal > 50 && checkVal < 75) {
          return parseInt(item[type] / 100) * 100 + 75;
        }
        if (checkVal > 75 && checkVal < 100) {
          return parseInt(item[type] / 100) * 100 + 100;
        }

        return item[type];
      }
      if (item[type + "Set"] == "50") {
        // let checkVal = parseInt(String(parseInt(item[type])).substr(-2, 2));
        let checkVal = parseInt(item[type]) - parseInt(item[type] / 100) * 100;
        if (checkVal > 0 && checkVal < 50) {
          return parseInt(item[type] / 100) * 100 + 50;
        }
        if (checkVal > 50 && checkVal < 100) {
          return parseInt(item[type] / 100) * 100 + 100;
        }

        return item[type];
      }
      if (item[type + "Set"] == "100") {
        return parseInt(item[type] / 100) * 100 + 100;
      }

      if (item[type + "Set"] == "實材") {
        return item[type];
      }
    },
    //無條件進位
    roundUp(num, decimal) {
      return (
        math.ceil((num + Number.EPSILON) * math.pow(10, decimal)) /
        math.pow(10, decimal)
      );
    },
    filterFinalPrice(item) {
      return (
        (parseFloat(item.rawmaterial.price) +
          parseFloat(item.extraRawmaterialPrice)) *
        (this.roundUp(
          ((this.filterFormat(item, "width") / 100) *
            this.filterFormat(item, "long")) /
            100,
          2
        ) *
          item.quantity)
      ).toFixed(0);
      // return Math.round(val); //2021.3.19 改回傳四捨五入,取整數
      // return this.roundUp(val, 0);
    },
    //各種工作總金額
    // optionTotal(items, type, extraType) {
    //   return items.tempItems.reduce((total, item) => {
    //     if (item[type]) {
    //       return (total +=
    //         (parseFloat(item[type].price) + parseFloat(item[extraType])) *
    //         item.quantity);
    //     } else {
    //       return total;
    //     }
    //   }, 0);
    // },
    //回傳指定項目的總合
    comTotal(items, type) {
      return items.reduce((total, i) => {
        if (i.customer){
          if (i.customer.snkey == '10' && type == 'machiningPrice')
          console.log(type,i)
        }
        
        return (total += parseInt(i[type]));
      }, 0);
    },
    //列印指定會員應收帳款列表
    printCustomerList(items) {
      let data = {
        items: items,
        dates: this.list,
      };
      let routeData = this.$router.resolve({
        path: "/print/customershipmentlistprint",
        query: { data: JSON.stringify(data) },
      });
      window.open(routeData.href, "_blank");
    },
    //列印指定會員應收帳款列表(單筆)
    printCustomerListSingle(item) {
      let singleItem = [];
      singleItem[0] = item;
      let data = {
        items: singleItem,
        dates: this.list,
      };
      let routeData = this.$router.resolve({
        path: "/print/customershipmentlistprint",
        query: { data: JSON.stringify(data) },
      });
      window.open(routeData.href, "_blank");
    },
  },
};
</script>

<style>
@media print {
  @page {
    size: A4 portrait;
    margin: 0cm;
    padding: 0cm;
  }
}
</style>