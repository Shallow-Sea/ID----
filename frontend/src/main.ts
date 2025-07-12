import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'

// 创建Vue应用实例
const app = createApp(App)

// 配置Element Plus
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default',
})

// 启用Pinia状态管理
app.use(createPinia())

// 配置路由
app.use(router)

// 挂载应用
app.mount('#app') 