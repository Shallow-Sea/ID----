<template>
  <div class="login-page">
    <el-card class="login-card">
      <div class="login-header">
        <h2>管理员登录</h2>
      </div>
      
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="密码"
            :prefix-icon="Lock"
            type="password"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item v-if="adminStore.loginError">
          <el-alert
            :title="adminStore.loginError"
            type="error"
            :closable="false"
            show-icon
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="adminStore.loginLoading"
            native-type="submit"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
        
        <div class="back-link">
          <el-link type="primary" @click="goHome">返回首页</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { useAdminStore } from '../store/admin'

const router = useRouter()
const adminStore = useAdminStore()
const formRef = ref(null)

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      const success = await adminStore.login(loginForm.username, loginForm.password)
      if (success) {
        router.push('/admin/dashboard')
      }
    }
  })
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 已登录则直接跳转到管理页面
onMounted(() => {
  adminStore.loadAdminInfo()
  if (adminStore.isLoggedIn) {
    router.push('/admin/dashboard')
  }
})
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #303133;
  font-weight: 500;
}

.back-link {
  text-align: center;
  margin-top: 15px;
}
</style> 