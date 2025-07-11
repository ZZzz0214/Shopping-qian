<!-- 商品发布 - 其它设置 -->
<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" :disabled="isDetail">
    <el-form-item label="商品排序" prop="sort">
      <el-input-number
        v-model="formData.sort"
        :min="0"
        placeholder="请输入商品排序"
        class="w-80!"
      />
    </el-form-item>
    <el-form-item label="赠送积分" prop="giveIntegral">
      <el-input-number
        v-model="formData.giveIntegral"
        :min="0"
        placeholder="请输入赠送积分"
        class="w-80!"
      />
    </el-form-item>
    <el-form-item label="虚拟销量" prop="virtualSalesCount">
      <el-input-number
        v-model="formData.virtualSalesCount"
        :min="0"
        placeholder="请输入虚拟销量"
        class="w-80!"
      />
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import type { Spu } from '@/api/mall/product/spu'
import { PropType } from 'vue'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'ProductOtherForm' })

const message = useMessage() // 消息弹窗

const props = defineProps({
  propFormData: {
    type: Object as PropType<Spu>,
    default: () => {}
  },
  isDetail: propTypes.bool.def(false) // 是否作为详情组件
})

const formRef = ref() // 表单Ref
// 表单数据
const formData = ref<Spu>({
  sort: 0, // 商品排序
  giveIntegral: 0, // 赠送积分
  virtualSalesCount: 0 // 虚拟销量
})
// 表单规则
const rules = reactive({
  sort: [required],
  giveIntegral: [required],
  virtualSalesCount: [required]
})

/** 将传进来的值赋值给 formData */
watch(
  () => props.propFormData,
  (data) => {
    if (!data) return
    console.log('OtherForm接收到的数据:', {
      sort: data.sort,
      giveIntegral: data.giveIntegral,
      virtualSalesCount: data.virtualSalesCount
    })
    
    // 直接设置数据，不使用copyValueToTarget
    formData.value.sort = data.sort || 0
    formData.value.giveIntegral = data.giveIntegral || 0
    formData.value.virtualSalesCount = data.virtualSalesCount || 0
    
    // 延迟触发响应式更新
    setTimeout(() => {
      // 触发组件重新渲染
      formData.value = { ...formData.value }
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
    Object.assign(props.propFormData, formData.value)
  } catch (e) {
    message.error('【其它设置】不完善，请填写相关信息')
    emit('update:activeName', 'other')
    throw e // 目的截断之后的校验
  }
}
defineExpose({ validate, formData })
</script>
