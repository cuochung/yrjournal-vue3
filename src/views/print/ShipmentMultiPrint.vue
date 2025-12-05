<template>
  <div class="ShipmentMultiPrint" v-if="customerItems != null">
    <div v-for="item in printItems" :key="item.snkey">
      <ShipmentPrint :printItem="item" :printCustomerItems="customerItems" />
      <v-divider class="my-2"></v-divider>
      <p style="page-break-after: always"></p>
    </div>
  </div>
</template>

<script>
import ShipmentPrint from "@/views/print/ShipmentPrint";

export default {
  components: { ShipmentPrint },
  data() {
    return {
      printItems: null,
      cData: JSON.parse(sessionStorage.getItem("cData")),
      customerItems: null,
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
    this.printItems = JSON.parse(this.$route.query.data); //取得待列印的資料
    this.getData("customer");
  },

  methods: {
    //取得指定資料
    getData(tableName) {
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