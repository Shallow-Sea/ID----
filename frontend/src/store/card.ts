import { defineStore } from 'pinia'
import { cardApi } from '../api'

interface CardInfo {
  cardCode: string
  expireTime: number
  type: string // 'day' | 'month' | 'year'
  createTime: number
}

export const useCardStore = defineStore('card', {
  state: () => ({
    cardInfo: null as CardInfo | null,
    cardLoading: false,
    verifyError: '',
  }),
  
  getters: {
    hasValidCard: (state) => {
      if (!state.cardInfo) return false
      return state.cardInfo.expireTime > Date.now()
    },
    
    remainingTime: (state) => {
      if (!state.cardInfo) return 0
      const now = Date.now()
      return Math.max(0, state.cardInfo.expireTime - now)
    },
    
    expiryDate: (state) => {
      if (!state.cardInfo) return ''
      return new Date(state.cardInfo.expireTime).toLocaleString()
    }
  },
  
  actions: {
    // 从本地存储加载卡密信息
    loadCardInfo() {
      const storedCard = localStorage.getItem('cardInfo')
      if (storedCard) {
        try {
          this.cardInfo = JSON.parse(storedCard)
        } catch (e) {
          console.error('解析卡密信息出错:', e)
          localStorage.removeItem('cardInfo')
          this.cardInfo = null
        }
      }
    },
    
    // 验证卡密
    async verifyCard(cardCode: string) {
      if (!cardCode.trim()) {
        this.verifyError = '请输入卡密'
        return false
      }
      
      try {
        this.cardLoading = true
        this.verifyError = ''
        
        const response = await cardApi.verify(cardCode)
        this.cardInfo = {
          cardCode,
          ...response
        }
        
        // 保存到本地
        localStorage.setItem('cardInfo', JSON.stringify(this.cardInfo))
        return true
      } catch (error: any) {
        this.verifyError = error.response?.data?.message || '卡密验证失败'
        return false
      } finally {
        this.cardLoading = false
      }
    },
    
    // 验证卡密是否仍然有效
    async checkCardValidity() {
      if (!this.cardInfo) return false
      
      try {
        const response = await cardApi.checkStatus()
        
        // 更新卡密信息
        if (response && response.valid) {
          this.cardInfo = {
            ...this.cardInfo,
            ...response
          }
          localStorage.setItem('cardInfo', JSON.stringify(this.cardInfo))
          return true
        } else {
          // 卡密已失效
          this.clearCardInfo()
          return false
        }
      } catch (error) {
        console.error('检查卡密状态出错:', error)
        return false
      }
    },
    
    // 清除卡密信息
    clearCardInfo() {
      this.cardInfo = null
      localStorage.removeItem('cardInfo')
    },
    
    // 设置自动检测卡密有效性的定时器（每30分钟）
    setupAutoCheck() {
      const THIRTY_MINUTES = 30 * 60 * 1000
      
      // 先检查一次
      this.checkCardValidity()
      
      // 设置定时检查
      setInterval(() => {
        this.checkCardValidity()
      }, THIRTY_MINUTES)
    }
  }
}) 