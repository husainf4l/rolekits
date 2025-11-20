import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Templates', path: '/templates' },
  { label: 'Editor', path: '/editor/demo' },
  { label: 'Preview', path: '/preview/demo' },
  { label: 'Settings', path: '/settings' },
]

interface SidebarProps {
  isCollapsed?: boolean
}

export const Sidebar = ({ isCollapsed }: SidebarProps) => (
  <aside
    className={clsx(
      'fixed inset-y-0 z-20 w-64 border-r border-slate-100 bg-white px-4 py-6 transition-transform lg:static',
      isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0',
    )}
  >
    <div className="mb-8 flex items-center gap-3 px-2">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">🎯</div>
      <div>
        <p className="text-sm font-semibold text-slate-900">Resume Builder</p>
        <p className="text-xs text-slate-500">Phase 2 Workspace</p>
      </div>
    </div>

    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50',
              isActive && 'bg-slate-900 text-white hover:bg-slate-900',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
)

