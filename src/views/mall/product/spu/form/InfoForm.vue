<!-- 商品发布 - 基础设置 -->
<template>
  <el-form ref="formRef" :disabled="isDetail" :model="formData" :rules="rules" label-width="120px">
    <el-form-item label="商品名称" prop="name">
      <el-input
        v-model="formData.name"
        :autosize="{ minRows: 2, maxRows: 2 }"
        :clearable="true"
        :show-word-limit="true"
        class="w-80!"
        maxlength="64"
        placeholder="请输入商品名称"
        type="textarea"
      />
    </el-form-item>
    <el-form-item label="商品分类" prop="categoryId">
      <el-cascader
        v-model="formData.categoryId"
        :options="categoryList"
        :props="defaultProps"
        class="w-80"
        clearable
        filterable
        placeholder="请选择商品分类"
      />
    </el-form-item>
<!--    <el-form-item label="商品品牌" prop="brandId">-->
<!--      <el-select v-model="formData.brandId" class="w-80" placeholder="请选择商品品牌">-->
<!--        <el-option-->
<!--          v-for="item in brandList"-->
<!--          :key="item.id"-->
<!--          :label="item.name"-->
<!--          :value="item.id as number"-->
<!--        />-->
<!--      </el-select>-->
<!--    </el-form-item>-->
    <el-form-item label="商品品牌" prop="brandId">
      <el-cascader
        v-model="formData.brandId"
        :options="brandList"
        :props="defaultProps"
        class="w-80"
        clearable
        filterable
        placeholder="请选择商品品牌"
      />
    </el-form-item>
    <el-form-item label="商品关键字" prop="keyword">
      <el-input v-model="formData.keyword" class="w-80!" placeholder="请输入商品关键字" />
    </el-form-item>
    <el-form-item label="商品简介" prop="introduction">
      <el-input
        v-model="formData.introduction"
        :autosize="{ minRows: 2, maxRows: 2 }"
        :clearable="true"
        :show-word-limit="true"
        class="w-80!"
        maxlength="128"
        placeholder="请输入商品名称"
        type="textarea"
      />
    </el-form-item>
<!--    商品佣金 -xz-->
    <el-form-item label="商品佣金" prop="commission">
      <el-input-number
        v-model="formData.commission"
        :min="0"
        :precision="2"
        :step="0.1"
        class="w-100%"
        controls-position="right"
      />
    </el-form-item>
    <!-- 新增的商品价格备注字段，根据用户角色是否为 super_admin 显示 -xz -->
    <el-form-item v-if="isSuperAdmin" label="商品价格备注" prop="priceNote">
<!--      <el-input-->
<!--        v-model="formData.priceNote"-->
<!--        :autosize="{ minRows: 3, maxRows: 5 }"-->
<!--        :clearable="true"-->
<!--        :show-word-limit="true"-->
<!--        class="w-80!"-->
<!--        maxlength="256"-->
<!--        placeholder="请输入商品价格备注"-->
<!--        type="textarea"-->
<!--      />-->
      <Editor
        v-model:modelValue="formData.priceNote"
      />

    </el-form-item>
    <el-form-item label="商品封面图" prop="picUrl">
      <UploadImg v-model="formData.picUrl" :disabled="isDetail" height="80px" />
    </el-form-item>
    <el-form-item label="商品轮播图" prop="sliderPicUrls">
      <UploadImgs v-model="formData.sliderPicUrls" :disabled="isDetail" />
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import { PropType } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { defaultProps, handleTree } from '@/utils/tree'
import type { Spu } from '@/api/mall/product/spu'
import * as ProductCategoryApi from '@/api/mall/product/category'
import { CategoryVO } from '@/api/mall/product/category'
import * as ProductBrandApi from '@/api/mall/product/brand'
import { BrandVO } from '@/api/mall/product/brand'
import { useUserStore } from '@/store/modules/user'
import { Editor } from '@/components/Editor'

const userStore = useUserStore()

// 获取用户的 roles
// 计算属性，用于判断当前用户是否为超级管理员 -xz
const isSuperAdmin = computed(() => {
  return userStore.getRoles.includes('super_admin')
})

defineOptions({ name: 'ProductSpuInfoForm' })
const props = defineProps({
  propFormData: {
    type: Object as PropType<Spu>,
    default: () => {}
  },
  isDetail: propTypes.bool.def(false) // 是否作为详情组件
})

const message = useMessage() // 消息弹窗

const formRef = ref() // 表单 Ref
const formData = reactive<Spu>({
  name: '', // 商品名称
  categoryId: undefined, // 商品分类
  keyword: '', // 关键字
  picUrl: '', // 商品封面图
  sliderPicUrls: [], // 商品轮播图
  introduction: '', // 商品简介
  brandId: undefined, // 商品品牌
  commission: 0,// 商品佣金 -xz
  priceNote:'' //商品价格备注 -xz
})
const rules = reactive({
  name: [required],
  categoryId: [required],
  keyword: [required],
  introduction: [required],
  picUrl: [required],
  sliderPicUrls: [required],
  brandId: [required]
})

/** 将传进来的值赋值给 formData */
watch(
  () => props.propFormData,
  (data) => {
    if (!data) {
      return
    }
    //解决priceNote为空的问题 -xz
    if (data.priceNote === null || data.priceNote === undefined) {
      data.priceNote = ''
    }
    console.log('InfoForm接收到的priceNote:', data.priceNote)
    
    // 直接设置数据，不使用Object.assign
    formData.priceNote = data.priceNote
    formData.name = data.name || ''
    formData.categoryId = data.categoryId
    formData.keyword = data.keyword || ''
    formData.introduction = data.introduction || ''
    formData.picUrl = data.picUrl || ''
    formData.sliderPicUrls = data.sliderPicUrls || []
    formData.brandId = data.brandId
    formData.commission = data.commission || 0
    
    // 延迟触发响应式更新，确保Editor组件完全初始化
    setTimeout(() => {
      // 触发组件重新渲染
      Object.assign(formData, { ...formData })
    }, 100)
    
    // 额外延迟，确保富文本编辑器完全初始化
    setTimeout(() => {
      // 再次触发响应式更新
      formData.priceNote = data.priceNote
    }, 800)
  },
  {
    immediate: true,
    deep: true
  }
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
    message.error('【基础设置】不完善，请填写相关信息')
    emit('update:activeName', 'info')
    throw e // 目的截断之后的校验
  }
}
defineExpose({ validate })

/** 初始化 */
const brandList = ref<BrandVO[]>([]) // 商品品牌列表
const categoryList = ref<CategoryVO[]>([]) // 商品分类树
onMounted(async () => {
  // 获得分类树
  const data = await ProductCategoryApi.getCategoryList({})
  categoryList.value = handleTree(data, 'id')
  // 获取商品品牌列表
  brandList.value = await ProductBrandApi.getSimpleBrandList()
})
</script>
