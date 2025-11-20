import type { ID } from './common'

export interface ContactInfo {
  full_name: string
  email: string
  phone: string
  location: string
  website?: string
  linkedin?: string
}

export interface SummarySection {
  headline: string
  summary: string
  highlights?: string[]
}

export interface ExperienceItem {
  id: ID
  role: string
  company: string
  location?: string
  start_date: string
  end_date?: string
  achievements: string[]
  technologies?: string[]
}

export interface EducationItem {
  id: ID
  school: string
  degree: string
  start_date: string
  end_date?: string
  details?: string
}

export interface ResumeContent {
  contact: ContactInfo
  summary: SummarySection
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: string[]
  certifications?: string[]
}

export interface Resume {
  id: ID
  user_id: ID
  title: string
  template_id: ID | null
  content: ResumeContent
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface ResumeUpdatePayload {
  title?: string
  template_id?: ID | null
  content?: Partial<ResumeContent>
}

