<template>
  <div class="admin-layout">
    <el-container style="height: 100vh;">
      <el-aside width="240px">
        <div class="logo">
          <h2>卡密系统管理</h2>
        </div>
        
        <el-menu
          :router="true"
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#fff"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataLine /></el-icon>
            <span>控制台</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/users">
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/cards">
            <el-icon><Key /></el-icon>
            <span>卡密管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/content">
            <el-icon><Document /></el-icon>
            <span>内容管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header>
          <div class="header-content">
            <div class="breadcrumb">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">
                  管理系统
                </el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentMenuTitle }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            
            <div class="user-actions">
              <span class="welcome-text">
                欢迎您，{{ adminStore.adminInfo?.username || '管理员' }}
              </span>
              <el-dropdown trigger="click" @command="handleCommand">
                <el-button type="primary" plain>
                  操作 <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="viewSite">前往网站</el-dropdown-item>
                    <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        
        <el-main>
          <router-view v-if="isAuthorized" />
          <el-result 
            v-else
            icon="error" 
            title="未授权" 
            sub-title="您没有权限访问该页面" 
          >
            <template #extra>
              <el-button type="primary" @click="goHome">返回首页</el-button>
            </template>
          </el-result>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  DataLine, 
  UserFilled, 
  Key, 
  Document, 
  Setting, 
  ArrowDown 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAdminStore } from '../../store/admin'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

// 是否已授权
const isAuthorized = computed(() => {
  return adminStore.isLoggedIn
})

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 当前菜单标题
const currentMenuTitle = computed(() => {
  const path = route.path
  
  if (path.includes('dashboard')) return '控制台'
  if (path.includes('users')) return '用户管理'
  if (path.includes('cards')) return '卡密管理'
  if (path.includes('content')) return '内容管理'
  if (path.includes('settings')) return '系统设置'
  
  return '管理系统'
})

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      adminStore.logout()
      ElMessage({
        type: 'success',
        message: '已退出登录',
      })
      router.push('/login')
    }).catch(() => {
      // 取消操作
    })
  } else if (command === 'viewSite') {
    router.push('/')
  }
}

// 返回首页
const goHome = () => {
  router.push('/admin/dashboard')
}

// 检查登录状态
onMounted(() => {
  adminStore.loadAdminInfo()
  if (!adminStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263445;
}

.logo h2 {
  color: #fff;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.el-aside {
  background-color: #304156;
  overflow-x: hidden;
}

.el-menu-vertical {
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.welcome-text {
  margin-right: 10px;
  color: #606266;
}

.user-actions {
  display: flex;
  align-items: center;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style> 