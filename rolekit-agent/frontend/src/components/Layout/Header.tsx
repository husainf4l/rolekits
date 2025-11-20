import { Button } from '@/components/UI/Button'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/UI/Input'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
          onClick={onToggleSidebar}
        >
          ☰
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Resume Builder</h1>
          <p className="text-sm text-slate-500">
            Build, preview, and export professional resumes
          </p>
        </div>
      </div>

      <div className="hidden w-full max-w-sm lg:block">
        <Input placeholder="Search resumes, templates, or tasks..." />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm">
          Create Resume
        </Button>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-center text-sm font-semibold leading-8 text-primary-700">
            {user?.name?.[0] ?? 'U'}
          </div>
          <div className="hidden text-left text-xs leading-tight sm:block">
            <p className="font-medium text-slate-900">{user?.name ?? 'Guest'}</p>
            <p className="text-slate-500">{user?.subscription_type ?? 'Free plan'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

