import request from '@/config/axios'
import type { PageParam, PageResult } from '@/types/pagable'

export interface Sku {
  id?: number
  spuId?: number
  name?: string
  specIds?: string[]
  properties?: Record<string, string | number>[]
  price?: number
  marketPrice?: number
  costPrice?: number
  barCode?: string
  picUrl?: string
  stock?: number
  weight?: number
  volume?: number
  firstBrokeragePrice?: number
  secondBrokeragePrice?: number
  salesCount?: number
}

export interface Spu {
  id?: number
  name?: string
  categoryId?: number
  keyword?: string
  picUrl?: string
  sliderPicUrls?: string[]
  introduction?: string
  specType?: boolean
  subCommissionType?: boolean
  skus?: Sku[]
  price?: number
  marketPrice?: number
  costPrice?: number
  stock?: number
  branId?: number
  brandId?: number
  deliveryTemplateId?: number
  deliveryTypes?: number[]
  description?: string
  notes?: string // 添加明确的笔记字段定义
  data?: string  // 添加明确的数据字段定义
  sort?: number
  giveIntegral?: number
  virtualSalesCount?: number
  totalSalesCount?: number
  browseCount?: number
  salesCount?: number
  status?: number
  createTime?: Date
  commission?: number
  priceNote?: string
}

export interface SpuUpdateStatusReqVO {
  id: number
  status: number
}

// 查询商品SPU列表
export const getSpuPage = (params: PageParam) => {
  return request.get<PageResult<Spu>>({ url: '/product/spu/page', params })
}

// 查询商品SPU列表每个状态的数量
export const getTabsCount = () => {
  return request.get<Record<string, number>>({ url: '/product/spu/get-count' })
}

// 查询商品SPU详情
export const getSpu = (id: number) => {
  return request.get<Spu>({ url: '/product/spu/get?id=' + id })
}

// 新增商品SPU
export const createSpu = (data: Spu) => {
  return request.post<number>({ url: '/product/spu/create', data })
}

// 修改商品SPU
export const updateSpu = (data: Spu) => {
  return request.put<void>({ url: '/product/spu/update', data })
}

// 修改商品SPU状态
export const updateStatus = (data: SpuUpdateStatusReqVO) => {
  return request.put<void>({ url: '/product/spu/update-status', data })
}

// 删除商品SPU
export const deleteSpu = (id: number) => {
  return request.delete<void>({ url: '/product/spu/delete?id=' + id })
}

// 导出商品SPU Excel
export const exportSpu = (params) => {
  return request.download({ url: '/product/spu/export', params })
} 