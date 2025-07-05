<!-- 商品发布 - 物流设置 -->
<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" :disabled="isDetail">
    <el-form-item label="配送方式" prop="deliveryTypes">
      <el-checkbox-group v-model="formData.deliveryTypes" class="w-80">
        <el-checkbox
          v-for="dict in getIntDictOptions(DICT_TYPE.TRADE_DELIVERY_TYPE)"
          :key="dict.value"
          :label="dict.value"
        >
          {{ dict.label }}
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item
      label="运费模板"
      prop="deliveryTemplateId"
      v-if="formData.deliveryTypes?.includes(DeliveryTypeEnum.EXPRESS.type)"
    >
      <el-select placeholder="请选择运费模板" v-model="formData.deliveryTemplateId" class="w-80">
        <el-option
          v-for="item in deliveryTemplateList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import { PropType } from 'vue'
import { propTypes } from '@/utils/propTypes'
import type { Spu } from '@/api/mall/product/spu'
import * as ExpressTemplateApi from '@/api/mall/trade/delivery/expressTemplate'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { DeliveryTypeEnum } from '@/utils/constants'

defineOptions({ name: 'ProductDeliveryForm' })

const message = useMessage() // 消息弹窗

const props = defineProps({
  propFormData: {
    type: Object as PropType<Spu>,
    default: () => {}
  },
  isDetail: propTypes.bool.def(false) // 是否作为详情组件
})
const formRef = ref() // 表单 Ref
const formData = reactive<Spu>({
  deliveryTypes: [], // 配送方式
  deliveryTemplateId: undefined // 运费模版
})
const rules = reactive({
  deliveryTypes: [required],
  deliveryTemplateId: [required]
})

/** 将传进来的值赋值给 formData */
watch(
  () => props.propFormData,
  (data) => {
    if (!data) return
    console.log('DeliveryForm接收到的数据:', {
      deliveryTypes: data.deliveryTypes,
      deliveryTemplateId: data.deliveryTemplateId
    })
    
    // 直接设置数据，不使用copyValueToTarget
    formData.deliveryTypes = data.deliveryTypes || []
    formData.deliveryTemplateId = data.deliveryTemplateId
    
    // 延迟触发响应式更新
    setTimeout(() => {
      // 触发组件重新渲染
      Object.assign(formData, { ...formData })
    }, 100)
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
    await unref(formRef)?.validate()
    // 校验通过更新数据
    Object.assign(props.propFormData, formData)
  } catch (e) {
    message.error('【物流设置】不完善，请填写相关信息')
    emit('update:activeName', 'delivery')
    throw e // 目的截断之后的校验
  }
}
defineExpose({ validate, formData })

/** 初始化 */
const deliveryTemplateList = ref([]) // 运费模版
onMounted(async () => {
  deliveryTemplateList.value = await ExpressTemplateApi.getSimpleTemplateList()
})
</script>
