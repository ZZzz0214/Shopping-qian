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

defineOptions({ name: 'ProductSpuForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const { push, currentRoute } = useRouter() // 路由
const { params, name, query } = useRoute() // 查询参数
const { delView } = useTagsViewStore() // 视图操作

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const activeName = ref('info') // Tag 激活的窗口
const isDetail = ref(false) // 是否查看详情
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
  if (query.copyDataId) {
    try {
      // 从sessionStorage获取数据
      const copyDataString = sessionStorage.getItem(query.copyDataId as string)
      if (!copyDataString) {
        message.error('获取复制数据失败')
        return
      }
      
      const copyData = JSON.parse(copyDataString)
      // 使用完后移除sessionStorage中的数据
      sessionStorage.removeItem(query.copyDataId as string)
      
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
        description: copyData.description,
        notes: copyData.notes,
        data: copyData.data,
        priceNote: copyData.priceNote
      }))
      
      // 直接复制数据到formData，不使用copyValueToTarget函数
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
    } catch (error) {
      console.error('复制数据解析失败:', error)
      message.error('复制数据解析失败')
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
    } else {
      await ProductSpuApi.updateSpu(data)
      message.success(t('common.updateSuccess'))
    }
    close()
  } finally {
    formLoading.value = false
  }
}

/** 关闭按钮 */
const close = () => {
  // 返回商品列表页面
  push({ path: '/mall/product/spu' })
}

/** 初始化 */
onMounted(async () => {
  // 先处理复制的数据，如果有的话
  handleCopyData()
  // 如果没有复制数据，则获取详情
  if (!query.copyDataId) {
    await getDetail()
  }
})
</script>
