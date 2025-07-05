<script lang="ts" setup>
import { PropType } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import {i18nChangeLanguage, IDomEditor, IEditorConfig, SlateTransforms} from '@wangeditor/editor'
import { propTypes } from '@/utils/propTypes'
import { isNumber } from '@/utils/is'
import {ElLoading, ElMessage} from 'element-plus'
import { useLocaleStore } from '@/store/modules/locale'
import { getAccessToken, getTenantId } from '@/utils/auth'
import * as FileApi from '@/api/infra/file'


defineOptions({ name: 'Editor' })

type InsertFnType = (url: string, alt: string, href: string) => void

const localeStore = useLocaleStore()

const currentLocale = computed(() => localeStore.getCurrentLocale)

i18nChangeLanguage(unref(currentLocale).lang)

const props = defineProps({
  editorId: propTypes.string.def(''),
  height: propTypes.oneOfType([Number, String]).def('750px'),
  editorConfig: {
    type: Object as PropType<Partial<IEditorConfig>>,
    default: () => undefined
  },
  readonly: propTypes.bool.def(false),
  modelValue: propTypes.string.def(''),
 
})

// 生成唯一的编辑器ID
const uniqueEditorId = computed(() => {
  return props.editorId || `wangeditor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
})

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  type: undefined,
  path: undefined,
  createTime: []
})
//let previousVideoList: string[] = []; // 用于存储上一个视频列表
let intervalId: NodeJS.Timeout | null = null; // 外部变量存储定时器ID
let savedVideoList: string[] = []; // 新增一个变量来保存视频列表

const emit = defineEmits(['change', 'update:modelValue'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef<IDomEditor>()

const valueHtml = ref('')

watch(
  () => props.modelValue,
  (val: string) => {
    if (val === unref(valueHtml)) return
    valueHtml.value = val
    
    // 如果编辑器已经创建，强制更新内容
    if (editorRef.value) {
      nextTick(() => {
        try {
          // 确保编辑器内容与传入的值同步
          if (val && val !== editorRef.value.getHtml()) {
            editorRef.value.setHtml(val)
          }
        } catch (error) {
          console.warn('更新编辑器内容失败:', error)
        }
      })
    }
  },
  {
    immediate: true,
    deep: true
  }
)

// 监听
watch(
  () => valueHtml.value,
  (val: string) => {
    emit('update:modelValue', val)
  }
)

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
  
  // 编辑器创建完成后，如果有初始值，设置到编辑器中
  if (props.modelValue && props.modelValue.trim()) {
    nextTick(() => {
      try {
        editor.setHtml(props.modelValue)
      } catch (error) {
        console.warn('设置编辑器内容失败:', error)
      }
    })
  }
}

// 编辑器配置
const editorConfig = computed((): IEditorConfig => {
  return Object.assign(
    {
      placeholder: '请输入内容...',
      readOnly: props.readonly,
      customAlert: (s: string, t: string) => {
        switch (t) {
          case 'success':
            ElMessage.success(s)
            break
          case 'info':
            ElMessage.info(s)
            break
          case 'warning':
            ElMessage.warning(s)
            break
          case 'error':
            ElMessage.error(s)
            break
          default:
            ElMessage.info(s)
            break
        }
      },
      autoFocus: true,
      scroll: true,
      MENU_CONF: {
        ['uploadImage']: {
          server: import.meta.env.VITE_UPLOAD_URL,
          // 单个文件的最大体积限制，默认为 20M
          maxFileSize: 20 * 1024 * 1024,
          // 最多可上传几个文件，默认为 100
          maxNumberOfFiles: 200,
          // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
          allowedFileTypes: ['image/*'],

          // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
          meta: { updateSupport: 0 },
          // 将 meta 拼接到 url 参数中，默认 false
          metaWithUrl: true,

          // 自定义增加 http  header
          headers: {
            Accept: '*',
            Authorization: 'Bearer ' + getAccessToken(),
            'tenant-id': getTenantId()
          },

          // 跨域是否传递 cookie ，默认为 false
          withCredentials: true,

          // 超时时间，默认为 15 秒
          timeout: 60 * 1000, // 60 秒

          // form-data fieldName，后端接口参数名称，默认值wangeditor-uploaded-image
          fieldName: 'file',
          // 上传之前触发
          onBeforeUpload(file: File) {
            console.log(file)
            return file
          },
          // 上传进度的回调函数
          onProgress(progress: number) {
            // progress 是 0-100 的数字
            console.log('progress', progress)
          },
          onSuccess(file: File, res: any) {
            console.log('onSuccess', file, res)
          },
          onFailed(file: File, res: any) {
            alert(res.message)
            console.log('onFailed', file, res)
          },
          onError(file: File, err: any, res: any) {
            alert(err.message)
            console.error('onError', file, err, res)
          },
          // 自定义插入图片
          customInsert(res: any, insertFn: InsertFnType) {
           // insertFn(res.data, 'image', res.data)

            const imgUrl = res.data;
            const imgHtml = `<img src="${imgUrl}" alt="image""/>`;

            // 获取编辑器实例并插入图片 HTML
            const editor = unref(editorRef.value);
            if (editor) {
              editor.dangerouslyInsertHtml(imgHtml); // 使用带样式的 HTML 插入图片
            } else {
              console.error('Editor is not initialized.');
            }
            editor.insertBreak()
            // const editor = unref(editorRef.value);
            // // 插入换行符，确保图片后面有空行
            // editor.insertBreak();
            //
            // // 聚焦并将光标移动到下一行
            // editor.focus(true);  // 聚焦到编辑器
            // editor.move(1);      // 光标移动到下一行

            // 获取编辑器实例
            //实验可以 可以控制缩放比例
            // const imgUrl = res.data;
            // const imgHtml = `<img src="${imgUrl}" alt="image" style="width: 30%;"/>`;
            //
            // // 获取编辑器实例并插入图片 HTML
            // const editor = unref(editorRef.value);
            // if (editor) {
            //   editor.dangerouslyInsertHtml(imgHtml); // 使用带样式的 HTML 插入图片
            // } else {
            //   console.error('Editor is not initialized.');
            // }


            //不行 压缩画质
            // const imgUrl = res.data;
            // const imgHtml = `<img src="${imgUrl}" alt="image" style="width: 650px; height: 400px;" />`;
            //
            // const editor = unref(editorRef.value);
            // if (editor) {
            //   // 通过 dangerouslyInsertHtml 插入图片的 HTML，控制宽高
            //   editor.dangerouslyInsertHtml(imgHtml);
            // } else {
            //   console.error('Editor is not initialized.');
            // }


            // const editor = unref(editorRef.value)
            //
            //
            // const imageEntries = editor.getElemsByType('image'); // 获取所有图片元素
            // console.log(imageEntries)
            // if (!imageEntries.length) {
            //   console.log('当前没有图片节点');
            //   return;
            // }
            //
            // imageEntries.forEach((imageEntry) => {
            //   // imageEntry 是一个对象，包含图片的相关属性
            //   const node = imageEntry; // 获取当前图片节点
            //   console.log('选中了图片节点', node);
            //
            //   // 修改图片的宽度和高度属性
            //   SlateTransforms.setNodes(
            //     editor,
            //     {
            //       // @ts-ignore
            //       style: {
            //         width: '30px',  // 设置宽度
            //         height: '30px', // 设置高度
            //       },
            //     },
            //   );
            // });


            //不行 压缩画质
            // const imageElements = editor.getElemsByType('image');
            //
            //
            // nextTick(() => {
            //   // 获取当前所有的图片节点
            //   const selectedImages = editor.getElemsByType('image');
            //   console.log("Selected Images:", selectedImages);
            //
            //   imageElements.forEach((element) => {
            //     console.log("运行一次");
            //     SlateTransforms.setNodes(
            //       editor,
            //       {
            //         width: '200px',  // 设置宽度为200px
            //         height: '20px',   // 高度自适应
            //       },
            //       {
            //         mode: 'highest', // 针对最高层级的节点
            //       }
            //     );
            //   });
            //
            // });





          }
        },
        ['uploadVideo']: { // 新增的视频上传配置
          // server: import.meta.env.VITE_UPLOAD_URL,
          server: 'https://www.xiezheng123.top:48080/admin-api/infra/file/upload',
          maxFileSize: 500 * 1024 * 1024, // 最大文件限制为500MB
          maxNumberOfFiles: 20, // 最多可上传20个视频
          allowedFileTypes: ['video/*'], // 允许上传所有类型的视频文件
          meta: { updateSupport: 0 },
          metaWithUrl: true,
          headers: {
            Accept: '*',
            Authorization: 'Bearer ' + getAccessToken(),
            'tenant-id': getTenantId()
          },
          withCredentials: true,
          timeout: 60 * 60 * 1000, // 60秒-120
          fieldName: 'file',
          onBeforeUpload(file: File) {
            console.log(file)
            return file
            // 确保获取到正确的文件对象

          },
          // onProgress(progress: number) {
          //   console.log('progress', progress)
          //
          //   if (progress === 100) {
          //     // 调用接口获取最新上传的视频路径
          //     const getLatestVideoPath = async () => {
          //       try {
          //         const response = await FileApi.getFilePage(queryParams); // 获取视频列表的接口
          //         const currentVideoList = response.list.map(item => item.url).slice(0, 5); // 获取当前前五条视频路径
          //
          //         // 只有在前五条视频路径发生变化时才执行后续逻辑
          //         const hasUpdated = previousVideoList.slice(0, 5).some((url, index) => url !== currentVideoList[index]);
          //
          //         if (hasUpdated) {
          //           previousVideoList = currentVideoList; // 更新之前的视频列表
          //
          //           if (currentVideoList.length > 0) {
          //             const latestVideoPath = currentVideoList[0]; // 最新上传的视频路径
          //             console.log("最新文件路径：" + latestVideoPath);
          //
          //             ElMessageBox.alert(`最新视频路径: ${latestVideoPath}`, '视频上传成功', {
          //               confirmButtonText: '确定',
          //             }).then(() => {
          //               // 点击确定后的逻辑，可以选择将路径复制到剪贴板
          //               navigator.clipboard.writeText(latestVideoPath).then(() => {
          //                 ElMessage.success('视频路径已复制到剪贴板');
          //               }).catch(err => {
          //                 console.error('复制失败', err);
          //               });
          //             });
          //           }
          //         } else {
          //           console.log("前五条视频路径没有更新，跳过弹窗。");
          //         }
          //       } catch (error) {
          //         console.error('获取最新视频路径失败', error);
          //       }
          //     };
          //
          //     // 执行获取视频路径
          //     getLatestVideoPath();
          //   }
          //
          // },
          onProgress(progress: number) {
            console.log('progress', progress);

            // 当进度为1时，保存当前视频列表
            // if (progress === 100) {
            //   FileApi.getFilePage(queryParams).then(response => {
            //     savedVideoList = response.list.map(item => item.url).slice(0, 5); // 保存前五条视频路径
            //     console.log("保存的视频列表:", savedVideoList);
            //     if (!intervalId) {
            //       intervalId = setInterval(async () => {
            //         try {
            //           const response = await FileApi.getFilePage(queryParams);
            //           const currentVideoList = response.list.map(item => item.url).slice(0, 5);
            //           console.log("currentVideoList", currentVideoList);
            //
            //           // 比较当前列表和保存的列表
            //           const hasUpdated = savedVideoList.some((url, index) => url !== currentVideoList[index]);
            //
            //           if (hasUpdated) {
            //             savedVideoList = currentVideoList; // 更新保存的视频列表
            //
            //             if (currentVideoList.length > 0) {
            //               const latestVideoPath = currentVideoList[0];
            //               console.log("最新文件路径：" + latestVideoPath);
            //
            //               ElMessageBox.alert(`最新视频路径: ${latestVideoPath}`, '视频上传成功', {
            //                 confirmButtonText: '确定',
            //               }).then(() => {
            //                 navigator.clipboard.writeText(latestVideoPath).then(() => {
            //                   ElMessage.success('视频路径已复制到剪贴板');
            //                   clearInterval(intervalId!);
            //                   intervalId = null;
            //                 }).catch(err => {
            //                   console.error('复制失败', err);
            //                   clearInterval(intervalId!);
            //                   intervalId = null;
            //                 });
            //               });
            //             }
            //           } else {
            //             console.log("前五条视频路径没有更新，跳过弹窗。");
            //           }
            //         } catch (error) {
            //           console.error('获取最新视频路径失败', error);
            //         }
            //       }, 20000);
            //     }
            //   }).catch(error => {
            //     console.error('获取视频列表失败', error);
            //   });
            // }


          },



          onSuccess(file: File, res: any) {
            console.log('onSuccess', file, res)
          },
          onFailed(file: File, res: any) {
            alert(res.message)
            console.log('onFailed', file, res)
          },
          onError(file: File, err: any, res: any) {
            alert(err.message)
            console.error('onError', file, err, res)
          },
          customInsert(res: any, insertFn: InsertFnType) {

             insertFn(res.data, 'video', res.data)
          }
        }
      },
      uploadImgShowBase64: true
    },
    props.editorConfig || {}
  )
})



const editorStyle = computed(() => {
  return {
    height: isNumber(props.height) ? `${props.height}px` : props.height
  }
})

// 回调函数
const handleChange = (editor: IDomEditor) => {
  // editor.insertBreak();
  //  editor.move(1);      // 光标移动到下一行
  emit('change', editor)
}

// 组件销毁时，及时销毁编辑器
onBeforeUnmount(() => {
  const editor = unref(editorRef.value)

  // 销毁，并移除 editor
  if (editor) {
    try {
      editor.destroy()
    } catch (error) {
      console.warn('销毁编辑器失败:', error)
    }
  }
})

const getEditorRef = async (): Promise<IDomEditor> => {
  await nextTick()
  return unref(editorRef.value) as IDomEditor
}

defineExpose({
  getEditorRef
})
</script>

<template>
  <div class="border-1 border-solid border-[var(--tags-view-border-color)] z-10">
        <!-- 工具栏 -->
    <Toolbar
      :editor="editorRef"
      :editorId="uniqueEditorId"
      class="border-0 b-b-1 border-solid border-[var(--tags-view-border-color)]"
    />
    <!-- 编辑器 -->
    <Editor
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :editorId="uniqueEditorId"
      :style="editorStyle"
      @on-change="handleChange"
      @on-created="handleCreated"
    />
  </div>
</template>

<style src="@wangeditor/editor/dist/css/style.css"></style>
