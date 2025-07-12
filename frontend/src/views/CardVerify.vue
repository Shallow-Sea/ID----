<template>
  <div class="card-verify">
    <el-card class="verify-card">
      <template #header>
        <div class="card-header">
          <h2>卡密验证</h2>
          <p class="subtitle">请输入您的卡密以访问内容</p>
        </div>
      </template>
      
      <el-form :model="formData" @submit.prevent="handleVerify">
        <el-form-item :error="cardStore.verifyError">
          <el-input
            v-model="formData.cardCode"
            placeholder="请输入卡密"
            :prefix-icon="Key"
            size="large"
            @keyup.enter="handleVerify"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            :loading="cardStore.cardLoading"
            native-type="submit" 
            style="width: 100%"
          >
            验证卡密
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
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Key } from '@element-plus/icons-vue'
import { useCardStore } from '../store/card'

const router = useRouter()
const cardStore = useCardStore()

// 表单数据
const formData = reactive({
  cardCode: ''
})

// 处理验证
const handleVerify = async () => {
  const success = await cardStore.verifyCard(formData.cardCode)
  
  if (success) {
    // 验证成功，跳转到内容页
    router.push('/content')
  }
}

// 返回首页
const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.card-verify {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.verify-card {
  width: 100%;
  max-width: 400px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin-bottom: 10px;
  color: #303133;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin-bottom: 0;
}

.back-link {
  text-align: center;
  margin-top: 15px;
}
</style> 