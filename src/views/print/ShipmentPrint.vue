<template>
  <div class="ShipmentPrint pa-3" v-if="checkDataReady">
    <v-row>
      <v-col cols="4">
        <!-- <h1>{{ cData.company_name }}</h1>
        <h2>統編:47816069</h2> -->
        <!-- <v-img :src="require('@/assets/herfa-logo-01.png')" aspect-ratio="3.5" contain></v-img> -->
      </v-col>
      <v-col
        cols="4"
        class="text-h6 font-weight-bold d-flex justify-center align-center"
      >
        <div class="text-center">
          {{ cData.company_name }} <br />
          施工出貨單
        </div>
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

    <!-- <v-divider class="my-2"></v-divider> -->

    <!-- <v-row v-if="filterCustomer" class="mx-3 text-h4">
      <v-col cols="4" class="my-0 pb-0">單據日期: {{ list.date }}</v-col>
      <v-col cols="4" class="my-0 pb-0"
        >會員名稱: {{ filterCustomer.name }}</v-col
      >
      <v-col cols="4" class="my-0 pb-0"
        >手機: {{ filterCustomer.cellphone }}</v-col
      >
      <v-col cols="12" v-if="list.otheraddress" class="my-0 pt-0"
        >指定送貨地址: {{ list.otheraddress }}</v-col
      >
      <v-col cols="12" v-else class="my-0 pt-0"
        >送貨地址: {{ filterCustomer.address }}</v-col
      >
    </v-row> -->

    <!-- <v-divider class="my-2"></v-divider> -->

    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th colspan="9">
              <v-row v-if="filterCustomer" class="mx-3 text-h4 black--text">
                <v-col cols="4" class="my-0 pb-0"
                  >單據日期: {{ list.date }}</v-col
                >
                <v-col cols="4" class="my-0 pb-0"
                  >會員名稱: {{ filterCustomer.name }}</v-col
                >
                <v-col cols="4" class="my-0 pb-0"
                  >手機: {{ filterCustomer.cellphone }}</v-col
                >
                <!-- <v-col cols="3">單據號碼: {{ list.code }}</v-col> -->

                <v-col cols="12" v-if="list.otheraddress" class="my-0 pt-0"
                  >指定送貨地址: {{ list.otheraddress }}</v-col
                >
                <v-col cols="12" v-else class="my-0 pt-0"
                  >送貨地址: {{ filterCustomer.address }}</v-col
                >
              </v-row>
            </th>
          </tr>
        </thead>
        <thead class="text-no-wrap">
          <tr class="grey lighten-4">
            <th class="text-center text-h6 font-weight-bold">編號</th>
            <th class="text-center text-h6 font-weight-bold">品名</th>
            <th class="text-center text-h6 font-weight-bold">規格</th>
            <th class="text-center text-h6 font-weight-bold">數量</th>
            <th class="text-center text-h6 font-weight-bold">材數</th>
            <th class="text-center text-h6 font-weight-bold">單價</th>
            <th class="text-center text-h6 font-weight-bold">買賣金額</th>
            <!-- <th class="text-center text-h6 font-weight-bold">加工金額</th> -->
            <th class="text-center text-h6 font-weight-bold">
              <v-row>
                <v-col cols="5">加工種類</v-col>
                <v-col cols="2">才/尺/次數</v-col>
                <v-col class="text-right">單價</v-col>
                <v-col class="text-right">金額</v-col>
              </v-row>
            </th>
            <th class="text-center text-h6 font-weight-bold">備註</th>
          </tr>
        </thead>
        <tbody class="text-center">
          <tr v-for="(item, index) in list.tempItems" :key="index">
            <td class="text-no-wrap text-h6">
              {{ index + 1 }}
            </td>
            <td class="text-no-wrap text-h6">
              {{ item.rawmaterial.thickness }} {{ item.rawmaterial.name }}
            </td>
            <td class="text-h6">
              {{ filterSpecification(item.long) }} *
              {{ filterSpecification(item.width) }}
            </td>
            <td class="text-h6">{{ item.quantity }}</td>
            <td class="text-h6">
              {{ returnCubeFeet(item) * returnExtraCubeFeet(item) }}
            </td>

            <td class="text-h6">
              {{
                parseFloat(item.rawmaterial.price) +
                parseFloat(item.extraRawmaterialPrice)
              }}
            </td>
            <!-- 買賣金額 -->
            <td class="text-h6">
              {{ filterFinalPrice(item).toFixed(0) * item.quantity }}
            </td>

            <td class="text-h6">
              <!-- 加工金額 -->
              <v-row
                v-for="(machiningItem, mIndex) in item.machinings"
                :key="mIndex"
              >
                <v-col cols="5">{{ machiningItem.finalName }}</v-col>
                <v-col cols="2">{{
                  machiningItem.finalSize * item.quantity
                }}</v-col>
                <v-col class="text-right">{{ machiningItem.finalPrice }}</v-col>
                <v-col class="text-right">{{
                  machiningItem.finalWorkPrice * item.quantity
                }}</v-col>
              </v-row>
              <!-- {{ item.totalMachining * item.quantity }} -->
            </td>
            <td class="text-h6">
              {{ item.note }}
            </td>
          </tr>

          <tr class="grey lighten-4">
            <td class="text-h6 font-weight-bold text-center">小計</td>
            <td>
              <div class="d-print-none">
                <v-switch
                  v-model="Specification"
                  :label="Specification ? '公分' : '台尺'"
                ></v-switch>
              </div>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="text-h6 font-weight-bold">
              {{ priceTotal | filtermoney }}
            </td>

            <td class="text-h6 font-weight-bold">
              {{ machiningTotal | filtermoney }}
            </td>
            <td>
              <v-switch
                label="含稅"
                v-model="includeTax"
                class="d-print-none"
              ></v-switch>
            </td>
          </tr>

          <tr>
            <td class="text-h5 text-left font-weight-bold" colspan="10">
              <v-row>
                <v-col cols="5">司機:</v-col>
                <v-col cols="4">會員簽收:</v-col>
                <v-col cols="3">
                  <div>
                    合計金額: {{ (priceTotal + machiningTotal) | filtermoney }}
                  </div>
                  <div v-if="includeTax">
                    稅額:
                    {{ ((priceTotal + machiningTotal) * 0.05) | filtermoney }}
                    <br />
                    含稅金額:
                    {{ ((priceTotal + machiningTotal) * 1.05) | filtermoney }}
                  </div>
                  <!-- <v-chip
                    color="red"
                    outlined
                    class="pa-2 mx-2"
                    v-if="list.noDiscount"
                    >現金價不折扣</v-chip
                  > -->
                </v-col>
              </v-row>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <v-divider class="my-2"></v-divider>

    <div class="text-h6 font-weight-bold">
      備註: <br />
      貨款未付清或票據未兌現之前，本公司仍保有貨品所有權，並得不經法律程序取回
      <br />
      以上價格均未含稅，如需發票需另加總金額5%
    </div>
  </div>
</template>

<script>
import * as math from "mathjs"; //引入mathjs,處理浮點相乘產生的問題

export default {
  props: ["printItem", "printCustomerItems"],
  data() {
    return {
      list: null,
      cData: JSON.parse(sessionStorage.getItem("cData")),
      customerItems: null, //暫存所有會員名單
      Specification: false,
      includeTax: false,
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
    checkDataReady() {
      if (this.list != null && this.customerItems != null) {
        return true;
      } else {
        return false;
      }
    },
    //取得本筆資料會員資料
    filterCustomer() {
      return this.customerItems.find(
        (i) => i.snkey == this.list.customer.snkey
      );
    },
    //單價總金額
    priceTotal() {
      return this.list.tempItems.reduce((total, item) => {
        return (total += parseInt(this.filterFinalPrice(item)));
      }, 0);
    },
    machiningTotal() {
      return this.list.tempItems.reduce((total, item) => {
        return (total += parseInt(item.totalMachining) * item.quantity);
      }, 0);
    },
  },

  mounted() {
    if (this.printItem) {
      this.list = this.printItem;
      this.list.tempItems.reverse();
      this.customerItems = this.printCustomerItems;
    } else {
      this.list = JSON.parse(this.$route.query.data);
      this.list.tempItems.reverse();
      this.getData("customer");
    }
  },

  methods: {
    //回傳材質
    returnExtraCubeFeet(item) {
      if (item.extraCubeFeet) {
        return item.extraCubeFeet;
      } else {
        return 1;
      }
    },
    //回傳材數計算值
    returnCubeFeet(item) {
      let val = this.roundUp(
        ((item.finalSetLong / 100) * item.finalSetWidth) / 100,
        2
      );
      if (val < 1){
        return 1
      }else{
        return val;
      }
    },
    //台尺 / 公分顯示換算
    filterSpecification(val) {
      if (this.Specification) {
        return Math.round(Number(math.format(val / 3.3, 14)));
      } else {
        return val;
      }
    },
    //最終單價計算
    filterFinalPrice(item) {
      return (
        (parseFloat(item.rawmaterial.price) +
          parseFloat(item.extraRawmaterialPrice)) *
        this.returnCubeFeet(item) *
        this.returnExtraCubeFeet(item)
      );
    },
    // filterFinalPrice(item) {
    //   return (
    //     (parseFloat(item.rawmaterial.price) +
    //       parseFloat(item.extraRawmaterialPrice)) *
    //     (this.roundUp(
    //       ((this.filterFormat(item, "width") / 100) *
    //         this.filterFormat(item, "long")) /
    //         100,
    //       2
    //     ) *
    //       item.quantity)
    //   ).toFixed(0);
    //   // return Math.round(val); //2021.3.19 改回傳四捨五入,取整數
    //   // return this.roundUp(val, 0);
    // },
    //無條件進位
    roundUp(num, decimal) {
      return (
        math.ceil((num + Number.EPSILON) * math.pow(10, decimal)) /
        math.pow(10, decimal)
      );
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
    //取得指定資料
    getData(tableName) {
      console.log("getdata");
      let data = {
        url:
          "general/getAll/" + this.$store.state.databaseName + "/" + tableName,
        postData: "",
      };

      let returnItems = this.$store.dispatch("returnItems", data);
      returnItems.then((rs) => {
        // console.log(tableName,rs)
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
  },
};
</script>

<style lang="scss" >
.ShipmentPrint {
  table,
  th,
  td {
    border: 1px solid black;
  }
}

@media print {
  @page {
    /* size: A4; */
    /* size: A4 portrait; */
    margin: 0cm;
    margin-top:10px;
    padding: 0cm;
  }
}
</style>