import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 w-full">
          <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2 px-4 py-3">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">GreAgents</h1>
            </div>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
