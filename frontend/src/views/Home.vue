<template>
  <div class="home">
    <el-card class="welcome-card">
      <div class="welcome-header">
        <h1>卡密系统</h1>
        <p>一个简单高效的内容访问控制系统</p>
      </div>
      
      <div class="card-status" v-if="cardStore.hasValidCard">
        <el-alert
          title="您已验证卡密"
          type="success"
          :closable="false"
          show-icon>
          <template #default>
            <p>卡密到期时间: {{ cardStore.expiryDate }}</p>
            <el-button type="primary" @click="goToContent">
              立即访问内容
            </el-button>
          </template>
        </el-alert>
      </div>
      
      <div class="actions" v-else>
        <el-button type="primary" size="large" @click="goToVerify">
          立即验证卡密
        </el-button>
        <el-button type="info" size="large" @click="goToAdmin">
          管理员登录
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCardStore } from '../store/card'

const router = useRouter()
const cardStore = useCardStore()

// 初始化时加载卡密信息并设置自动检查
onMounted(() => {
  cardStore.loadCardInfo()
  cardStore.setupAutoCheck()
})

// 导航函数
const goToVerify = () => router.push('/verify')
const goToContent = () => router.push('/content')
const goToAdmin = () => router.push('/login')
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.welcome-card {
  width: 100%;
  max-width: 600px;
}

.welcome-header {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-header h1 {
  font-size: 36px;
  color: #409eff;
}

.welcome-header p {
  font-size: 16px;
  color: #666;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.card-status {
  margin: 30px 0;
}
</style> 