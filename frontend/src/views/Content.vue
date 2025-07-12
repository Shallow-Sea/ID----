<template>
  <div class="content-page">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1 class="site-title">内容中心</h1>
          <div class="user-info">
            <el-tag type="success" effect="dark" size="large">
              卡密有效期至：{{ cardStore.expiryDate }}
            </el-tag>
            <el-button type="danger" @click="handleLogout">退出</el-button>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>
        
        <div v-else-if="error" class="error-container">
          <el-result
            icon="error"
            title="加载失败"
            :sub-title="error"
          >
            <template #extra>
              <el-button type="primary" @click="fetchContent">重新加载</el-button>
            </template>
          </el-result>
        </div>
        
        <div v-else-if="contentList.length === 0" class="empty-container">
          <el-empty description="暂无内容" />
        </div>
        
        <div v-else class="content-container">
          <el-row :gutter="20">
            <el-col v-for="item in contentList" :key="item.id" :span="8">
              <el-card class="content-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>{{ item.title }}</span>
                    <el-button class="button" type="text" @click="viewDetail(item.id)">
                      查看详情
                    </el-button>
                  </div>
                </template>
                <div class="card-body">
                  <p class="card-description">{{ item.description }}</p>
                  <p class="card-info">更新时间: {{ formatDate(item.updateTime) }}</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
    
    <!-- 内容详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentDetail.title"
      width="70%"
      destroy-on-close
    >
      <div v-if="loadingDetail" class="loading-container">
        <el-skeleton :rows="15" animated />
      </div>
      
      <div v-else-if="detailError" class="error-container">
        <el-result
          icon="error"
          title="加载失败"
          :sub-title="detailError"
        />
      </div>
      
      <div v-else class="detail-content" v-html="currentDetail.content"></div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCardStore } from '../store/card'
import { contentApi } from '../api'

const router = useRouter()
const cardStore = useCardStore()

// 内容列表状态
const contentList = ref([])
const loading = ref(true)
const error = ref('')

// 详情状态
const detailVisible = ref(false)
const currentDetail = ref({ id: null, title: '', content: '', updateTime: null })
const loadingDetail = ref(false)
const detailError = ref('')

// 获取内容列表
const fetchContent = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await contentApi.getList()
    contentList.value = result.data || []
  } catch (err) {
    error.value = '获取内容失败，请稍后再试'
    console.error('获取内容失败:', err)
  } finally {
    loading.value = false
  }
}

// 查看内容详情
const viewDetail = async (id) => {
  loadingDetail.value = true
  detailError.value = ''
  currentDetail.value = { id, title: '加载中...', content: '', updateTime: null }
  detailVisible.value = true
  
  try {
    const result = await contentApi.getDetail(id)
    currentDetail.value = result.data
  } catch (err) {
    detailError.value = '获取内容详情失败，请稍后再试'
    console.error('获取内容详情失败:', err)
  } finally {
    loadingDetail.value = false
  }
}

// 日期格式化
const formatDate = (timestamp) => {
  if (!timestamp) return '未知'
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    cardStore.clearCardInfo()
    ElMessage({
      type: 'success',
      message: '已退出',
    })
    router.push('/')
  }).catch(() => {
    // 取消操作
  })
}

// 页面加载时获取内容列表
onMounted(() => {
  // 确保有有效卡密，否则跳转到验证页
  if (!cardStore.hasValidCard) {
    router.push('/verify')
    return
  }
  
  fetchContent()
})
</script>

<style scoped>
.content-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.site-title {
  margin: 0;
  font-size: 20px;
  color: #409eff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.el-main {
  padding: 20px;
}

.loading-container, .error-container, .empty-container {
  padding: 40px 0;
}

.content-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  display: flex;
  flex-direction: column;
  height: 120px;
}

.card-description {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  color: #606266;
}

.card-info {
  color: #909399;
  font-size: 12px;
  margin-top: auto;
}

.detail-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}
</style> 