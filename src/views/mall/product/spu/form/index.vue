<template>
  <ContentWrap v-loading="formLoading">
    <el-tabs v-model="activeName">
      <el-tab-pane label="基础设置" name="info">
        <InfoForm
          ref="infoRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="价格库存" name="sku">
        <SkuForm
          ref="skuRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="物流设置" name="delivery">
        <DeliveryForm
          ref="deliveryRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="商品详情" name="description">
        <DescriptionForm
          ref="descriptionRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
<!--      加入商品笔记和详情-->
      <el-tab-pane label="商品笔记" name="notes">
        <NotesForm
          ref="notesRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="商品数据" name="data">
        <DataForm
          ref="dataRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="其它设置" name="other">
        <OtherForm
          ref="otherRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
    </el-tabs>
    <el-form>
      <el-form-item style="float: right">
        <el-button v-if="!isDetail" type="warning" @click="clearForm" :disabled="formLoading">
          清空
        </el-button>
        <el-button v-if="!isDetail" :loading="formLoading" type="primary" @click="submitForm">
          保存
        </el-button>
        <el-button @click="close">返回</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import { ElMessageBox } from 'element-plus'
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as ProductSpuApi from '@/api/mall/product/spu'
import InfoForm from './InfoForm.vue'
import DescriptionForm from './DescriptionForm.vue'
import OtherForm from './OtherForm.vue'
import SkuForm from './SkuForm.vue'
import DeliveryForm from './DeliveryForm.vue'
import NotesForm from './NotesForm.vue'
import DataForm from './DataForm.vue'
import { convertToInteger, floatToFixed2, formatToFraction } from '@/utils'
import FormPersistence from '@/utils/formPersistence'

defineOptions({ name: 'ProductSpuForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const { push, currentRoute } = useRouter() // 路由
const { params, name, query } = useRoute() // 查询参数
const { delView } = useTagsViewStore() // 视图操作

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const activeName = ref('info') // Tag 激活的窗口
const isDetail = ref(false) // 是否查看详情
const formPersistence = FormPersistence.getInstance() // 表单数据持久化实例
const copyDataProcessed = ref(false) // 标记是否已处理复制数据
const infoRef = ref() // 商品信息 Ref
const skuRef = ref() // 商品规格 Ref
const deliveryRef = ref() // 物流设置 Ref
const descriptionRef = ref() // 商品详情 Ref
const notesRef = ref() // 商品笔记 Ref
const dataRef = ref() // 商品数据 Ref
const otherRef = ref() // 其他设置 Ref
// SPU 表单数据
const formData = ref<ProductSpuApi.Spu>({
  name: '', // 商品名称
  categoryId: undefined, // 商品分类
  keyword: '', // 关键字
  picUrl: '', // 商品封面图
  sliderPicUrls: [], // 商品轮播图
  introduction: '', // 商品简介
  deliveryTypes: [], // 配送方式数组
  deliveryTemplateId: undefined, // 运费模版
  brandId: undefined, // 商品品牌
  specType: false, // 商品规格
  subCommissionType: false, // 分销类型
  commission:0,//佣金字段
  priceNote:'',
  skus: [
    {
      price: 0, // 商品价格
      marketPrice: 0, // 市场价
      costPrice: 0, // 成本价
      barCode: '', // 商品条码
      picUrl: '', // 图片地址
      stock: 0, // 库存
      weight: 0, // 商品重量
      volume: 0, // 商品体积
      firstBrokeragePrice: 0, // 一级分销的佣金
      secondBrokeragePrice: 0 // 二级分销的佣金
    }
  ],
  description: '', // 商品详情
  notes: '', // 商品笔记
  data: '', // 商品数据
  sort: 0, // 商品排序
  giveIntegral: 0, // 赠送积分
  virtualSalesCount: 0 // 虚拟销量
})

/** 获得详情 */
const getDetail = async () => {
  if ('ProductSpuDetail' === name) {
    isDetail.value = true
  }
  const id = params.id as unknown as number
  if (id) {
    formLoading.value = true
    try {
      const res = (await ProductSpuApi.getSpu(id)) as ProductSpuApi.Spu
      res.skus?.forEach((item) => {
        if (isDetail.value) {
          item.price = floatToFixed2(item.price)
          item.marketPrice = floatToFixed2(item.marketPrice)
          item.costPrice = floatToFixed2(item.costPrice)
          item.firstBrokeragePrice = floatToFixed2(item.firstBrokeragePrice)
          item.secondBrokeragePrice = floatToFixed2(item.secondBrokeragePrice)
        } else {
          // 回显价格分转元
          item.price = formatToFraction(item.price)
          item.marketPrice = formatToFraction(item.marketPrice)
          item.costPrice = formatToFraction(item.costPrice)
          item.firstBrokeragePrice = formatToFraction(item.firstBrokeragePrice)
          item.secondBrokeragePrice = formatToFraction(item.secondBrokeragePrice)
        }
      })
      // 处理 commission 字段 商品佣金 -xz
      if (isDetail.value) {
        res.commission = floatToFixed2(res.commission)
      } else {
        res.commission = formatToFraction(res.commission)
      }
      formData.value = res
    } finally {
      formLoading.value = false
    }
  }
}

/** 处理复制的数据 */
const handleCopyData = () => {
  // 检查URL参数中是否有copyDataId
  if (query.copyDataId && !copyDataProcessed.value) {
    try {
      console.log('开始处理复制数据，copyDataId:', query.copyDataId)
      
      let copyDataString = null
      let dataSource = ''
      
      // 优先从localStorage获取数据（用于页面切换后恢复）
      const localStorageKey = `copy_spu_data_${query.copyDataId}`
      copyDataString = localStorage.getItem(localStorageKey)
      if (copyDataString) {
        dataSource = 'localStorage'
        console.log('从localStorage获取到数据，长度:', copyDataString.length)
      } else {
        // 如果localStorage中没有，则从sessionStorage获取数据
        copyDataString = sessionStorage.getItem(query.copyDataId as string)
        if (copyDataString) {
          dataSource = 'sessionStorage'
          console.log('从sessionStorage获取到数据，长度:', copyDataString.length)
        }
      }
      
      if (!copyDataString) {
        console.error('localStorage和sessionStorage中都没有找到复制数据:', query.copyDataId)
        message.error('获取复制数据失败，请重新复制商品')
        return
      }
      
      const copyData = JSON.parse(copyDataString)
      console.log('解析复制数据成功，数据源:', dataSource, '商品名称:', copyData.name)
      
      // 处理SKU数据的价格转换
      if (copyData.skus && copyData.skus.length > 0) {
        copyData.skus.forEach((item: any) => {
          // 价格分转元
          item.price = formatToFraction(item.price)
          item.marketPrice = formatToFraction(item.marketPrice)
          item.costPrice = formatToFraction(item.costPrice)
          item.firstBrokeragePrice = formatToFraction(item.firstBrokeragePrice)
          item.secondBrokeragePrice = formatToFraction(item.secondBrokeragePrice)
          
          // 确保是数字类型
          item.price = Number(item.price)
          item.marketPrice = Number(item.marketPrice)
          item.costPrice = Number(item.costPrice)
          item.firstBrokeragePrice = Number(item.firstBrokeragePrice)
          item.secondBrokeragePrice = Number(item.secondBrokeragePrice)
          item.stock = Number(item.stock || 0)
          item.weight = Number(item.weight || 0)
          item.volume = Number(item.volume || 0)
        })
      }
      // 处理佣金字段
      if (copyData.commission !== undefined) {
        copyData.commission = formatToFraction(copyData.commission)
        // 确保是数字类型
        copyData.commission = Number(copyData.commission)
      }
      // 处理轮播图数据格式
      if (copyData.sliderPicUrls && copyData.sliderPicUrls.length > 0) {
        // 确保sliderPicUrls是字符串数组而不是对象数组
        copyData.sliderPicUrls = copyData.sliderPicUrls.map((url: any) => {
          // 如果已经是字符串，直接返回
          if (typeof url === 'string') {
            return url
          }
          // 如果是对象，则返回url属性
          return url.url || ''
        })
      } else {
        copyData.sliderPicUrls = []
      }
      
      // 确保所有文本字段都存在并有默认值
      const textFields = ['notes', 'data', 'description', 'priceNote', 'introduction', 'keyword']
      textFields.forEach(field => {
        if (copyData[field] === undefined || copyData[field] === null) {
          copyData[field] = ''
        }
      })
      
      // 确保必要的字段有默认值并且是正确的类型
      if (!copyData.deliveryTypes) {
        copyData.deliveryTypes = []
      }
      if (copyData.specType === undefined) {
        copyData.specType = false
      }
      if (copyData.subCommissionType === undefined) {
        copyData.subCommissionType = false
      }
      
      // 确保数字类型字段是数字
      copyData.sort = Number(copyData.sort || 0)
      copyData.giveIntegral = Number(copyData.giveIntegral || 0)
      copyData.virtualSalesCount = Number(copyData.virtualSalesCount || 0)
      
      // 输出调试信息
      console.log('处理后的复制数据:', JSON.stringify({
        name: copyData.name,
        description: copyData.description,
        notes: copyData.notes,
        data: copyData.data,
        priceNote: copyData.priceNote
      }))
      
      // 直接复制数据到formData
      Object.assign(formData.value, copyData)
      
      // 强制触发响应式更新，确保子组件能接收到数据
      nextTick(() => {
        // 触发formData的深度更新
        formData.value = { ...formData.value }
        
        // 延迟显示成功消息
        setTimeout(() => {
          message.success('已加载复制的商品数据')
        }, 500)
      })
      
      // 确保富文本编辑器字段有正确的初始值
      setTimeout(() => {
        if (copyData.notes !== undefined) {
          formData.value.notes = copyData.notes
        }
        if (copyData.data !== undefined) {
          formData.value.data = copyData.data
        }
        if (copyData.description !== undefined) {
          formData.value.description = copyData.description
        }
        if (copyData.priceNote !== undefined) {
          formData.value.priceNote = copyData.priceNote
        }
      }, 100)
      
      // 如果数据来自sessionStorage，则保存到localStorage以确保页面切换后数据不丢失
      if (dataSource === 'sessionStorage') {
        const localStorageKey = `copy_spu_data_${query.copyDataId}`
        localStorage.setItem(localStorageKey, JSON.stringify(copyData))
        console.log('保存数据到localStorage，Key:', localStorageKey)
        
        // 延迟清除sessionStorage中的数据，确保数据已经完全加载
        setTimeout(() => {
          sessionStorage.removeItem(query.copyDataId as string)
          console.log('已清除sessionStorage中的数据:', query.copyDataId)
        }, 1000)
      }
      
      // 标记已处理复制数据
      copyDataProcessed.value = true
      
    } catch (error) {
      console.error('复制数据解析失败:', error)
      message.error('复制数据解析失败，请重新复制商品')
    }
  }
}

/** 提交按钮 */
const submitForm = async () => {
  // 提交请求
  formLoading.value = true
  try {
    // 校验各表单
    await unref(infoRef)?.validate()
    await unref(skuRef)?.validate()
    await unref(deliveryRef)?.validate()
    await unref(descriptionRef)?.validate()

    await unref(notesRef)?.validate()
    await unref(dataRef)?.validate()

    await unref(otherRef)?.validate()
    // 深拷贝一份, 这样最终 server 端不满足，不需要影响原始数据
    const deepCopyFormData = cloneDeep(unref(formData.value)) as ProductSpuApi.Spu

    // 将元转换为分：处理表单中的佣金和价格 -xz
    if (deepCopyFormData.commission !== undefined) {
      deepCopyFormData.commission = convertToInteger(deepCopyFormData.commission)
    }
    deepCopyFormData.skus!.forEach((item) => {
      // 给sku name赋值
      item.name = deepCopyFormData.name
      // sku相关价格元转分
      item.price = convertToInteger(item.price)
      item.marketPrice = convertToInteger(item.marketPrice)
      item.costPrice = convertToInteger(item.costPrice)
      item.firstBrokeragePrice = convertToInteger(item.firstBrokeragePrice)
      item.secondBrokeragePrice = convertToInteger(item.secondBrokeragePrice)
    })
    // 处理轮播图列表
    const newSliderPicUrls: any[] = []
    deepCopyFormData.sliderPicUrls!.forEach((item: any) => {
      // 如果是前端选的图
      typeof item === 'object' ? newSliderPicUrls.push(item.url) : newSliderPicUrls.push(item)
    })
    deepCopyFormData.sliderPicUrls = newSliderPicUrls
    // 校验都通过后提交表单
    const data = deepCopyFormData as ProductSpuApi.Spu
    const id = params.id as unknown as number
    if (!id) {
      await ProductSpuApi.createSpu(data)
      message.success(t('common.createSuccess'))
      // 提交成功后清除保存的数据
      const pageKey = FormPersistence.generatePageKey(name as string, params, query)
      formPersistence.clearFormData(pageKey)
      
      // 如果是复制新增，清除localStorage中的数据
      if (query.copyDataId) {
        const localStorageKey = `copy_spu_data_${query.copyDataId}`
        localStorage.removeItem(localStorageKey)
        console.log('提交成功后清除localStorage数据:', localStorageKey)
      }
    } else {
      await ProductSpuApi.updateSpu(data)
      message.success(t('common.updateSuccess'))
    }
    close()
  } finally {
    formLoading.value = false
  }
}

/** 清空表单 */
const clearForm = () => {
  ElMessageBox.confirm('确定要清空所有表单数据吗？此操作不可恢复。', '确认清空', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 重置表单数据为初始状态
    formData.value = {
      name: '', // 商品名称
      categoryId: undefined, // 商品分类
      keyword: '', // 关键字
      picUrl: '', // 商品封面图
      sliderPicUrls: [], // 商品轮播图
      introduction: '', // 商品简介
      deliveryTypes: [], // 配送方式数组
      deliveryTemplateId: undefined, // 运费模版
      brandId: undefined, // 商品品牌
      specType: false, // 商品规格
      subCommissionType: false, // 分销类型
      commission: 0, // 佣金字段
      priceNote: '',
      skus: [
        {
          price: 0, // 商品价格
          marketPrice: 0, // 市场价
          costPrice: 0, // 成本价
          barCode: '', // 商品条码
          picUrl: '', // 图片地址
          stock: 0, // 库存
          weight: 0, // 商品重量
          volume: 0, // 商品体积
          firstBrokeragePrice: 0, // 一级分销的佣金
          secondBrokeragePrice: 0 // 二级分销的佣金
        }
      ],
      description: '', // 商品详情
      notes: '', // 商品笔记
      data: '', // 商品数据
      sort: 0, // 商品排序
      giveIntegral: 0, // 赠送积分
      virtualSalesCount: 0 // 虚拟销量
    }
    
    // 清除所有子组件的表单验证状态
    nextTick(() => {
      if (infoRef.value) {
        infoRef.value.$refs?.formRef?.clearValidate?.()
      }
      if (skuRef.value) {
        skuRef.value.$refs?.formRef?.clearValidate?.()
      }
      if (deliveryRef.value) {
        deliveryRef.value.$refs?.formRef?.clearValidate?.()
      }
      if (descriptionRef.value) {
        descriptionRef.value.$refs?.formRef?.clearValidate?.()
      }
      if (notesRef.value) {
        notesRef.value.$refs?.formRef?.clearValidate?.()
      }
      if (dataRef.value) {
        dataRef.value.$refs?.formRef?.clearValidate?.()
      }
      if (otherRef.value) {
        otherRef.value.$refs?.formRef?.clearValidate?.()
      }
    })
    
    // 清除保存的数据
    if (name === 'ProductSpuAdd') {
      const pageKey = FormPersistence.generatePageKey(name as string, params, query)
      formPersistence.clearFormData(pageKey)
      
      // 如果是复制新增，清除localStorage中的数据
      if (query.copyDataId) {
        const localStorageKey = `copy_spu_data_${query.copyDataId}`
        localStorage.removeItem(localStorageKey)
        console.log('清空表单时清除localStorage数据:', localStorageKey)
      }
    }
    
    // 重置复制数据处理标志
    copyDataProcessed.value = false
    
    // 重置当前激活的标签页
    activeName.value = 'info'
    
    message.success('表单数据已清空')
  }).catch(() => {
    // 用户取消清空操作
  })
}

/** 关闭按钮 */
const close = () => {
  // 如果是新增页面，清除保存的数据
  if (name === 'ProductSpuAdd') {
    const pageKey = FormPersistence.generatePageKey(name as string, params, query)
    formPersistence.clearFormData(pageKey)
    
    // 如果是复制新增，清除localStorage中的数据
    if (query.copyDataId) {
      const localStorageKey = `copy_spu_data_${query.copyDataId}`
      localStorage.removeItem(localStorageKey)
      console.log('关闭页面时清除localStorage数据:', localStorageKey)
    }
  }
  // 重置复制数据处理标志
  copyDataProcessed.value = false
  // 返回商品列表页面
  push({ path: '/mall/product/spu' })
}

/** 监听formData变化，自动保存数据 */
watch(
  formData,
  (newData) => {
    if (name === 'ProductSpuAdd' && !isDetail.value && newData.name) {
      const pageKey = FormPersistence.generatePageKey(name as string, params, query)
      formPersistence.saveFormData(pageKey, newData)
    }
  },
  { deep: true }
)

/** 页面激活时恢复数据 */
onActivated(() => {
  if (name === 'ProductSpuAdd' && !isDetail.value) {
    // 检查是否有复制数据
    const hasCopyData = !!query.copyDataId
    
    if (hasCopyData) {
      // 如果有复制数据，尝试从localStorage获取
      const localStorageKey = `copy_spu_data_${query.copyDataId}`
      const savedDataString = localStorage.getItem(localStorageKey)
      
      if (savedDataString) {
        try {
          const savedData = JSON.parse(savedDataString)
          console.log('从localStorage恢复复制数据:', savedData.name)
          
          // 恢复表单数据
          Object.assign(formData.value, savedData)
          
          // 强制触发响应式更新，确保子组件能接收到数据
          nextTick(() => {
            // 触发formData的深度更新
            formData.value = { ...formData.value }
            
            // 延迟显示成功消息
            setTimeout(() => {
              message.success('已恢复商品数据')
            }, 500)
          })
          
          // 标记已处理复制数据
          copyDataProcessed.value = true
          
          return
        } catch (error) {
          console.error('解析localStorage数据失败:', error)
        }
      }
      
      // 如果localStorage中没有数据，尝试从sessionStorage获取
      if (!copyDataProcessed.value) {
        const copyDataString = sessionStorage.getItem(query.copyDataId as string)
        if (copyDataString) {
          console.log('从sessionStorage恢复复制数据')
          handleCopyData()
          return
        }
      }
      
      // 如果都没有数据，说明数据丢失了
      message.error('复制数据已丢失，请重新复制')
      return
    }
    
    // 如果没有复制数据，尝试恢复普通新增的持久化数据
    const pageKey = FormPersistence.generatePageKey(name as string, params, query)
    const savedData = formPersistence.getFormData(pageKey)
    
    if (savedData) {
      // 恢复表单数据
      Object.assign(formData.value, savedData)
      
      // 强制触发响应式更新，确保子组件能接收到数据
      nextTick(() => {
        // 触发formData的深度更新
        formData.value = { ...formData.value }
        
        // 延迟显示成功消息
        setTimeout(() => {
          message.success('已恢复商品数据')
        }, 500)
      })
    }
  }
})

/** 页面失活时保存数据 */
onDeactivated(() => {
  if (name === 'ProductSpuAdd' && !isDetail.value && formData.value.name) {
    // 保存到FormPersistence（用于普通新增）
    const pageKey = FormPersistence.generatePageKey(name as string, params, query)
    formPersistence.saveFormData(pageKey, formData.value)
    
    // 如果是复制新增，同时保存到localStorage
    if (query.copyDataId) {
      const localStorageKey = `copy_spu_data_${query.copyDataId}`
      localStorage.setItem(localStorageKey, JSON.stringify(formData.value))
      console.log('页面失活时保存复制数据到localStorage:', localStorageKey)
    }
  }
})

/** 初始化 */
onMounted(async () => {
  console.log('页面初始化，query:', query, 'name:', name)
  
  // 先处理复制的数据，如果有的话
  const hasCopyData = !!query.copyDataId
  if (hasCopyData) {
    console.log('检测到复制数据，开始处理')
    
    // 优先尝试从localStorage恢复数据（页面切换后恢复）
    const localStorageKey = `copy_spu_data_${query.copyDataId}`
    const savedDataString = localStorage.getItem(localStorageKey)
    
    if (savedDataString) {
      try {
        const savedData = JSON.parse(savedDataString)
        console.log('从localStorage恢复复制数据:', savedData.name)
        
        // 恢复表单数据
        Object.assign(formData.value, savedData)
        
        // 强制触发响应式更新，确保子组件能接收到数据
        nextTick(() => {
          formData.value = { ...formData.value }
          setTimeout(() => {
            message.success('已恢复商品数据')
          }, 500)
        })
        
        // 标记已处理复制数据
        copyDataProcessed.value = true
        return
      } catch (error) {
        console.error('解析localStorage数据失败:', error)
      }
    }
    
    // 如果localStorage中没有数据，尝试从sessionStorage获取（首次复制）
    if (!copyDataProcessed.value) {
      handleCopyData()
    }
  } else {
    console.log('没有复制数据，获取详情')
    // 如果没有复制数据，则获取详情
    await getDetail()
    
    // 如果是新增页面且没有复制数据，尝试恢复表单数据
    if (name === 'ProductSpuAdd') {
      const pageKey = FormPersistence.generatePageKey(name as string, params, query)
      const savedData = formPersistence.getFormData(pageKey)
      if (savedData) {
        console.log('恢复持久化数据')
        // 恢复表单数据
        Object.assign(formData.value, savedData)
        
        // 强制触发响应式更新
        nextTick(() => {
          formData.value = { ...formData.value }
          message.success('已恢复上次编辑的数据')
        })
      }
    }
  }
  
  // 重置复制数据处理标志
  if (!hasCopyData) {
    copyDataProcessed.value = false
  }
})

/** 页面离开前保存数据 */
onBeforeUnmount(() => {
  // 如果是新增页面且有数据，保存到本地存储
  if (name === 'ProductSpuAdd' && formData.value.name) {
    const pageKey = FormPersistence.generatePageKey(name as string, params, query)
    formPersistence.saveFormData(pageKey, formData.value)
    
    // 如果是复制新增，同时保存到localStorage
    if (query.copyDataId) {
      const localStorageKey = `copy_spu_data_${query.copyDataId}`
      localStorage.setItem(localStorageKey, JSON.stringify(formData.value))
      console.log('页面离开前保存复制数据到localStorage:', localStorageKey)
    }
  }
})
</script>
