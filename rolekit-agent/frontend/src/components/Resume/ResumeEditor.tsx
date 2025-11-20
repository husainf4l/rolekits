import { useEffect, useState } from 'react'
import { useResume } from '@/hooks/useResume'
import { FormFields } from './FormFields'
import { TemplateSelector } from './TemplateSelector'
import { Preview } from './Preview'
import { Button } from '@/components/UI/Button'

interface ResumeEditorProps {
  resumeId: string
}

export const ResumeEditor = ({ resumeId }: ResumeEditorProps) => {
  const { resume, handleFieldChange, isLoading } = useResume(resumeId)
  const [selectedTemplate, setSelectedTemplate] = useState(resume?.template_id ?? null)

  useEffect(() => {
    setSelectedTemplate(resume?.template_id ?? null)
  }, [resume?.template_id])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Loading resume...
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold text-slate-900">Resume not found</p>
        <p className="text-sm text-slate-500">
          Create a new resume from the dashboard or select an existing one.
        </p>
      </div>
    )
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    handleFieldChange('meta', 'template_id', templateId)
  }

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{resume.title}</h2>
            <p className="text-sm text-slate-500">Auto-saving to the cloud</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary">Preview</Button>
            <Button>Export PDF</Button>
          </div>
        </div>

        <TemplateSelector selected={selectedTemplate} onChange={handleTemplateChange} />
        <FormFields resume={resume} onChange={handleFieldChange} />
      </div>

      <div className="hidden flex-1 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 shadow-inner lg:block">
        <Preview resume={resume} template={selectedTemplate} />
      </div>
    </div>
  )
}

