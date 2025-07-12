import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 如果是管理员接口，添加token
    if (config.url?.startsWith('/admin')) {
      const token = localStorage.getItem('adminToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    // 如果是需要卡密验证的接口
    if (config.url?.startsWith('/content')) {
      const cardInfo = localStorage.getItem('cardInfo')
      if (cardInfo) {
        try {
          const { cardCode } = JSON.parse(cardInfo)
          config.headers['Card-Code'] = cardCode
        } catch (e) {
          console.error('卡密解析错误:', e)
        }
      }
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 处理特定错误
    if (error.response) {
      // 卡密失效或不存在
      if (error.response.status === 403 && error.response.data.code === 'INVALID_CARD') {
        localStorage.removeItem('cardInfo')
        window.location.href = '/verify'
        return
      }
      
      // 管理员token失效
      if (error.response.status === 401) {
        localStorage.removeItem('adminToken')
        window.location.href = '/login'
        return
      }
    }
    
    return Promise.reject(error)
  }
)

// 卡密相关API
export const cardApi = {
  // 验证卡密
  verify: (cardCode: string) => {
    return api.post('/card/verify', { cardCode })
  },
  
  // 检查卡密状态
  checkStatus: () => {
    const cardInfo = localStorage.getItem('cardInfo')
    if (!cardInfo) {
      return Promise.reject(new Error('无卡密信息'))
    }
    
    try {
      const { cardCode } = JSON.parse(cardInfo)
      return api.get(`/card/status/${cardCode}`)
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

// 内容API
export const contentApi = {
  // 获取内容列表
  getList: () => {
    return api.get('/content/list')
  },
  
  // 获取内容详情
  getDetail: (id: number | string) => {
    return api.get(`/content/detail/${id}`)
  }
}

// 管理员API
export const adminApi = {
  // 登录
  login: (username: string, password: string) => {
    return api.post('/admin/login', { username, password })
  },
  
  // 获取数据统计
  getDashboard: () => {
    return api.get('/admin/dashboard')
  },
  
  // 用户管理
  users: {
    list: (params: any) => {
      return api.get('/admin/users', { params })
    },
    create: (userData: any) => {
      return api.post('/admin/users', userData)
    },
    update: (id: number | string, userData: any) => {
      return api.put(`/admin/users/${id}`, userData)
    },
    delete: (id: number | string) => {
      return api.delete(`/admin/users/${id}`)
    }
  },
  
  // 卡密管理
  cards: {
    list: (params: any) => {
      return api.get('/admin/cards', { params })
    },
    create: (cardData: any) => {
      return api.post('/admin/cards', cardData)
    },
    batchCreate: (cardData: any) => {
      return api.post('/admin/cards/batch', cardData)
    },
    update: (id: number | string, cardData: any) => {
      return api.put(`/admin/cards/${id}`, cardData)
    },
    delete: (id: number | string) => {
      return api.delete(`/admin/cards/${id}`)
    },
    export: (format: 'txt' | 'excel' = 'excel', filter?: any) => {
      return api.get(`/admin/cards/export/${format}`, { 
        params: filter,
        responseType: 'blob'
      })
    }
  },
  
  // 内容管理
  content: {
    list: (params: any) => {
      return api.get('/admin/content', { params })
    },
    create: (contentData: any) => {
      return api.post('/admin/content', contentData)
    },
    update: (id: number | string, contentData: any) => {
      return api.put(`/admin/content/${id}`, contentData)
    },
    delete: (id: number | string) => {
      return api.delete(`/admin/content/${id}`)
    }
  },
  
  // 系统设置
  settings: {
    get: () => {
      return api.get('/admin/settings')
    },
    update: (settingsData: any) => {
      return api.put('/admin/settings', settingsData)
    }
  }
}

export default api 