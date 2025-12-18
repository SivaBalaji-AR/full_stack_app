import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
      
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-h-screen bg-gray-50 w-full">
        
        <header className="flex items-center border-b bg-white px-4 py-2 shadow-sm">
          <SidebarTrigger />
          <span className="ml-4 font-semibold">Admin Panel</span>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      
      </main>
    </SidebarProvider>
  );
}