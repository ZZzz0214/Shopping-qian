<template>
<!--  <doc-alert title="会员用户、标签、分组" url="https://doc.iocoder.cn/member/user/" />-->

  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="用户昵称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          class="!w-240px"
          clearable
          placeholder="请输入用户昵称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          class="!w-240px"
          clearable
          placeholder="请输入手机号"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="注册时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item label="登录时间" prop="loginDate">
        <el-date-picker
          v-model="queryParams.loginDate"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item label="用户标签" prop="tagIds">
        <MemberTagSelect v-model="queryParams.tagIds" />
      </el-form-item>
      <el-form-item label="用户等级" prop="levelId">
        <MemberLevelSelect v-model="queryParams.levelId" />
      </el-form-item>
      <el-form-item label="用户分组" prop="groupId">
        <MemberGroupSelect v-model="queryParams.groupId" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button v-hasPermi="['promotion:coupon:send']" @click="openCoupon">发送优惠券</el-button>
        <!-- 新增批量开启商品笔记按钮 -->
        <el-button @click="handleBatchSwitch('productNote', true)">
          批量开启商品笔记
        </el-button>
        <!-- 新增批量关闭商品笔记按钮 -->
        <el-button @click="handleBatchSwitch('productNote', false)">
          批量关闭商品笔记
        </el-button>

        <!-- 新增批量开启商品数据按钮 -->
        <el-button @click="handleBatchSwitch('productData', true)">
          批量开启商品数据
        </el-button>
        <!-- 新增批量关闭商品数据按钮 -->
        <el-button @click="handleBatchSwitch('productData', false)">
          批量关闭商品数据
        </el-button>
        <el-button @click="handleBatchSwitch('productDetail', true)">
          批量开启商品详情
        </el-button>
        <el-button @click="handleBatchSwitch('productDetail', false)">
          批量关闭商品详情
        </el-button>

      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :show-overflow-tooltip="true"
      :stripe="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column align="center" label="用户编号" prop="id" width="120px" />
      <el-table-column align="center" label="头像" prop="avatar" width="80px">
        <template #default="scope">
          <img :src="scope.row.avatar" style="width: 40px" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="手机号" prop="mobile" width="120px" />
      <el-table-column align="center" label="昵称" prop="nickname" width="80px" />
<!--      商品笔记和数据 -xz -->

      <el-table-column align="center" label="老板可看" width="150px">
        <template #default="{ row }">
          <el-switch
            v-model="row.BossEnabled"
            :active-text="'是'"
            :inactive-text="'否'"
            @change="handleSwitchChange('Boss', row)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="客户左专区" width="150px">
        <template #default="{ row }">
          <el-switch
            v-model="row.productNoteEnabledZuo"
            :active-text="'是'"
            :inactive-text="'否'"
            @change="handleSwitchChange('productNoteZuo', row)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="客户右专区" width="150px">
        <template #default="{ row }">
          <el-switch
            v-model="row.productNoteEnabledYuo"
            :active-text="'是'"
            :inactive-text="'否'"
            @change="handleSwitchChange('productNoteYou', row)"
          />
        </template>
      </el-table-column>


      <el-table-column align="center" label="商品分类权限" width="150px">
        <template #default="{ row }">
          <el-switch
            v-model="row.productDetailEnabled"
            :active-text="'是'"
            :inactive-text="'否'"
            @change="handleSwitchChange('productDetail', row)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品数据" width="150px">
        <template #default="{ row }">
          <el-switch
            v-model="row.productDataEnabled"
            :active-text="'是'"
            :inactive-text="'否'"
            @change="handleSwitchChange('productData', row)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="图片视频转发" width="150px">
        <template #default="{ row }">
          <el-switch
            v-model="row.photoEnabled"
            :active-text="'是'"
            :inactive-text="'否'"
            @change="handleSwitchChange('photo', row)"
          />
        </template>
      </el-table-column>

      <el-table-column align="center" label="等级" prop="levelName" width="100px" />
      <el-table-column align="center" label="分组" prop="groupName" width="100px" />
      <el-table-column
        :show-overflow-tooltip="false"
        align="center"
        label="用户标签"
        prop="tagNames"
      >
        <template #default="scope">
          <el-tag v-for="(tagName, index) in scope.row.tagNames" :key="index" class="mr-5px">
            {{ tagName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="积分" prop="point" width="100px" />
      <el-table-column align="center" label="状态" prop="status" width="100px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="登录时间"
        prop="loginDate"
        width="180px"
      />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="注册时间"
        prop="createTime"
        width="180px"
      />
      <el-table-column
        :show-overflow-tooltip="false"
        align="center"
        fixed="right"
        label="操作"
        width="100px"
      >
        <template #default="scope">
          <div class="flex items-center justify-center">
            <el-button link type="primary" @click="openDetail(scope.row.id)">详情</el-button>
            <el-dropdown
              v-hasPermi="[
                'member:user:update',
                'member:user:update-level',
                'member:user:update-point',
                'member:user:update-balance'
              ]"
              @command="(command) => handleCommand(command, scope.row)"
            >
              <el-button link type="primary">
                <Icon icon="ep:d-arrow-right" />
                更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="checkPermi(['member:user:update'])"
                    command="handleUpdate"
                  >
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="checkPermi(['member:user:update-level'])"
                    command="handleUpdateLevel"
                  >
                    修改等级
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="checkPermi(['member:user:update-point'])"
                    command="handleUpdatePoint"
                  >
                    修改积分
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="checkPermi(['member:user:update-balance'])"
                    command="handleUpdateBlance"
                  >
                    修改余额(WIP)
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <UserForm ref="formRef" @success="getList" />
  <!-- 修改用户等级弹窗 -->
  <UserLevelUpdateForm ref="updateLevelFormRef" @success="getList" />
  <!-- 修改用户积分弹窗 -->
  <UserPointUpdateForm ref="updatePointFormRef" @success="getList" />
  <!-- 发送优惠券弹窗 -->
  <CouponSendForm ref="couponSendFormRef" />
</template>
<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as UserApi from '@/api/member/user'
import { DICT_TYPE } from '@/utils/dict'
import UserForm from './UserForm.vue'
import MemberTagSelect from '@/views/member/tag/components/MemberTagSelect.vue'
import MemberLevelSelect from '@/views/member/level/components/MemberLevelSelect.vue'
import MemberGroupSelect from '@/views/member/group/components/MemberGroupSelect.vue'
import UserLevelUpdateForm from './UserLevelUpdateForm.vue'
import UserPointUpdateForm from './UserPointUpdateForm.vue'
import { CouponSendForm } from '@/views/mall/promotion/coupon/components'
import { checkPermi } from '@/utils/permission'

defineOptions({ name: 'MemberUser' })

const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  nickname: null,
  mobile: null,
  loginDate: [],
  createTime: [],
  tagIds: [],
  levelId: null,
  groupId: null
})
const queryFormRef = ref() // 搜索的表单
const updateLevelFormRef = ref() // 修改会员等级表单
const updatePointFormRef = ref() // 修改会员积分表单
const selectedIds = ref<number[]>([]) // 表格的选中 ID 数组

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserApi.getUserPage(queryParams)
    list.value = data.list.map(user => ({
      ...user,
      productNoteEnabledZuo: (user.scopes || []).includes('admin_biji_zuo'),
      productNoteEnabledYuo: (user.scopes || []).includes('admin_biji_you'),
      productDataEnabled: (user.scopes || []).includes('admin_shuju'),
      productDetailEnabled: (user.scopes || []).includes('admin_xiangqing'),// 添加新的权限
      photoEnabled:(user.scopes || []).includes('admin_photo'),
      BossEnabled:(user.scopes || []).includes('admin_boss')
    }))
    total.value = data.total
  } finally {
    loading.value = false
  }
}

//解决按钮开启关闭逻辑
const handleSwitchChange = async (type: 'productNoteYou'|'productNoteZuo' | 'productData'| 'productDetail'| 'photo' | 'Boss', row: UserApi.UserVO) => {
  // 复制当前行的数据
  const updateData = { ...row };


  if (!updateData.scopes) {
    updateData.scopes = [];
  }


  // 确定需要添加或移除的 scope
  // const scopeToAdd = type === 'productNote' ? 'admin_biji' : type === 'productData' ? 'admin_shuju' : 'admin_xiangqing';
  const scopeToAdd = {
    productNoteZuo: 'admin_biji_zuo',
    productNoteYou:'admin_biji_you',
    productData: 'admin_shuju',
    productDetail: 'admin_xiangqing',
    photo: 'admin_photo', // 添加 photo 类型的权限
    Boss:'admin_boss'
  }[type];

  // 根据 scopes 中是否包含 scopeToAdd 来决定是添加还是移除
  if (updateData.scopes.includes(scopeToAdd)) {
    // 如果包含，则移除 scope，表示关闭该功能
    updateData.scopes = updateData.scopes.filter(scope => scope !== scopeToAdd);
  } else {
    // 如果不包含，则添加 scope，表示开启该功能
    updateData.scopes.push(scopeToAdd);
  }



  try {
    await UserApi.updateUser(updateData);
    message.success('更新成功');
    await getList();
  } catch (error) {
    message.error('更新失败');
  }
}

const handleBatchSwitch = async (type: 'productNote' | 'productData'| 'productDetail', enable: boolean) => {
  if (selectedIds.value.length === 0) {
    message.warning('请选择要操作的用户');
    return;
  }

  const updates = list.value.filter(user => selectedIds.value.includes(user.id)).map(user => {
    const updatedUser: UserApi.UserVO = { ...user };
    if (!updatedUser.scopes) {
      updatedUser.scopes = [];
    }
    const scopeToAdd = type === 'productNote' ? 'admin_biji' : type === 'productData' ? 'admin_shuju' : 'admin_xiangqing';

    if (enable) {
      if (!updatedUser.scopes.includes(scopeToAdd)) {
        updatedUser.scopes.push(scopeToAdd);
      }
    } else {
      updatedUser.scopes = updatedUser.scopes.filter(scope => scope !== scopeToAdd);
    }

    return updatedUser;
  });

  try {
    await Promise.all(updates.map(user => UserApi.updateUser(user)));
    message.success('批量操作成功');
    await getList();
  } catch (error) {
    message.error('批量操作失败');
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 打开会员详情 */
const { push } = useRouter()
const openDetail = (id: number) => {
  push({ name: 'MemberUserDetail', params: { id } })
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 表格选中事件 */
const handleSelectionChange = (rows: UserApi.UserVO[]) => {
  selectedIds.value = rows.map((row) => row.id)
}

/** 发送优惠券 */
const couponSendFormRef = ref()
const openCoupon = () => {
  if (selectedIds.value.length === 0) {
    message.warning('请选择要发送优惠券的用户')
    return
  }
  couponSendFormRef.value.open(selectedIds.value)
}

/** 操作分发 */
const handleCommand = (command: string, row: UserApi.UserVO) => {
  switch (command) {
    case 'handleUpdate':
      openForm('update', row.id)
      break
    case 'handleUpdateLevel':
      updateLevelFormRef.value.open(row.id)
      break
    case 'handleUpdatePoint':
      updatePointFormRef.value.open(row.id)
      break
    case 'handleUpdateBlance':
      // todo @jason：增加一个【修改余额】
      break
    default:
      break
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
