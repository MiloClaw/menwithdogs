import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Fixed Sidebar - Desktop only, mobile uses Sheet */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        
        <main className={`flex-1 p-6 overflow-auto ${isMobile ? 'pt-14' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
