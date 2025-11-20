import type { ID } from './common'

export interface Template {
  id: ID
  name: string
  category: string
  html_template: string
  css_styles: string
  preview_image_url?: string
  is_ats_optimized: boolean
  is_active: boolean
}

