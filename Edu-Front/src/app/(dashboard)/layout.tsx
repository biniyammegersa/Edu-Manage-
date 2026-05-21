//src/app/(dashboard)/proposal/page.tsx
import { AppSidebar } from "@/components/layout/app-sidebar";
import Header from "@/components/layout/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-[calc(100%-var(--sidebar-width))] flex flex-col min-h-screen">
        <Header />
        <div className="p-6 flex-1">{children}</div>
        
        {/* Small Footer */}
        <footer className="border-t py-4 px-6 text-center text-xs text-muted-foreground bg-white dark:bg-gray-900 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <p>© {new Date().getFullYear()} EduManage — Built for academic excellence.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
