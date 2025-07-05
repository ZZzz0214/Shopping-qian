import { SlateDescendant } from '@wangeditor/editor'
type EmptyText = {
  text: ''
}

export type ImageStyle = {
  width?: string
  height?: string
}

export type ImageElement = {
  type: 'image'
  src: string
  alt?: string
  href?: string
  style?: ImageStyle
  children: EmptyText[]
}
declare module 'slate' {
  interface CustomTypes {
    // 扩展 text
    Text: {
      text: string
      bold?: boolean
      italic?: boolean
      code?: boolean
      through?: boolean
      underline?: boolean
      sup?: boolean
      sub?: boolean
      color?: string
      bgColor?: string
      fontSize?: string
      fontFamily?: string
    }

    // 扩展 Element 的 type 属性
    Element: {
      type: string
      children: SlateDescendant[]
    }

  }
}
