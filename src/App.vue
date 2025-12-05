<script setup>
// Components are automatically registered
import { useStore } from '@/stores/useStore'
const store = useStore()

</script>

<template>
  <v-overlay 
    v-model="store.state.loading" 
    class="align-center justify-center"
    :scrim="true"
    persistent
    location="center"
  >
    <v-progress-circular 
      indeterminate 
      size="64"
      color="primary"
      :width="7"
    ></v-progress-circular>
  </v-overlay>

  <v-app>
    <v-main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
