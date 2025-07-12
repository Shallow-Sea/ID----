import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/content',
    name: 'Content',
    component: () => import('../views/Content.vue'),
    meta: { requiresAuth: true } // 需要卡密验证的内容页
  },
  {
    path: '/verify',
    name: 'CardVerify',
    component: () => import('../views/CardVerify.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/Layout.vue'),
    meta: { requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('../views/admin/UserManagement.vue')
      },
      {
        path: 'cards',
        name: 'CardManagement',
        component: () => import('../views/admin/CardManagement.vue')
      },
      {
        path: 'content',
        name: 'ContentManagement',
        component: () => import('../views/admin/ContentManagement.vue')
      },
      {
        path: 'settings',
        name: 'SystemSettings',
        component: () => import('../views/admin/SystemSettings.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要验证卡密
  if (to.meta.requiresAuth) {
    const cardInfo = localStorage.getItem('cardInfo')
    
    if (!cardInfo) {
      // 没有卡密信息，跳转到验证页
      next({ name: 'CardVerify' })
      return
    }
    
    try {
      // 解析卡密信息
      const { expireTime } = JSON.parse(cardInfo)
      const now = new Date().getTime()
      
      if (expireTime < now) {
        // 卡密已过期，清除并跳转验证页
        localStorage.removeItem('cardInfo')
        next({ name: 'CardVerify' })
        return
      }
    } catch (e) {
      // 卡密信息解析错误，清除并跳转验证页
      localStorage.removeItem('cardInfo')
      next({ name: 'CardVerify' })
      return
    }
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin) {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      next({ name: 'Login' })
      return
    }
  }
  
  next()
})

export default router 