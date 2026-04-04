import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="relative flex w-full flex-1 flex-col">
          <SidebarTrigger className="absolute left-4 top-4 z-20 md:hidden" />
          <div className="flex-1 p-6 pt-16 md:pt-6">{children}</div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
