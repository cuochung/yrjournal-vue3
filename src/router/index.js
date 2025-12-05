import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/orderpage'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: 'Login' },
  },
  {
    path: '/main',
    name: 'main',
    component: () => import('@/views/main/Main.vue'),
    meta: { title: '主畫面' },
    children: [
      { path: 'functionlist', name: 'functionlist', component: () => import('@/views/main/FunctionList.vue') },
      { path: 'Orderset', name: 'Orderset', component: () => import('@/views/main/Orderset/index.vue') },
      { path: 'Customer', name: 'Customer', component: () => import('@/views/main/Customer/index.vue') },
      { path: 'Personnel', name: 'Personnel', component: () => import('@/views/main/Personnel/index.vue') },
      { path: 'Orderinfo', name: 'Orderinfo', component: () => import('@/views/main/Orderinfo/index.vue') },
      { path: 'Orderpagepv', name: 'Orderpagepv', component: () => import('@/views/main/Orderpagepv/index.vue') },
      { path: 'PurchaseRecord', name: 'PurchaseRecord', component: () => import('@/views/main/PurchaseRecord/index.vue') },
    ]
  },
  {
    path: '/orderpage',
    name: 'orderpage',
    component: () => import('@/views/orderpage/index.vue'),
    meta: { title: '會員功能' },
  },
  // 將 404 路由放在最後
  { path: '/:pathMatch(.*)*', redirect: '/' },
//     meta: { title: '訂位畫面' },
//   },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.title != undefined) {
    window.document.title = to.meta.title
  } else {
    window.document.title = '會員消費管理系統'
  }
  next()
})

export default router
