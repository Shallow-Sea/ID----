import { defineStore } from 'pinia'
import { adminApi } from '../api'

interface AdminInfo {
  id: number
  username: string
  role: string
  token: string
}

export const useAdminStore = defineStore('admin', {
  state: () => ({
    adminInfo: null as AdminInfo | null,
    loginLoading: false,
    loginError: ''
  }),
  
  getters: {
    isLoggedIn: (state) => {
      return !!state.adminInfo && !!state.adminInfo.token
    },
    
    isSuperAdmin: (state) => {
      return state.adminInfo?.role === 'super'
    }
  },
  
  actions: {
    // 从本地存储加载管理员信息
    loadAdminInfo() {
      const storedAdmin = localStorage.getItem('adminInfo')
      const storedToken = localStorage.getItem('adminToken')
      
      if (storedAdmin && storedToken) {
        try {
          const adminInfo = JSON.parse(storedAdmin)
          this.adminInfo = {
            ...adminInfo,
            token: storedToken
          }
        } catch (e) {
          this.clearAdminInfo()
        }
      }
    },
    
    // 管理员登录
    async login(username: string, password: string) {
      if (!username.trim() || !password.trim()) {
        this.loginError = '用户名和密码不能为空'
        return false
      }
      
      try {
        this.loginLoading = true
        this.loginError = ''
        
        const response = await adminApi.login(username, password)
        const { token, ...adminInfo } = response
        
        this.adminInfo = {
          ...adminInfo,
          token
        }
        
        // 保存到本地存储
        localStorage.setItem('adminToken', token)
        localStorage.setItem('adminInfo', JSON.stringify(adminInfo))
        
        return true
      } catch (error: any) {
        this.loginError = error.response?.data?.message || '登录失败'
        return false
      } finally {
        this.loginLoading = false
      }
    },
    
    // 登出
    logout() {
      this.clearAdminInfo()
      return true
    },
    
    // 清除管理员信息
    clearAdminInfo() {
      this.adminInfo = null
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminInfo')
    }
  }
}) 