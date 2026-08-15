import { AdminHeader } from './AdminHeader'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AdminHeader />
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
