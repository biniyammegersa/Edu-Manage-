"use client";

import { useState } from "react";
import { Header } from "./Header";
import { DashboardSidebar } from "@/app/(src)/components/layout/DashboardSidebar";

type UserRole = "student" | "teacher" | "admin" | "coordinator" | "examiner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: UserRole;
}

export function DashboardLayout({ children, role = "student" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header 
        showMenuButton 
        onMenuClick={() => setSidebarOpen(true)} 
      />

      <DashboardSidebar 
        role={role} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* 
         ADDED: pt-20 (padding-top) to push content down below the fixed header (16px + 4px buffer)
         lg:pl-64 pushes content right for the sidebar
      */}
      <main className="pt-20 lg:pl-64 transition-all duration-300">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}