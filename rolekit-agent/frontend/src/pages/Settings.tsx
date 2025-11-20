import { Button } from '@/components/UI/Button'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/UI/Input'

export const SettingsPage = () => {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-900">Account Settings</p>
        <p className="text-xs text-slate-500">
          Manage workspace preferences, authentication, and AI usage.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-center text-2xl font-semibold leading-[64px] text-primary-700">
            {user?.name?.[0] ?? 'U'}
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">{user?.name ?? 'Guest'}</p>
            <p className="text-sm text-slate-500">{user?.email ?? 'Not signed in'}</p>
          </div>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="mt-6 grid gap-4">
          <Input label="Full Name" defaultValue={user?.name ?? ''} />
          <Input label="Email" defaultValue={user?.email ?? ''} type="email" />
          <Input label="Subscription" defaultValue={user?.subscription_type ?? 'free'} />
        </div>
      </div>
    </div>
  )
}

