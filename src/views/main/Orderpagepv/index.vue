<template>
  <div>
    <!-- <v-card-title>會員畫面預覽</v-card-title> -->
    <h2 class="titleStyle">會員畫面預覽</h2>
    <!-- <v-divider class="mb-2"></v-divider> -->
    <OrderPage />
  </div>
</template>

<script>
import OrderPage from '@/views/orderpage/index.vue'

export default {
  components:{OrderPage}
}

</script>

<style scoped>
.titleStyle
{
  z-index: 10;
  position: fixed;
  top: 100px;
  left: 2%;
  color: red;
  border: 1px solid red;
  padding:5px;
  border-radius: 10px;
}

@media (max-width: 600px) {
  .titleStyle {
    position: fixed;
    top: 93%;
    left: 2%;
    font-size: 1rem;
    color: red;
    /* padding: 3px 8px; */
    /* border-radius: 8px; */
  }

  /* 你可以針對其他 class 做手機專屬調整 */
}

</style>