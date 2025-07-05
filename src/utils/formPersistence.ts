/**
 * 表单数据持久化工具类
 * 用于在页面切换时保存和恢复表单数据
 */

interface FormDataCache {
  [key: string]: any
}

class FormPersistence {
  private static instance: FormPersistence
  private cache: Map<string, FormDataCache> = new Map()
  private readonly STORAGE_KEY = 'form_persistence_cache'
  private readonly MAX_CACHE_SIZE = 10 // 最大缓存数量

  private constructor() {
    this.loadFromStorage()
  }

  public static getInstance(): FormPersistence {
    if (!FormPersistence.instance) {
      FormPersistence.instance = new FormPersistence()
    }
    return FormPersistence.instance
  }

  /**
   * 保存表单数据
   * @param pageKey 页面唯一标识
   * @param formData 表单数据
   */
  public saveFormData(pageKey: string, formData: any): void {
    try {
      // 限制缓存大小
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const firstKey = this.cache.keys().next().value
        if (firstKey) {
          this.cache.delete(firstKey)
        }
      }

      this.cache.set(pageKey, {
        data: formData,
        timestamp: Date.now()
      })

      this.saveToStorage()
    } catch (error) {
      console.error('保存表单数据失败:', error)
    }
  }

  /**
   * 获取表单数据
   * @param pageKey 页面唯一标识
   * @returns 表单数据或null
   */
  public getFormData(pageKey: string): any | null {
    try {
      const cached = this.cache.get(pageKey)
      if (!cached) return null

      // 检查缓存是否过期（24小时）
      const now = Date.now()
      const expireTime = 24 * 60 * 60 * 1000 // 24小时
      if (now - cached.timestamp > expireTime) {
        this.cache.delete(pageKey)
        this.saveToStorage()
        return null
      }

      return cached.data
    } catch (error) {
      console.error('获取表单数据失败:', error)
      return null
    }
  }

  /**
   * 清除指定页面的表单数据
   * @param pageKey 页面唯一标识
   */
  public clearFormData(pageKey: string): void {
    try {
      this.cache.delete(pageKey)
      this.saveToStorage()
    } catch (error) {
      console.error('清除表单数据失败:', error)
    }
  }

  /**
   * 清除所有表单数据
   */
  public clearAllFormData(): void {
    try {
      this.cache.clear()
      this.saveToStorage()
    } catch (error) {
      console.error('清除所有表单数据失败:', error)
    }
  }

  /**
   * 生成页面唯一标识
   * @param routeName 路由名称
   * @param routeParams 路由参数
   * @returns 页面唯一标识
   */
  public static generatePageKey(routeName: string, routeParams?: any): string {
    const paramsStr = routeParams ? JSON.stringify(routeParams) : ''
    return `${routeName}_${paramsStr}`
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('保存到本地存储失败:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        this.cache = new Map(Object.entries(parsed))
      }
    } catch (error) {
      console.error('从本地存储加载失败:', error)
      this.cache = new Map()
    }
  }
}

export default FormPersistence 