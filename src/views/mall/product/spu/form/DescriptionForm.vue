<!-- 商品发布 - 商品详情 -->
<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" :disabled="isDetail">
    <!--富文本编辑器组件-->
    <el-form-item label="商品详情" prop="description">
      <Editor 
        v-model:modelValue="formData.description" 
      />
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import type { Spu } from '@/api/mall/product/spu'
import { Editor } from '@/components/Editor'
import { PropType } from 'vue'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'ProductDescriptionForm' })

const message = useMessage() // 消息弹窗

const props = defineProps({
  propFormData: {
    type: Object as PropType<Spu>,
    default: () => {}
  },
  activeName: propTypes.string.def(''),
  isDetail: propTypes.bool.def(false) // 是否作为详情组件
})
const formRef = ref() // 表单Ref
const formData = ref<Spu>({
  description: '' // 商品详情
})
// 表单规则
const rules = reactive({
  // 将description字段改为非必填，因为复制的商品可能没有详情内容
  // description: [required]
})

/** 富文本编辑器如果输入过再清空会有残留，需再重置一次 */
watch(
  () => formData.value.description,
  (newValue) => {
    if ('<p><br></p>' === newValue) {
      formData.value.description = ''
    }
  },
  {
    deep: true,
    immediate: true
  }
)

/** 将传进来的值赋值给 formData */
watch(
  () => props.propFormData,
  (data) => {
    if (!data) return
    // 确保description字段存在
    if (data.description === undefined || data.description === null) {
      data.description = ''
    }
    console.log('DescriptionForm接收到的数据:', data.description)
    
    // 直接设置数据，不使用Object.assign
    formData.value.description = data.description
    
    // 延迟触发响应式更新，确保Editor组件完全初始化
    setTimeout(() => {
      // 触发组件重新渲染
      formData.value = { ...formData.value }
    }, 100)
    
    // 额外延迟，确保富文本编辑器完全初始化
    setTimeout(() => {
      // 再次触发响应式更新
      formData.value.description = data.description
    }, 800)
  },
  {
    // fix: 去掉深度监听只有对象引用发生改变的时候才执行,解决改一动多的问题
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
    message.error('【商品详情】不完善，请填写相关信息')
    emit('update:activeName', 'description')
    throw e // 目的截断之后的校验
  }
}
defineExpose({ validate, formData })
</script>
