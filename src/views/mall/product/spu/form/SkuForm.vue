<!-- 商品发布 - 库存价格 -->
<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" :disabled="isDetail">
    <el-form-item label="分销类型" props="subCommissionType">
      <el-radio-group
        v-model="formData.subCommissionType"
        @change="changeSubCommissionType"
        class="w-80"
      >
        <el-radio :label="false">默认设置</el-radio>
        <el-radio :label="true" class="radio">单独设置</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="商品规格" props="specType">
      <el-radio-group v-model="formData.specType" @change="onChangeSpec" class="w-80">
        <el-radio :label="false" class="radio">单规格</el-radio>
        <el-radio :label="true">多规格</el-radio>
      </el-radio-group>
    </el-form-item>
    <!-- 多规格添加-->
    <el-form-item v-if="!formData.specType">
      <SkuList
        ref="skuListRef"
        :prop-form-data="formData"
        :property-list="propertyList"
        :rule-config="ruleConfig"
      />
    </el-form-item>
    <el-form-item v-if="formData.specType" label="商品属性">
      <el-button class="mb-10px mr-15px" @click="attributesAddFormRef.open">添加属性</el-button>
      <ProductAttributes
        :property-list="propertyList"
        @success="generateSkus"
        @update:property-list="updatePropertyList"
        :is-detail="isDetail"
      />
    </el-form-item>
    <template v-if="formData.specType && propertyList.length > 0">
      <el-form-item label="批量设置" v-if="!isDetail">
        <SkuList :is-batch="true" :prop-form-data="formData" :property-list="propertyList" />
      </el-form-item>
      <el-form-item label="规格列表">
        <SkuList
          ref="skuListRef"
          :prop-form-data="formData"
          :property-list="propertyList"
          :rule-config="ruleConfig"
          :is-detail="isDetail"
        />
      </el-form-item>
    </template>
  </el-form>

  <!-- 商品属性添加 Form 表单 -->
  <ProductPropertyAddForm ref="attributesAddFormRef" :propertyList="propertyList" />
</template>
<script lang="ts" setup>
import { PropType } from 'vue'
import { propTypes } from '@/utils/propTypes'
import {
  getPropertyList,
  PropertyAndValues,
  RuleConfig,
  SkuList
} from '@/views/mall/product/spu/components/index'
import ProductAttributes from './ProductAttributes.vue'
import ProductPropertyAddForm from './ProductPropertyAddForm.vue'
import type { Spu } from '@/api/mall/product/spu'

defineOptions({ name: 'ProductSpuSkuForm' })

const updatePropertyList = (newPropertyList) => {

  // console.log("子组件传递上来的newPropertyList"+JSON.stringify(newPropertyList, null, 2))
  // console.log("子组件传递上来的removedValue"+JSON.stringify(removedValue, null, 2))
  // 清空当前的 propertyList
  skuListRef.value.generateTableData([]);

  // 更新 propertyList 为新的属性列表
  propertyList.value = newPropertyList;

  // 生成新的表格数据
  skuListRef.value.generateTableData(propertyList);

  // console.log("更新后的propertyList", JSON.stringify(propertyList.value, null, 2));

}



// sku 相关属性校验规则
const ruleConfig: RuleConfig[] = [
  {
    name: 'stock',
    rule: (arg) => arg >= 0,
    message: '商品库存必须大于等于 1 ！！！'
  },
  {
    name: 'price',
    rule: (arg) => arg >= 0.01,
    message: '商品销售价格必须大于等于 0.01 元！！！'
  },
  {
    name: 'marketPrice',
    rule: (arg) => arg >= 0.01,
    message: '商品市场价格必须大于等于 0.01 元！！！'
  },
  {
    name: 'costPrice',
    rule: (arg) => arg >= 0.01,
    message: '商品成本价格必须大于等于 0.00 元！！！'
  }
]

const message = useMessage() // 消息弹窗

const props = defineProps({
  propFormData: {
    type: Object as PropType<Spu>,
    default: () => {}
  },
  isDetail: propTypes.bool.def(false) // 是否作为详情组件
})
const attributesAddFormRef = ref() // 添加商品属性表单
const formRef = ref() // 表单 Ref
const propertyList = ref<PropertyAndValues[]>([]) // 商品属性列表
const skuListRef = ref() // 商品属性列表 Ref
const formData = reactive<Spu>({
  specType: false, // 商品规格
  subCommissionType: false, // 分销类型
  skus: []
})
const rules = reactive({
  specType: [required],
  subCommissionType: [required]
})

/** 将传进来的值赋值给 formData */
watch(
  () => props.propFormData,
  (data) => {
    if (!data) return
    console.log('SkuForm接收到的数据:', {
      specType: data.specType,
      subCommissionType: data.subCommissionType,
      skus: data.skus
    })
    
    // 直接设置数据，不使用copyValueToTarget
    formData.specType = data.specType || false
    formData.subCommissionType = data.subCommissionType || false
    formData.skus = data.skus || []
    
    // 延迟触发响应式更新
    setTimeout(() => {
      // 触发组件重新渲染
      Object.assign(formData, { ...formData })
    }, 100)
    
    // 将 SKU 的属性，整理成 PropertyAndValues 数组
    propertyList.value = getPropertyList(data)
  },
  {
    immediate: true,
    deep: true
  }
)

/** 监听formData变化，同步到父组件 */
watch(
  formData,
  (newData) => {
    if (props.propFormData) {
      Object.assign(props.propFormData, newData)
    }
  },
  { deep: true }
)



/** 表单校验 */
const emit = defineEmits(['update:activeName'])
const validate = async () => {
  if (!formRef) return
  try {
    // 校验 sku
    skuListRef.value.validateSku()
    await unref(formRef).validate()
    // 校验通过更新数据
    Object.assign(props.propFormData, formData)
  } catch (e) {
    message.error('【库存价格】不完善，请填写相关信息')
    emit('update:activeName', 'sku')
    throw e // 目的截断之后的校验
  }
}
defineExpose({ validate, formData })

/** 分销类型 */
const changeSubCommissionType = () => {
  // 默认为零，类型切换后也要重置为零
  for (const item of formData.skus!) {
    item.firstBrokeragePrice = 0
    item.secondBrokeragePrice = 0
  }
}

/** 选择规格 */
const onChangeSpec = () => {
  // 重置商品属性列表
  propertyList.value = []
  // 重置sku列表
  formData.skus = [
    {
      price: 0,
      marketPrice: 0,
      costPrice: 0,
      barCode: '',
      picUrl: '',
      stock: 0,
      weight: 0,
      volume: 0,
      firstBrokeragePrice: 0,
      secondBrokeragePrice: 0
    }
  ]
}

/** 调用 SkuList generateTableData 方法*/
const generateSkus = (propertyList) => {
  // console.log('调用了generateSkus'+  JSON.stringify(propertyList, null, 2))
  skuListRef.value.generateTableData(propertyList)

}


</script>
