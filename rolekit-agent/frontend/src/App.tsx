import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Sidebar } from '@/components/Layout/Sidebar'
import { Header } from '@/components/Layout/Header'
import { Footer } from '@/components/Layout/Footer'
import { DashboardPage } from '@/pages/Dashboard'
import { TemplatesPage } from '@/pages/Templates'
import { EditorPage } from '@/pages/Editor'
import { PreviewPage } from '@/pages/Preview'
import { SettingsPage } from '@/pages/Settings'

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar isCollapsed={!sidebarOpen} />
        <div className="flex min-h-screen flex-1 flex-col lg:ml-0">
          <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/editor/:id" element={<EditorPage />} />
              <Route path="/preview/:id" element={<PreviewPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default App
